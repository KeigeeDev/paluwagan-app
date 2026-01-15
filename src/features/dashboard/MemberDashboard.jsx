import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { requestUtang, requestHulog, fetchTransactions, requestPayment } from '../transactions/transactionService';
import { addLinkedMember, getLinkedMembers } from '../members/memberService';
import TransactionModal from '../transactions/TransactionModal';

export default function MemberDashboard() {
    const { currentUser, userProfile } = useAuth();
    const [transactions, setTransactions] = useState([]);

    // UI State
    const [showUtangForm, setShowUtangForm] = useState(false);
    const [showHulogForm, setShowHulogForm] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);

    // Member Management State
    const [linkedMembers, setLinkedMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState('main'); // 'main' or memberId
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRelation, setNewMemberRelation] = useState('');

    // Utang Form State
    const [amount, setAmount] = useState('');
    const [beneficiaryType, setBeneficiaryType] = useState('member'); // Default to self/selected member
    const [beneficiaryName, setBeneficiaryName] = useState('');

    // Hulog Form State
    const [hulogAmount, setHulogAmount] = useState('');

    // Modal State
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Load Data
    useEffect(() => {
        if (currentUser) {
            loadData();
        }
    }, [currentUser]);

    const loadData = async () => {
        const [txs, members] = await Promise.all([
            fetchTransactions('member', currentUser.uid),
            getLinkedMembers(currentUser.uid)
        ]);
        setTransactions(txs);
        setLinkedMembers(members);
    };

    // Helper to get current profile name
    const getCurrentProfileName = () => {
        if (selectedMemberId === 'main') return userProfile?.displayName || currentUser.displayName || 'Main Account';
        const member = linkedMembers.find(m => m.id === selectedMemberId);
        return member ? member.name : 'Unknown';
    };

    // Filter Transactions
    const [filters, setFilters] = useState({
        date: '',
        type: '',
        name: '',
        status: ''
    });

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // 1. Member Filter
            let matchesMember = false;
            if (selectedMemberId === 'main') {
                // Show Main Account transactions (where memberId is null/undefined)
                matchesMember = !t.memberId;
            } else {
                // Show specific member transactions
                matchesMember = t.memberId === selectedMemberId;
            }

            if (!matchesMember) return false;

            // 2. Column Filters
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
    }, [transactions, selectedMemberId, filters]);

    const totalHulog = useMemo(() => {
        return filteredTransactions
            .filter(t => t.type === 'HULOG' && t.status === 'approved')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [filteredTransactions]);

    const totalUtang = useMemo(() => {
        return filteredTransactions
            .filter(t => t.type === 'UTANG' && t.status === 'approved')
            .reduce((sum, t) => sum + t.balance, 0);
    }, [filteredTransactions]);

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberName) return;

        const result = await addLinkedMember(currentUser.uid, {
            name: newMemberName,
            relationship: newMemberRelation || 'Family'
        });

        if (result.success) {
            alert("Member Added Successfully!");
            setNewMemberName('');
            setNewMemberRelation('');
            setShowMemberModal(false);
            loadData();
        } else {
            alert("Failed to add member");
        }
    }

    const handleUtangSubmit = async (e) => {
        e.preventDefault();
        if (!amount) return;

        // Determine Name
        let finalName = beneficiaryName;

        if (beneficiaryType === 'member') {
            finalName = getCurrentProfileName();
        }

        const memberIdToSave = selectedMemberId === 'main' ? null : selectedMemberId;

        await requestUtang(currentUser.uid, amount, beneficiaryType, finalName, memberIdToSave);
        setShowUtangForm(false);
        setAmount('');
        loadData();
        alert("Utang Requested!");
    };

    const handleHulogSubmit = async (e) => {
        e.preventDefault();
        if (!hulogAmount) return;

        const displayName = getCurrentProfileName();
        const memberIdToSave = selectedMemberId === 'main' ? null : selectedMemberId;

        await requestHulog(currentUser.uid, hulogAmount, displayName, memberIdToSave);
        setShowHulogForm(false);
        setHulogAmount('');
        loadData();
        alert("Hulog Request Submitted!");
    };

    const handlePayment = async (transaction) => {
        const amountStr = prompt(`Current Balance: ${transaction.balance}\nEnter payment amount:`);
        if (!amountStr) return;

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) return alert("Invalid amount");
        if (amount > transaction.balance) return alert("Payment cannot exceed balance!");

        // Use the same member/beneficiary info as the original transaction or current context
        const beneficiaryName = transaction.beneficiaryName || getCurrentProfileName();
        const memberIdToSave = transaction.memberId || (selectedMemberId === 'main' ? null : selectedMemberId);

        await requestPayment(currentUser.uid, transaction.id, amount, beneficiaryName, memberIdToSave);
        alert("Payment Requested! Waiting for Admin Approval.");
        loadData();
    };

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            <header className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-dark">My Paluwagan</h1>
                    <p className="text-sm md:text-base text-slate-500">
                        Viewing: <span className="font-semibold text-primary">{getCurrentProfileName()}</span>
                    </p>
                </div>

                <div className="flex gap-2">
                    <select
                        className="p-2 border rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary outline-none"
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                    >
                        <option value="main">Main Account</option>
                        {linkedMembers.map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.relationship})</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowMemberModal(true)}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition shadow-sm text-sm"
                    >
                        + Member
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition">
                    <h2 className="text-emerald-100 font-medium mb-1">Total Savings (Hulog)</h2>
                    <p className="text-3xl font-bold">₱ {totalHulog.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-emerald-100 mt-2 opacity-80">For {getCurrentProfileName()}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition">
                    <h2 className="text-rose-100 font-medium mb-1">Outstanding Balance (Utang)</h2>
                    <p className="text-3xl font-bold">₱ {totalUtang.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-rose-100 mt-2 opacity-80">For {getCurrentProfileName()}</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8">
                <button
                    onClick={() => {
                        setShowUtangForm(!showUtangForm);
                        setShowHulogForm(false);
                    }}
                    className="bg-danger text-white px-6 py-3 rounded-lg shadow hover:bg-red-600 transition flex-1 sm:flex-none justify-center flex font-medium"
                >
                    Request Utang
                </button>
                <button
                    onClick={() => {
                        setShowHulogForm(!showHulogForm);
                        setShowUtangForm(false);
                    }}
                    className="bg-primary text-white px-6 py-3 rounded-lg shadow hover:bg-emerald-600 transition flex-1 sm:flex-none justify-center flex font-medium"
                >
                    Add Hulog
                </button>
            </div>

            {/* NEW MEMBER MODAL */}
            {showMemberModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-fade-in relative">
                        <button
                            onClick={() => setShowMemberModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold mb-4">Add Family Member</h2>
                        <form onSubmit={handleAddMember}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                                    value={newMemberName}
                                    onChange={e => setNewMemberName(e.target.value)}
                                    placeholder="e.g. Juan dela Cruz"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
                                <input
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary outline-none"
                                    value={newMemberRelation}
                                    onChange={e => setNewMemberRelation(e.target.value)}
                                    placeholder="e.g. Son, Wife, Sibling"
                                />
                            </div>
                            <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700 font-medium">
                                Add Member
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* FORMS */}
            {showUtangForm && (
                <form onSubmit={handleUtangSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 mb-8 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-danger"></div>
                    <h3 className="text-xl font-bold mb-4 text-danger">New Loan Request ({getCurrentProfileName()})</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Amount</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-danger focus:outline-none"
                                onChange={(e) => setAmount(e.target.value)}
                                value={amount}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Beneficiary</label>
                            <select
                                className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-danger focus:outline-none"
                                value={beneficiaryType}
                                onChange={(e) => setBeneficiaryType(e.target.value)}
                            >
                                <option value="member">Self/Profile (3% Interest)</option>
                                <option value="non-member">Other/Friend (5% Interest)</option>
                            </select>
                        </div>
                    </div>

                    {beneficiaryType === 'non-member' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700">Beneficiary Name</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-danger focus:outline-none"
                                placeholder="Enter friend's name"
                                onChange={(e) => setBeneficiaryName(e.target.value)}
                                value={beneficiaryName}
                                required
                            />
                        </div>
                    )}

                    <div className="text-sm text-slate-500 mb-4 bg-red-50 p-3 rounded border border-red-100 text-danger">
                        <strong>Note:</strong> Applying for <strong>{getCurrentProfileName()}</strong>. <br />
                        Projected Balance: {amount ? (Number(amount) * (beneficiaryType === 'member' ? 1.03 : 1.05)).toFixed(2) : 0}
                    </div>

                    <button type="submit" className="w-full md:w-auto bg-dark text-white px-6 py-2 rounded hover:opacity-90">
                        Submit Request
                    </button>
                </form>
            )}

            {showHulogForm && (
                <form onSubmit={handleHulogSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 mb-8 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                    <h3 className="text-xl font-bold mb-4 text-primary">New Hulog ({getCurrentProfileName()})</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Amount</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded mt-1 focus:ring-2 focus:ring-primary focus:outline-none"
                                onChange={(e) => setHulogAmount(e.target.value)}
                                value={hulogAmount}
                                placeholder="Enter amount to deposit"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full md:w-auto bg-dark text-white px-6 py-2 rounded hover:opacity-90">
                        Submit Deposit
                    </button>
                </form>
            )}

            {/* Transaction History Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Recent Transactions</h3>
                    <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">Filtered by: {getCurrentProfileName()}</span>
                </div>
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
                                        <span>Name</span>
                                        <input
                                            type="text"
                                            placeholder="Filter..."
                                            className="p-1 border rounded text-xs font-normal normal-case focus:outline-none focus:ring-1 focus:ring-primary w-full min-w-[100px]"
                                            value={filters.name}
                                            onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                    </div>
                                </th>
                                <th className="p-4 align-top">Amount</th>
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
                                            <option value="rejected">Rejected</option>
                                            <option value="paid">Paid</option>
                                        </select>
                                    </div>
                                </th>
                                <th className="p-4 align-top">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50 transition">
                                    <td className="p-4 text-slate-500 text-sm">{new Date(t.date.seconds * 1000).toLocaleDateString()}</td>
                                    <td className="p-4 font-medium text-sm">
                                        <span className={`px-2 py-1 rounded ${t.type === 'HULOG' ? 'bg-emerald-100 text-emerald-700' :
                                            t.type === 'PAYMENT' ? 'bg-indigo-100 text-indigo-700' :
                                                'bg-rose-100 text-rose-700'
                                            }`}>
                                            {t.type}
                                        </span>
                                    </td>
                                    <td onClick={() => setSelectedTransaction(t)} className="p-4 text-sm font-medium text-slate-700 cursor-pointer hover:text-primary transition">{t.beneficiaryName || 'Self'}</td>
                                    <td onClick={() => setSelectedTransaction(t)} className={`p-4 font-bold cursor-pointer hover:opacity-80 transition ${t.type === 'HULOG' ? 'text-primary' :
                                        t.type === 'PAYMENT' ? 'text-indigo-600' :
                                            'text-danger'
                                        }`}>
                                        {t.type === 'UTANG' ? t.balance.toFixed(2) : t.amount.toFixed(2)}
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
                                    <td className="p-4">
                                        {t.type === 'UTANG' && t.status === 'approved' && (
                                            <button
                                                onClick={() => handlePayment(t)}
                                                className="bg-secondary text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition shadow-sm"
                                            >
                                                Pay
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500 italic">No transactions found for this profile.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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