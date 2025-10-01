import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Separator } from '../../../components/ui/separator';
import { Loader2, CreditCard, Building, Smartphone, Banknote } from 'lucide-react';
import { usePayment } from '../hooks/usePayment';
import { PaymentMethod, Currency } from '../../../types';
import { formatCurrency } from '../utils/payment-utils';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');

export interface PaymentFormProps {
  invoiceId: string;
  accountId: string;
  amount: number;
  currency: Currency;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

interface PaymentMethodOption {
  method: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  fee?: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  invoiceId,
  accountId,
  amount,
  currency,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [billingData, setBillingData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    country: 'EG',
    city: '',
    street: '',
  });
  const [walletNumber, setWalletNumber] = useState('');

  const {
    createPayment,
    confirmPayment,
    loading,
    error,
    paymentResult,
  } = usePayment();

  useEffect(() => {
    // Load available payment methods based on currency
    loadPaymentMethods();
  }, [currency]);

  useEffect(() => {
    // Handle successful payment
    if (paymentResult?.success && onSuccess) {
      onSuccess(paymentResult.paymentId);
    }
  }, [paymentResult, onSuccess]);

  useEffect(() => {
    // Handle payment errors
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const loadPaymentMethods = () => {
    const methods: PaymentMethodOption[] = [];

    // Stripe (for international currencies)
    if (['USD', 'EUR', 'GBP'].includes(currency)) {
      methods.push({
        method: PaymentMethod.STRIPE,
        name: 'Credit/Debit Card',
        description: 'Pay with credit or debit card',
        icon: <CreditCard className="w-5 h-5" />,
        enabled: true,
        fee: '2.9% + $0.30',
      });
    }

    // Paymob (for EGP)
    if (currency === 'EGP') {
      methods.push(
        {
          method: PaymentMethod.PAYMOB,
          name: 'Credit/Debit Card',
          description: 'Pay with credit or debit card (Egypt)',
          icon: <CreditCard className="w-5 h-5" />,
          enabled: true,
          fee: '2.5% + EGP 2',
        },
        {
          method: PaymentMethod.VODAFONE_CASH,
          name: 'Vodafone Cash',
          description: 'Pay with Vodafone Cash wallet',
          icon: <Smartphone className="w-5 h-5" />,
          enabled: true,
          fee: '2.5% + EGP 2',
        },
        {
          method: PaymentMethod.INSTAPAY,
          name: 'InstaPay',
          description: 'Pay with InstaPay',
          icon: <Smartphone className="w-5 h-5" />,
          enabled: true,
          fee: '2.5% + EGP 2',
        }
      );
    }

    // Manual methods (always available)
    methods.push(
      {
        method: PaymentMethod.BANK_TRANSFER,
        name: 'Bank Transfer',
        description: 'Transfer funds to our bank account',
        icon: <Building className="w-5 h-5" />,
        enabled: true,
        fee: 'No processing fee',
      },
      {
        method: PaymentMethod.CASH,
        name: 'Cash Payment',
        description: 'Pay in cash at our office',
        icon: <Banknote className="w-5 h-5" />,
        enabled: true,
        fee: 'No processing fee',
      }
    );

    setPaymentMethods(methods);

    // Set default selection
    if (methods.length > 0) {
      setSelectedMethod(methods[0].method);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;

    const paymentData = {
      invoiceId,
      accountId,
      amount,
      currency,
      method: selectedMethod,
      description: `Payment for invoice ${invoiceId}`,
      successUrl: `${window.location.origin}/payments/success`,
      cancelUrl: `${window.location.origin}/payments/cancel`,
      billingData: selectedMethod in [PaymentMethod.PAYMOB, PaymentMethod.INSTAPAY, PaymentMethod.VODAFONE_CASH]
        ? billingData
        : undefined,
      walletNumber: selectedMethod === PaymentMethod.VODAFONE_CASH ? walletNumber : undefined,
    };

    await createPayment(paymentData);
  };

  const renderPaymentMethodForm = () => {
    switch (selectedMethod) {
      case PaymentMethod.STRIPE:
        return (
          <Elements stripe={stripePromise}>
            <StripePaymentForm
              amount={amount}
              currency={currency}
              onPayment={handlePayment}
              loading={loading}
            />
          </Elements>
        );

      case PaymentMethod.PAYMOB:
      case PaymentMethod.INSTAPAY:
        return (
          <PaymobPaymentForm
            billingData={billingData}
            setBillingData={setBillingData}
            onPayment={handlePayment}
            loading={loading}
          />
        );

      case PaymentMethod.VODAFONE_CASH:
        return (
          <VodafoneCashForm
            billingData={billingData}
            setBillingData={setBillingData}
            walletNumber={walletNumber}
            setWalletNumber={setWalletNumber}
            onPayment={handlePayment}
            loading={loading}
          />
        );

      case PaymentMethod.BANK_TRANSFER:
      case PaymentMethod.CASH:
        return (
          <ManualPaymentForm
            method={selectedMethod}
            onPayment={handlePayment}
            loading={loading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payment</span>
          <span className="text-2xl font-bold text-green-600">
            {formatCurrency(amount, currency)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <Label className="text-base font-semibold">Select Payment Method</Label>
          <RadioGroup
            value={selectedMethod || ''}
            onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
            className="mt-3"
          >
            {paymentMethods.map((method) => (
              <div
                key={method.method}
                className={`flex items-center space-x-3 p-4 border rounded-lg ${
                  selectedMethod === method.method
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <RadioGroupItem
                  value={method.method}
                  disabled={!method.enabled}
                />
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {method.icon}
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                    </div>
                  </div>
                  {method.fee && (
                    <div className="text-sm text-gray-500">{method.fee}</div>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Payment Form */}
        {selectedMethod && (
          <div>
            <Label className="text-base font-semibold">Payment Details</Label>
            <div className="mt-3">
              {renderPaymentMethodForm()}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Result */}
        {paymentResult && !paymentResult.success && (
          <Alert variant="destructive">
            <AlertDescription>{paymentResult.error || 'Payment failed'}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Stripe Payment Form Component
interface StripePaymentFormProps {
  amount: number;
  currency: Currency;
  onPayment: () => void;
  loading: boolean;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  currency,
  onPayment,
  loading,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement options={cardElementOptions} />
      </div>
      <Button
        onClick={onPayment}
        disabled={!stripe || !elements || loading}
        className="w-full"
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Pay {formatCurrency(amount, currency)}
      </Button>
    </div>
  );
};

// Paymob Payment Form Component
interface PaymobPaymentFormProps {
  billingData: any;
  setBillingData: (data: any) => void;
  onPayment: () => void;
  loading: boolean;
}

const PaymobPaymentForm: React.FC<PaymobPaymentFormProps> = ({
  billingData,
  setBillingData,
  onPayment,
  loading,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={billingData.first_name}
            onChange={(e) =>
              setBillingData({ ...billingData, first_name: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={billingData.last_name}
            onChange={(e) =>
              setBillingData({ ...billingData, last_name: e.target.value })
            }
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={billingData.email}
          onChange={(e) =>
            setBillingData({ ...billingData, email: e.target.value })
          }
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={billingData.phone_number}
          onChange={(e) =>
            setBillingData({ ...billingData, phone_number: e.target.value })
          }
          required
        />
      </div>
      <Button onClick={onPayment} disabled={loading} className="w-full">
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Continue to Payment
      </Button>
    </div>
  );
};

// Vodafone Cash Form Component
interface VodafoneCashFormProps {
  billingData: any;
  setBillingData: (data: any) => void;
  walletNumber: string;
  setWalletNumber: (number: string) => void;
  onPayment: () => void;
  loading: boolean;
}

const VodafoneCashForm: React.FC<VodafoneCashFormProps> = ({
  billingData,
  setBillingData,
  walletNumber,
  setWalletNumber,
  onPayment,
  loading,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="walletNumber">Vodafone Cash Number</Label>
        <Input
          id="walletNumber"
          value={walletNumber}
          onChange={(e) => setWalletNumber(e.target.value)}
          placeholder="01xxxxxxxxx"
          required
        />
      </div>
      <PaymobPaymentForm
        billingData={billingData}
        setBillingData={setBillingData}
        onPayment={onPayment}
        loading={loading}
      />
    </div>
  );
};

// Manual Payment Form Component
interface ManualPaymentFormProps {
  method: PaymentMethod;
  onPayment: () => void;
  loading: boolean;
}

const ManualPaymentForm: React.FC<ManualPaymentFormProps> = ({
  method,
  onPayment,
  loading,
}) => {
  const methodNames = {
    [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
    [PaymentMethod.CASH]: 'Cash Payment',
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          After clicking continue, you will receive detailed instructions for {methodNames[method as keyof typeof methodNames]}.
        </div>
      </div>
      <Button onClick={onPayment} disabled={loading} className="w-full">
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Get Payment Instructions
      </Button>
    </div>
  );
};

export default PaymentForm;