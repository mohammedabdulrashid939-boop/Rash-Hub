import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { BUSINESS_INFO, getWhatsAppLink } from '../lib/constants';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const formattedMessage = `Hello Rash Hub Store!\n*Name:* ${name.trim()}\n*Phone:* ${phone.trim() || 'Not specified'}\n*Message:* ${message.trim()}\n*Location:* Abofour, Ghana`;
    window.open(getWhatsAppLink(formattedMessage), '_blank');
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3.5 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-bold uppercase tracking-wider">
          Abofour Delivery Support
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          GET IN TOUCH WITH RASH HUB
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
          Need a specific team jersey, sizing advice, or instant delivery status in Abofour? Contact
          our store team directly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-[#0D121F] border border-gray-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Official WhatsApp</span>
                <p className="text-base font-extrabold text-white">{BUSINESS_INFO.whatsapp}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Fastest response! Chat with Rashid for immediate stock availability and dispatch.
            </p>
            <a
              href={getWhatsAppLink('Hello Rash Hub Store, I want to inquire about jerseys.')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00E676] hover:underline pt-1"
            >
              <span>Open WhatsApp Chat</span>
              <span>→</span>
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D121F] border border-gray-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Telephone Call</span>
                <p className="text-base font-extrabold text-white">{BUSINESS_INFO.phoneFormatted}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Available 7 days a week for inquiries and delivery coordination across Abofour.
            </p>
            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00E676] hover:underline pt-1"
            >
              <span>Call 0533916516</span>
              <span>→</span>
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D121F] border border-gray-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Delivery Territory</span>
                <p className="text-base font-extrabold text-white">Abofour, Ghana Only</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Local door-to-door delivery throughout Abofour Central, Post Office, Zongo, and New Town areas.
            </p>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-7 bg-[#0D121F] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              Send a Message or Custom Jersey Request
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Looking for a retro kit, player version printing, or national team jersey? Send us a quick note.
            </p>
          </div>

          {sent && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-[#00E676]/40 text-[#00E676] text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Message transferred to WhatsApp for instant response!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kwame Mensah"
                className="w-full px-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00E676]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0533916516"
                className="w-full px-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00E676]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Which jersey or question do you have? *
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Do you have the Real Madrid 2025/2026 Player Version in size Large for delivery to Abofour Post Office?"
                className="w-full px-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00E676]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#00E676] text-black font-extrabold uppercase tracking-wider hover:bg-[#00FF7F] transition shadow-lg shadow-[#00E676]/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message Via WhatsApp</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
