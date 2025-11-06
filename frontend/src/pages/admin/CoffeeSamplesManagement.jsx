// CoffeeSamplesManagement.js — Full CRUD (Create + Edit with Cloudinary upload preview)
import React, { useState, useEffect, useRef } from 'react';
import { Coffee, Trash2, Search, Filter, Calendar, Warehouse, Plus, Edit, X } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../config';

const CoffeeSamplesManagement = () => {
  const [samples, setSamples] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('all');

  // Modal / form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSample, setCurrentSample] = useState(null); // used when editing
  const [form, setForm] = useState({ grnNumber: '', warehouseId: '', imageFile: null });
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterWarehouse]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [samplesRes, warehousesRes] = await Promise.all([
        axios.get(`${API_URL}/admin/samples`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/warehouses`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      // samplesRes.data likely grouped by day in earlier API; normalize if needed
      const rawSamples = Array.isArray(samplesRes.data) ? samplesRes.data : (samplesRes.data.flatMap?.((g) => g.items) || []);

      setSamples(rawSamples);
      setWarehouses(warehousesRes.data);
    } catch (err) {
      console.error('Fetch failed', err);
      alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Open Add modal
  const openAddModal = () => {
    setEditMode(false);
    setCurrentSample(null);
    setForm({ grnNumber: '', warehouseId: warehouses[0]?._id || '', imageFile: null });
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  // Open Edit modal
  const openEditModal = (sample) => {
    setEditMode(true);
    setCurrentSample(sample);
    setForm({ grnNumber: sample.grnNumber || '', warehouseId: sample.warehouse?._id || '', imageFile: null });
    setPreviewUrl(sample.imageUrl || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setCurrentSample(null);
    setForm({ grnNumber: '', warehouseId: '', imageFile: null });
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(prev => ({ ...prev, imageFile: file }));
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemovePreview = () => {
    setForm(prev => ({ ...prev, imageFile: null }));
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = async () => {
    if (!form.grnNumber || !form.warehouseId) {
      alert('Please provide GRN and select a warehouse');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const data = new FormData();
      data.append('grnNumber', form.grnNumber);
      data.append('warehouseId', form.warehouseId);
      // If a new image file is selected, append it. For edit, imageFile may be null meaning keep existing.
      if (form.imageFile) data.append('imageData', form.imageFile);

      if (!editMode) {
        // Create
        await axios.post(`${API_URL}/coffee-samples`, data, { headers: { Authorization: `Bearer ${token}` } });
        alert('Sample created');
      } else {
        // Update (admin route)
        await axios.put(`${API_URL}/admin/samples/${currentSample._id}`, data, { headers: { Authorization: `Bearer ${token}` } });
        alert('Sample updated');
      }

      closeModal();
      fetchData();
    } catch (err) {
      console.error('Save failed', err);
      const msg = err?.response?.data?.message || 'Failed to save sample';
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coffee sample?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/samples/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert('Deleted');
      fetchData();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete sample');
    }
  };

  const filteredSamples = samples.filter(sample => {
    const s = searchTerm.trim().toLowerCase();
    const matchesSearch = !s || (
      (sample.grnNumber || '').toLowerCase().includes(s) ||
      (sample.warehouse?.name || '').toLowerCase().includes(s)
    );
    const matchesWarehouse = filterWarehouse === 'all' || (sample.warehouse?._id === filterWarehouse);
    return matchesSearch && matchesWarehouse;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-coffee-accent/10 p-2 rounded-xl">
            <Coffee className="w-5 h-5 text-coffee-dark" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Coffee Samples Management</h2>
            <p className="text-sm text-gray-500">Create, edit or delete coffee samples (Cloudinary storage)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={openAddModal} className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-xl">
            <Plus className="w-4 h-4" /> Add Sample
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by GRN or warehouse" className="w-full pl-10 pr-4 py-2 border rounded-xl" />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-xl">
            <option value="all">All Warehouses</option>
            {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12">Loading...</div>
        ) : filteredSamples.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-8 text-center">No samples found</div>
        ) : (
          filteredSamples.map(sample => (
            <div key={sample._id} className="bg-white rounded-xl shadow-sm overflow-hidden border">
              <div className="relative aspect-[4/3] bg-gray-100 cursor-pointer" onClick={() => window.open(sample.imageUrl, '_blank')}>
                <img src={sample.imageUrl} alt={`GRN ${sample.grnNumber}`} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(sample); }} className="bg-white/90 p-1 rounded shadow">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(sample._id); }} className="bg-white/90 p-1 rounded shadow">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="inline-flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded text-xs">
                    <Warehouse className="w-3 h-3" />
                    <span className="max-w-[120px] truncate">{sample.warehouse?.name}</span>
                  </span>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold truncate">GRN: {sample.grnNumber}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(sample.dateAdded || sample.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-xs text-gray-500 mt-2">Favorites: {sample.favoritedBy?.length || 0}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{editMode ? 'Edit Sample' : 'Add Sample'}</h3>
              <button onClick={closeModal} className="p-2 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
              <div className="space-y-3">
                <label className="block text-sm font-medium">GRN Number</label>
                <input value={form.grnNumber} onChange={e => setForm(prev => ({ ...prev, grnNumber: e.target.value }))} className="w-full border rounded-xl p-2" />

                <label className="block text-sm font-medium">Warehouse</label>
                <select value={form.warehouseId} onChange={e => setForm(prev => ({ ...prev, warehouseId: e.target.value }))} className="w-full border rounded-xl p-2">
                  <option value="">Select warehouse</option>
                  {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>

                <div className="mt-3">
                  <label className="block text-sm font-medium mb-2">Image (preview before save)</label>

                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="preview" className="w-full h-44 object-cover rounded-md border" />
                      <button onClick={handleRemovePreview} className="absolute top-2 right-2 bg-white/80 p-1 rounded shadow"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="border-dashed border-2 border-gray-200 rounded-xl p-6 text-center">
                      <p className="text-sm text-gray-500">No image selected</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3">
                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl cursor-pointer">
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      <span className="text-sm">Choose Image</span>
                    </label>

                    {previewUrl && (
                      <button onClick={handleRemovePreview} className="px-3 py-2 border rounded-xl">Remove</button>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-2">Images are uploaded to Cloudinary via the backend. If you don't choose a new image while editing, the existing image will be preserved.</p>
                </div>
              </div>

              {/* Right column: preview + actions */}
              <div className="flex flex-col justify-between">
                <div className="bg-gray-50 p-4 rounded-xl h-full">
                  <h4 className="text-sm font-medium mb-2">Preview</h4>
                  <div className="w-full h-56 bg-white border rounded-md overflow-hidden flex items-center justify-center">
                    {previewUrl ? <img src={previewUrl} alt="preview" className="object-contain h-full" /> : (
                      <div className="text-sm text-gray-400">Preview will appear here</div>
                    )}
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    <div>GRN: <span className="font-medium">{form.grnNumber || '—'}</span></div>
                    <div>Warehouse: <span className="font-medium">{warehouses.find(w => w._id === form.warehouseId)?.name || '—'}</span></div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button onClick={closeModal} className="px-4 py-2 border rounded-xl">Cancel</button>
                  <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-xl">{editMode ? 'Save Changes' : 'Create Sample'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoffeeSamplesManagement;
