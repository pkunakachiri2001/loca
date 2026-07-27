'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Sparkles, User } from 'lucide-react';

const quickReplies = [
  'How do I book a car?',
  'What are your prices?',
  'How do I list my company?',
  'Is payment secure?',
];

const botResponses: Record<string, string> = {
  'how do i book a car?': 'Booking a car is simple! 1️⃣ Browse vehicles in your city. 2️⃣ Select your pickup/dropoff dates. 3️⃣ Pay securely online. 4️⃣ Receive instant booking confirmation. Need help finding a vehicle?',
  'what are your prices?': 'Prices are set by verified providers. Car rentals start from $25/day, buses from $65/day, and driver hire from $15/day. Try coupon WELCOME10 for 10% off your first booking!',
  'how do i list my company?': 'Welcome aboard! 🚀 Click "List Your Business" in the top bar. Registration is 100% free with no setup fees. Our team verifies applications within 48 hours.',
  'is payment secure?': '🔒 100% Secure. All payments use bank-grade 256-bit SSL encryption via Paystack & Stripe. Funds are protected until your trip begins.',
};

function getBotResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const [key, response] of Object.entries(botResponses)) {
    if (lower.includes(key.slice(0, 12))) return response;
  }
  return "I'm FleetNest Concierge! ✨ I can assist you with vehicle bookings, provider onboarding, pricing, or account questions. How can I help you today?";
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time: string;
}

export function AiChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to FleetNest ✨ How can I assist with your transport or business today?',
      sender: 'bot',
      time: new Date().toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = getBotResponse(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        time: new Date().toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 750);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="mb-4 w-96 max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]"
            style={{
              background: 'linear-gradient(145deg, #1C1C1F 0%, #121214 100%)',
              border: '1px solid rgba(232, 165, 71, 0.3)',
              boxShadow: '0 24px 48px -12px rgba(0,0,0,0.8), 0 0 32px rgba(232,165,71,0.15)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 px-5" style={{ background: '#242428', borderBottom: '1px solid #2E2E34' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#E8A547', color: '#0E0E10' }}>
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm" style={{ color: '#F5F0E8' }}>FleetNest Concierge</h3>
                  <p className="text-[10px] flex items-center gap-1" style={{ color: '#34D399' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online 24/7
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: '#9A9A9E' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(232,165,71,0.15)', border: '1px solid rgba(232,165,71,0.3)', color: '#E8A547' }}>
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'rounded-tr-none'
                        : 'rounded-tl-none'
                    }`}
                    style={{
                      background: m.sender === 'user' ? '#E8A547' : '#242428',
                      color: m.sender === 'user' ? '#0E0E10' : '#F5F0E8',
                      border: m.sender === 'bot' ? '1px solid #2E2E34' : 'none',
                      fontWeight: m.sender === 'user' ? 600 : 400,
                    }}
                  >
                    {m.text}
                    <p className="text-[9px] mt-1 text-right opacity-60">{m.time}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs" style={{ color: '#6B6B72' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(232,165,71,0.15)' }}>
                    <Bot className="h-3.5 w-3.5" style={{ color: '#E8A547' }} />
                  </div>
                  <span>Concierge is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            <div className="px-4 py-2 flex flex-wrap gap-1.5" style={{ borderTop: '1px solid #242428' }}>
              {quickReplies.map((qr) => (
                <button
                  key={qr}
                  onClick={() => sendMessage(qr)}
                  className="text-[11px] px-2.5 py-1 rounded-full transition-all"
                  style={{ background: '#242428', border: '1px solid #2E2E34', color: '#9A9A9E' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8A547'; (e.currentTarget as HTMLElement).style.color = '#E8A547'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2E2E34'; (e.currentTarget as HTMLElement).style.color = '#9A9A9E'; }}
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="p-3 flex items-center gap-2"
              style={{ background: '#1A1A1C', borderTop: '1px solid #2E2E34' }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Concierge anything..."
                className="input-dark flex-1 py-2 text-xs"
              />
              <button type="submit" className="btn-primary py-2 px-3">
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full font-display text-sm font-bold shadow-2xl transition-all"
          style={{
            background: 'linear-gradient(135deg, #F5D78A 0%, #E8A547 50%, #C4892E 100%)',
            color: '#0E0E10',
            boxShadow: '0 8px 30px rgba(232, 165, 71, 0.45)',
          }}
        >
          <Sparkles className="h-4 w-4" />
          <span>Need Help?</span>
        </motion.button>
      )}
    </div>
  );
}
