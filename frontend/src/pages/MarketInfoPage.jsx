import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
    TrendingUp, 
    Calendar, 
    DollarSign, 
    Package, 
    AlertCircle,
    Loader,
    RefreshCw,
    BarChart3
} from 'lucide-react';
import API_URL from '../config';
const MarketInfoPage = () => {
    const { t } = useTranslation();
    const { token } = useAuth();
    const [marketInfos, setMarketInfos] = useState([]);
    const [coffeePrices, setCoffeePrices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [view, setView] = useState('updates'); // State to toggle views


    const fetchData = async () => {
        setRefreshing(true);
        setError('');
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const [marketInfoRes, coffeePricesRes] = await Promise.all([
                axios.get(`${API_URL}/market/info`, config),
                axios.get(`${API_URL}/market/prices`, config),
            ]);

            setMarketInfos(marketInfoRes.data);
            setCoffeePrices(coffeePricesRes.data);
        } catch (err) {
            console.error('Failed to fetch market data:', err);
            setError(t('failedToLoadMarketData'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token, t]);

    const groupPricesByType = (prices) => {
        const grouped = {};
        prices.forEach(price => {
            if (!grouped[price.coffeeType]) {
                grouped[price.coffeeType] = [];
            }
            grouped[price.coffeeType].push(price);
        });
        return grouped;
    };

    const groupedPrices = groupPricesByType(coffeePrices);
    const coffeeTypeOrder = ['Local Unwashed', 'Local Washed', 'Local Sidama Washed', 'Local Washed Yirgacheffe'];

    const formatPrice = (price) => {
        return price ? price.toLocaleString() + ' Birr' : 'None';
    };

    const getPriceChangeColor = (lowerPrice, upperPrice) => {
        if (!lowerPrice || !upperPrice) return 'text-gray-500';
        const avgPrice = (lowerPrice + upperPrice) / 2;
        if (avgPrice > 5000) return 'text-green-600';
        if (avgPrice > 3000) return 'text-amber-600';
        return 'text-coffee-accent';
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    {t('Daily Market Information')}
                                </h1>
                                <p className="text-white/80 text-xs mt-0.5">
                                    Loading current market data...
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2 text-coffee-accent">
                            <Loader className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-medium">{t('loadingMarketData')}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    {t('Daily Market Information')}
                                </h1>
                                <p className="text-white/80 text-xs mt-0.5">
                                    Real-time coffee market updates and price information
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={fetchData}
                            disabled={refreshing}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 text-white text-sm"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Toggle Buttons */}
                    <div className="bg-gray-50 p-1 rounded-xl inline-flex w-full mb-6">
                        <button
                            type="button"
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-1 text-sm ${view === 'updates'
                                ? 'bg-white text-coffee-dark shadow-md'
                                : 'text-gray-600 hover:text-coffee-dark'
                            }`}
                            onClick={() => {
                                setView('updates');
                            }}
                        >
                            <Calendar className="w-4 h-4" />
                            <span>{t('Daily Updates')}</span>
                        </button>
                        <button
                            type="button"
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-1 text-sm ${view === 'prices'
                                ? 'bg-white text-coffee-dark shadow-md'
                                : 'text-gray-600 hover:text-coffee-dark'
                            }`}
                            onClick={() => {
                                setView('prices');
                            }}
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>{t('Current Price Range')}</span>
                        </button>
                    </div>

                    {/* Content Based on Selected View */}
                    {view === 'updates' && (
                        <section className="space-y-4">
                            <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-cream p-3 rounded-xl border border-gray-200">
                                <Calendar className="w-4 h-4 text-coffee-accent" />
                                <h2 className="text-sm font-bold text-coffee-dark">{t('Daily Updates')}</h2>
                            </div>

                            {marketInfos.length === 0 ? (
                                <div className="bg-gradient-to-br from-cream to-coffee-light p-6 rounded-xl text-center border border-gray-200">
                                    <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <h3 className="text-sm font-semibold text-gray-600 mb-1">No updates available</h3>
                                    <p className="text-gray-500 text-xs">
                                        Check back later for the latest market news
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {marketInfos.map((info) => (
                                        <div key={info._id} className="bg-gradient-to-br from-cream to-coffee-light rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                                            <div className="p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="w-4 h-4 text-coffee-accent" />
                                                        <span className="text-sm font-bold text-coffee-dark">
                                                            {new Date(info.date).toLocaleDateString('en-US', { 
                                                                year: 'numeric', 
                                                                month: 'short', 
                                                                day: 'numeric' 
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {info.imageUrl && (
                                                    <img 
                                                        src={info.imageUrl} 
                                                        alt={`Market Info for ${info.date}`} 
                                                        className="w-full h-32 object-cover rounded-lg mb-3"
                                                    />
                                                )}
                                                
                                                {info.description && (
                                                    <p className="text-gray-700 text-xs leading-relaxed">
                                                        {info.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {view === 'prices' && (
                        <section className="space-y-4">
                            <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-cream p-3 rounded-xl border border-gray-200">
                                <BarChart3 className="w-4 h-4 text-coffee-accent" />
                                <h2 className="text-sm font-bold text-coffee-dark">{t('Current Price Range')}</h2>
                            </div>

                            {coffeePrices.length === 0 ? (
                                <div className="bg-gradient-to-br from-cream to-coffee-light p-6 rounded-xl text-center border border-gray-200">
                                    <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <h3 className="text-sm font-semibold text-gray-600 mb-1">No price data available</h3>
                                    <p className="text-gray-500 text-xs">
                                        Price information will be updated soon
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {coffeeTypeOrder.map(type => (
                                        groupedPrices[type] && (
                                            <div key={type} className="bg-gradient-to-br from-cream to-coffee-light rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                <div className="p-3">
                                                    <div className="flex items-center space-x-2 mb-3">
                                                        <Package className="w-4 h-4 text-coffee-accent" />
                                                        <h3 className="text-sm font-bold text-coffee-dark">
                                                            {type}
                                                        </h3>
                                                    </div>
                                                    
                                                 <div className="overflow-x-auto rounded-xl border border-coffee-accent/30 shadow-md bg-gradient-to-br from-cream to-coffee-light">
  <table className="min-w-full text-sm rounded-xl overflow-hidden">
    <thead className="bg-coffee-accent text-white">
      <tr>
        <th className="px-4 py-2 text-left font-semibold">Grade</th>
        <th className="px-4 py-2 text-left font-semibold">Lower Price</th>
        <th className="px-4 py-2 text-left font-semibold">Upper Price</th>
      </tr>
    </thead>
    <tbody>
      {groupedPrices[type].map((price, index) => (
        <tr
          key={price._id}
          className={`${
            index % 2 === 0 ? 'bg-white/80' : 'bg-cream/70'
          } hover:bg-coffee-light/50 transition-all duration-200`}
        >
          <td className="px-4 py-2 font-medium text-coffee-dark">{price.grade}</td>
          <td
            className={`px-4 py-2 font-semibold ${getPriceChangeColor(
              price.lowerPrice,
              price.upperPrice
            )}`}
          >
            {formatPrice(price.lowerPrice)}
          </td>
          <td
            className={`px-4 py-2 font-semibold ${getPriceChangeColor(
              price.lowerPrice,
              price.upperPrice
            )}`}
          >
            {formatPrice(price.upperPrice)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketInfoPage;