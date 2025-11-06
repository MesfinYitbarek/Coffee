// frontend/src/components/Layout.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Calculator, 
    Image, 
    TrendingUp, 
    MessageCircle, 
    User, 
    LogOut, 
    Clock, 
    Sparkles, 
    Shield,
    Warehouse,
    Coffee,
    BarChart3
} from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();

    const getDaysLeft = () => {
        if (!user || !user.packageExpiresAt) return null;
        const now = new Date();
        const expires = new Date(user.packageExpiresAt);
        const diffTime = expires.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const daysLeft = getDaysLeft();
    const isFreeTrial = user?.packageType === 'free_trial';
    const isAdmin = user?.role === 'admin';

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-coffee-light via-cream to-coffee-light">
            {/* Top Bar */}
            <div className="bg-gradient-to-r from-coffee-dark via-coffee-accent to-coffee-dark text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                    <div className="flex items-center justify-between h-14">
                        {!isAdmin && daysLeft !== null && (
                            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                <Clock className="w-4 h-4" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium opacity-80">Subscription Status</span>
                                    <span className="text-sm font-bold">
                                        {daysLeft} {daysLeft === 1 ? 'day' : 'days'} remaining
                                        {isFreeTrial && (
                                            <span className="ml-1 text-xs bg-yellow-500/20 px-1.5 py-0.5 rounded-full">
                                                Free Trial
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}

                        {isAdmin && (
                            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                <Shield className="w-4 h-4" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium opacity-80">Admin Panel</span>
                                    <span className="text-sm font-bold">System Management</span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                            {!isAdmin && (
                                <button
                                    onClick={() => alert('Navigate to profile/subscription page to extend!')}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span className="hidden sm:inline text-sm font-medium">Extend Plan</span>
                                </button>
                            )}
                            <button
                                onClick={logout}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg transition-all duration-200"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-grow overflow-auto pb-16">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation */}
            {!isAdmin ? (
                // Regular User Navigation
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
                    <div className="max-w-7xl mx-auto px-2">
                        <ul className="flex justify-around items-center h-14">
                            <NavItem to="/calculator" icon={Calculator} label="Calculator" />
                            <NavItem to="/gallery" icon={Image} label="Gallery" />
                            <NavItem to="/market-info" icon={TrendingUp} label="Market" />
                            <NavItem to="/chat" icon={MessageCircle} label="Chat" />
                            <NavItem to="/profile" icon={User} label="Profile" />
                        </ul>
                    </div>
                </nav>
            ) : (
                // Admin Navigation
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
                    <div className="max-w-7xl mx-auto px-2">
                        <ul className="flex justify-around items-center h-14">
                            <NavItem to="/admin/dashboard" icon={BarChart3} label="Dashboard" />
                            <NavItem to="/admin/users" icon={User} label="Users" />
                            <NavItem to="/admin/warehouses" icon={Warehouse} label="Warehouses" />
                            <NavItem to="/admin/samples" icon={Coffee} label="Samples" />
                            <NavItem to="/admin/market-info" icon={TrendingUp} label="Market" />
                        </ul>
                    </div>
                </nav>
            )}
        </div>
    );
};

const NavItem = ({ to, icon: Icon, label }) => {
    return (
        <li className="flex-1">
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 ${
                        isActive
                            ? 'text-coffee-accent scale-105'
                            : 'text-gray-600 hover:text-coffee-dark hover:bg-gray-50'
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        <div className={`relative ${isActive ? 'transform -translate-y-0.5' : ''}`}>
                            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                            {isActive && (
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-coffee-accent rounded-full" />
                            )}
                        </div>
                        <span className={`text-xs mt-0.5 font-medium ${isActive ? 'font-semibold' : ''}`}>
                            {label}
                        </span>
                    </>
                )}
            </NavLink>
        </li>
    );
};

export default Layout;