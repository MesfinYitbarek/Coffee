import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
    Crown,
    Zap,
    Calendar,
    CreditCard,
    CheckCircle,
    Clock,
    AlertCircle,
    Loader,
    Star,
    Gift,
    Shield,
    Copy,
    Coffee,
    Sparkles
} from 'lucide-react';

const SubscriptionPage = () => {
    const { user, loading, refreshUser, token } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [selectedPackage, setSelectedPackage] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [copiedField, setCopiedField] = useState('');

    // Check user activation and redirect
    useEffect(() => {
        if (!loading && user) {
            if (user.isActive && user.packageType !== 'none') {
                navigate('/calculator');
            }
        } else if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const handlePackageSelection = (pkgType) => {
        setSelectedPackage(pkgType);
        setMessage('');
        setError('');
    };

    const copyToClipboard = async (text, fieldName) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(''), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handlePaymentConfirmation = async (pkgType) => {
        setProcessing(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post(
                'http://localhost:5000/api/users/select-package',
                { packageType: pkgType },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }
            );

            setMessage(response.data.message || 'Package selected successfully! Waiting for admin activation.');

            // Refresh user data from backend
            await refreshUser();

        } catch (err) {
            console.error('Payment confirmation failed:', err);
            const errorMessage = err.response?.data?.message ||
                err.message ||
                'Something went wrong while confirming payment. Please try again.';
            setError(errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    const handleFreeTrialStart = async () => {
        setProcessing(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post(
                'http://localhost:5000/api/users/free-trial',
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 10000
                }
            );

            setMessage(response.data.message || 'Free trial started successfully!');

            // Refresh user data
            await refreshUser();

            // Navigate after a short delay to show success message
            setTimeout(() => {
                navigate('/calculator');
            }, 2000);

        } catch (err) {
            console.error('Free trial start failed:', err);
            const errorMessage = err.response?.data?.message ||
                err.message ||
                'Unable to start free trial. Please try again.';
            setError(errorMessage);
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-coffee-light via-cream to-coffee-light flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-6xl">
                    <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                                <Coffee className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    Choose Your Package
                                </h1>
                                <p className="text-white/80 text-xs mt-0.5">
                                    Brewing your perfect subscription plan...
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2 text-coffee-accent">
                            <Loader className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-medium">Loading subscription...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const packageDetails = {
        free_trial: {
            price: 0,
            duration: '7 days',
            icon: Gift,
            color: 'from-amber-500 to-amber-600',
            bgColor: 'from-amber-50 to-amber-100',
            borderColor: 'border-amber-200',
            buttonColor: 'from-amber-500 to-amber-600',
            features: ['Full access to all features', 'No payment required', 'Instant activation', 'Perfect for testing']
        },
        monthly: {
            price: 1000,
            duration: '30 days',
            icon: Zap,
            color: 'from-coffee-accent to-coffee-dark',
            bgColor: 'from-cream to-coffee-light',
            borderColor: 'border-coffee-200',
            buttonColor: 'from-coffee-dark to-coffee-accent',
            features: ['Full access to all features', 'Priority support', 'Regular updates', 'Flexible monthly plan']
        },
        quarterly: {
            price: 3000,
            duration: '90 days',
            icon: Crown,
            color: 'from-green-600 to-emerald-700',
            bgColor: 'from-green-50 to-emerald-100',
            borderColor: 'border-green-200',
            buttonColor: 'from-green-600 to-emerald-700',
            features: ['Full access to all features', 'Priority support', 'Regular updates', 'Best value savings', 'Dedicated assistance']
        }
    };

    const paymentInfo = {
        adminName: 'Sara Ali',
        cbeAccount: '1000123456789',
        telebirrAccount: '0912345678'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-coffee-light via-cream to-coffee-light p-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                                <Coffee className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    Choose Your Package
                                </h1>
                                <p className="text-white/80 text-xs mt-0.5">
                                    Select the perfect roast for your coffee trading journey
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        {/* Messages */}
                        {message && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                <p className="text-green-700 text-sm">{message}</p>
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Welcome Message */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cream to-coffee-light px-4 py-2 rounded-full mb-3">
                                <Sparkles className="w-4 h-4 text-coffee-accent" />
                                <span className="text-sm font-semibold text-coffee-dark">
                                    Choose a subscription plan to unlock full access to our coffee trading platform
                                </span>
                            </div>
                        </div>

                        {/* Payment Information - Always Visible */}
                        <div className="bg-gradient-to-br from-coffee-dark/5 to-coffee-accent/10 rounded-2xl shadow-sm border border-coffee-200 p-6 mb-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <CreditCard className="w-5 h-5 text-coffee-accent" />
                                <h3 className="text-lg font-bold text-coffee-dark">Payment Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {/* Admin Name */}
                                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-coffee-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <Shield className="w-4 h-4 text-coffee-accent" />
                                            <span className="text-sm font-semibold text-gray-700">Name</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(paymentInfo.adminName, 'adminName')}
                                            className="p-1 hover:bg-coffee-light rounded transition-colors"
                                        >
                                            <Copy className={`w-3 h-3 ${copiedField === 'adminName' ? 'text-green-500' : 'text-gray-400'}`} />
                                        </button>
                                    </div>
                                    <p className="text-base font-bold text-coffee-dark">{paymentInfo.adminName}</p>
                                    {copiedField === 'adminName' && (
                                        <p className="text-xs text-green-600 mt-1">Copied!</p>
                                    )}
                                </div>

                                {/* CBE Account */}
                                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-coffee-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <CreditCard className="w-4 h-4 text-coffee-accent" />
                                            <span className="text-sm font-semibold text-gray-700">CBE Account</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(paymentInfo.cbeAccount, 'cbeAccount')}
                                            className="p-1 hover:bg-coffee-light rounded transition-colors"
                                        >
                                            <Copy className={`w-3 h-3 ${copiedField === 'cbeAccount' ? 'text-green-500' : 'text-gray-400'}`} />
                                        </button>
                                    </div>
                                    <p className="text-base font-bold text-coffee-dark font-mono">{paymentInfo.cbeAccount}</p>
                                    {copiedField === 'cbeAccount' && (
                                        <p className="text-xs text-green-600 mt-1">Copied!</p>
                                    )}
                                </div>

                                {/* Telebirr Account */}
                                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-coffee-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <Zap className="w-4 h-4 text-coffee-accent" />
                                            <span className="text-sm font-semibold text-gray-700">Telebirr Account</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(paymentInfo.telebirrAccount, 'telebirrAccount')}
                                            className="p-1 hover:bg-coffee-light rounded transition-colors"
                                        >
                                            <Copy className={`w-3 h-3 ${copiedField === 'telebirrAccount' ? 'text-green-500' : 'text-gray-400'}`} />
                                        </button>
                                    </div>
                                    <p className="text-base font-bold text-coffee-dark font-mono">{paymentInfo.telebirrAccount}</p>
                                    {copiedField === 'telebirrAccount' && (
                                        <p className="text-xs text-green-600 mt-1">Copied!</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-amber-100/50 border border-amber-200 p-3 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800 mb-1">Important Payment Instructions</p>
                                        <p className="text-xs text-amber-700">
                                            ⚠️ Please include your phone number in the payment reference or description when making the transfer.
                                        </p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            <span className="font-semibold">Support:</span> If you need help contact us at 0912345678.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Package Selection with Individual Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {Object.entries(packageDetails).map(([pkgType, details]) => {
                                const IconComponent = details.icon;
                                const isSelected = selectedPackage === pkgType;

                                return (
                                    <div
                                        key={pkgType}
                                        className={`relative rounded-2xl shadow-sm transition-all duration-300 overflow-visible ${
                                            isSelected
                                                ? 'ring-2 ring-coffee-accent shadow-lg transform scale-[1.02]'
                                                : 'hover:shadow-md'
                                        }`}
                                    >
                                        {/* Background */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${details.bgColor} ${details.borderColor} border-2 rounded-2xl`} />

                                        {/* Card Content */}
                                        <div className="relative">
                                            {/* Header */}
                                            <div 
                                                className={`p-4 bg-gradient-to-r ${details.color} text-white cursor-pointer rounded-t-2xl`}
                                                onClick={() => handlePackageSelection(pkgType)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <IconComponent className="w-6 h-6" />
                                                    {pkgType === 'free_trial' && (
                                                        <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
                                                            <Star className="w-3 h-3 fill-white" />
                                                            <span className="text-xs font-semibold">Popular</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold mt-2">
                                                    {pkgType === 'free_trial' ? 'Free Trial' :
                                                     pkgType === 'monthly' ? 'Monthly Package' : 'Quarterly Package'}
                                                </h3>
                                            </div>

                                            {/* Content */}
                                            <div 
                                                className="p-4 cursor-pointer"
                                                onClick={() => handlePackageSelection(pkgType)}
                                            >
                                                <div className="text-center mb-4">
                                                    <p className="text-2xl font-bold text-coffee-dark">
                                                        {details.price === 0 ? 'Free' : `${details.price} Birr`}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Duration: {details.duration}
                                                    </p>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    {details.features.map((feature, index) => (
                                                        <div key={index} className="flex items-center space-x-2 text-xs">
                                                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                                            <span className="text-gray-700">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {isSelected && (
                                                    <div className="flex items-center justify-center space-x-1 text-coffee-accent bg-white/80 py-1 rounded-full mb-4">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span className="text-sm font-semibold">Selected</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Button - Shows below card content when selected */}
                                            {isSelected && (
                                                <div className="px-4 pb-4">
                                                    {pkgType === 'free_trial' ? (
                                                        <button
                                                            onClick={handleFreeTrialStart}
                                                            disabled={processing}
                                                            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02]"
                                                        >
                                                            {processing ? (
                                                                <>
                                                                    <Loader className="w-5 h-5 animate-spin" />
                                                                    <span>Starting Your Trial...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Zap className="w-5 h-5" />
                                                                    <span>Start Free Trial</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handlePaymentConfirmation(pkgType)}
                                                            disabled={processing}
                                                            className="w-full py-3 px-4 bg-gradient-to-r from-coffee-dark to-coffee-accent text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-[1.02]"
                                                        >
                                                            {processing ? (
                                                                <>
                                                                    <Loader className="w-5 h-5 animate-spin" />
                                                                    <span>Processing Payment...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="w-5 h-5" />
                                                                    <span>I Paid</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                                        {pkgType === 'free_trial' 
                                                            ? 'Instant access - No payment required'
                                                            : 'Click after completing your payment'
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Activation Notice */}
                        {message && message.includes('Waiting for admin activation') && (
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-4 mt-6">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <h3 className="text-sm font-bold text-blue-800">Activation Process</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-700">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        <span>Package selection recorded</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-3 h-3 text-blue-500" />
                                        <span>Admin reviewing payment</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Shield className="w-3 h-3 text-purple-500" />
                                        <span>Security verification</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                        <span>Account activation</span>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-600 mt-3 text-center">
                                    You'll be automatically redirected once activated
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPage;