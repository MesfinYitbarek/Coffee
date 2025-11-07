import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
    User, 
    Package, 
    Calendar, 
    Clock, 
    CreditCard, 
    Mail, 
    Phone, 
    Crown,
    Zap,
    Shield,
    Contact,
    ArrowRight
} from 'lucide-react';

const ProfilePage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    {t('Profile')}
                                </h1>
                                <p className="text-white/80 text-xs mt-0.5">
                                    Loading profile information...
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-accent mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">{t('loadingProfile')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getDaysLeft = () => {
        if (!user.packageExpiresAt) return 0;
        const now = new Date();
        const expires = new Date(user.packageExpiresAt);
        const diffTime = expires.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const daysLeft = getDaysLeft();
    const isFreeTrial = user.packageType === 'free_trial';

    const handleExtendPackage = () => {
        navigate('/subscribe');
    };

    const formatPackageType = (type) => {
        switch (type) {
            case 'free_trial': return t('Free Trial');
            case 'monthly': return t('Monthly Package');
            case 'quarterly': return t('Quarterly Package');
            default: return t('none');
        }
    };

    const getPackageColor = (type) => {
        switch (type) {
            case 'free_trial': return 'text-amber-600';
            case 'monthly': return 'text-blue-600';
            case 'quarterly': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusColor = (isActive) => {
        return isActive ? 'text-green-600' : 'text-red-600';
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-coffee-dark to-coffee-accent p-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">
                                {t('Profile')}
                            </h1>
                            <p className="text-white/80 text-xs mt-0.5">
                                Manage your account and subscription
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* User Information */}
                        <div className="bg-gradient-to-br from-cream to-coffee-light rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-2 mb-4">
                                <User className="w-4 h-4 text-coffee-accent" />
                                <h2 className="text-sm font-bold text-coffee-dark">{t('User Info')}</h2>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                                    <span className="text-xs font-medium text-gray-600">{t('name')}</span>
                                    <span className="text-sm font-semibold text-coffee-dark">{user.name}</span>
                                </div>
                                
                                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-1">
                                        <Phone className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs font-medium text-gray-600">{t('phoneNumber')}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-coffee-dark">{user.phoneNumber}</span>
                                </div>
                                
                                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-1">
                                        <Mail className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs font-medium text-gray-600">{t('emailAddress')}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-coffee-dark">{user.emailAddress}</span>
                                </div>
                                
                               
                            </div>
                        </div>

                        {/* Account Status */}
                        <div className="bg-gradient-to-br from-cream to-coffee-light rounded-xl shadow-sm border border-gray-200 p-4">
                            <div className="flex items-center space-x-2 mb-4">
                                <Package className="w-4 h-4 text-coffee-accent" />
                                <h2 className="text-sm font-bold text-coffee-dark">{t('Account Status')}</h2>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-1">
                                        <Crown className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs font-medium text-gray-600">{t('Current Package')}</span>
                                    </div>
                                    <span className={`text-sm font-semibold ${getPackageColor(user.packageType)}`}>
                                        {formatPackageType(user.packageType)}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-1">
                                        <Zap className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs font-medium text-gray-600">{t('Status')}</span>
                                    </div>
                                    <span className={`text-sm font-semibold ${getStatusColor(user.isActive)}`}>
                                        {user.isActive ? t('Active') : t('inActive')}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs font-medium text-gray-600">{t('endsOn')}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-coffee-dark">
                                        {user.packageExpiresAt 
                                            ? new Date(user.packageExpiresAt).toLocaleDateString() 
                                            : t('notApplicable')
                                        }
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-1">
                                        <Clock className="w-3 h-3 text-gray-500" />
                                        <span className="text-xs font-medium text-gray-600">{t('daysLeft')}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`text-sm font-bold ${
                                            daysLeft < 7 ? 'text-red-600' : 
                                            daysLeft < 30 ? 'text-amber-600' : 'text-green-600'
                                        }`}>
                                            {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                                        </span>
                                        {isFreeTrial && (
                                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                                Trial
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleExtendPackage}
                                className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-coffee-dark to-coffee-accent text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                <CreditCard className="w-4 h-4" />
                                <span>{t('extendPackage')}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Admin Contact Information */}
                    <div className="mt-6 bg-gradient-to-br from-cream to-coffee-light rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <Contact className="w-4 h-4 text-coffee-accent" />
                            <h2 className="text-sm font-bold text-coffee-dark">{t('Admin Contact')}</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-2 mb-2">
                                    <User className="w-4 h-4 text-coffee-accent" />
                                    <span className="text-xs font-semibold text-gray-700">{t('adminName')}</span>
                                </div>
                                <p className="text-sm font-medium text-coffee-dark">Sara Ali</p>
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CreditCard className="w-4 h-4 text-coffee-accent" />
                                    <span className="text-xs font-semibold text-gray-700">{t('cbeAccount')}</span>
                                </div>
                                <p className="text-sm font-medium text-coffee-dark">1000123456789</p>
                            </div>
                            
                            <div className="bg-white p-3 rounded-lg border border-gray-200 md:col-span-2">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Phone className="w-4 h-4 text-coffee-accent" />
                                    <span className="text-xs font-semibold text-gray-700">{t('telebirrAccount')}</span>
                                </div>
                                <p className="text-sm font-medium text-coffee-dark">09XXXXXXXX</p>
                            </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-700 text-center">
                                💡 Contact the admin for any subscription-related inquiries or payment confirmations
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
                            <div className="flex items-center space-x-2">
                                <Package className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-semibold text-green-800">Package</span>
                            </div>
                            <p className="text-sm font-bold text-green-900 mt-1">
                                {formatPackageType(user.packageType)}
                            </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span className="text-xs font-semibold text-blue-800">Days Left</span>
                            </div>
                            <p className="text-sm font-bold text-blue-900 mt-1">
                                {daysLeft}
                            </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-xl border border-amber-200">
                            <div className="flex items-center space-x-2">
                                <Zap className="w-3 h-3 text-amber-600" />
                                <span className="text-xs font-semibold text-amber-800">Status</span>
                            </div>
                            <p className="text-sm font-bold text-amber-900 mt-1">
                                {user.isActive ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl border border-purple-200">
                            <div className="flex items-center space-x-2">
                                <Shield className="w-3 h-3 text-purple-600" />
                                <span className="text-xs font-semibold text-purple-800">Role</span>
                            </div>
                            <p className="text-sm font-bold text-purple-900 mt-1">
                                {t(user.role)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;