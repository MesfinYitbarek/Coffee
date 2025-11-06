// UserManagement.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Filter, CheckCircle, XCircle, 
    Calendar, Trash2, Plus, Edit, Clock,
    Users,
    MoreVertical
} from 'lucide-react';
import axios from 'axios';
import API_URL from '../../config';
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPackage, setFilterPackage] = useState('all');
    const [filterActive, setFilterActive] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showActivateModal, setShowActivateModal] = useState(false);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, filterPackage, filterActive, pagination.currentPage]);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = {
                page: pagination.currentPage,
                limit: 8,
                search: searchTerm || undefined,
                packageType: filterPackage !== 'all' ? filterPackage : undefined,
                isActive: filterActive !== 'all' ? filterActive : undefined
            };

            const response = await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            const fetchedUsers = Array.isArray(response.data.users)
                ? response.data.users
                : Array.isArray(response.data.data)
                ? response.data.data
                : [];

            setUsers(fetchedUsers);
            setPagination({
                currentPage: response.data.currentPage || 1,
                totalPages: response.data.totalPages || 1
            });
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (userId, packageType) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/admin/users/${userId}/activate`, 
                { packageType },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            fetchUsers();
            setShowActivateModal(false);
            setSelectedUser(null);
        } catch (error) {
            console.error('Failed to activate user:', error);
            alert('Failed to activate user');
        }
    };

    const handleDeactivate = async (userId) => {
        if (!window.confirm('Are you sure you want to deactivate this user?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/admin/users/${userId}/deactivate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            fetchUsers();
        } catch (error) {
            console.error('Failed to deactivate user:', error);
            alert('Failed to deactivate user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user');
        }
    };

    const getStatusBadge = (user) => {
        if (!user.isActive) {
            return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Inactive</span>;
        }
        
        const daysLeft = user.packageExpiresAt 
            ? Math.ceil((new Date(user.packageExpiresAt) - new Date()) / (1000 * 60 * 60 * 24))
            : 0;

        if (daysLeft <= 0) {
            return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Expired</span>;
        }

        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active ({daysLeft}d)</span>;
    };

    const getPackageBadge = (packageType) => {
        const badges = {
            free_trial: 'bg-blue-100 text-blue-700 border border-blue-200',
            monthly: 'bg-purple-100 text-purple-700 border border-purple-200',
            quarterly: 'bg-amber-100 text-amber-700 border border-amber-200',
            none: 'bg-gray-100 text-gray-700 border border-gray-200'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[packageType] || badges.none}`}>
                {packageType === 'free_trial' ? 'Trial' : packageType.replace('_', ' ')}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">User Management</h1>
                                <p className="text-white/80 text-xs mt-0.5">Loading users...</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2 text-coffee-accent">
                            <Clock className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-medium">Loading users...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">User Management</h1>
                            <p className="text-white/80 text-xs mt-0.5">Manage user accounts and subscriptions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Search */}
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coffee-accent focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Package Filter */}
                    <select
                        value={filterPackage}
                        onChange={(e) => setFilterPackage(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coffee-accent focus:border-transparent text-sm"
                    >
                        <option value="all">All Packages</option>
                        <option value="free_trial">Free Trial</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="none">No Package</option>
                    </select>

                    {/* Active Filter */}
                    <select
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coffee-accent focus:border-transparent text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {users.map((user) => (
                    <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all duration-200">
                        {/* User Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-coffee-dark to-coffee-accent rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                                        {user.name}
                                    </h3>
                                    <p className="text-xs text-gray-500">ID: {user._id?.slice(-6)}</p>
                                </div>
                            </div>
                            {getStatusBadge(user)}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-1 mb-3">
                            <p className="text-xs text-gray-900 font-medium truncate">{user.phoneNumber}</p>
                            <p className="text-xs text-gray-500 truncate">{user.emailAddress}</p>
                        </div>

                        {/* Package & Expiry */}
                        <div className="flex items-center justify-between mb-3">
                            {getPackageBadge(user.packageType)}
                            {user.packageExpiresAt && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(user.packageExpiresAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center space-x-1">
                                {!user.isActive && (
                                    <button
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setShowActivateModal(true);
                                        }}
                                        className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                        title="Activate"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
                                )}
                                {user.isActive && (
                                    <button
                                        onClick={() => handleDeactivate(user._id)}
                                        className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition-colors"
                                        title="Deactivate"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {users.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">No users found</h3>
                    <p className="text-gray-500 text-sm">
                        {searchTerm || filterPackage !== 'all' || filterActive !== 'all' 
                            ? 'Try adjusting your filters to see more results'
                            : 'No users available yet'
                        }
                    </p>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex items-center justify-between">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors text-sm"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors text-sm"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Activate User Modal */}
            <AnimatePresence>
                {showActivateModal && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowActivateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-3">Activate User</h2>
                            <p className="text-gray-600 text-sm mb-4">
                                Select package for <strong>{selectedUser.name}</strong>
                            </p>
                            
                            <div className="space-y-2 mb-4">
                                <button
                                    onClick={() => handleActivate(selectedUser._id, 'monthly')}
                                    className="w-full p-3 bg-purple-50 border-2 border-purple-200 rounded-xl hover:bg-purple-100 transition-colors text-left"
                                >
                                    <div className="font-semibold text-purple-900 text-sm">Monthly Package</div>
                                    <div className="text-xs text-purple-600">30 days - 1000 Birr</div>
                                </button>
                                
                                <button
                                    onClick={() => handleActivate(selectedUser._id, 'quarterly')}
                                    className="w-full p-3 bg-amber-50 border-2 border-amber-200 rounded-xl hover:bg-amber-100 transition-colors text-left"
                                >
                                    <div className="font-semibold text-amber-900 text-sm">Quarterly Package</div>
                                    <div className="text-xs text-amber-600">90 days - 3000 Birr</div>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowActivateModal(false)}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;