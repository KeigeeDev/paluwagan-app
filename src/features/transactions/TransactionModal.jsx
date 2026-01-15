import React from 'react';
import { X } from 'lucide-react';

export default function TransactionModal({ isOpen, onClose, transaction, allTransactions }) {
    if (!isOpen || !transaction) return null;

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Find linked transaction for Payments
    const getLinkedTransactionInfo = () => {
        if (transaction.type !== 'PAYMENT' || !transaction.relatedTransactionId) return null;

        const linkedTx = allTransactions.find(t => t.id === transaction.relatedTransactionId);
        if (!linkedTx) return <p className="text-red-500 text-sm">Linked Loan Record Not Found</p>;

        return (
            <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Payment For Loan</p>
                <div className="flex justify-between items-center text-sm">
                    <span>Date: {formatDate(linkedTx.date)}</span>
                    <span className="font-semibold text-danger">Balance: ₱{linkedTx.balance.toFixed(2)}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden">
                {/* Header */}
                <div className={`p-4 ${transaction.type === 'HULOG' ? 'bg-emerald-600' :
                    transaction.type === 'PAYMENT' ? 'bg-indigo-600' :
                        'bg-rose-600'
                    } text-white flex justify-between items-start`}>
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            {transaction.type} Details
                        </h2>
                        <p className="text-white/80 text-sm">{formatDate(transaction.date)}</p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Amount</p>
                            <p className={`text-3xl font-bold ${transaction.type === 'HULOG' ? 'text-emerald-600' :
                                transaction.type === 'PAYMENT' ? 'text-indigo-600' :
                                    'text-rose-600'
                                }`}>
                                ₱{transaction.type === 'UTANG'
                                    ? transaction.principal?.toFixed(2)
                                    : transaction.amount?.toFixed(2)}
                            </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${transaction.status === 'approved' ? 'bg-green-100 text-green-700' :
                            transaction.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                                transaction.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                            }`}>
                            {transaction.status}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* UTANG Specifics */}
                        {transaction.type === 'UTANG' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded">
                                        <p className="text-xs text-slate-500">Interest Rate</p>
                                        <p className="font-semibold">{(transaction.interestRate * 100).toFixed(0)}%</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded">
                                        <p className="text-xs text-slate-500">Total Interest</p>
                                        <p className="font-semibold text-orange-600">
                                            ₱{(transaction.totalInterest || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 bg-rose-50 rounded border border-rose-100 flex justify-between items-center">
                                    <span className="text-rose-700 font-medium">Current Balance</span>
                                    <span className="text-xl font-bold text-rose-700">₱{transaction.balance.toFixed(2)}</span>
                                </div>
                            </>
                        )}

                        {/* PAYMENT Specifics */}
                        {transaction.type === 'PAYMENT' && getLinkedTransactionInfo()}

                        {/* HULOG Specifics */}
                        {transaction.type === 'HULOG' && (
                            <div className="p-3 bg-emerald-50 rounded border border-emerald-100 text-center text-emerald-700 text-sm">
                                Verified Deposit
                            </div>
                        )}

                        {/* Common Footer Info */}
                        <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
                            <span>ID: {transaction.id.slice(0, 8)}...</span>
                            <span>{transaction.beneficiaryName}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
