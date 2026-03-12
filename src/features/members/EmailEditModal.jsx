import React, { useState } from 'react';

/**
 * Modal for editing a user's email address
 * @param {object} user - The user object { id, email, displayName }
 * @param {function} onSave - Callback after successful update
 * @param {function} onClose - Close modal callback
 * @param {function} updateEmailService - The service function to call
 */
export default function EmailEditModal({ user, onSave, onClose, updateEmailService }) {
    const [newEmail, setNewEmail] = useState(user.email || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEmail || newEmail === user.email) {
            onClose();
            return;
        }

        setLoading(true);
        setError('');

        const result = await updateEmailService(user.id, newEmail);
        
        if (result.success) {
            onSave();
            onClose();
        } else {
            setError(result.error || 'Failed to update email');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-800">Edit Email Address</h3>
                        <button 
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <div className="mb-4">
                        <p className="text-sm text-slate-500">
                            Updating email for: <span className="font-semibold text-slate-700">{user.displayName || user.name}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark shadow-md shadow-primary/20 transition disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
