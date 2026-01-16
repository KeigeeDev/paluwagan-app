import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { fetchTransactions, getFiscalYear } from './transactionService';
import TransactionModal from './TransactionModal';

export default function TransactionsPage() {
    const { currentUser, userRole } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [selectedYear, setSelectedYear] = useState(getFiscalYear());

    // Filters
    const [filters, setFilters] = useState({
        date: '',
        type: '',
        name: '',
        status: ''
    });

    const loadData = async () => {
        setLoading(true);
        // If admin, use selectedYear filter. If member, always fetch current + history (or just let backend handle it)
        // For now, re-using logic: Admin gets all, Member gets own.
        const yearParam = userRole === 'admin' && selectedYear !== 'all' ? selectedYear : null;
        const data = await fetchTransactions(userRole, currentUser?.uid, yearParam);
        setTransactions(data);
        setLoading(false);
    };

    useEffect(() => {
        if (currentUser) {
            loadData();
        }
    }, [currentUser, selectedYear]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            if (filters.date) {
                const txDate = new Date(t.date.seconds * 1000).toISOString().split('T')[0];
                if (txDate !== filters.date) return false;
            }
            if (filters.type && t.type !== filters.type) return false;

            if (filters.name) {
                const name = (t.beneficiaryName || 'Self').toLowerCase();
                if (!name.includes(filters.name.toLowerCase())) return false;
            }

            if (filters.status && t.status !== filters.status) return false;

            return true;
        });
    }, [transactions, filters]);

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-dark">Transactions</h1>
                    <p className="text-slate-500">
                        {userRole === 'admin' ? 'Viewing all system transactions' : 'Viewing your transaction history'}
                    </p>
                </div>

                <div className="flex gap-2 items-center">
                    {userRole === 'admin' && (
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="p-2 border rounded-md text-sm bg-white focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value={getFiscalYear()}>{getFiscalYear()} (Current)</option>
                            <option value={getFiscalYear() - 1}>{getFiscalYear() - 1}</option>
                            <option value="all">All Years</option>
                        </select>
                    )}

                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                        Refresh
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                            <tr>
                                <th className="p-4 align-top">
                                    <div className="flex flex-col gap-2">
                                        <span>Date</span>
                                        <input
                                            type="date"
                                            className="p-1 border rounded text-xs font-normal normal-case focus:outline-none focus:ring-1 focus:ring-primary w-full"
                                            value={filters.date}
                                            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                                        />
                                    </div>
                                </th>
                                <th className="p-4 align-top">
                                    <div className="flex flex-col gap-2">
                                        <span>Type</span>
                                        <select
                                            className="p-1 border rounded text-xs font-normal normal-case focus:outline-none focus:ring-1 focus:ring-primary w-full"
                                            value={filters.type}
                                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                        >
                                            <option value="">All</option>
                                            <option value="HULOG">Hulog</option>
                                            <option value="UTANG">Utang</option>
                                            <option value="PAYMENT">Payment</option>
                                        </select>
                                    </div>
                                </th>
                                <th className="p-4 align-top">
                                    <div className="flex flex-col gap-2">
                                        <span>Beneficiary</span>
                                        <input
                                            type="text"
                                            placeholder="Filter name..."
                                            className="p-1 border rounded text-xs font-normal normal-case focus:outline-none focus:ring-1 focus:ring-primary w-full min-w-[120px]"
                                            value={filters.name}
                                            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                    </div>
                                </th>
                                <th className="p-4 align-top">Amount / Balance</th>
                                <th className="p-4 align-top">Interest</th>
                                <th className="p-4 align-top">
                                    <div className="flex flex-col gap-2">
                                        <span>Status</span>
                                        <select
                                            className="p-1 border rounded text-xs font-normal normal-case focus:outline-none focus:ring-1 focus:ring-primary w-full"
                                            value={filters.status}
                                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                        >
                                            <option value="">All</option>
                                            <option value="approved">Approved</option>
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">Loading transactions...</td>
                                </tr>
                            ) : filteredTransactions.length > 0 ? (
                                filteredTransactions.map(t => (
                                    <tr
                                        key={t.id}
                                        onClick={() => setSelectedTransaction(t)}
                                        className="hover:bg-slate-50 cursor-pointer transition group"
                                    >
                                        <td className="p-4 text-slate-500 text-sm">
                                            {t.date ? new Date(t.date.seconds * 1000).toLocaleDateString() : 'N/A'}
                                            <div className="text-xs text-slate-400">
                                                {t.date ? new Date(t.date.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'HULOG' ? 'bg-emerald-100 text-emerald-700' :
                                                    t.type === 'PAYMENT' ? 'bg-indigo-100 text-indigo-700' :
                                                        'bg-rose-100 text-rose-700'
                                                }`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-slate-700 group-hover:text-primary transition">
                                            {t.beneficiaryName || 'Self'}
                                        </td>
                                        <td className={`p-4 font-bold ${t.type === 'HULOG' ? 'text-emerald-600' :
                                                t.type === 'PAYMENT' ? 'text-indigo-600' :
                                                    'text-rose-600'
                                            }`}>
                                            {t.type === 'UTANG' ?
                                                <span>₱ {t.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> :
                                                <span>₱ {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            }
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">
                                            {t.totalInterest && t.totalInterest > 0 ? (
                                                <span className="text-orange-600 font-medium">+ ₱ {t.totalInterest.toFixed(2)}</span>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold border ${t.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    t.status === 'paid' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                        t.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                }`}>
                                                {t.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500 italic">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                    <span>Showing {filteredTransactions.length} records</span>
                    <span>Note: Click on a row to view details</span>
                </div>
            </div>

            <TransactionModal
                isOpen={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                transaction={selectedTransaction}
                allTransactions={transactions}
            />
        </div>
    );
}
