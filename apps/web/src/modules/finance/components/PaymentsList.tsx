import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  CreditCard,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { Payment } from '../../../types/finance.types';

export default function PaymentsList() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadPayments();
    setMounted(true);
  }, []);

  const loadPayments = async () => {
    try {
      const data = await financeService.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/40 dark:from-gray-950 dark:via-emerald-950/30 dark:to-blue-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-300 dark:bg-emerald-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative p-8">
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 p-[1px]">
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Payments & Collections
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Track all payment transactions</p>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Plus className="h-5 w-5 inline mr-2" />
                  Record Payment
                </button>
              </div>

              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${payment.type === 'received' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                          {payment.type === 'received' ? (
                            <TrendingUp className={`h-6 w-6 ${payment.type === 'received' ? 'text-emerald-600' : 'text-red-600'}`} />
                          ) : (
                            <TrendingDown className={`h-6 w-6 ${payment.type === 'received' ? 'text-emerald-600' : 'text-red-600'}`} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{payment.description}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{payment.reference} • {payment.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${payment.type === 'received' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {payment.type === 'received' ? '+' : '-'}${payment.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}