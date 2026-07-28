'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How does Famba verify companies?',
    a: 'Every company undergoes a multi-step verification process: document review (business registration, tax ID), physical inspection, background checks on key personnel, and an initial quality audit. Verified companies receive a green checkmark badge.',
  },
  {
    q: 'Is my payment secure?',
    a: 'Absolutely. All payments are processed with bank-level 256-bit SSL encryption. Your funds are held securely until the service begins, protecting you from fraudulent providers.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Yes. Our flexible cancellation policy allows free cancellation up to 24 hours before the booking start time for a full refund. Cancellations within 24 hours are subject to a 10% fee.',
  },
  {
    q: 'How do I list my business on Famba?',
    a: 'Register a company account, fill in your business details, upload your documents, and submit for verification. Our team reviews all applications within 48-72 hours. Once verified, you can add unlimited listings.',
  },
  {
    q: 'What happens if I have a problem with a service?',
    a: 'Contact our 24/7 support team via live chat, WhatsApp, or email. We also have a built-in dispute resolution system. For serious issues, Famba can mediate and process refunds where applicable.',
  },
  {
    q: 'Does Famba offer loyalty rewards?',
    a: 'Yes! Every completed booking earns you Famba Points. 1 point is awarded per $1 spent. Points can be redeemed for discounts on future bookings. Refer friends and earn bonus points too.',
  },
  {
    q: 'Is GPS tracking available for all bookings?',
    a: 'Live GPS tracking is available for driver and courier delivery bookings where the provider has opted in. For vehicle rentals, your booking details include pickup coordinates and Google Maps directions.',
  },
  {
    q: 'Can companies set their own prices?',
    a: 'Yes. Companies have full control over their pricing, including hourly/daily rates, deposits, and special offers. Prices are displayed transparently to customers with no hidden fees.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white border-t border-slate-200">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-badge mb-4 inline-flex">FAQ</span>
          <h2 className="font-display text-4xl font-extrabold text-[#0B192C] md:text-5xl mb-4">
            Frequently Asked <span className="text-[#008767]">Questions</span>
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto font-medium text-base">
            Everything you need to know about Famba. Can't find an answer? Contact our support team.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-[#008767]/50 transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="font-bold text-[#0B192C] text-base pr-4">{faq.q}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${openIndex === i ? 'bg-[#E6F4F1] text-[#008767] rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-6 pb-6 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
