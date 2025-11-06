// WarehouseManagement.js
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
    CheckCircle,
    XCircle
} from 'lucide-react';
import axios from 'axios';

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
            const response = await axios.get('http://localhost:5000/api/admin/warehouses', {
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
                // Update warehouse
                await axios.put(
                    `http://localhost:5000/api/admin/warehouses/${editingWarehouse._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // Add new warehouse
                await axios.post(
                    'http://localhost:5000/api/coffee-samples/warehouses',
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
            await axios.delete(`http://localhost:5000/api/admin/warehouses/${warehouseId}`, {
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
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                                <Warehouse className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Warehouse Management</h1>
                                <p className="text-white/80 text-xs mt-0.5">Loading warehouses...</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2 text-coffee-accent">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-coffee-accent"></div>
                            <span className="text-sm font-medium">Loading...</span>
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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                                <Warehouse className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Warehouse Management</h1>
                                <p className="text-white/80 text-xs mt-0.5">Manage coffee warehouse locations</p>
                            </div>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add Warehouse</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
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

            {/* Warehouses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWarehouses.map((warehouse) => (
                    <div key={warehouse._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                <Warehouse className="w-5 h-5 text-coffee-accent" />
                                <h3 className="text-sm font-bold text-gray-900">{warehouse.name}</h3>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => openEditModal(warehouse)}
                                    className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(warehouse._id)}
                                    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        
                        {warehouse.location && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                                <MapPin className="w-4 h-4" />
                                <span>{warehouse.location}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Created: {new Date(warehouse.createdAt).toLocaleDateString()}</span>
                            <span>ID: {warehouse._id.slice(-6)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredWarehouses.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">No warehouses found</h3>
                    <p className="text-gray-500 text-sm">
                        {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first warehouse'}
                    </p>
                </div>
            )}

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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Warehouse Name *
                                    </label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                                    </label>
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
                                        <span>{editingWarehouse ? 'Update Warehouse' : 'Add Warehouse'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
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