# MAS Business OS - Payment Integration Documentation

## Overview

This document describes the comprehensive payment integration system for MAS Business OS, supporting multiple payment providers and methods including Stripe, Paymob, and manual payment methods.

## Architecture

The payment system follows a layered architecture:

```
┌─────────────────────────────────────────┐
│           Frontend Components           │
│  (PaymentForm, PaymentHistory, etc.)    │
├─────────────────────────────────────────┤
│              API Layer                  │
│      (/api/payments endpoints)          │
├─────────────────────────────────────────┤
│           PaymentService                │
│        (Unified Interface)              │
├─────────────────────────────────────────┤
│        Payment Integrations             │
│    ┌─────────┐  ┌──────────────────┐    │
│    │ Stripe  │  │     Paymob       │    │
│    │         │  │                  │    │
│    └─────────┘  └──────────────────┘    │
├─────────────────────────────────────────┤
│           Webhook Handlers              │
│     (Stripe & Paymob Events)            │
└─────────────────────────────────────────┘
```

## Payment Methods Supported

### 1. Stripe (International)
- **Credit/Debit Cards**: Visa, Mastercard, American Express
- **Payment Intents**: For programmatic payments
- **Checkout Sessions**: For hosted payment pages
- **Subscriptions**: For recurring payments
- **Currencies**: USD, EUR, GBP, and others

### 2. Paymob (Egypt)
- **Credit/Debit Cards**: Local and international cards
- **Vodafone Cash**: Mobile wallet payments
- **InstaPay**: Egyptian instant payment system
- **Currency**: EGP

### 3. Manual Methods
- **Bank Transfer**: With payment instructions
- **Cash**: Office payment with reference number

## Implementation Details

### Backend Structure

```
functions/src/
├── integrations/
│   ├── stripe/
│   │   ├── stripe-client.ts           # Stripe SDK initialization
│   │   ├── payment-intent.ts          # Payment intent management
│   │   ├── checkout-session.ts        # Checkout session handling
│   │   ├── customer.ts                # Customer management
│   │   ├── subscription.ts            # Recurring payments
│   │   ├── refund.ts                  # Refund processing
│   │   ├── webhook-handler.ts         # Stripe webhook events
│   │   └── index.ts                   # Exports
│   └── paymob/
│       ├── paymob-client.ts           # Paymob API client
│       ├── payment-order.ts           # Order management
│       ├── token.ts                   # Payment token generation
│       ├── transaction.ts             # Transaction queries
│       ├── refund.ts                  # Refund processing
│       ├── webhook-handler.ts         # Paymob webhook events
│       └── index.ts                   # Exports
├── services/
│   └── PaymentService.ts              # Unified payment interface
├── api/payments/
│   ├── create-payment.ts              # Payment creation
│   ├── confirm-payment.ts             # Payment confirmation
│   ├── payment-status.ts              # Status checks
│   ├── payment-history.ts             # History & analytics
│   ├── refund.ts                      # Refund management
│   └── index.ts                       # Route definitions
└── webhooks/
    ├── stripe-webhook.ts              # Stripe webhook endpoint
    ├── paymob-webhook.ts              # Paymob webhook endpoint
    ├── webhook-security.ts            # Security utilities
    └── index.ts                       # Webhook routes
```

### Frontend Structure

```
apps/web/src/modules/payments/
├── components/
│   ├── PaymentForm.tsx                # Main payment form
│   ├── PaymentMethods.tsx             # Method selection
│   ├── PaymentHistory.tsx             # Transaction history
│   └── InvoicePayment.tsx             # Invoice payment flow
├── hooks/
│   └── usePayment.ts                  # Payment React hooks
└── utils/
    └── payment-utils.ts               # Utility functions
```

## API Endpoints

### Payment Management
- `POST /api/payments` - Create payment
- `GET /api/payments/methods` - Get available methods
- `GET /api/payments/fees/estimate` - Estimate fees
- `POST /api/payments/:id/confirm` - Confirm payment
- `POST /api/payments/:id/confirm-manual` - Manual confirmation
- `POST /api/payments/:id/cancel` - Cancel payment
- `GET /api/payments/:id` - Get payment status
- `GET /api/payments` - Payment history
- `GET /api/payments/analytics` - Payment analytics

### Refund Management
- `POST /api/payments/refunds` - Create refund
- `GET /api/payments/refunds/:id` - Get refund status
- `GET /api/payments/:id/refunds` - Payment refunds
- `GET /api/payments/refunds` - Refund history

### Webhooks
- `POST /webhooks/stripe` - Stripe webhook endpoint
- `POST /webhooks/paymob` - Paymob webhook endpoint
- `GET /webhooks/paymob/callback` - Paymob callback
- `GET /webhooks/health` - Health check

## Configuration

### Environment Variables

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...

# Paymob Configuration
PAYMOB_API_KEY=your_api_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_MERCHANT_ID=your_merchant_id
PAYMOB_WEBHOOK_SECRET=your_webhook_secret
```

### Firebase Configuration

```typescript
// functions/src/config/firebase.ts
export const config = {
  payment: {
    stripe: {
      secretKey: functions.config().stripe?.secret_key,
      webhookSecret: functions.config().stripe?.webhook_secret,
      currency: 'usd',
    },
    paymob: {
      apiKey: functions.config().paymob?.api_key,
      integrationId: functions.config().paymob?.integration_id,
      merchantId: functions.config().paymob?.merchant_id,
      webhookSecret: functions.config().paymob?.webhook_secret,
    },
  },
};
```

## Payment Flow Examples

### 1. Stripe Card Payment

```typescript
// Create payment intent
const paymentData = {
  invoiceId: 'inv_123',
  accountId: 'acc_456',
  amount: 100.00,
  currency: 'USD',
  method: 'stripe',
  paymentMethodId: 'pm_card_visa', // Optional
};

const result = await paymentService.processPayment(paymentData);

// Frontend confirmation with Stripe Elements
const { error, paymentIntent } = await stripe.confirmCardPayment(
  result.stripeData.clientSecret,
  {
    payment_method: {
      card: elements.getElement(CardElement),
    }
  }
);
```

### 2. Paymob Payment

```typescript
// Create Paymob order and token
const paymentData = {
  invoiceId: 'inv_123',
  accountId: 'acc_456',
  amount: 1000.00,
  currency: 'EGP',
  method: 'paymob',
  billingData: {
    email: 'customer@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone_number: '01234567890',
    // ... other billing fields
  },
};

const result = await paymentService.processPayment(paymentData);

// Redirect to Paymob iframe
window.location.href = result.paymobData.iframeUrl;
```

### 3. Manual Bank Transfer

```typescript
// Generate payment instructions
const paymentData = {
  invoiceId: 'inv_123',
  accountId: 'acc_456',
  amount: 500.00,
  currency: 'USD',
  method: 'bank_transfer',
};

const result = await paymentService.processPayment(paymentData);

// Display instructions to user
console.log(result.manualData.instructions);
console.log('Reference:', result.manualData.referenceNumber);
```

## Webhook Event Handling

### Stripe Events
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `checkout.session.completed` - Checkout completed
- `invoice.paid` - Invoice paid (subscriptions)
- `customer.subscription.created` - Subscription started
- `charge.refund.updated` - Refund processed

### Paymob Events
- `transaction.processed` - Transaction completed
- `transaction.failed` - Transaction failed
- `refund.processed` - Refund completed

### Event Processing
```typescript
// Stripe webhook handler
export async function handleStripeWebhook(req: Request, res: Response) {
  const payload = req.body;
  const signature = req.headers['stripe-signature'];

  const result = await stripeWebhookHandler.handleWebhook(payload, signature);

  res.status(200).json({ received: true });
}

// Paymob webhook handler
export async function handlePaymobWebhook(req: Request, res: Response) {
  const payload = req.body;
  const signature = req.headers['x-paymob-signature'];

  const result = await paymobWebhookHandler.handleWebhook(payload, signature);

  res.status(200).json({ received: true });
}
```

## Security Considerations

### 1. Webhook Security
- **Signature Verification**: All webhooks verify cryptographic signatures
- **Rate Limiting**: 1000 requests per minute per IP
- **IP Whitelisting**: Optional restriction to known provider IPs
- **Idempotency**: Duplicate webhook prevention
- **HTTPS Only**: All endpoints require TLS

### 2. Data Protection
- **PCI Compliance**: No card data stored locally
- **Encryption**: All sensitive data encrypted at rest
- **Access Control**: Role-based payment permissions
- **Audit Logging**: All payment operations logged

### 3. Error Handling
- **Graceful Degradation**: Fallback payment methods
- **Retry Logic**: Automatic retry for failed payments
- **User Feedback**: Clear error messages
- **Monitoring**: Real-time payment monitoring

## Testing

### Test Card Numbers

#### Stripe Test Cards
```
Visa: 4242424242424242
Visa (debit): 4000056655665556
Mastercard: 5555555555554444
American Express: 378282246310005
Declined: 4000000000000002
```

#### Paymob Test Environment
- Use Paymob's staging environment
- Test integration credentials provided by Paymob
- Test mobile wallet numbers provided in documentation

### Test Webhooks
```bash
# Test Stripe webhook
curl -X POST http://localhost:3000/webhooks/stripe/test

# Test Paymob webhook
curl -X POST http://localhost:3000/webhooks/paymob/test
```

## Deployment

### 1. Backend Deployment
```bash
# Install dependencies
npm install

# Deploy Firebase Functions
firebase deploy --only functions
```

### 2. Frontend Deployment
```bash
# Build frontend
npm run build

# Deploy to hosting
firebase deploy --only hosting
```

### 3. Environment Setup
```bash
# Set Firebase configuration
firebase functions:config:set stripe.secret_key="sk_live_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."
firebase functions:config:set paymob.api_key="your_key"
firebase functions:config:set paymob.integration_id="12345"
```

## Monitoring and Analytics

### Payment Analytics
- Total payments by method
- Success/failure rates
- Average transaction amounts
- Revenue by time period
- Refund rates and amounts

### Health Monitoring
- Webhook delivery success rates
- API response times
- Error rates and types
- Payment provider uptime

### Alerts
- Failed payment webhooks
- High error rates
- Unusual payment patterns
- Security incidents

## Troubleshooting

### Common Issues

#### 1. Webhook Not Received
- Check webhook URL configuration in provider dashboard
- Verify endpoint is publicly accessible
- Check webhook signature configuration
- Review webhook logs for errors

#### 2. Payment Fails
- Verify API credentials
- Check payment method restrictions
- Confirm currency support
- Review error logs

#### 3. Duplicate Payments
- Check idempotency key usage
- Verify webhook deduplication
- Review payment status before retry

### Support Contacts
- **Stripe Support**: https://support.stripe.com
- **Paymob Support**: https://docs.paymob.com
- **Internal Support**: devops@mas-business.com

## Appendices

### A. Error Codes
- `PAYMENT_FAILED` - Generic payment failure
- `INSUFFICIENT_FUNDS` - Card declined
- `INVALID_PAYMENT_METHOD` - Invalid payment data
- `WEBHOOK_SIGNATURE_FAILED` - Invalid webhook signature
- `RATE_LIMIT_EXCEEDED` - Too many requests

### B. Status Codes
- `pending` - Payment initiated
- `processing` - Payment being processed
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

### C. Currencies Supported
- **Stripe**: USD, EUR, GBP, CAD, AUD, JPY
- **Paymob**: EGP
- **Manual**: All currencies

---

**Document Version**: 1.0
**Last Updated**: 2025-01-25
**Author**: MAS Development Team