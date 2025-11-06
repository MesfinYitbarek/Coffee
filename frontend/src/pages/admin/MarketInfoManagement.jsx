
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE =  'http://localhost:5000/api';

const emptyMarket = { date: '', description: '', imageFile: null, imageUrl: '' };
const emptyPrice = { coffeeType: 'Local Unwashed', grade: '', lowerPrice: '', upperPrice: '' };

export default function MarketInfoManagement() {
  const [marketInfos, setMarketInfos] = useState([]);
  const [coffeePrices, setCoffeePrices] = useState([]);
  const [loading, setLoading] = useState(true);

  // modals
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [editingMarket, setEditingMarket] = useState(null);

  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);

  // form states
  const [marketForm, setMarketForm] = useState(emptyMarket);
  const [priceForm, setPriceForm] = useState(emptyPrice);

  const coffeeTypes = ['Local Unwashed', 'Local Washed', 'Local Sidama Washed', 'Local Washed Yirgacheffe'];

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [mRes, pRes] = await Promise.all([
        axios.get(`${API_BASE}/market/info`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/market/prices`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setMarketInfos(mRes.data);
      setCoffeePrices(pRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  // ----------------- Market Info CRUD -----------------
  function openAddMarket() {
    setEditingMarket(null);
    setMarketForm(emptyMarket);
    setShowMarketModal(true);
  }

  function openEditMarket(info) {
    setEditingMarket(info);
    setMarketForm({ date: new Date(info.date).toISOString().slice(0, 10), description: info.description || '', imageUrl: info.imageUrl || '', imageFile: null });
    setShowMarketModal(true);
  }

  async function handleMarketSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      // The backend expects imageData as base64 or multipart depending on implementation.
      // Here we send multipart/form-data so backend route should accept file upload (multer)
      const formData = new FormData();
      formData.append('date', marketForm.date);
      formData.append('description', marketForm.description || '');
      if (marketForm.imageFile) formData.append('imageData', marketForm.imageFile);

      if (editingMarket) {
        // update existing
        await axios.put(`${API_BASE}/market/info/${editingMarket._id}`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
        alert('Market info updated');
      } else {
        // create
        await axios.post(`${API_BASE}/market/info`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
        alert('Market info added');
      }

      setShowMarketModal(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save market info');
    }
  }

  async function handleDeleteMarket(id) {
    if (!window.confirm('Delete this market info?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/market/info/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  }

  // ----------------- Coffee Price CRUD -----------------
  function openAddPrice() {
    setEditingPrice(null);
    setPriceForm(emptyPrice);
    setShowPriceModal(true);
  }

  function openEditPrice(p) {
    setEditingPrice(p);
    setPriceForm({ coffeeType: p.coffeeType, grade: p.grade, lowerPrice: p.lowerPrice || '', upperPrice: p.upperPrice || '' });
    setShowPriceModal(true);
  }

  async function handlePriceSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      // The backend route POST /api/market/prices upserts based on coffeeType+grade
      const payload = { ...priceForm };
      // parse numbers
      if (payload.lowerPrice === '') payload.lowerPrice = null; else payload.lowerPrice = Number(payload.lowerPrice);
      if (payload.upperPrice === '') payload.upperPrice = null; else payload.upperPrice = Number(payload.upperPrice);

      await axios.post(`${API_BASE}/market/prices`, payload, { headers: { Authorization: `Bearer ${token}` } });
      alert('Price saved');
      setShowPriceModal(false);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save price');
    }
  }

  async function handleDeletePrice(priceId) {
    if (!window.confirm('Delete this price entry?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/market/prices/${priceId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Failed to delete price');
    }
  }

  // ----------------- UI Helpers -----------------
  function onMarketFileChange(e) {
    const file = e.target.files?.[0] || null;
    setMarketForm(prev => ({ ...prev, imageFile: file }));
  }

  if (loading) return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="p-6 bg-white rounded shadow">Loading...</div>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Market Information Management</h1>
        <div className="flex gap-2">
          <button onClick={openAddPrice} className="px-3 py-1 border rounded text-sm">Add Price</button>
          <button onClick={openAddMarket} className="px-3 py-1 border rounded text-sm">Add Market Info</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Market List */}
        <div className="bg-white p-4 rounded border">
          <h2 className="font-medium mb-3">Market Updates</h2>
          {marketInfos.length === 0 && <div className="text-sm text-gray-500">No market updates</div>}
          <div className="space-y-3">
            {marketInfos.map(info => (
              <div key={info._id} className="border p-2 rounded">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold">{new Date(info.date).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-600">{info.description}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-1">
                      <button onClick={() => openEditMarket(info)} className="px-2 py-1 border text-xs rounded">Edit</button>
                      <button onClick={() => handleDeleteMarket(info._id)} className="px-2 py-1 border text-xs rounded">Delete</button>
                    </div>
                    {info.imageUrl && <img src={info.imageUrl} alt="preview" className="w-20 h-12 object-cover rounded mt-2" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prices List */}
        <div className="bg-white p-4 rounded border">
          <h2 className="font-medium mb-3">Coffee Prices</h2>
          {coffeePrices.length === 0 && <div className="text-sm text-gray-500">No prices</div>}
          <div className="space-y-2">
            {coffeeTypes.map(type => (
              <div key={type} className="p-2 border rounded">
                <div className="font-semibold text-sm">{type}</div>
                <div className="mt-2 space-y-1">
                  {coffeePrices.filter(p => p.coffeeType === type).map(p => (
                    <div key={p._id} className="flex items-center justify-between">
                      <div className="text-sm">Grade {p.grade}</div>
                      <div className="text-right text-sm">
                        <div>{p.lowerPrice ? `${p.lowerPrice.toLocaleString()} - ${p.upperPrice?.toLocaleString() || 'N/A'} Birr` : 'N/A'}</div>
                        <div className="text-xs text-gray-500">Updated {new Date(p.dateUpdated).toLocaleDateString()}</div>
                      </div>
                      <div className="flex gap-1 ml-3">
                        <button onClick={() => openEditPrice(p)} className="px-2 py-1 border text-xs rounded">Edit</button>
                        <button onClick={() => handleDeletePrice(p._id)} className="px-2 py-1 border text-xs rounded">Delete</button>
                      </div>
                    </div>
                  ))}
                  {coffeePrices.filter(p => p.coffeeType === type).length === 0 && (
                    <div className="text-xs text-gray-500">No data</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Modal */}
      {showMarketModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded w-full max-w-lg">
            <h3 className="font-semibold mb-2">{editingMarket ? 'Edit Market Info' : 'Add Market Info'}</h3>
            <form onSubmit={handleMarketSubmit} className="space-y-3">
              <div>
                <label className="text-xs block mb-1">Date</label>
                <input type="date" value={marketForm.date} onChange={e => setMarketForm(prev => ({...prev, date: e.target.value}))} className="w-full border p-2 rounded text-sm" required />
              </div>
              <div>
                <label className="text-xs block mb-1">Description</label>
                <textarea value={marketForm.description} onChange={e => setMarketForm(prev => ({...prev, description: e.target.value}))} className="w-full border p-2 rounded text-sm" rows={3} />
              </div>
              <div>
                <label className="text-xs block mb-1">Image (optional)</label>
                <input type="file" accept="image/*" onChange={onMarketFileChange} className="text-sm" />
                {marketForm.imageUrl && !marketForm.imageFile && <img src={marketForm.imageUrl} alt="preview" className="w-32 h-20 object-cover mt-2 rounded" />}
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowMarketModal(false)} className="px-3 py-1 border rounded text-sm">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded w-full max-w-md">
            <h3 className="font-semibold mb-2">{editingPrice ? 'Edit Price' : 'Add Price'}</h3>
            <form onSubmit={handlePriceSubmit} className="space-y-3">
              <div>
                <label className="text-xs block mb-1">Coffee Type</label>
                <select value={priceForm.coffeeType} onChange={e => setPriceForm(prev => ({...prev, coffeeType: e.target.value}))} className="w-full border p-2 rounded text-sm">
                  {coffeeTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs block mb-1">Grade</label>
                <input type="text" value={priceForm.grade} onChange={e => setPriceForm(prev => ({...prev, grade: e.target.value}))} className="w-full border p-2 rounded text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs block mb-1">Lower Price</label>
                  <input type="number" value={priceForm.lowerPrice} onChange={e => setPriceForm(prev => ({...prev, lowerPrice: e.target.value}))} className="w-full border p-2 rounded text-sm" />
                </div>
                <div>
                  <label className="text-xs block mb-1">Upper Price</label>
                  <input type="number" value={priceForm.upperPrice} onChange={e => setPriceForm(prev => ({...prev, upperPrice: e.target.value}))} className="w-full border p-2 rounded text-sm" />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowPriceModal(false)} className="px-3 py-1 border rounded text-sm">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



