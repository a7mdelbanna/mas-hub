import { Request, Response } from 'express';
import { z } from 'zod';
import { paymentService } from '../../services/PaymentService';
import { db, COLLECTIONS, admin, HTTP_STATUS, ERROR_MESSAGES } from '../../config/firebase';
import { PaymentMethod, PaymentStatus, Currency } from '../../../src/types/models';

// Validation schemas
const paymentHistoryQuerySchema = z.object({
  accountId: z.string().optional(),
  invoiceId: z.string().optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  currency: z.nativeEnum(Currency).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().transform(Number).refine(n => n > 0, 'Page must be positive').optional(),
  limit: z.string().transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be 1-100').optional(),
  sortBy: z.enum(['createdAt', 'amount', 'paidAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Get Payment History
 * Retrieves paginated payment history with filtering
 */
export async function getPaymentHistory(req: Request, res: Response): Promise<void> {
  try {
    const validationResult = paymentHistoryQuerySchema.safeParse(req.query);
    if (!validationResult.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: ERROR_MESSAGES.VALIDATION_FAILED,
          details: validationResult.error.errors,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const {
      accountId,
      invoiceId,
      method,
      status,
      currency,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = validationResult.data;

    // Build query constraints
    let query = db.collection(COLLECTIONS.PAYMENTS).where('deletedAt', '==', null);

    // Apply filters
    if (accountId) {
      query = query.where('accountId', '==', accountId);
    }

    if (invoiceId) {
      query = query.where('invoiceId', '==', invoiceId);
    }

    if (method) {
      query = query.where('method', '==', method);
    }

    if (status) {
      query = query.where('status', '==', status);
    }

    if (currency) {
      query = query.where('currency', '==', currency);
    }

    if (startDate) {
      query = query.where('createdAt', '>=', admin.firestore.Timestamp.fromDate(new Date(startDate)));
    }

    if (endDate) {
      query = query.where('createdAt', '<=', admin.firestore.Timestamp.fromDate(new Date(endDate)));
    }

    // Apply sorting
    query = query.orderBy(sortBy, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.offset(offset).limit(limit);

    // Execute query
    const snapshot = await query.get();

    // Get total count for pagination (this is an approximation)
    // For exact count, we would need a separate query which can be expensive
    const totalCount = snapshot.size < limit ? offset + snapshot.size : offset + limit + 1;

    // Format payments
    const payments = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const paymentData = doc.data();

        // Get related invoice and account info
        const [invoice, account] = await Promise.all([
          paymentData.invoiceId ?
            db.collection(COLLECTIONS.INVOICES).doc(paymentData.invoiceId).get() :
            Promise.resolve(null),
          paymentData.accountId ?
            db.collection(COLLECTIONS.ACCOUNTS).doc(paymentData.accountId).get() :
            Promise.resolve(null),
        ]);

        return {
          id: doc.id,
          paymentNumber: paymentData.paymentNumber,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          method: paymentData.method,
          paidAt: paymentData.paidAt?.toDate?.()?.toISOString() || paymentData.paidAt,
          createdAt: paymentData.createdAt?.toDate?.()?.toISOString() || paymentData.createdAt,
          reference: paymentData.reference,
          notes: paymentData.notes,
          failureReason: paymentData.failureReason,

          // Related entities
          invoice: invoice?.exists ? {
            id: invoice.id,
            invoiceNumber: invoice.data()?.invoiceNumber,
            total: invoice.data()?.total,
            status: invoice.data()?.status,
          } : null,

          account: account?.exists ? {
            id: account.id,
            name: account.data()?.name,
            type: account.data()?.type,
          } : null,

          // Gateway specific data (if user has permissions)
          ...(req.user?.customClaims?.roles?.includes('finance') && {
            gatewayTransactionId: paymentData.gatewayTransactionId,
            receiptUrl: paymentData.receiptUrl,
          }),
        };
      })
    );

    // Calculate summary statistics
    const summary = calculatePaymentSummary(payments);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          hasNext: snapshot.size === limit,
          hasPrev: page > 1,
        },
        summary,
        filters: {
          accountId,
          invoiceId,
          method,
          status,
          currency,
          startDate,
          endDate,
        },
        sorting: {
          sortBy,
          sortOrder,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0',
      },
    });
  } catch (error) {
    console.error('Get payment history API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while retrieving payment history',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

/**
 * Get Payment Analytics
 * Provides payment analytics and metrics
 */
export async function getPaymentAnalytics(req: Request, res: Response): Promise<void> {
  try {
    const {
      accountId,
      startDate,
      endDate,
      groupBy = 'month',
    } = req.query;

    // Default to last 12 months if no date range provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);

    const start = startDate ? new Date(startDate as string) : defaultStartDate;
    const end = endDate ? new Date(endDate as string) : defaultEndDate;

    // Get analytics data
    const analytics = await paymentService.getPaymentAnalytics(start, end, accountId as string);

    // Get time series data
    const timeSeries = await getPaymentTimeSeries(start, end, groupBy as string, accountId as string);

    // Get method breakdown
    const methodBreakdown = await getPaymentMethodBreakdown(start, end, accountId as string);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        summary: analytics,
        timeSeries,
        methodBreakdown,
        dateRange: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          groupBy,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0',
      },
    });
  } catch (error) {
    console.error('Get payment analytics API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while retrieving payment analytics',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

/**
 * Export Payment History
 * Exports payment history to CSV/Excel
 */
export async function exportPaymentHistory(req: Request, res: Response): Promise<void> {
  try {
    const {
      format = 'csv',
      accountId,
      startDate,
      endDate,
      status,
      method,
    } = req.query;

    if (!['csv', 'excel'].includes(format as string)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Format must be csv or excel',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Build query for export (no pagination limits)
    let query = db.collection(COLLECTIONS.PAYMENTS).where('deletedAt', '==', null);

    if (accountId) query = query.where('accountId', '==', accountId);
    if (status) query = query.where('status', '==', status);
    if (method) query = query.where('method', '==', method);
    if (startDate) query = query.where('createdAt', '>=', admin.firestore.Timestamp.fromDate(new Date(startDate as string)));
    if (endDate) query = query.where('createdAt', '<=', admin.firestore.Timestamp.fromDate(new Date(endDate as string)));

    query = query.orderBy('createdAt', 'desc').limit(10000); // Reasonable limit for export

    const snapshot = await query.get();

    if (snapshot.empty) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: {
          code: 'NO_DATA',
          message: 'No payment data found for the specified criteria',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    // Format data for export
    const exportData = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        'Payment ID': doc.id,
        'Payment Number': data.paymentNumber,
        'Invoice ID': data.invoiceId,
        'Account ID': data.accountId,
        'Amount': data.amount,
        'Currency': data.currency,
        'Status': data.status,
        'Method': data.method,
        'Paid At': data.paidAt?.toDate?.()?.toISOString() || data.paidAt || '',
        'Created At': data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        'Reference': data.reference || '',
        'Gateway Transaction ID': data.gatewayTransactionId || '',
        'Failure Reason': data.failureReason || '',
        'Notes': data.notes || '',
      };
    });

    // Generate export file
    const filename = `payments_${new Date().toISOString().split('T')[0]}.${format}`;

    if (format === 'csv') {
      const csv = generateCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } else {
      // For Excel export, you would typically use a library like exceljs
      res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Excel export not yet implemented',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }
  } catch (error) {
    console.error('Export payment history API error:', error);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error occurred while exporting payment history',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}

// Helper functions

function calculatePaymentSummary(payments: any[]): any {
  const summary = {
    totalPayments: payments.length,
    totalAmount: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    refundedPayments: 0,
    averageAmount: 0,
    currencyBreakdown: {} as Record<string, { count: number; amount: number }>,
    methodBreakdown: {} as Record<string, { count: number; amount: number }>,
  };

  for (const payment of payments) {
    summary.totalAmount += payment.amount;

    // Status counts
    switch (payment.status) {
      case PaymentStatus.COMPLETED:
        summary.completedPayments++;
        break;
      case PaymentStatus.PENDING:
      case PaymentStatus.PROCESSING:
        summary.pendingPayments++;
        break;
      case PaymentStatus.FAILED:
        summary.failedPayments++;
        break;
      case PaymentStatus.REFUNDED:
        summary.refundedPayments++;
        break;
    }

    // Currency breakdown
    if (!summary.currencyBreakdown[payment.currency]) {
      summary.currencyBreakdown[payment.currency] = { count: 0, amount: 0 };
    }
    summary.currencyBreakdown[payment.currency].count++;
    summary.currencyBreakdown[payment.currency].amount += payment.amount;

    // Method breakdown
    if (!summary.methodBreakdown[payment.method]) {
      summary.methodBreakdown[payment.method] = { count: 0, amount: 0 };
    }
    summary.methodBreakdown[payment.method].count++;
    summary.methodBreakdown[payment.method].amount += payment.amount;
  }

  summary.averageAmount = payments.length > 0 ? summary.totalAmount / payments.length : 0;

  return summary;
}

async function getPaymentTimeSeries(
  startDate: Date,
  endDate: Date,
  groupBy: string,
  accountId?: string
): Promise<any[]> {
  // This would implement time series data aggregation
  // For now, return empty array as implementation would be complex
  return [];
}

async function getPaymentMethodBreakdown(
  startDate: Date,
  endDate: Date,
  accountId?: string
): Promise<any[]> {
  // This would implement method breakdown aggregation
  // For now, return empty array as implementation would be complex
  return [];
}

function generateCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV values
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}