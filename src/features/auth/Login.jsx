import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { auth } from '../../config/firebase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup, loginWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);

            if (isLogin) {
                await login(email, password);
            } else {
                if (password !== confirmPassword) {
                    return setError("Passwords do not match");
                }
                await signup(email, password, displayName);
            }
            // Navigation is handled by useEffect
        } catch (err) {
            console.error(err);
            setError('Failed to log in. Please check your credentials.');
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            // Navigation is handled by useEffect (currentUser watch)
        } catch (err) {
            console.error(err);
            setError('Google sign-in failed. Please try again.');
            setLoading(false);
        }
    };

    console.log(auth);

    return (
        <div className="min-h-screen flex items-center justify-center bg-light font-sans">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white border border-border overflow-hidden">
                    {/* Header */}
                    <div className="px-8 py-12 border-b border-border text-center">
                        <h2 className="text-3xl font-bold text-dark tracking-tight mb-2">
                            {isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
                        </h2>
                        <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-bold">
                            {isLogin ? 'Sign in to the ledger' : 'Join the system'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {error && (
                            <div className="border border-danger text-danger p-4 text-xs font-bold uppercase tracking-widest bg-rose-50/50">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-0 py-3 border-b border-border focus:border-secondary transition-all outline-none bg-transparent text-dark placeholder:text-slate-300"
                                        placeholder="JUAN DELA CRUZ"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-0 py-3 border-b border-border focus:border-secondary transition-all outline-none bg-transparent text-dark placeholder:text-slate-300"
                                    placeholder="NAME@EXAMPLE.COM"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-0 py-3 border-b border-border focus:border-secondary transition-all outline-none bg-transparent text-dark placeholder:text-slate-300"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Confirm Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-0 py-3 border-b border-border focus:border-secondary transition-all outline-none bg-transparent text-dark placeholder:text-slate-300"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-secondary hover:bg-violet-700 text-white font-bold py-4 px-6 transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
                            >
                                {loading ? 'PROCESSING...' : (isLogin ? 'SIGN IN' : 'SIGN UP')}
                            </button>

                            <div className="relative flex items-center justify-center py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <span className="relative bg-white px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">OR</span>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-border hover:bg-slate-50 text-dark font-bold py-4 px-6 transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" className="w-4.5 h-4.5">
                                    <path fill="#EA4335" d="M24 9.5c3.15 0 5.64 1.08 7.74 2.85l5.77-5.77C33.91 3.45 29.27 1.5 24 1.5 14.97 1.5 7.38 6.91 3.9 14.6l6.72 5.22C12.4 13.47 17.73 9.5 24 9.5z"/>
                                    <path fill="#4285F4" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v8.98h12.42c-.54 2.88-2.17 5.32-4.62 6.96l7.1 5.52C43.23 37.13 46.1 31.27 46.1 24.5z"/>
                                    <path fill="#FBBC05" d="M10.62 28.18A14.56 14.56 0 0 1 9.5 24c0-1.45.25-2.86.62-4.18L3.4 14.6A22.46 22.46 0 0 0 1.5 24c0 3.37.73 6.56 2.04 9.43l7.08-5.25z"/>
                                    <path fill="#34A853" d="M24 46.5c5.27 0 9.69-1.74 12.92-4.74l-7.1-5.52c-1.75 1.17-3.99 1.86-5.82 1.86-6.27 0-11.6-3.97-13.38-9.92l-7.08 5.25C7.38 41.09 14.97 46.5 24 46.5z"/>
                                </svg>
                                GOOGLE SIGN IN
                            </button>
                        </div>
                    </form>

                    <div className="bg-light px-8 py-6 border-t border-border text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {isLogin ? "NEW TO THE SYSTEM?" : "ALREADY ENROLLED?"}
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-secondary hover:underline focus:outline-none"
                            >
                                {isLogin ? 'CREATE ACCOUNT' : 'LOG IN'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
