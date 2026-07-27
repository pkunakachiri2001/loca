'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How does FleetNest verify companies?',
    a: 'Every company undergoes a multi-step verification process: document review (business registration, tax ID), physical inspection, background checks on key personnel, and an initial quality audit. Verified companies receive a blue checkmark badge.',
  },
  {
    q: 'Is my payment secure?',
    a: 'Absolutely. All payments are processed through Stripe, the world\'s most trusted payment infrastructure, with bank-level 256-bit SSL encryption. Your funds are held securely until the service begins, protecting you from fraudulent providers.',
  },
  {
    q: 'Can I cancel a booking?',
    a: 'Yes. Our flexible cancellation policy allows free cancellation up to 24 hours before the booking start time for a full refund. Cancellations within 24 hours are subject to a 10% fee. Emergency cancellations are handled case-by-case.',
  },
  {
    q: 'How do I list my business on FleetNest?',
    a: 'Register a company account, fill in your business details, upload your documents, and submit for verification. Our team reviews all applications within 48-72 hours. Once verified, you can add unlimited listings.',
  },
  {
    q: 'What happens if I have a problem with a service?',
    a: 'Contact our 24/7 support team via live chat, WhatsApp, or email. We also have a built-in dispute resolution system. For serious issues, FleetNest can mediate and process refunds where applicable.',
  },
  {
    q: 'Does FleetNest offer loyalty rewards?',
    a: 'Yes! Every completed booking earns you FleetNest Points. 1 point is awarded per $1 spent. Points can be redeemed for discounts on future bookings. Refer friends and earn bonus points too.',
  },
  {
    q: 'Is GPS tracking available for all bookings?',
    a: 'Live GPS tracking is available for driver and courier bookings where the provider has opted in. For vehicle rentals, your booking details include pickup coordinates and Google Maps directions.',
  },
  {
    q: 'Can companies set their own prices?',
    a: 'Yes. Companies have full control over their pricing, including hourly/daily rates, deposits, and special offers. Prices are displayed transparently to customers with no hidden fees.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-badge mb-4 inline-flex">FAQ</span>
          <h2 className="font-display text-4xl font-bold text-white md:text-5xl mb-4">
            Frequently Asked{' '}
            <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Everything you need to know about FleetNest. Can't find an answer? Contact our support team.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-6 text-left hover:bg-white/2 transition-colors"
              >
                <span className="font-medium text-white pr-4">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-blue-400 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
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
