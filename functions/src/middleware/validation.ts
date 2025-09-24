import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/firebase';

/**
 * Middleware to validate request body with Zod schema
 */
export const validateBody = <T>(schema: ZodSchema<T>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: ERROR_MESSAGES.VALIDATION_FAILED,
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred during validation',
          },
        });
      }
    }
  };
};

/**
 * Middleware to validate query parameters with Zod schema
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred during validation',
          },
        });
      }
    }
  };
};

/**
 * Middleware to validate route parameters with Zod schema
 */
export const validateParams = <T>(schema: ZodSchema<T>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid route parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
        });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred during validation',
          },
        });
      }
    }
  };
};

// Common validation schemas

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Common field validation schemas

export const emailSchema = z.string().email('Invalid email address');

export const phoneSchema = z.string().regex(
  /^\+?[1-9]\d{1,14}$/,
  'Invalid phone number format'
);

export const urlSchema = z.string().url('Invalid URL format');

export const currencySchema = z.enum(['USD', 'EGP', 'EUR', 'GBP', 'AED']);

export const languageSchema = z.enum(['en', 'ar', 'ru']);

export const percentageSchema = z.number().min(0).max(100);

export const moneySchema = z.number().min(0).multipleOf(0.01);

// Business validation schemas

export const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  accountId: z.string().min(1),
  projectTypeId: z.string().min(1),
  managerId: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  estimateBudget: moneySchema,
  currency: currencySchema,
  members: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
});

export const createInvoiceSchema = z.object({
  accountId: z.string().min(1),
  projectId: z.string().optional(),
  contractId: z.string().optional(),
  type: z.enum(['one-time', 'milestone', 'recurring']),
  dueDate: z.string().datetime(),
  currency: currencySchema,
  lineItems: z.array(z.object({
    itemId: z.string().optional(),
    itemType: z.enum(['product', 'service', 'timesheet', 'expense', 'other']),
    name: z.string().min(1),
    description: z.string().optional(),
    quantity: z.number().positive(),
    unitPrice: moneySchema,
    discount: z.number().optional(),
    discountType: z.enum(['percentage', 'fixed']).optional(),
    tax: z.number().optional(),
  })),
  terms: z.string().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
});

export const createPaymentSchema = z.object({
  invoiceId: z.string().optional(),
  accountId: z.string().min(1),
  amount: moneySchema,
  currency: currencySchema,
  method: z.enum(['stripe', 'paymob', 'instapay', 'vodafone_cash', 'bank_transfer', 'cash']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const createTicketSchema = z.object({
  accountId: z.string().min(1),
  projectId: z.string().optional(),
  assetId: z.string().optional(),
  subject: z.string().min(1).max(255),
  description: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string().optional(),
  customFields: z.record(z.any()).optional(),
});

export const createTaskSchema = z.object({
  projectId: z.string().min(1),
  phaseId: z.string().optional(),
  parentTaskId: z.string().optional(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.number().min(1).max(5).optional(),
  assigneeId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  estimateHours: z.number().positive().optional(),
  labels: z.array(z.string()).optional(),
  blockedBy: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
});

export const timesheetEntrySchema = z.object({
  projectId: z.string().min(1),
  taskId: z.string().optional(),
  date: z.string().datetime(),
  hours: z.number().positive().max(24),
  billable: z.boolean(),
  description: z.string().optional(),
  rate: moneySchema.optional(),
});

export const createOpportunitySchema = z.object({
  accountId: z.string().min(1),
  name: z.string().min(1).max(255),
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']),
  amount: moneySchema,
  currency: currencySchema,
  probability: percentageSchema,
  expectedClose: z.string().datetime(),
  source: z.string().optional(),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6),
  twoFactorCode: z.string().optional(),
});

export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(12).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number and special character'
  ),
});

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string().min(1),
  mimetype: z.string().min(1),
  size: z.number().max(100 * 1024 * 1024), // 100MB max
});

// Search and filter validation
export const searchSchema = z.object({
  query: z.string().min(1).max(255),
  filters: z.record(z.any()).optional(),
  ...paginationSchema.shape,
});

/**
 * Sanitize input to prevent XSS and injection attacks
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query params
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query) as any;
  }

  // Sanitize params
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params) as any;
  }

  next();
};

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    // Remove potential SQL injection patterns
    let sanitized = obj.replace(/(['";\\])/g, '\\$1');

    // Remove potential XSS patterns
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

    return sanitized;
  }

  return obj;
}

/**
 * Validate request content type
 */
export const requireContentType = (contentType: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.is(contentType)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: `Content-Type must be ${contentType}`,
        },
      });
      return;
    }
    next();
  };
};

/**
 * Validate request size
 */
export const limitRequestSize = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0');

    if (contentLength > maxSize) {
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: `Request size exceeds limit of ${maxSize} bytes`,
        },
      });
      return;
    }
    next();
  };
};