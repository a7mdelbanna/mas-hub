import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building,
  CreditCard,
  Wallet,
  PiggyBank,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { Account } from '../../../types/finance.types';

const accountTypeIcons = {
  asset: { icon: Building, color: 'from-emerald-500 to-emerald-600' },
  liability: { icon: CreditCard, color: 'from-red-500 to-red-600' },
  equity: { icon: PiggyBank, color: 'from-purple-500 to-purple-600' },
  revenue: { icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
  expense: { icon: Receipt, color: 'from-orange-500 to-orange-600' }
};

const accountTypeColors = {
  asset: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300' },
  liability: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300' },
  equity: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300' },
  revenue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300' },
  expense: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300' }
};

export default function AccountsList() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadAccounts();
    setMounted(true);
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await financeService.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          account.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || account.type === filterType;
    return matchesSearch && matchesType;
  });

  const getAccountSummary = () => {
    const totalAssets = accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0);
    const totalRevenue = accounts.filter(a => a.type === 'revenue').reduce((sum, a) => sum + a.balance, 0);
    const totalExpenses = accounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.balance, 0);

    return { totalAssets, totalLiabilities, totalRevenue, totalExpenses };
  };

  const summary = getAccountSummary();

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/40 dark:from-gray-950 dark:via-emerald-950/30 dark:to-blue-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-300 dark:bg-emerald-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative p-8 space-y-8">
        {/* Header with Summary */}
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 p-[1px]">
            <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-purple-600/10 opacity-50"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg">
                      <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Chart of Accounts
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">Manage your financial accounts</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {/* TODO: Add create account modal */}}
                    className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>New Account</span>
                    </span>
                  </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Assets</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        ${summary.totalAssets.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Liabilities</p>
                      <p className="text-2xl font-bold text-red-600">
                        ${summary.totalLiabilities.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${summary.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Expenses</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ${summary.totalExpenses.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and View Controls */}
        <div className={`flex flex-wrap items-center justify-between gap-4 transition-all duration-700 delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="asset">Assets</option>
              <option value="liability">Liabilities</option>
              <option value="equity">Equity</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expenses</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Accounts Grid/List */}
        <div className={`transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAccounts.map((account, index) => (
                <div
                  key={account.id}
                  className="group relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition duration-500"></div>

                  <div className="relative cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl bg-gradient-to-r ${accountTypeIcons[account.type].color} shadow-lg`}>
                          {React.createElement(accountTypeIcons[account.type].icon, { className: 'h-5 w-5 text-white' })}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                            {account.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{account.code}</p>
                        </div>
                      </div>
                      <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Type Badge */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${accountTypeColors[account.type].bg} ${accountTypeColors[account.type].text}`}>
                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{account.category}</span>
                    </div>

                    {/* Balance */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Balance</span>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${account.balance.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {account.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {account.description}
                      </p>
                    )}

                    {/* Status */}
                    <div className="flex items-center justify-between mt-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                        account.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAccounts.map((account, index) => (
                <div
                  key={account.id}
                  className="group relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>

                  <div className="relative cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${accountTypeIcons[account.type].color} shadow-lg`}>
                          {React.createElement(accountTypeIcons[account.type].icon, { className: 'h-6 w-6 text-white' })}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{account.name}</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">({account.code})</span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${accountTypeColors[account.type].bg} ${accountTypeColors[account.type].text}`}>
                              {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{account.category} • {account.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${account.balance.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
                        </div>

                        <div className="text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                            account.isActive
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <MoreVertical className="h-5 w-5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}