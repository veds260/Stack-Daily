'use client';

import { useState } from 'react';
import MultiStepForm from './components/MultiStepForm';
import MemberCard from './components/MemberCard';
import { FormData } from './types';

export default function Home() {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormComplete = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Submit to Google Sheets
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Failed to submit to sheets:', error);
      // Still show the card even if submission fails
    }

    setFormData(data);
    setIsSubmitting(false);
  };

  const handleBack = () => {
    setFormData(null);
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Generating your card...</p>
        </div>
      </div>
    );
  }

  if (formData) {
    return <MemberCard data={formData} onBack={handleBack} />;
  }

  return <MultiStepForm onComplete={handleFormComplete} />;
}
