import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { LogOut, Menu, User, X } from 'lucide-react';

export default function MainLayout() {
    const { logout, currentUser, userRole } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    return (
        <div className="min-h-screen bg-light flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-dark text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-sm">
                        P
                    </div>
                    <span className="text-xl font-bold tracking-tight">Paluwagan</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-1 hover:bg-slate-700 rounded transition"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Sidebar / Navigation */}
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-dark text-white p-4 transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 md:flex-shrink-0 md:min-h-screen
            `}>
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
                            P
                        </div>
                        <span className="text-xl font-bold tracking-tight">Paluwagan</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="space-y-2">
                    <div className="px-4 py-2 bg-slate-700/50 rounded-lg mb-4">
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Account</p>
                        <div className="flex items-center gap-2">
                            <User size={16} className="text-slate-300" />
                            <span className="text-sm font-medium truncate w-32">{currentUser?.email}</span>
                        </div>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded mt-1 inline-block">
                            {userRole?.toUpperCase()}
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors text-left"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
                <div className="md:p-8 p-4">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
