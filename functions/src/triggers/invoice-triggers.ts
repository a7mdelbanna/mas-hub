import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import AutomationRulesEngine from '../rules/automation-rules';

const db = admin.firestore();
const automationEngine = new AutomationRulesEngine(db);

/**
 * Trigger when an invoice is created
 */
export const onInvoiceCreated = functions.firestore
  .document('invoices/{invoiceId}')
  .onCreate(async (snapshot, context) => {
    const invoice = snapshot.data();
    const invoiceId = context.params.invoiceId;

    try {
      // Generate invoice number if not present
      if (!invoice.invoiceNumber) {
        const invoiceNumber = await generateInvoiceNumber();
        await snapshot.ref.update({ invoiceNumber });
      }

      // Set initial status
      if (!invoice.status) {
        await snapshot.ref.update({ status: 'draft' });
      }

      // Create audit log
      await createAuditLog('invoice.created', invoiceId, invoice.createdBy, {
        accountId: invoice.accountId,
        amount: invoice.total,
        type: invoice.type
      });

      // Send notification to finance team
      await notifyFinanceTeam('new_invoice', invoice);

      // If auto-send is enabled, send to client
      if (invoice.autoSend) {
        await sendInvoiceToClient(invoiceId, invoice);
      }

    } catch (error) {
      console.error('Error in onInvoiceCreated:', error);
      await createSystemLog('error', 'invoice.onCreate', error);
    }
  });

/**
 * Trigger when an invoice is updated
 */
export const onInvoiceUpdated = functions.firestore
  .document('invoices/{invoiceId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const invoiceId = context.params.invoiceId;

    try {
      // Check for status changes
      if (before.status !== after.status) {
        await handleInvoiceStatusChange(invoiceId, before, after);
      }

      // Check for payment updates
      if (before.paidAmount !== after.paidAmount) {
        await handleInvoicePaymentUpdate(invoiceId, before, after);
      }

      // Check if invoice became overdue
      if (!before.overdue && after.overdue) {
        await automationEngine.processInvoiceOverdue(invoiceId);
      }

      // Create audit log for significant changes
      const significantFields = ['status', 'total', 'paidAmount', 'dueDate'];
      const changes = getFieldChanges(before, after, significantFields);

      if (changes.length > 0) {
        await createAuditLog('invoice.updated', invoiceId, after.updatedBy, { changes });
      }

    } catch (error) {
      console.error('Error in onInvoiceUpdated:', error);
      await createSystemLog('error', 'invoice.onUpdate', error);
    }
  });

/**
 * Scheduled function to check for overdue invoices
 */
export const checkOverdueInvoices = functions.pubsub
  .schedule('every day at 09:00')
  .timeZone('Africa/Cairo')
  .onRun(async (context) => {
    console.log('Checking for overdue invoices...');

    try {
      const now = admin.firestore.Timestamp.now();

      // Find invoices that are due
      const overdueInvoices = await db.collection('invoices')
        .where('status', 'in', ['sent', 'viewed', 'partially_paid'])
        .where('dueDate', '<', now)
        .get();

      console.log(`Found ${overdueInvoices.size} potentially overdue invoices`);

      for (const doc of overdueInvoices.docs) {
        const invoice = doc.data();

        // Mark as overdue if not already
        if (invoice.status !== 'overdue') {
          await doc.ref.update({
            status: 'overdue',
            overdueAt: now,
            daysPastDue: calculateDaysPastDue(invoice.dueDate)
          });

          // Trigger automation
          await automationEngine.processInvoiceOverdue(doc.id);
        }
      }

      // Also check for invoices approaching due date
      const upcomingDue = new Date();
      upcomingDue.setDate(upcomingDue.getDate() + 3); // 3 days before due

      const upcomingInvoices = await db.collection('invoices')
        .where('status', 'in', ['sent', 'viewed'])
        .where('dueDate', '>', now)
        .where('dueDate', '<', admin.firestore.Timestamp.fromDate(upcomingDue))
        .get();

      console.log(`Found ${upcomingInvoices.size} invoices approaching due date`);

      for (const doc of upcomingInvoices.docs) {
        const invoice = doc.data();

        // Send reminder if not sent recently
        if (!invoice.lastReminderSent ||
            daysSince(invoice.lastReminderSent) > 3) {
          await sendInvoiceReminder(doc.id, invoice, 'upcoming');

          await doc.ref.update({
            lastReminderSent: now
          });
        }
      }

      await createSystemLog('info', 'invoice.checkOverdue', {
        overdueCount: overdueInvoices.size,
        upcomingCount: upcomingInvoices.size
      });

    } catch (error) {
      console.error('Error checking overdue invoices:', error);
      await createSystemLog('error', 'invoice.checkOverdue', error);
    }
  });

// Helper functions

async function handleInvoiceStatusChange(
  invoiceId: string,
  before: any,
  after: any
): Promise<void> {
  const newStatus = after.status;

  switch (newStatus) {
    case 'sent':
      await onInvoiceSent(invoiceId, after);
      break;

    case 'paid':
      await onInvoicePaid(invoiceId, after);
      break;

    case 'overdue':
      await onInvoiceOverdue(invoiceId, after);
      break;

    case 'cancelled':
      await onInvoiceCancelled(invoiceId, after);
      break;
  }

  // Notify relevant parties
  await notifyInvoiceStatusChange(invoiceId, before.status, newStatus);
}

async function handleInvoicePaymentUpdate(
  invoiceId: string,
  before: any,
  after: any
): Promise<void> {
  const paymentIncrease = after.paidAmount - before.paidAmount;

  if (paymentIncrease > 0) {
    // Payment received
    await createNotification(
      after.accountId,
      'success',
      'Payment Received',
      `Payment of ${after.currency} ${paymentIncrease} received for invoice ${after.invoiceNumber}`
    );

    // Check if fully paid
    if (after.balanceDue <= 0 && before.balanceDue > 0) {
      await onInvoiceFullyPaid(invoiceId, after);
    }
  }
}

async function onInvoiceSent(invoiceId: string, invoice: any): Promise<void> {
  // Log sent time
  await db.collection('invoices').doc(invoiceId).update({
    sentAt: admin.firestore.Timestamp.now()
  });

  // Create activity log
  await createActivityLog(invoiceId, 'sent', {
    to: invoice.accountEmail,
    method: 'email'
  });

  // Schedule follow-up reminder
  await scheduleInvoiceReminder(invoiceId, 7); // Remind in 7 days
}

async function onInvoicePaid(invoiceId: string, invoice: any): Promise<void> {
  // Update related project budget
  if (invoice.projectId) {
    const projectRef = db.collection('projects').doc(invoice.projectId);
    await projectRef.update({
      actualRevenue: admin.firestore.FieldValue.increment(invoice.total)
    });
  }

  // Create success notification
  await createNotification(
    invoice.accountId,
    'success',
    'Invoice Paid',
    `Thank you! Invoice ${invoice.invoiceNumber} has been paid in full.`
  );

  // Update account standing
  await updateAccountStanding(invoice.accountId);
}

async function onInvoiceOverdue(invoiceId: string, invoice: any): Promise<void> {
  // Calculate overdue fees if applicable
  if (invoice.lateFeePercent) {
    const lateFee = invoice.total * (invoice.lateFeePercent / 100);
    await db.collection('invoices').doc(invoiceId).update({
      lateFee,
      total: invoice.total + lateFee,
      balanceDue: invoice.balanceDue + lateFee
    });
  }

  // Create warning notification
  await createNotification(
    invoice.accountId,
    'warning',
    'Invoice Overdue',
    `Invoice ${invoice.invoiceNumber} is now overdue. Please make payment to avoid service interruption.`
  );
}

async function onInvoiceCancelled(invoiceId: string, invoice: any): Promise<void> {
  // Reverse any related transactions
  const transactions = await db.collection('transactions')
    .where('invoiceId', '==', invoiceId)
    .get();

  for (const doc of transactions.docs) {
    await doc.ref.update({
      status: 'cancelled',
      cancelledAt: admin.firestore.Timestamp.now()
    });
  }

  // Notify account
  await createNotification(
    invoice.accountId,
    'info',
    'Invoice Cancelled',
    `Invoice ${invoice.invoiceNumber} has been cancelled.`
  );
}

async function onInvoiceFullyPaid(invoiceId: string, invoice: any): Promise<void> {
  // Check and unblock client portal if needed
  const account = await db.collection('accounts').doc(invoice.accountId).get();
  if (account.exists && account.data()!.portalBlocked) {
    // Check if there are other overdue invoices
    const otherOverdue = await db.collection('invoices')
      .where('accountId', '==', invoice.accountId)
      .where('status', '==', 'overdue')
      .where(admin.firestore.FieldPath.documentId(), '!=', invoiceId)
      .get();

    if (otherOverdue.empty) {
      await db.collection('accounts').doc(invoice.accountId).update({
        portalBlocked: false,
        portalBlockedReason: admin.firestore.FieldValue.delete(),
        portalBlockedAt: admin.firestore.FieldValue.delete()
      });

      await createNotification(
        invoice.accountId,
        'success',
        'Portal Access Restored',
        'Your portal access has been restored. Thank you for your payment.'
      );
    }
  }
}

async function sendInvoiceToClient(invoiceId: string, invoice: any): Promise<void> {
  // Get client details
  const account = await db.collection('accounts').doc(invoice.accountId).get();
  if (!account.exists) return;

  const accountData = account.data()!;

  // Queue email
  await db.collection('emailQueue').add({
    to: accountData.email,
    template: 'invoice-new',
    data: {
      clientName: accountData.name,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      viewUrl: `${process.env.CLIENT_PORTAL_URL}/invoices/${invoiceId}`
    },
    status: 'pending',
    createdAt: admin.firestore.Timestamp.now()
  });

  // Update invoice status
  await db.collection('invoices').doc(invoiceId).update({
    status: 'sent',
    sentAt: admin.firestore.Timestamp.now()
  });
}

async function sendInvoiceReminder(
  invoiceId: string,
  invoice: any,
  type: string
): Promise<void> {
  const templates: Record<string, string> = {
    upcoming: 'invoice-reminder-upcoming',
    overdue: 'invoice-reminder-overdue',
    final: 'invoice-reminder-final'
  };

  // Get account details
  const account = await db.collection('accounts').doc(invoice.accountId).get();
  if (!account.exists) return;

  const accountData = account.data()!;

  // Queue email
  await db.collection('emailQueue').add({
    to: accountData.email,
    template: templates[type] || templates.upcoming,
    data: {
      clientName: accountData.name,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      daysPastDue: calculateDaysPastDue(invoice.dueDate),
      payUrl: `${process.env.CLIENT_PORTAL_URL}/invoices/${invoiceId}/pay`
    },
    status: 'pending',
    createdAt: admin.firestore.Timestamp.now()
  });
}

async function scheduleInvoiceReminder(invoiceId: string, daysFromNow: number): Promise<void> {
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + daysFromNow);

  await db.collection('scheduledTasks').add({
    type: 'invoice_reminder',
    targetId: invoiceId,
    scheduledFor: admin.firestore.Timestamp.fromDate(reminderDate),
    status: 'pending',
    createdAt: admin.firestore.Timestamp.now()
  });
}

async function notifyFinanceTeam(type: string, invoice: any): Promise<void> {
  const financeUsers = await db.collection('users')
    .where('role', 'in', ['finance_manager', 'finance_user'])
    .get();

  for (const userDoc of financeUsers.docs) {
    await createNotification(
      userDoc.id,
      'info',
      type === 'new_invoice' ? 'New Invoice Created' : 'Invoice Update',
      `Invoice ${invoice.invoiceNumber} for ${invoice.total} ${invoice.currency}`
    );
  }
}

async function notifyInvoiceStatusChange(
  invoiceId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  // Implementation for status change notifications
}

async function updateAccountStanding(accountId: string): Promise<void> {
  // Calculate account payment history
  const paidInvoices = await db.collection('invoices')
    .where('accountId', '==', accountId)
    .where('status', '==', 'paid')
    .get();

  const overdueInvoices = await db.collection('invoices')
    .where('accountId', '==', accountId)
    .where('status', '==', 'overdue')
    .get();

  const standing = overdueInvoices.size === 0 ? 'good' : 'at_risk';

  await db.collection('accounts').doc(accountId).update({
    paymentStanding: standing,
    totalPaidInvoices: paidInvoices.size,
    totalOverdueInvoices: overdueInvoices.size,
    lastPaymentStatusUpdate: admin.firestore.Timestamp.now()
  });
}

async function generateInvoiceNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const counterRef = db.collection('counters').doc('invoices');
  const counterDoc = await counterRef.get();

  let counter = 1;
  if (counterDoc.exists) {
    counter = counterDoc.data()!.value + 1;
    await counterRef.update({ value: counter });
  } else {
    await counterRef.set({ value: counter });
  }

  return `INV-${year}${month}-${String(counter).padStart(4, '0')}`;
}

function calculateDaysPastDue(dueDate: admin.firestore.Timestamp): number {
  const now = Date.now();
  const due = dueDate.toMillis();
  const dayInMs = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((now - due) / dayInMs));
}

function daysSince(date: admin.firestore.Timestamp): number {
  const now = Date.now();
  const then = date.toMillis();
  const dayInMs = 24 * 60 * 60 * 1000;
  return Math.floor((now - then) / dayInMs);
}

function getFieldChanges(before: any, after: any, fields: string[]): any[] {
  const changes = [];
  for (const field of fields) {
    if (before[field] !== after[field]) {
      changes.push({
        field,
        oldValue: before[field],
        newValue: after[field]
      });
    }
  }
  return changes;
}

async function createAuditLog(
  action: string,
  entityId: string,
  userId: string,
  metadata?: any
): Promise<void> {
  await db.collection('auditLogs').add({
    timestamp: admin.firestore.Timestamp.now(),
    userId,
    action,
    entityType: 'invoice',
    entityId,
    metadata
  });
}

async function createActivityLog(
  entityId: string,
  type: string,
  data: any
): Promise<void> {
  await db.collection('activityLogs').add({
    entityType: 'invoice',
    entityId,
    type,
    data,
    timestamp: admin.firestore.Timestamp.now()
  });
}

async function createSystemLog(
  level: string,
  action: string,
  data: any
): Promise<void> {
  await db.collection('systemLogs').add({
    level,
    action,
    data: typeof data === 'object' && data.message ? data.message : data,
    stack: typeof data === 'object' && data.stack ? data.stack : undefined,
    timestamp: admin.firestore.Timestamp.now()
  });
}

async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string
): Promise<void> {
  await db.collection('notifications').add({
    userId,
    type,
    title,
    message,
    read: false,
    emailSent: false,
    pushSent: false,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  });
}