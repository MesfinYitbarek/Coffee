// AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, Coffee, Warehouse, TrendingUp, 
    DollarSign, AlertCircle, CheckCircle, XCircle,
    BarChart3,
    Package,
    Clock
} from 'lucide-react';
import axios from 'axios';
import API_URL from '../../config';
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const [dashboardRes, userRes] = await Promise.all([
                axios.get(`${API_URL}/admin/dashboard/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/admin/users/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setStats(dashboardRes.data);
            setUserStats(userRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                                <p className="text-white/80 text-xs mt-0.5">Loading platform statistics...</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2 text-coffee-accent">
                            <Coffee className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-medium">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'from-blue-50 to-blue-100',
            borderColor: 'border-blue-200'
        },
        {
            title: 'Active Users',
            value: stats?.activeUsers || 0,
            icon: CheckCircle,
            color: 'from-green-500 to-green-600',
            bgColor: 'from-green-50 to-green-100',
            borderColor: 'border-green-200'
        },
        {
            title: 'Coffee Samples',
            value: stats?.totalSamples || 0,
            icon: Coffee,
            color: 'from-amber-500 to-orange-600',
            bgColor: 'from-amber-50 to-amber-100',
            borderColor: 'border-amber-200'
        },
        {
            title: 'Warehouses',
            value: stats?.totalWarehouses || 0,
            icon: Warehouse,
            color: 'from-purple-500 to-purple-600',
            bgColor: 'from-purple-50 to-purple-100',
            borderColor: 'border-purple-200'
        },
        {
            title: 'Pending Activations',
            value: stats?.pendingActivations || 0,
            icon: AlertCircle,
            color: 'from-yellow-500 to-yellow-600',
            bgColor: 'from-yellow-50 to-yellow-100',
            borderColor: 'border-yellow-200'
        },
        {
            title: 'Monthly Revenue',
            value: `${stats?.estimatedMonthlyRevenue?.toLocaleString() || 0} Birr`,
            icon: DollarSign,
            color: 'from-emerald-500 to-emerald-600',
            bgColor: 'from-emerald-50 to-emerald-100',
            borderColor: 'border-emerald-200'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                            <p className="text-white/80 text-xs mt-0.5">Manage your coffee trading platform</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
                                <stat.icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{stat.title}</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* User Breakdown */}
            {userStats && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center space-x-2 mb-3">
                        <Users className="w-4 h-4 text-coffee-accent" />
                        <h2 className="text-sm font-bold text-coffee-dark">User Breakdown</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 text-center">
                            <p className="text-lg font-bold text-blue-900">{userStats.freeTrialUsers}</p>
                            <p className="text-xs text-blue-700 font-medium">Free Trial</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200 text-center">
                            <p className="text-lg font-bold text-green-900">{userStats.monthlyUsers}</p>
                            <p className="text-xs text-green-700 font-medium">Monthly</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200 text-center">
                            <p className="text-lg font-bold text-purple-900">{userStats.quarterlyUsers}</p>
                            <p className="text-xs text-purple-700 font-medium">Quarterly</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg border border-red-200 text-center">
                            <p className="text-lg font-bold text-red-900">{userStats.inactiveUsers}</p>
                            <p className="text-xs text-red-700 font-medium">Inactive</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;