import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Warehouse, 
    MapPin, 
    Edit, 
    Trash2, 
    Plus, 
    Search,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import axios from 'axios';
import API_URL from '../../config';

const WarehouseManagement = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [formData, setFormData] = useState({ name: '', location: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWarehouses();
    }, [searchTerm]);

    const fetchWarehouses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/admin/warehouses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWarehouses(response.data);
        } catch (error) {
            console.error('Failed to fetch warehouses:', error);
            setError('Failed to load warehouses');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('token');
            
            if (editingWarehouse) {
                await axios.put(
                    `${API_URL}/admin/warehouses/${editingWarehouse._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    `${API_URL}/coffee-samples/warehouses`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            fetchWarehouses();
            setShowAddModal(false);
            setEditingWarehouse(null);
            setFormData({ name: '', location: '' });
        } catch (error) {
            console.error('Failed to save warehouse:', error);
            setError(error.response?.data?.message || 'Failed to save warehouse');
        }
    };

    const handleDelete = async (warehouseId) => {
        if (!window.confirm('Are you sure you want to delete this warehouse?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/admin/warehouses/${warehouseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchWarehouses();
        } catch (error) {
            console.error('Failed to delete warehouse:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete warehouse';
            alert(errorMessage);
        }
    };

    const openEditModal = (warehouse) => {
        setEditingWarehouse(warehouse);
        setFormData({ name: warehouse.name, location: warehouse.location || '' });
        setShowAddModal(true);
    };

    const openAddModal = () => {
        setEditingWarehouse(null);
        setFormData({ name: '', location: '' });
        setShowAddModal(true);
    };

    const filteredWarehouses = warehouses.filter(warehouse =>
        warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (warehouse.location && warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-coffee-accent">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-coffee-accent"></div>
                <span className="ml-2 text-sm font-medium">Loading warehouses...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-coffee-dark to-coffee-accent p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Warehouse className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Warehouse Management</h1>
                            <p className="text-white/80 text-xs mt-0.5">Manage coffee warehouse locations</p>
                        </div>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add Warehouse</span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search warehouses by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-coffee-accent focus:border-transparent text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                {filteredWarehouses.length > 0 ? (
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 font-semibold">#</th>
                                <th className="px-4 py-3 font-semibold">Name</th>
                                <th className="px-4 py-3 font-semibold">Location</th>
                                <th className="px-4 py-3 font-semibold">Created Date</th>
                                <th className="px-4 py-3 font-semibold">Warehouse ID</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWarehouses.map((warehouse, index) => (
                                <tr key={warehouse._id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">{index + 1}</td>
                                    <td className="px-4 py-2 font-medium text-gray-900">{warehouse.name}</td>
                                    <td className="px-4 py-2 text-gray-600 flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{warehouse.location || '-'}</span>
                                    </td>
                                    <td className="px-4 py-2">{new Date(warehouse.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 text-gray-500">{warehouse._id.slice(-6)}</td>
                                    <td className="px-4 py-2 text-right space-x-2">
                                        <button
                                            onClick={() => openEditModal(warehouse)}
                                            className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(warehouse._id)}
                                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-8">
                        <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-1">No warehouses found</h3>
                        <p className="text-gray-500 text-sm">
                            {searchTerm ? 'Try changing your search keywords' : 'Start by adding your first warehouse'}
                        </p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
                            </h2>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
                                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-accent focus:border-transparent text-sm"
                                        placeholder="Enter warehouse name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-accent focus:border-transparent text-sm"
                                        placeholder="Enter location (optional)"
                                    />
                                </div>

                                <div className="flex items-center space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 bg-gradient-to-r from-coffee-dark to-coffee-accent text-white rounded-xl font-semibold hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        <span>{editingWarehouse ? 'Update' : 'Add'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WarehouseManagement;
