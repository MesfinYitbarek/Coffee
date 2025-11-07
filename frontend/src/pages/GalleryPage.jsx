import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
    Search,
    Filter,
    Heart,
    Image as ImageIcon,
    Warehouse,
    Calendar,
    Star,
    X,
    Loader
} from 'lucide-react';
import API_URL from '../config';
const GalleryPage = () => {
    const { t } = useTranslation();
    const { token, user } = useAuth();
    const [samplesByDay, setSamplesByDay] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [filters, setFilters] = useState({
        grn: '',
        warehouse: '',
        showFavorites: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    // Fetch warehouses
    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                const { data } = await axios.get(`${API_URL}/coffee-samples/warehouses`, config);
                setWarehouses(data);
            } catch (err) {
                console.error('Failed to fetch warehouses:', err);
                setError(t('failedToLoadWarehouses'));
            }
        };
        fetchWarehouses();
    }, [token, t]);

    // Fetch coffee samples based on filters
    useEffect(() => {
        const fetchCoffeeSamples = async () => {
            setLoading(true);
            setError('');
            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        grn: filters.grn,
                        warehouse: filters.warehouse,
                        favorites: filters.showFavorites,
                    },
                };
                const { data } = await axios.get(`${API_URL}/coffee-samples`, config);
                setSamplesByDay(data);
            } catch (err) {
                console.error('Failed to fetch coffee samples:', err);
                setError(t('failedToLoadSamples'));
            } finally {
                setLoading(false);
            }
        };
        if (token) {
            fetchCoffeeSamples();
        }
    }, [filters, token, t]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const clearFilters = () => {
        setFilters({
            grn: '',
            warehouse: '',
            showFavorites: false,
        });
    };

    const toggleFavorite = async (sampleId) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            await axios.put(`${API_URL}/${sampleId}/favorite`, {}, config);
            // Re-fetch samples to update favorite status immediately
            setFilters(prev => ({ ...prev }));
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
            setError(t('failedToToggleFavorite'));
        }
    };

    const hasActiveFilters = filters.grn || filters.warehouse || filters.showFavorites;

    return (
        <div className="max-w-full mx-auto p-1">
            <div className="bg-white rounded-2xl  border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                            <ImageIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">
                                {t('Coffee Sample Gallery')}
                            </h1>
                            <p className="text-white/80 text-xs mt-0.5">
                                Browse and manage your coffee sample collection
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    {/* Filters Section (Compact Modern Style) */}
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm p-3 mb-4">
                        <div className="flex flex-wrap items-center justify-between mb-2">
                            <div className="flex items-center space-x-1 text-coffee-dark">
                                <Filter className="w-3.5 h-3.5 text-coffee-accent" />
                                <h2 className="text-xs font-semibold uppercase tracking-wide">Filters</h2>
                            </div>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center space-x-1 text-xs text-gray-500 hover:text-coffee-accent transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                    <span>Clear</span>
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-2 md:space-y-0">
                            {/* GRN Search */}
                            <div className="relative flex-1 min-w-[150px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="grn"
                                    placeholder={t('Search by GRN')}
                                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-coffee-accent focus:border-transparent bg-white transition-all"
                                    value={filters.grn}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            {/* Warehouse Filter */}
                            <div className="relative flex-1 min-w-[150px]">
                                <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select
                                    name="warehouse"
                                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-coffee-accent focus:border-transparent bg-white transition-all appearance-none"
                                    value={filters.warehouse}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">{t('All Warehouses')}</option>
                                    {warehouses.map((warehouse) => (
                                        <option key={warehouse._id} value={warehouse._id}>
                                            {warehouse.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Favorites Filter */}
                            <label className="flex items-center space-x-1.5 px-2 py-1 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-coffee-accent transition-all text-sm">
                                <input
                                    type="checkbox"
                                    name="showFavorites"
                                    className="h-3.5 w-3.5 text-coffee-accent focus:ring-coffee-accent border-gray-300 rounded"
                                    checked={filters.showFavorites}
                                    onChange={handleFilterChange}
                                />
                                <div className="flex items-center space-x-1">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs text-gray-700">{t('Favorites Only')}</span>
                                </div>
                            </label>
                        </div>
                    </div>


                    {/* Error & Loading States */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                            <X className="w-4 h-4 text-red-600" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center space-x-2 text-coffee-accent">
                                <Loader className="w-5 h-5 animate-spin" />
                                <span className="text-sm font-medium">{t('loadingSamples')}</span>
                            </div>
                        </div>
                    )}

                    {/* Coffee Samples Display */}
                    {!loading && samplesByDay.length === 0 && !error && (
                        <div className="text-center py-12">
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-1">No samples found</h3>
                            <p className="text-gray-500 text-sm">
                                {hasActiveFilters
                                    ? 'Try adjusting your filters to see more results'
                                    : 'No coffee samples available yet'
                                }
                            </p>
                        </div>
                    )}

                    {/* Samples Grid */}
                    {!loading && samplesByDay.length > 0 && (
                        <div className="space-y-6">
                            {samplesByDay.map(dayGroup => (
                                <div key={dayGroup.date} className="space-y-3">
                                    {/* Date Header */}
                                    <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-cream p-3 rounded-xl border border-gray-200">
                                        <Calendar className="w-4 h-4 text-coffee-accent" />
                                        <div>
                                            <h2 className="text-sm font-bold text-coffee-dark">
                                                {dayGroup.date}
                                            </h2>
                                            <p className="text-xs text-gray-600">
                                                {dayGroup.count} {dayGroup.count === 1 ? 'sample' : 'samples'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Samples Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {dayGroup.items.map(sample => (
                                            <div
                                                key={sample._id}
                                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                                                onClick={() => setSelectedImage(sample)}
                                            >
                                                {/* Image */}
                                                <div className="relative aspect-square bg-gray-100">
                                                    <img
                                                        src={sample.imageUrl}
                                                        alt={`Coffee Sample GRN: ${sample.grnNumber}`}
                                                        className="w-full h-full object-cover"
                                                    />

                                                    {/* Favorite Button */}
                                                    <button
                                                        className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleFavorite(sample._id);
                                                        }}
                                                    >
                                                        <Heart
                                                            className={`w-4 h-4 ${sample.favoritedBy.includes(user?._id)
                                                                ? 'fill-red-500 text-red-500'
                                                                : 'text-gray-400 hover:text-red-400'
                                                                } transition-colors`}
                                                        />
                                                    </button>

                                                    {/* Warehouse Badge */}
                                                    <div className="absolute bottom-2 left-2">
                                                        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-xs text-white">
                                                            <Warehouse className="w-3 h-3" />
                                                            <span>{sample.warehouse.name}</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Sample Info */}
                                                <div className="p-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-sm font-bold text-coffee-dark">
                                                            GRN: {sample.grnNumber}
                                                        </p>
                                                        {sample.favoritedBy.includes(user?._id) && (
                                                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                        )}
                                                    </div>

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ... keep all imports and existing code ... */}

{/* Image Modal */}
{selectedImage && (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl max-w-full max-h-[90vh] overflow-hidden relative">
      {/* Image */}
      <img
        src={selectedImage.imageUrl}
        alt={`Coffee Sample GRN: ${selectedImage.grnNumber}`}
        className="w-full h-auto max-h-[70vh] object-contain"
      />

      {/* Close Button */}
      <button
        className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
        onClick={() => setSelectedImage(null)}
      >
        <X className="w-5 h-5 text-gray-700" />
      </button>

      {/* Favorite Button */}
      <button
        className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
        onClick={() => {
          toggleFavorite(selectedImage._id);
          setSelectedImage(prev => ({
            ...prev,
            favoritedBy: prev.favoritedBy.includes(user?._id)
              ? prev.favoritedBy.filter(id => id !== user?._id)
              : [...prev.favoritedBy, user?._id]
          }));
        }}
      >
        <Heart
          className={`w-5 h-5 ${
            selectedImage.favoritedBy.includes(user?._id)
              ? 'fill-red-500 text-red-500'
              : 'text-gray-700 hover:text-red-400'
          } transition-colors`}
        />
      </button>

      {/* Download Button */}
      <a
        href={selectedImage.imageUrl}
        download={`coffee-sample-${selectedImage.grnNumber}.jpg`}
        className="absolute top-4 right-16 bg-white/90 hover:bg-white text-coffee-dark font-bold px-3 py-1 rounded-full text-sm shadow-md"
      >
        ⬇ Download
      </a>

      {/* Image Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-coffee-dark">
            GRN: {selectedImage.grnNumber}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Warehouse className="w-4 h-4" />
            <span>{selectedImage.warehouse.name}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Added on {new Date(selectedImage.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  </div>
)}

        </div>
    );
};

export default GalleryPage;