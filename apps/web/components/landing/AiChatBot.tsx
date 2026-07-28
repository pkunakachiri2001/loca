'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';

const quickReplies = [
  'How do I book a car?',
  'What are your prices?',
  'How do I list my company?',
  'Is payment secure?',
];

const botResponses: Record<string, string> = {
  'how do i book a car?': 'Booking on Famba is simple! 1️⃣ Browse vehicles or services in your city. 2️⃣ Select your dates or delivery location. 3️⃣ Pay securely online in USD. 4️⃣ Receive instant confirmation. Need help finding a vehicle?',
  'what are your prices?': 'Prices are set by verified providers. Car rentals start from $25/day, buses from $65/day, driver hire from $15/day, and package deliveries from $2.50. Try coupon WELCOME10 for 10% off your first booking!',
  'how do i list my company?': 'Welcome aboard! 🚀 Click "List Your Business" in the top bar. Registration is 100% free with no setup fees. Our team verifies applications within 48 hours.',
  'is payment secure?': '🔒 100% Secure. All payments use bank-grade 256-bit SSL encryption. Funds are protected until your trip or service begins.',
};

function getBotResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const [key, response] of Object.entries(botResponses)) {
    if (lower.includes(key.slice(0, 12))) return response;
  }
  return "I'm Famba Assistant! ✨ I can assist you with vehicle bookings, deliveries, provider onboarding, pricing, or account questions. How can I help you today?";
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
      text: 'Welcome to Famba ✨ How can I assist with your transport, delivery, or business today?',
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
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-4 w-96 max-w-[calc(100vw-3rem)] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[520px] bg-white border border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 px-5 bg-[#008767] text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white">Famba Assistant</h3>
                  <p className="text-[10px] flex items-center gap-1 text-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Online 24/7
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/20 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767]">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'rounded-tr-none bg-[#008767] text-white shadow-sm font-semibold'
                        : 'rounded-tl-none bg-white text-slate-800 border border-slate-200 shadow-sm'
                    }`}
                  >
                    {m.text}
                    <p className={`text-[9px] mt-1 text-right ${m.sender === 'user' ? 'text-white/80' : 'text-slate-400'}`}>{m.time}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[#E6F4F1] text-[#008767]">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <span>Assistant is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            <div className="px-4 py-2 flex flex-wrap gap-1.5 bg-white border-t border-slate-100">
              {quickReplies.map((qr) => (
                <button
                  key={qr}
                  onClick={() => sendMessage(qr)}
                  className="text-[11px] px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-[#E6F4F1] hover:text-[#008767] hover:border-[#B2E3D8] transition-all font-semibold"
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
              className="p-3 flex items-center gap-2 bg-white border-t border-slate-200"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Famba assistant anything..."
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
          className="flex items-center gap-2 px-5 py-3.5 rounded-full font-bold text-sm text-white bg-[#008767] shadow-xl shadow-[#008767]/30 hover:bg-[#007358] transition-all"
        >
          <Sparkles className="h-4 w-4" />
          <span>Need Help?</span>
        </motion.button>
      )}
    </div>
  );
}
