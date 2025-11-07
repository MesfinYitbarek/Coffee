import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Newspaper, Plus, Edit, Trash2 } from 'lucide-react';
import API_URL from '../../config';

const emptyMarket = { date: '', description: '', imageFile: null, imageUrl: '' };
const emptyPrice = { coffeeType: 'Local Unwashed', grade: '', lowerPrice: '', upperPrice: '' };

export default function MarketInfoManagement() {
  const [marketInfos, setMarketInfos] = useState([]);
  const [coffeePrices, setCoffeePrices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showMarketModal, setShowMarketModal] = useState(false);
  const [editingMarket, setEditingMarket] = useState(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);

  const [marketForm, setMarketForm] = useState(emptyMarket);
  const [priceForm, setPriceForm] = useState(emptyPrice);

  const [activeTab, setActiveTab] = useState('market'); // 🔁 Toggle state

  const coffeeTypes = ['Local Unwashed', 'Local Washed', 'Local Sidama Washed', 'Local Washed Yirgacheffe'];

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [mRes, pRes] = await Promise.all([
        axios.get(`${API_URL}/market/info`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/market/prices`, { headers: { Authorization: `Bearer ${token}` } }),
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

  // CRUD Handlers (Market + Price) --------------------
  const openAddMarket = () => {
    setEditingMarket(null);
    setMarketForm(emptyMarket);
    setShowMarketModal(true);
  };

  const openEditMarket = (info) => {
    setEditingMarket(info);
    setMarketForm({
      date: new Date(info.date).toISOString().slice(0, 10),
      description: info.description || '',
      imageUrl: info.imageUrl || '',
      imageFile: null,
    });
    setShowMarketModal(true);
  };

  async function handleMarketSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('date', marketForm.date);
      formData.append('description', marketForm.description || '');
      if (marketForm.imageFile) formData.append('imageData', marketForm.imageFile);

      if (editingMarket) {
        await axios.put(`${API_URL}/market/info/${editingMarket._id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`${API_URL}/market/info`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      }

      setShowMarketModal(false);
      fetchAll();
    } catch (err) {
      alert('Failed to save market info');
    }
  }

  const openAddPrice = () => {
    setEditingPrice(null);
    setPriceForm(emptyPrice);
    setShowPriceModal(true);
  };

  const openEditPrice = (p) => {
    setEditingPrice(p);
    setPriceForm({
      coffeeType: p.coffeeType,
      grade: p.grade,
      lowerPrice: p.lowerPrice || '',
      upperPrice: p.upperPrice || '',
    });
    setShowPriceModal(true);
  };

  async function handlePriceSubmit(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  try {
    const payload = { ...priceForm };
    if (payload.lowerPrice === '') payload.lowerPrice = null; else payload.lowerPrice = Number(payload.lowerPrice);
    if (payload.upperPrice === '') payload.upperPrice = null; else payload.upperPrice = Number(payload.upperPrice);

    if (editingPrice) {
      // ✅ EDIT existing price
      await axios.put(`${API_URL}/market/prices/${editingPrice._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Price updated successfully');
    } else {
      // ✅ CREATE new price
      await axios.post(`${API_URL}/market/prices`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Price added successfully');
    }

    setShowPriceModal(false);
    fetchAll();
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || 'Failed to save price');
  }
}


  const handleDeleteMarket = async (id) => {
    if (!window.confirm('Delete this market info?')) return;
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/market/info/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  const handleDeletePrice = async (id) => {
    if (!window.confirm('Delete this price entry?')) return;
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/market/prices/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-60 text-coffee-accent font-medium">Loading...</div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-coffee-dark to-coffee-accent p-5 rounded-2xl shadow-md flex justify-between items-center">
        <h1 className="text-white font-bold text-lg flex items-center space-x-2">
          <Coffee className="w-5 h-5" />
          <span>Market Information Management</span>
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={openAddMarket}
            className="px-3 py-2 bg-white/20 rounded-xl text-white text-sm flex items-center gap-1 hover:bg-white/30"
          >
            <Plus className="w-4 h-4" /> Market Info
          </button>
          <button
            onClick={openAddPrice}
            className="px-3 py-2 bg-white/20 rounded-xl text-white text-sm flex items-center gap-1 hover:bg-white/30"
          >
            <Plus className="w-4 h-4" /> Price
          </button>
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex justify-center space-x-3">
        <button
          onClick={() => setActiveTab('market')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'market'
              ? 'bg-coffee-accent text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Newspaper className="inline w-4 h-4 mr-1" /> Market Updates
        </button>
        <button
          onClick={() => setActiveTab('price')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'price'
              ? 'bg-coffee-accent text-white shadow'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Coffee className="inline w-4 h-4 mr-1" /> Coffee Prices
        </button>
      </div>

      {/* Animated Content Switch */}
      <AnimatePresence mode="wait">
        {activeTab === 'market' ? (
          <motion.div
            key="market"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-4"
          >
            {marketInfos.length === 0 ? (
              <div className="text-center text-gray-500 py-6">No market updates available.</div>
            ) : (
              marketInfos.map((info) => (
                <div
                  key={info._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">
                        {new Date(info.date).toLocaleDateString()}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openEditMarket(info)}
                        className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMarket(info._id)}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {info.imageUrl && (
                    <img
                      src={info.imageUrl}
                      alt="Market"
                      className="w-full h-40 object-cover rounded-lg mt-3"
                    />
                  )}
                </div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="price"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3"
          >
            {coffeeTypes.map((type) => (
              <div key={type} className="border-b pb-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">{type}</h3>
                {coffeePrices.filter((p) => p.coffeeType === type).length === 0 ? (
                  <p className="text-xs text-gray-500">No data</p>
                ) : (
                  coffeePrices
                    .filter((p) => p.coffeeType === type)
                    .map((p) => (
                      <div key={p._id} className="flex justify-between items-center text-sm py-1">
                        <div>{p.grade}</div>
                        <div className="text-gray-700">
                          {p.lowerPrice
                            ? `${p.lowerPrice} - ${p.upperPrice || 'N/A'} Birr`
                            : 'N/A'}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openEditPrice(p)}
                            className="p-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeletePrice(p._id)}
                            className="p-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {showMarketModal && (
        <Modal
          title={editingMarket ? 'Edit Market Info' : 'Add Market Info'}
          onClose={() => setShowMarketModal(false)}
          onSubmit={handleMarketSubmit}
        >
          <div className="space-y-3">
            <input
              type="date"
              required
              value={marketForm.date}
              onChange={(e) => setMarketForm({ ...marketForm, date: e.target.value })}
              className="w-full border rounded-lg p-2 text-sm"
            />
            <textarea
              rows="3"
              placeholder="Description"
              value={marketForm.description}
              onChange={(e) => setMarketForm({ ...marketForm, description: e.target.value })}
              className="w-full border rounded-lg p-2 text-sm"
            />
            <input type="file" onChange={(e) => setMarketForm({ ...marketForm, imageFile: e.target.files[0] })} />
            {marketForm.imageUrl && !marketForm.imageFile && (
              <img src={marketForm.imageUrl} className="w-32 h-20 object-cover mt-2 rounded" alt="preview" />
            )}
          </div>
        </Modal>
      )}

      {showPriceModal && (
        <Modal
          title={editingPrice ? 'Edit Coffee Price' : 'Add Coffee Price'}
          onClose={() => setShowPriceModal(false)}
          onSubmit={handlePriceSubmit}
        >
          <div className="space-y-3">
            <select
              value={priceForm.coffeeType}
              onChange={(e) => setPriceForm({ ...priceForm, coffeeType: e.target.value })}
              className="w-full border rounded-lg p-2 text-sm"
            >
              {coffeeTypes.map((ct) => (
                <option key={ct}>{ct}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Grade"
              value={priceForm.grade}
              onChange={(e) => setPriceForm({ ...priceForm, grade: e.target.value })}
              className="w-full border rounded-lg p-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Lower Price"
                value={priceForm.lowerPrice}
                onChange={(e) => setPriceForm({ ...priceForm, lowerPrice: e.target.value })}
                className="border rounded-lg p-2 text-sm"
              />
              <input
                type="number"
                placeholder="Upper Price"
                value={priceForm.upperPrice}
                onChange={(e) => setPriceForm({ ...priceForm, upperPrice: e.target.value })}
                className="border rounded-lg p-2 text-sm"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ------------------- Modal Component -------------------
function Modal({ title, children, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
      >
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
          className="space-y-4"
        >
          {children}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-coffee-accent text-white rounded-lg hover:opacity-90"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
