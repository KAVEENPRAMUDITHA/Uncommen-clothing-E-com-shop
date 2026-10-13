import { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STORE } from '../lib/utils';

interface WhatsAppButtonProps {
    phoneNumber?: string; // Formatted international number without +, e.g., '94704850452'
    displayNumber?: string; // Local display format, e.g., '0704850452'
    defaultMessage?: string;
}

const QUICK_PROMPTS = [
    { label: '🛍️ Inquire about an Item', message: 'Hi! I have an inquiry about a product at Uncommon Clothing.' },
    { label: '📦 Track My Order', message: 'Hi! I would like to check the status of my order.' },
    { label: '📏 Size & Fit Advice', message: 'Hello! Could you help me with sizing for an item?' },
    { label: '📍 Store Location & Hours', message: 'Hi! Can you provide your store location and opening hours?' },
];

export default function WhatsAppButton({
    phoneNumber = STORE.whatsappNumber || '94704850452',
    displayNumber = STORE.whatsapp || '0704850452',
    defaultMessage = 'Hello Uncommon Clothing! I would like to get more information.',
}: WhatsAppButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [customMessage, setCustomMessage] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).Tawk_API) {
            try {
                if (isOpen) {
                    (window as any).Tawk_API.hideWidget?.();
                } else {
                    (window as any).Tawk_API.showWidget?.();
                }
            } catch {
                // Ignore if Tawk API not yet ready
            }
        }
    }, [isOpen]);

    const getWhatsAppUrl = (msg: string) => {
        const text = encodeURIComponent(msg.trim() || defaultMessage);
        return `https://wa.me/${phoneNumber}?text=${text}`;
    };

    const handleSend = (msgToSend: string) => {
        const url = getWhatsAppUrl(msgToSend);
        window.open(url, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend(customMessage || defaultMessage);
    };

    const toggleOpen = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <div 
            className="fixed bottom-6 right-6 flex flex-col items-end pointer-events-auto"
            style={{ zIndex: 2147483647 }}
        >
            {/* WhatsApp Chat Card Popup */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.94 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="mb-4 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-200/90 overflow-hidden flex flex-col text-neutral-900"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4.5 sm:p-5 relative">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
                                aria-label="Close WhatsApp chat popup"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-white text-emerald-700 flex items-center justify-center font-black text-lg shadow-md">
                                        UC
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-base tracking-tight leading-tight flex items-center gap-1.5">
                                        {STORE.name}
                                        <Sparkles size={14} className="text-yellow-300" />
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-100 mt-0.5">
                                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                                        <span>Online • {displayNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-white/90 mt-3 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10">
                                ⚡ Typically replies within a few minutes
                            </p>
                        </div>

                        {/* Body / Chat preview */}
                        <div className="p-4 sm:p-5 bg-neutral-50/80 space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Incoming Message Bubble */}
                            <div className="flex items-start gap-2.5">
                                <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-neutral-200 shadow-xs text-xs sm:text-sm text-neutral-800 leading-relaxed max-w-[88%]">
                                    <p className="font-semibold text-neutral-900 mb-1">Uncommon Support</p>
                                    <p>
                                        Hello there! 👋 Welcome to Uncommon Clothing. How can we help you today? Choose a quick topic or send us a direct message on WhatsApp!
                                    </p>
                                    <span className="block text-[10px] text-neutral-400 text-right mt-1.5">Just now</span>
                                </div>
                            </div>

                            {/* Quick Questions */}
                            <div className="space-y-1.5 pt-1">
                                <p className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 px-1">
                                    Quick Inquiries
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {QUICK_PROMPTS.map((prompt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(prompt.message)}
                                            className="text-left text-xs bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-neutral-200/90 px-3 py-2 rounded-xl text-neutral-700 transition shadow-2xs font-medium flex items-center justify-between group"
                                        >
                                            <span>{prompt.label}</span>
                                            <span className="text-neutral-400 group-hover:text-emerald-600 text-xs transition">→</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Message Input */}
                            <form onSubmit={handleFormSubmit} className="pt-2">
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-neutral-300 rounded-full focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-neutral-900 placeholder:text-neutral-400 shadow-2xs"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-1.5 w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center transition shadow-xs"
                                        aria-label="Send WhatsApp message"
                                    >
                                        <Send size={13} className="ml-0.5" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Direct Button Footer */}
                        <div className="p-3 bg-white border-t border-neutral-200 flex items-center justify-between">
                            <span className="text-[11px] text-neutral-500 font-medium pl-1">
                                Direct WhatsApp: <span className="font-semibold text-neutral-800">{displayNumber}</span>
                            </span>
                            <a
                                href={getWhatsAppUrl(customMessage || defaultMessage)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 shadow-xs"
                            >
                                Open Chat
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating WhatsApp Action Button */}
            <div className="relative group">
                {/* Subtle Ripple/Pulse behind button */}
                <span className="absolute -inset-1 rounded-full bg-emerald-500/25 animate-ping pointer-events-none duration-1000"></span>

                <button
                    onClick={toggleOpen}
                    className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
                    aria-label="Contact us on WhatsApp"
                    title={`Chat on WhatsApp (${displayNumber})`}
                >
                    {isOpen ? (
                        <X size={26} className="text-white" />
                    ) : (
                        <div className="relative flex items-center justify-center">
                            {/* WhatsApp SVG Icon */}
                            <svg
                                viewBox="0 0 24 24"
                                className="w-8 h-8 fill-current drop-shadow-xs"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.004c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z" />
                            </svg>
                            {/* Notification dot */}
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
