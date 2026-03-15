import React, { useState, useEffect } from 'react';
import {
    fetchTransactions,
    runMonthlyInterestCheck,
    approvePayment,
    archiveFiscalYear,
    getFiscalYear,
    getStartingBalance,
    setStartingBalance
} from '../transactions/transactionService';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '../../config/firebase';
import TransactionModal from '../transactions/TransactionModal';

export default function AdminDashboard() {
    const [transactions, setTransactions] = useState([]);
    const [selectedYear, setSelectedYear] = useState(getFiscalYear()); // Default to current year
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const transactionsPerPage = 10;
    const [startingBalance, setStartingBalanceValue] = useState(0);
    const [isEditingBalance, setIsEditingBalance] = useState(false);
    const [newBalanceInput, setNewBalanceInput] = useState('');
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);

    const loadData = async () => {
        // 'admin' argument fetches ALL records, filtered by year if selected
        // If selectedYear is 'all', we pass null to fetch everything
        const yearParam = selectedYear === 'all' ? null : selectedYear;

        const [txData, startBal] = await Promise.all([
            fetchTransactions('admin', null, yearParam),
            selectedYear !== 'all' ? getStartingBalance(selectedYear) : Promise.resolve(0)
        ]);

        // Calculate Running Balance
        // 1. Sort by Date ASCENDING (Oldest first) to calculate running balance
        // 2. Apply starting balance
        // 3. Reverse back to DESCENDING (Newest first) for display if needed

        let currentBalance = startBal;

        // We need them in chronological order for calculation
        const sortedTx = [...txData].sort((a, b) => a.date.toMillis() - b.date.toMillis());

        const txWithBalance = sortedTx.map(t => {
            if (t.status === 'approved' || t.status === 'paid') {
                if (t.type === 'HULOG') {
                    currentBalance += t.amount;
                } else if (t.type === 'UTANG') {
                    currentBalance -= t.principal; // Deduct Principal
                } else if (t.type === 'PAYMENT') {
                    currentBalance += t.amount;
                }
            }
            return { ...t, runningBalance: currentBalance };
        });

        // Re-sort to Newest First for Display
        const finalTx = txWithBalance.sort((a, b) => b.date.toMillis() - a.date.toMillis());

        setTransactions(finalTx);
        setStartingBalanceValue(startBal);
        setNewBalanceInput(startBal);
        setCurrentPage(1);
    };

    useEffect(() => { loadData(); }, [selectedYear]);

    const handleUpdateStartingBalance = async () => {
        if (!newBalanceInput) return;
        const res = await setStartingBalance(selectedYear, newBalanceInput);
        if (res.success) {
            setIsEditingBalance(false);
            loadData();
        } else {
            alert("Failed to update starting balance");
        }
    };

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

    // Pagination logic
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
    const totalPages = Math.ceil(transactions.length / transactionsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                        <button onClick={() => setIsActionModalOpen(true)} className="flex-1 md:flex-none bg-danger text-white px-4 py-2 rounded text-sm whitespace-nowrap shadow hover:brightness-90 transition flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            Admin Actions
                        </button>
                    </div>
                </div>

                {/* Starting Balance Section */}
                {selectedYear !== 'all' && (
                    <div className="bg-slate-100 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-600">Starting Fund Balance ({selectedYear})</p>
                            <p className="text-xs text-slate-500">Initial cash on hand before any transactions this year.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditingBalance ? (
                                <>
                                    <input
                                        type="number"
                                        value={newBalanceInput}
                                        onChange={(e) => setNewBalanceInput(e.target.value)}
                                        className="p-1 px-2 border rounded w-32"
                                    />
                                    <button onClick={handleUpdateStartingBalance} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Save</button>
                                    <button onClick={() => setIsEditingBalance(false)} className="text-slate-500 text-xs underline hover:text-slate-700">Cancel</button>
                                </>
                            ) : (
                                <>
                                    <p className="text-xl font-bold font-mono text-slate-800">₱ {startingBalance.toLocaleString()}</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

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
                {currentTransactions.map(t => (
                    <div key={t.id} className="bg-white p-4 rounded shadow flex flex-col sm:flex-row justify-between items-start sm:items-center border-l-4 border-secondary gap-4">
                        <div onClick={() => setSelectedTransaction(t)} className="flex-1 cursor-pointer hover:bg-slate-50 p-2 rounded transition">
                            <p className="font-bold">{t.type} Request</p>
                            <p className="text-sm text-slate-500">
                                {t.beneficiaryName || 'User'} — {t.type === 'UTANG' ? `Balance: ₱${t.balance.toLocaleString()}` : `Amount: ₱${t.amount.toLocaleString()}`}
                            </p>
                            {t.runningBalance !== undefined && (
                                <p className="text-xs text-emerald-600 font-mono mt-1">
                                    Fund Balance: ₱{t.runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            )}
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded bg-white text-sm disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-medium text-slate-700 min-w-[100px] text-center">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded bg-white text-sm disabled:opacity-50 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Admin Actions Modal */}
            {isActionModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                Admin Actions
                            </h2>
                            <button onClick={() => setIsActionModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <p className="text-sm text-slate-600 mb-6">Warning: These actions can affect global data or alter historical records. Please proceed with caution.</p>

                        <div className="flex flex-col gap-3">
                            <button onClick={() => { setIsActionModalOpen(false); handleInterestRun(); }} className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg text-sm shadow transition text-left flex items-center justify-between group">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-base">Run Monthly Interest</span>
                                    <span className="text-xs font-normal opacity-90">Calculates and applies past due interest</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>

                            <button onClick={() => { setIsActionModalOpen(false); handleArchive(); }} className="w-full bg-slate-700 hover:bg-slate-800 text-white px-4 py-3 rounded-lg text-sm shadow transition text-left flex items-center justify-between group">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-base">Archive Fiscal Year</span>
                                    <span className="text-xs font-normal opacity-90">Hides past records and starts fresh</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>

                            {selectedYear !== 'all' && (
                                <button onClick={() => { setIsActionModalOpen(false); setIsEditingBalance(true); }} className="w-full bg-secondary hover:brightness-90 text-white px-4 py-3 rounded-lg text-sm shadow transition text-left flex items-center justify-between group">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-base">Edit Starting Balance</span>
                                        <span className="text-xs font-normal opacity-90">Adjust initial cash for this year</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Details Modal */}
            <TransactionModal
                isOpen={!!selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
                transaction={selectedTransaction}
                allTransactions={transactions}
            />
        </div >
    );
}
