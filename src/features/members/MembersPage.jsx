import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { fetchAllMembersWithSubMembers, approveSubMember, rejectSubMember } from './memberService';
import { fetchTransactions } from '../transactions/transactionService';

export default function MembersPage() {
    const { userRole } = useAuth();
    const [members, setMembers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

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
                                <th className="p-4 text-right">Total Hulog</th>
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
                                                m.email
                                            ) : (
                                                <span className="text-xs text-slate-400">Created by: {m.parentName}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center font-medium">
                                            {m.totalTransactions}
                                        </td>
                                        <td className="p-4 text-right font-medium text-emerald-600">
                                            {m.totalHulog > 0 ? `₱ ${m.totalHulog.toLocaleString()}` : '-'}
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
                                            {m.type === 'SUB' && (!m.status || m.status === 'pending') && (
                                                <div className="flex gap-2 justify-center">
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
                                                </div>
                                            )}
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
        </div>
    );
}
