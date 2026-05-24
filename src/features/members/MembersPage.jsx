import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { fetchAllMembersWithSubMembers, approveSubMember, rejectSubMember, updateUserEmail } from './memberService';
import { fetchTransactions, createWithdrawal } from '../transactions/transactionService';
import EmailEditModal from './EmailEditModal';

export default function MembersPage() {
    const { userRole } = useAuth();
    const [members, setMembers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState({ open: false, user: null });
    const [withdrawalModal, setWithdrawalModal] = useState({ open: false, member: null, amount: '', error: '' });

    const loadData = async () => {
        setLoading(true);
        try {
            const [membersData, transactionsData] = await Promise.all([
                fetchAllMembersWithSubMembers(),
                fetchTransactions('admin', null) // Fetch ALL transactions
            ]);
            setMembers(membersData);
            setTransactions(transactionsData);
        } catch (error) {
            console.error("Error loading members page:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = async (member) => {
        if (!confirm(`Approve sub-member ${member.name}?`)) return;
        const result = await approveSubMember(member.parentId, member.id);
        if (result.success) {
            alert("Member Approved");
            loadData();
        } else {
            alert("Error: " + result.error);
        }
    };

    const handleReject = async (member) => {
        if (!confirm(`Reject sub-member ${member.name}?`)) return;
        const result = await rejectSubMember(member.parentId, member.id);
        if (result.success) {
            alert("Member Rejected");
            loadData();
        } else {
            alert("Error: " + result.error);
        }
    };

    // Aggregate Data
    const rowData = useMemo(() => {
        return members.map(m => {
            // Filter transactions for this specific member
            const memberTx = transactions.filter(t => {
                if (m.type === 'MAIN') {
                    // Main member: transactions with their UID and NO memberId (or memberId null)
                    return t.uid === m.id && !t.memberId;
                } else {
                    // Sub member: transactions with their specific memberId
                    return t.memberId === m.id;
                }
            });

            const totalHulog = memberTx
                .filter(t => t.type === 'HULOG' && t.status === 'approved')
                .reduce((sum, t) => sum + t.amount, 0);

            const totalWithdrawal = memberTx
                .filter(t => t.type === 'WITHDRAWAL' && t.status === 'approved')
                .reduce((sum, t) => sum + t.amount, 0);

            const netSavings = totalHulog - totalWithdrawal;

            const totalUtang = memberTx
                .filter(t => t.type === 'UTANG' && t.status === 'approved')
                .reduce((sum, t) => sum + t.balance, 0);

            const totalInterest = memberTx
                .filter(t => t.type === 'UTANG')
                .reduce((sum, t) => sum + (t.totalInterest || 0), 0);

            return {
                ...m,
                totalTransactions: memberTx.length,
                totalHulog,
                totalWithdrawal,
                netSavings,
                totalUtang,
                totalInterest
            };
        });
    }, [members, transactions]);

    if (userRole !== 'admin') {
        return <div className="p-8 text-center text-red-600">Access Denied</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-dark">Member Management</h1>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition shadow-sm"
                >
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Display Name</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Email / Parent</th>
                                <th className="p-4 text-center">Tx Count</th>
                                <th className="p-4 text-right">Total Savings (Net)</th>
                                <th className="p-4 text-right">Total Utang</th>
                                <th className="p-4 text-right">Total Interest</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="p-8 text-center text-slate-500">Loading members...</td>
                                </tr>
                            ) : rowData.length > 0 ? (
                                rowData.map((m) => (
                                    <tr key={`${m.type}-${m.id}`} className="hover:bg-slate-50 transition">
                                        <td className="p-4 font-bold text-slate-700">
                                            {m.type === 'MAIN' ? (
                                                m.displayName || 'No Name'
                                            ) : (
                                                <span className="pl-4 border-l-2 border-slate-300 ml-2 block">
                                                    {m.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${m.type === 'MAIN' ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                {m.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {m.type === 'MAIN' ? (
                                                <div className="flex items-center gap-2 group">
                                                    <span>{m.email}</span>
                                                    <button 
                                                        onClick={() => setEditModal({ open: true, user: m })}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-primary hover:bg-slate-100 rounded transition"
                                                        title="Edit Email"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">Created by: {m.parentName}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center font-medium">
                                            {m.totalTransactions}
                                        </td>
                                        <td className="p-4 text-right font-medium text-emerald-600">
                                            {m.netSavings > 0 ? `₱ ${m.netSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                                            {m.totalWithdrawal > 0 && (
                                                <div className="text-[10px] text-slate-400 font-normal">
                                                    Deposited: ₱{m.totalHulog.toLocaleString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right font-medium text-rose-600">
                                            {m.totalUtang > 0 ? `₱ ${m.totalUtang.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="p-4 text-right font-medium text-indigo-600">
                                            {m.totalInterest > 0 ? `₱ ${m.totalInterest.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            {m.type === 'SUB' ? (
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${m.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        m.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {(m.status || 'pending').toUpperCase()}
                                                </span>
                                            ) : (
                                                <span className="text-green-600">ACTIVE</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                {m.type === 'SUB' && (!m.status || m.status === 'pending') && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(m)}
                                                            className="bg-primary text-white p-1 rounded hover:bg-emerald-600 transition text-xs px-2"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(m)}
                                                            className="bg-slate-200 text-slate-700 p-1 rounded hover:bg-slate-300 transition text-xs px-2"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {((m.type === 'MAIN') || (m.type === 'SUB' && m.status === 'approved')) && (
                                                    <button
                                                        onClick={() => setWithdrawalModal({ open: true, member: m, amount: '', error: '' })}
                                                        disabled={m.netSavings <= 0}
                                                        className="bg-amber-500 text-white p-1 px-3 rounded hover:bg-amber-600 transition text-xs font-semibold shadow-sm disabled:opacity-40 disabled:hover:bg-amber-500 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        Withdraw
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="p-8 text-center text-slate-500 italic">No members found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {editModal.open && (
                <EmailEditModal 
                    user={editModal.user}
                    onClose={() => setEditModal({ open: false, user: null })}
                    onSave={() => {
                        loadData();
                        alert("Email updated successfully in Firestore.");
                    }}
                    updateEmailService={updateUserEmail}
                />
            )}

            {withdrawalModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border border-slate-200 relative animate-fade-in">
                        <button 
                            onClick={() => setWithdrawalModal({ open: false, member: null, amount: '', error: '' })} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                            <span className="text-amber-500">💰</span> Withdraw Savings
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Create a savings withdrawal transaction for <span className="font-semibold text-slate-700">{withdrawalModal.member.displayName || withdrawalModal.member.name}</span>.
                        </p>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Available Savings</p>
                                <p className="text-2xl font-bold text-emerald-600">
                                    ₱{withdrawalModal.member.netSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const amt = parseFloat(withdrawalModal.amount);
                            if (isNaN(amt) || amt <= 0) {
                                setWithdrawalModal(prev => ({ ...prev, error: "Please enter a valid amount greater than ₱0" }));
                                return;
                            }
                            if (amt > withdrawalModal.member.netSavings) {
                                setWithdrawalModal(prev => ({ ...prev, error: `Withdrawal cannot exceed available savings of ₱${withdrawalModal.member.netSavings.toLocaleString()}` }));
                                return;
                            }

                            const { member } = withdrawalModal;
                            const uid = member.type === 'MAIN' ? member.id : member.parentId;
                            const displayName = member.type === 'MAIN' ? (member.displayName || member.email) : member.name;
                            const memberId = member.type === 'MAIN' ? null : member.id;

                            const res = await createWithdrawal(uid, amt, displayName, memberId);
                            if (res.success) {
                                setWithdrawalModal({ open: false, member: null, amount: '', error: '' });
                                alert(`Successfully withdrew ₱${amt.toLocaleString()} from ${displayName}'s savings.`);
                                loadData();
                            } else {
                                setWithdrawalModal(prev => ({ ...prev, error: "Failed to create withdrawal transaction: " + (res.error?.message || "Unknown error") }));
                            }
                        }}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Withdrawal Amount (₱)</label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    autoFocus
                                    placeholder="Enter amount"
                                    value={withdrawalModal.amount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        let error = '';
                                        if (parseFloat(val) > withdrawalModal.member.netSavings) {
                                            error = `Amount exceeds available savings of ₱${withdrawalModal.member.netSavings.toLocaleString()}`;
                                        }
                                        setWithdrawalModal(prev => ({ ...prev, amount: val, error }));
                                    }}
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                                />
                                {withdrawalModal.error && (
                                    <p className="text-red-500 text-xs mt-2 font-medium bg-red-50 p-2 rounded border border-red-100 flex items-center gap-1.5 animate-pulse">
                                        <span>⚠️</span> {withdrawalModal.error}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setWithdrawalModal({ open: false, member: null, amount: '', error: '' })}
                                    className="px-4 py-2 border rounded-lg bg-white text-slate-700 hover:bg-slate-50 transition text-sm font-semibold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!withdrawalModal.amount || parseFloat(withdrawalModal.amount) <= 0 || parseFloat(withdrawalModal.amount) > withdrawalModal.member.netSavings}
                                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Confirm Withdrawal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
