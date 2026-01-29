'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import MultiStepForm from './components/MultiStepForm';
import ShareableCard from './components/ShareableCard';
import { FormData } from './types';

const TELEGRAM_LINK = 'https://t.me/+q3abpE3xjGszMGQ1';

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

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <ShareableCard xProfile={formData.xProfile} name={formData.name} />
        </div>
      </div>
    );
  }

  return <MultiStepForm onComplete={handleFormComplete} />;
}
