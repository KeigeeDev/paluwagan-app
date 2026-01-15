import React, { useState, useEffect } from 'react';
import {
    fetchTransactions,
    runMonthlyInterestCheck,
    approvePayment,
    archiveFiscalYear,
    getFiscalYear
} from '../transactions/transactionService';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../../config/firebase';
import TransactionModal from '../transactions/TransactionModal';

export default function AdminDashboard() {
    const [transactions, setTransactions] = useState([]);
    const [selectedYear, setSelectedYear] = useState(getFiscalYear()); // Default to current year
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const loadData = async () => {
        // 'admin' argument fetches ALL records, filtered by year if selected
        // If selectedYear is 'all', we pass null to fetch everything
        const yearParam = selectedYear === 'all' ? null : selectedYear;
        const data = await fetchTransactions('admin', null, yearParam);
        setTransactions(data);
    };

    useEffect(() => { loadData(); }, [selectedYear]);

    const handleStatusUpdate = async (transaction, newStatus) => {
        try {
            if (transaction.type === 'PAYMENT' && newStatus === 'approved') {
                const result = await approvePayment(transaction.id);
                if (result.success) {
                    alert('Payment Approved and Balance Updated');
                    loadData();
                } else {
                    alert('Failed to approve payment: ' + result.error);
                }
                return;
            }

            const txRef = doc(db, "transactions", transaction.id);
            await updateDoc(txRef, { status: newStatus });
            loadData(); // Refresh UI
        } catch (err) {
            console.error(err);
        }
    };

    const handleInterestRun = async () => {
        if (!confirm("Run Monthly Interest for ALL unpaid loans? This should be done once a month.")) return;

        const result = await runMonthlyInterestCheck();
        if (result.success) {
            alert(`Interest applied to ${result.count} loans.`);
            loadData();
        }
    };

    const handleArchive = async () => {
        const year = prompt("Enter Fiscal Year to Archive (e.g., 2025):");
        if (!year) return;

        if (Number(year) === getFiscalYear()) {
            if (!confirm("Warning: You are archiving the CURRENT fiscal year. Continue?")) return;
        }

        const result = await archiveFiscalYear(year);
        if (result.success) {
            alert(`Archived ${result.count} transactions from ${year}.`);
            loadData();
        } else {
            alert("Error archiving: " + result.error);
        }
    };


    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col gap-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-2xl font-bold">Admin Console</h1>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                        <div className="flex items-center gap-2 mr-2">
                            <label className="text-sm font-medium text-slate-700">Fiscal Year:</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="p-2 border rounded-md text-sm bg-white focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value={getFiscalYear()}>{getFiscalYear()} (Current)</option>
                                <option value={getFiscalYear() - 1}>{getFiscalYear() - 1}</option>
                                <option value={getFiscalYear() - 2}>{getFiscalYear() - 2}</option>
                                <option value="all">Show All</option>
                            </select>
                        </div>

                        <button onClick={loadData} className="flex-1 md:flex-none bg-indigo-500 text-white px-4 py-2 rounded text-sm whitespace-nowrap shadow hover:bg-indigo-600 transition flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                            Refresh
                        </button>
                        <button onClick={handleInterestRun} className="flex-1 md:flex-none bg-orange-500 text-white px-4 py-2 rounded text-sm whitespace-nowrap shadow hover:bg-orange-600 transition">
                            Run Monthly Interest
                        </button>
                        <button onClick={handleArchive} className="flex-1 md:flex-none bg-slate-700 text-white px-4 py-2 rounded text-sm whitespace-nowrap shadow hover:bg-slate-800 transition">
                            Archive Year
                        </button>
                    </div>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-emerald-500">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Total Hulog (Savings)</p>
                        <p className="text-2xl font-bold text-emerald-600">
                            ₱ {transactions
                                .filter(t => t.type === 'HULOG' && t.status === 'approved')
                                .reduce((sum, t) => sum + t.amount, 0)
                                .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-rose-500">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Total Active Utang</p>
                        <p className="text-2xl font-bold text-rose-600">
                            ₱ {transactions
                                .filter(t => t.type === 'UTANG' && t.status === 'approved')
                                .reduce((sum, t) => sum + t.balance, 0)
                                .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
                        <p className="text-xs font-semibold text-slate-500 uppercase">Total Interest Earned</p>
                        <p className="text-2xl font-bold text-indigo-600">
                            ₱ {transactions
                                .filter(t => t.type === 'UTANG' && (t.status === 'approved' || t.status === 'paid'))
                                .reduce((sum, t) => sum + (t.totalInterest || 0), 0)
                                .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>
            <div className="grid gap-4">
                {transactions.map(t => (
                    <div key={t.id} className="bg-white p-4 rounded shadow flex flex-col sm:flex-row justify-between items-start sm:items-center border-l-4 border-secondary gap-4">
                        <div onClick={() => setSelectedTransaction(t)} className="flex-1 cursor-pointer hover:bg-slate-50 p-2 rounded transition">
                            <p className="font-bold">{t.type} Request</p>
                            <p className="text-sm text-slate-500">
                                {t.beneficiaryName || 'User'} — {t.type === 'UTANG' ? `Balance: ${t.balance}` : `Amount: ${t.amount}`}
                            </p>
                            <p className="text-xs text-slate-400">
                                Status: <span className={`font-semibold ${t.status === 'paid' ? 'text-blue-600' :
                                    t.status === 'approved' ? 'text-green-600' :
                                        t.status === 'rejected' ? 'text-red-600' :
                                            'text-orange-500'
                                    }`}>{t.status.toUpperCase()}</span>
                            </p>
                        </div>

                        {t.status === 'pending' && (
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => handleStatusUpdate(t, 'approved')}
                                    className="flex-1 sm:flex-none bg-primary text-white px-3 py-1 rounded text-sm"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(t, 'rejected')}
                                    className="flex-1 sm:flex-none bg-slate-200 text-slate-700 px-3 py-1 rounded text-sm"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Transaction Details Modal */}
            <TransactionModal
                isOpen={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                transaction={selectedTransaction}
                allTransactions={transactions}
            />
        </div>
    );
}
