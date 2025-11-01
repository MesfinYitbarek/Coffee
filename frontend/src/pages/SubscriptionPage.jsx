// frontend/src/pages/SubscriptionPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SubscriptionPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [selectedPackage, setSelectedPackage] = useState(null); // 'monthly', 'quarterly', 'free_trial'
    const [paymentSent, setPaymentSent] = useState(false); // State to track if user clicked 'I paid'

    // Redirect if user is already active or package is selected
    React.useEffect(() => {
        if (!loading && user) {
            if (user.isActive && user.packageType !== 'none') {
                navigate('/calculator'); // Already active, go to calculator
            }
        } else if (!loading && !user) {
            navigate('/'); // Not logged in, go to login
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-xl">Loading subscription...</div>;
    }

    const handlePackageSelection = (pkgType) => {
        setSelectedPackage(pkgType);
    };

    const handlePaymentConfirmation = () => {
        // Here, you would ideally send a request to the backend
        // to record that the user has "paid" and is waiting for admin activation.
        // For now, we just update local state.
        setPaymentSent(true);
        alert(t('paymentConfirmationMessage'));
        // In a real app, you might navigate to a 'pending activation' page
        // or stay here with a message, waiting for admin to activate.
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-coffee-light">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg text-center border border-gray-200">
                <h1 className="text-3xl font-bold text-coffee-dark mb-6">{t('chooseYourPackage')}</h1>

                {!paymentSent ? (
                    <>
                        <p className="text-gray-700 mb-8">{t('selectPackageDescription')}</p>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {/* Free Trial */}
                            <div
                                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedPackage === 'free_trial' ? 'border-coffee-accent shadow-md' : 'border-gray-300 hover:border-coffee-accent/50'}`}
                                onClick={() => handlePackageSelection('free_trial')}
                            >
                                <h3 className="text-xl font-semibold text-coffee-dark mb-2">{t('freeTrial')}</h3>
                                <p className="text-gray-600 text-lg mb-4">{t('freeTrialDays', { days: 7 })}</p>
                                <p className="text-sm text-gray-500">{t('noPaymentNeeded')}</p>
                            </div>

                            {/* Monthly Package */}
                            <div
                                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedPackage === 'monthly' ? 'border-coffee-accent shadow-md' : 'border-gray-300 hover:border-coffee-accent/50'}`}
                                onClick={() => handlePackageSelection('monthly')}
                            >
                                <h3 className="text-xl font-semibold text-coffee-dark mb-2">{t('monthlyPackage')}</h3>
                                <p className="text-gray-600 text-lg mb-4">1000 {t('birr')}</p>
                                <p className="text-sm text-gray-500">{t('duration', { duration: '30 days' })}</p>
                            </div>

                            {/* Quarterly Package */}
                            <div
                                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedPackage === 'quarterly' ? 'border-coffee-accent shadow-md' : 'border-gray-300 hover:border-coffee-accent/50'}`}
                                onClick={() => handlePackageSelection('quarterly')}
                            >
                                <h3 className="text-xl font-semibold text-coffee-dark mb-2">{t('quarterlyPackage')}</h3>
                                <p className="text-gray-600 text-lg mb-4">3000 {t('birr')}</p>
                                <p className="text-sm text-gray-500">{t('duration', { duration: '90 days' })}</p>
                            </div>
                        </div>

                        {selectedPackage && selectedPackage !== 'free_trial' && (
                            <div className="mt-8 p-6 bg-cream rounded-lg text-left">
                                <h4 className="text-xl font-semibold text-coffee-dark mb-4">{t('paymentInstructions')}</h4>
                                <p className="text-gray-700 mb-2"><strong>{t('adminName')}:</strong> Sara Ali</p>
                                <p className="text-gray-700 mb-4"><strong>{t('cbeAccount')}:</strong> 1000123456789</p>
                                <p className="text-gray-700 mb-4"><strong>{t('telebirrAccount')}:</strong> 09XXXXXXXX</p>
                                <p className="text-red-600 text-sm mb-6">{t('outsideWebsiteNote')}</p>

                                <button
                                    onClick={handlePaymentConfirmation}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-coffee-accent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-accent transition-colors"
                                >
                                    {t('iPaidButton')}
                                </button>
                            </div>
                        )}
                         {selectedPackage === 'free_trial' && (
                            <button
                                onClick={() => navigate('/calculator')} // For free trial, user can proceed immediately
                                className="w-full mt-8 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-coffee-accent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-accent transition-colors"
                            >
                                {t('startFreeTrial')}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="mt-8 p-6 bg-green-50 rounded-lg text-center border border-green-200">
                        <p className="text-green-700 font-semibold text-lg mb-4">{t('waitingForAdminActivation')}</p>
                        <p className="text-gray-600">{t('adminWillReviewPayment')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionPage;