import React, { useState, useEffect } from 'react';
import { Plus, Ticket, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { supportService } from '../../../services/support.service';
import { Ticket as TicketType } from '../../../types/support.types';

export default function TicketsList() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadTickets();
    setMounted(true);
  }, []);

  const loadTickets = async () => {
    try {
      const data = await supportService.getTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    }
  };

  const statusColors = {
    'open': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'in-progress': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'resolved': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    'closed': 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    'on-hold': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
  };

  const priorityColors = {
    'low': 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    'medium': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'high': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    'urgent': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-red-50/40 dark:from-gray-950 dark:via-blue-950/30 dark:to-red-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="relative p-8">
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-red-600 to-purple-600 p-[1px]">
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-red-600 shadow-lg">
                    <Ticket className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Ticket Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Track and manage customer support tickets</p>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Plus className="h-5 w-5 inline mr-2" />
                  New Ticket
                </button>
              </div>

              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{ticket.title}</h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">#{ticket.number}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{ticket.description}</p>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {ticket.customer.name} • {ticket.customer.company}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Assigned to: {ticket.assignedUser?.name || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex flex-col space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('-', ' ')}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)} Priority
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">SLA Level</p>
                        <p className="font-bold text-blue-700 dark:text-blue-200">
                          {ticket.sla.level.charAt(0).toUpperCase() + ticket.sla.level.slice(1)}
                        </p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                        <p className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">Time Remaining</p>
                        <p className="font-bold text-emerald-700 dark:text-emerald-200">
                          {ticket.sla.timeRemaining}h
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <p className="text-sm text-purple-600 dark:text-purple-300 mb-1">Category</p>
                        <p className="font-bold text-purple-700 dark:text-purple-200">
                          {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1).replace('-', ' ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <div className="flex space-x-2">
                        {ticket.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
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