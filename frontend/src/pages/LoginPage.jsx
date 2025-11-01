// frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { Coffee, Mail, Phone, Lock, User as UserIcon, Globe } from 'lucide-react';

const LoginPage = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { register, login, user } = useAuth();
    const { t } = useTranslation();

    React.useEffect(() => {
        if (user) {
            if (user.packageType === 'none' && !user.isActive && !user.paymentConfirmed && isRegister) {
                navigate('/subscribe');
            } else {
                navigate('/calculator');
            }
        }
    }, [user, navigate, isRegister]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (isRegister) {
            const res = await register({ name, phoneNumber, emailAddress, password });
            if (res.success) {
                setMessage(res.message + ' Redirecting to subscription options...');
            } else {
                setError(res.message);
            }
        } else {
            const res = await login({ phoneNumber, password });
            if (res.success) {
                setMessage(res.message + ' Redirecting...');
            } else {
                setError(res.message);
            }
        }
    };

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-coffee-light via-cream to-coffee-light relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden opacity-5">
                <div className="absolute top-20 left-20 w-96 h-96 bg-coffee-dark rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-coffee-accent rounded-full blur-3xl" />
            </div>

            {/* Language Toggle */}
            <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={() => handleLanguageChange(i18n.language === 'am' ? 'en' : 'am')}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-white shadow-lg rounded-xl hover:shadow-xl transition-all duration-200 border border-gray-100"
                >
                    <Globe className="w-4 h-4 text-coffee-accent" />
                    <span className="text-sm font-medium text-coffee-dark">
                        {i18n.language === 'am' ? 'English' : 'አማርኛ'}
                    </span>
                </button>
            </div>

            <div className="relative z-10 bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-coffee-dark to-coffee-accent rounded-2xl mb-3 shadow-lg">
                        <Coffee className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-coffee-dark mb-1">
                        {t('coffeeCalculatorTitle')}
                    </h1>
                    <p className="text-gray-600 text-sm">
                        {t(isRegister ? 'registerSubtitle' : 'loginSubtitle')}
                    </p>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}
                {message && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-green-700 text-sm">{message}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <InputField
                            icon={UserIcon}
                            id="name"
                            type="text"
                            label={t('name')}
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={isRegister}
                        />
                    )}
                    
                    <InputField
                        icon={Phone}
                        id="phoneNumber"
                        type="tel"
                        label={t('phoneNumber')}
                        placeholder="+251 912 345 678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                    
                    {isRegister && (
                        <InputField
                            icon={Mail}
                            id="emailAddress"
                            type="email"
                            label={t('emailAddress')}
                            placeholder="your.email@example.com"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            required={isRegister}
                        />
                    )}
                    
                    <InputField
                        icon={Lock}
                        id="password"
                        type="password"
                        label={t('password')}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-coffee-dark to-coffee-accent text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:ring-offset-2"
                    >
                        {t(isRegister ? 'register' : 'login')}
                    </button>
                </form>

                {/* Toggle Register/Login */}
                <div className="mt-4 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError('');
                            setMessage('');
                        }}
                        className="text-sm text-coffee-accent hover:text-coffee-dark font-medium transition-colors duration-200"
                    >
                        {t(isRegister ? 'alreadyHaveAccount' : 'dontHaveAccount')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ icon: Icon, id, type, label, placeholder, value, onChange, required }) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type={type}
                    id={id}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-accent focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                />
            </div>
        </div>
    );
};

export default LoginPage;