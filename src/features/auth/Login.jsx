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
        <div className="min-h-screen flex items-center justify-center bg-light">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary px-6 py-6 md:px-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-emerald-100 text-sm md:text-base">
                            {isLogin ? 'Sign in to your Paluwagan account' : 'Join our Paluwagan community'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-danger p-3 rounded text-sm text-center">
                                {error}
                            </div>
                        )}

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder="Juan Dela Cruz"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-xs text-slate-400 font-medium">OR</span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        {/* Google Sign-In Button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-lg transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" className="w-5 h-5 flex-shrink-0">
                                <path fill="#EA4335" d="M24 9.5c3.15 0 5.64 1.08 7.74 2.85l5.77-5.77C33.91 3.45 29.27 1.5 24 1.5 14.97 1.5 7.38 6.91 3.9 14.6l6.72 5.22C12.4 13.47 17.73 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v8.98h12.42c-.54 2.88-2.17 5.32-4.62 6.96l7.1 5.52C43.23 37.13 46.1 31.27 46.1 24.5z"/>
                                <path fill="#FBBC05" d="M10.62 28.18A14.56 14.56 0 0 1 9.5 24c0-1.45.25-2.86.62-4.18L3.4 14.6A22.46 22.46 0 0 0 1.5 24c0 3.37.73 6.56 2.04 9.43l7.08-5.25z"/>
                                <path fill="#34A853" d="M24 46.5c5.27 0 9.69-1.74 12.92-4.74l-7.1-5.52c-1.75 1.17-3.99 1.86-5.82 1.86-6.27 0-11.6-3.97-13.38-9.92l-7.08 5.25C7.38 41.09 14.97 46.5 24 46.5z"/>
                            </svg>
                            Continue with Google
                        </button>
                    </form>

                    <div className="bg-slate-50 px-6 py-4 md:px-8 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-1 text-primary font-bold hover:underline focus:outline-none"
                            >
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
