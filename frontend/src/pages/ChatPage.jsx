import React from 'react';
    import { useTranslation } from 'react-i18next';

    const ChatPage = () => {
        const { t } = useTranslation();
        return (
            <div className="flex items-center justify-center min-h-full p-4 bg-cream">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center w-full max-w-lg border border-gray-200">
                    <h1 className="text-3xl font-bold text-coffee-dark mb-4">{t('Chat')}</h1>
                    <p className="text-gray-700">{t('Chat Functionality Coming Soon')}</p>
                </div>
            </div>
        );
    };

    export default ChatPage;