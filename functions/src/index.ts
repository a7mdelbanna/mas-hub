import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// Import configuration
import { getEnvConfig } from './config/environment';

// Import API routers
import authRouter from './api/auth';

// Import triggers (these will be imported when created)
// import * as invoiceTriggers from './triggers/invoice-triggers';
// import * as projectTriggers from './triggers/project-triggers';
// import * as ticketTriggers from './triggers/ticket-triggers';
// import * as opportunityTriggers from './triggers/opportunity-triggers';
// import * as candidateTriggers from './triggers/candidate-triggers';
// import * as scheduledTriggers from './triggers/scheduled-triggers';

// ============================================
// Express App Setup
// ============================================

const app = express();
const envConfig = getEnvConfig();

// Configure CORS
app.use(cors({
  origin: envConfig.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ============================================
// API Routes
// ============================================

// Authentication routes
app.use('/auth', authRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      path: req.path,
    },
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  });
});

// ============================================
// Export HTTP Function
// ============================================

// Main API endpoint
export const api = functions.region('us-central1').https.onRequest(app);

// ============================================
// Firestore Triggers (to be implemented)
// ============================================

// Example triggers - uncomment when trigger files are created
/*
export const onInvoiceCreated = invoiceTriggers.onInvoiceCreated;
export const onInvoiceUpdated = invoiceTriggers.onInvoiceUpdated;
export const onProjectCreated = projectTriggers.onProjectCreated;
export const onProjectUpdated = projectTriggers.onProjectUpdated;
export const onTicketCreated = ticketTriggers.onTicketCreated;
export const onTicketUpdated = ticketTriggers.onTicketUpdated;
*/

// ============================================
// Scheduled Functions (to be implemented)
// ============================================

// Daily scheduled tasks - runs at 9 AM UTC
export const dailyTasks = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Running daily tasks...');

    // Check overdue invoices
    // await checkOverdueInvoices();

    // Clean up expired tokens
    // await cleanupExpiredTokens();

    // Generate daily reports
    // await generateDailyReports();

    return null;
  });

// SLA monitoring - runs every 15 minutes
export const slaMonitoring = functions.pubsub
  .schedule('*/15 * * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Checking SLA breaches...');

    // Check ticket SLA breaches
    // await checkSLABreaches();

    return null;
  });

// Weekly reports - runs every Monday at 10 AM UTC
export const weeklyReports = functions.pubsub
  .schedule('0 10 * * 1')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Generating weekly reports...');

    // Generate and send weekly reports
    // await generateWeeklyReports();

    return null;
  });

// Monthly billing - runs on the 1st of each month at midnight UTC
export const monthlyBilling = functions.pubsub
  .schedule('0 0 1 * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Processing monthly billing...');

    // Process recurring invoices
    // await processRecurringInvoices();

    // Process subscriptions
    // await processSubscriptions();

    return null;
  });

// ============================================
// HTTP Functions for Webhooks
// ============================================

export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  // Verify Stripe webhook signature
  const sig = req.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe?.webhook_secret;

  if (!endpointSecret) {
    console.error('Stripe webhook secret not configured');
    res.status(500).send('Configuration error');
    return;
  }

  try {
    // Process Stripe event
    const event = req.body; // Would normally verify with Stripe SDK

    switch (event.type) {
      case 'payment_intent.succeeded':
        await processSuccessfulPayment(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await processFailedPayment(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await processInvoicePayment(event.data.object);
        break;
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.status(200).send({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).send(`Webhook Error: ${error}`);
  }
});

export const paymobWebhook = functions.https.onRequest(async (req, res) => {
  // Process Paymob webhook
  try {
    const { type, obj } = req.body;

    switch (type) {
      case 'TRANSACTION':
        if (obj.success) {
          await processPaymobPayment(obj);
        } else {
          await processPaymobFailure(obj);
        }
        break;
      default:
        console.log(`Unhandled Paymob event type: ${type}`);
    }

    res.status(200).send({ received: true });
  } catch (error) {
    console.error('Paymob webhook error:', error);
    res.status(400).send(`Webhook Error: ${error}`);
  }
});

// ============================================
// Callable Functions for Complex Operations
// ============================================

export const convertDealToProject = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Verify permissions
  const hasPermission = await checkUserPermission(context.auth.uid, 'opportunities', 'convert');
  if (!hasPermission) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    const { opportunityId } = data;
    const WorkflowRules = await import('./rules/workflow-rules');
    const engine = new WorkflowRules.default(admin.firestore());

    const projectId = await engine.convertDealToProject(opportunityId);

    return { success: true, projectId };
  } catch (error) {
    console.error('Deal conversion error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to convert deal to project');
  }
});

export const processApproval = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const { approvalRequestId, action, comments } = data;
    const ApprovalRules = await import('./rules/approval-rules');
    const engine = new ApprovalRules.default(admin.firestore());

    await engine.processApproval(approvalRequestId, context.auth.uid, action, comments);

    return { success: true };
  } catch (error) {
    console.error('Approval processing error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process approval');
  }
});

export const generateInvoice = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Verify permissions
  const hasPermission = await checkUserPermission(context.auth.uid, 'invoices', 'create');
  if (!hasPermission) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  try {
    const { projectId, type, lineItems } = data;

    // Generate invoice
    const invoice = await createInvoice(projectId, type, lineItems, context.auth.uid);

    return { success: true, invoiceId: invoice.id };
  } catch (error) {
    console.error('Invoice generation error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate invoice');
  }
});

// ============================================
// Helper Functions
// ============================================

async function checkUserPermission(userId: string, resource: string, action: string): Promise<boolean> {
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  if (!userDoc.exists) return false;

  const userData = userDoc.data()!;
  const role = userData.role;

  // Check role-based permissions
  const roleDoc = await admin.firestore().collection('roles').doc(role).get();
  if (!roleDoc.exists) return false;

  const permissions = roleDoc.data()!.permissions || [];
  return permissions.some((p: any) =>
    p.resource === resource && p.actions.includes(action)
  );
}

async function processSuccessfulPayment(paymentIntent: any): Promise<void> {
  // Update payment record
  const payments = await admin.firestore().collection('payments')
    .where('gatewayTransactionId', '==', paymentIntent.id)
    .get();

  if (!payments.empty) {
    const paymentDoc = payments.docs[0];
    await paymentDoc.ref.update({
      status: 'completed',
      paidAt: admin.firestore.Timestamp.now(),
      gatewayResponse: paymentIntent
    });

    // Trigger payment workflow
    const WorkflowRules = await import('./rules/workflow-rules');
    const engine = new WorkflowRules.default(admin.firestore());
    await engine.processInvoicePayment(paymentDoc.id);
  }
}

async function processFailedPayment(paymentIntent: any): Promise<void> {
  // Update payment record
  const payments = await admin.firestore().collection('payments')
    .where('gatewayTransactionId', '==', paymentIntent.id)
    .get();

  if (!payments.empty) {
    const paymentDoc = payments.docs[0];
    await paymentDoc.ref.update({
      status: 'failed',
      failedAt: admin.firestore.Timestamp.now(),
      failureReason: paymentIntent.last_payment_error?.message,
      gatewayResponse: paymentIntent
    });

    // Notify customer
    const payment = paymentDoc.data();
    await createNotification(
      payment.accountId,
      'error',
      'Payment Failed',
      `Payment of ${payment.currency} ${payment.amount} failed. Please try again.`
    );
  }
}

async function processInvoicePayment(stripeInvoice: any): Promise<void> {
  // Find and update invoice
  const invoices = await admin.firestore().collection('invoices')
    .where('stripeInvoiceId', '==', stripeInvoice.id)
    .get();

  if (!invoices.empty) {
    const invoiceDoc = invoices.docs[0];
    const invoice = invoiceDoc.data();

    // Create payment record
    const payment = {
      paymentNumber: await generatePaymentNumber(),
      invoiceId: invoiceDoc.id,
      accountId: invoice.accountId,
      amount: stripeInvoice.amount_paid / 100, // Convert from cents
      currency: stripeInvoice.currency.toUpperCase(),
      status: 'completed',
      method: 'stripe',
      paidAt: admin.firestore.Timestamp.fromMillis(stripeInvoice.status_transitions.paid_at * 1000),
      gatewayTransactionId: stripeInvoice.payment_intent,
      gatewayResponse: stripeInvoice,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    const paymentRef = await admin.firestore().collection('payments').add(payment);

    // Trigger payment workflow
    const WorkflowRules = await import('./rules/workflow-rules');
    const engine = new WorkflowRules.default(admin.firestore());
    await engine.processInvoicePayment(paymentRef.id);
  }
}

async function processPaymobPayment(transaction: any): Promise<void> {
  // Similar to Stripe payment processing
  // Implementation would depend on Paymob's specific data structure
}

async function processPaymobFailure(transaction: any): Promise<void> {
  // Similar to Stripe failure processing
}

async function createInvoice(
  projectId: string,
  type: string,
  lineItems: any[],
  createdBy: string
): Promise<any> {
  // Get project details
  const projectDoc = await admin.firestore().collection('projects').doc(projectId).get();
  if (!projectDoc.exists) {
    throw new Error('Project not found');
  }

  const project = projectDoc.data()!;

  // Calculate totals
  let subtotal = 0;
  for (const item of lineItems) {
    item.lineTotal = item.quantity * item.unitPrice;
    subtotal += item.lineTotal;
  }

  const tax = subtotal * 0.14; // 14% tax rate (configurable)
  const total = subtotal + tax;

  // Create invoice
  const invoice = {
    invoiceNumber: await generateInvoiceNumber(),
    accountId: project.accountId,
    projectId,
    type,
    status: 'draft',
    issueDate: admin.firestore.Timestamp.now(),
    dueDate: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    ),
    currency: project.currency,
    subtotal,
    tax,
    total,
    paidAmount: 0,
    balanceDue: total,
    lineItems,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    createdBy
  };

  const invoiceRef = await admin.firestore().collection('invoices').add(invoice);
  return { id: invoiceRef.id, ...invoice };
}

async function generateInvoiceNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const counter = await getNextCounter('invoices');
  return `INV-${year}${month}-${String(counter).padStart(4, '0')}`;
}

async function generatePaymentNumber(): Promise<string> {
  const counter = await getNextCounter('payments');
  return `PAY-${String(counter).padStart(8, '0')}`;
}

async function getNextCounter(collection: string): Promise<number> {
  const counterRef = admin.firestore().collection('counters').doc(collection);
  const counterDoc = await counterRef.get();

  let counter = 1;
  if (counterDoc.exists) {
    counter = counterDoc.data()!.value + 1;
    await counterRef.update({ value: counter });
  } else {
    await counterRef.set({ value: counter });
  }

  return counter;
}

async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string
): Promise<void> {
  await admin.firestore().collection('notifications').add({
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