'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import MultiStepForm from './components/MultiStepForm';
import { FormData } from './types';

const TELEGRAM_LINK = 'https://t.me/stackdailyy';

export default function Home() {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormComplete = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to submit:', error);
    }

    setFormData(data);
    setIsSubmitting(false);
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Submitting...</p>
        </div>
      </div>
    );
  }

  if (formData) {
    return (
      <div className="min-h-screen bg-[#030303] relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px]" />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md"
          >
            <Image
              src="/stack-daily-logo-white.png"
              alt="Stack Daily"
              width={400}
              height={120}
              className="h-24 w-auto mx-auto mb-12"
            />

            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-white text-2xl font-medium mb-3">
              Welcome, {formData.name.split(' ')[0]}
            </h1>
            <p className="text-zinc-500 mb-10">
              Your application has been submitted. We will reach out soon.
            </p>

            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-colors"
            >
              Join our Telegram
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  return <MultiStepForm onComplete={handleFormComplete} />;
}
