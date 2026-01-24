'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FormData, EXPERTISE_OPTIONS, EXPERIENCE_OPTIONS, MONTHLY_RATE_OPTIONS, isValidUrl } from '../types';

interface MultiStepFormProps {
  onComplete: (data: FormData) => void;
}

const TOTAL_STEPS = 8;
const TELEGRAM_LINK = 'https://t.me/stackdailyy';

export default function MultiStepForm({ onComplete }: MultiStepFormProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    telegram: '',
    xProfile: '',
    expertise: [],
    experienceLevel: '',
    monthlyRate: '',
    biggestWin: '',
    portfolio: '',
  });
  const [portfolioError, setPortfolioError] = useState('');
  const [direction, setDirection] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'portfolio') setPortfolioError('');
  };

  const toggleExpertise = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(skill)
        ? prev.expertise.filter(s => s !== skill)
        : [...prev.expertise, skill],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return formData.name.trim().length > 0;
      case 2: return formData.telegram.trim().length > 0;
      case 3: return formData.xProfile.trim().length > 0;
      case 4: return formData.expertise.length > 0;
      case 5: return formData.experienceLevel.length > 0;
      case 6: return formData.monthlyRate.length > 0;
      case 7: return formData.biggestWin.trim().length > 0;
      case 8: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    // Auto-fix portfolio URL if entered without protocol
    if (step === 8 && formData.portfolio.trim() !== '') {
      let url = formData.portfolio.trim();
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
        updateField('portfolio', url);
      }
    }
    setDirection(1);
    if (step < TOTAL_STEPS) setStep(step + 1);
    else onComplete(formData);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(step - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canProceed()) {
      e.preventDefault();
      handleNext();
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 60 : -60,
      filter: 'blur(4px)',
    }),
    center: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -60 : 60,
      filter: 'blur(4px)',
    }),
  };

  // Welcome screen
  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#030303] relative overflow-hidden">
        {/* Subtle gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-950/20 rounded-full blur-[150px]" />

        {/* Logo at top */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2">
          <Image
            src="/stack-daily-logo-white.png"
            alt="Stack Daily"
            width={640}
            height={192}
            className="h-40 w-auto"
          />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-white text-4xl md:text-5xl font-light tracking-tight mb-4">
              Get First Dibs
            </h1>
            <p className="text-zinc-500 text-lg mb-12">
              on exclusive opportunities
            </p>

            <motion.button
              onClick={() => { setDirection(1); setStep(1); }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-4 bg-red-500 text-white rounded-full font-medium hover:bg-red-400 transition-colors"
            >
              Get Started
            </motion.button>

            <p className="mt-12 text-zinc-600 text-sm">
              <a
                href={TELEGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-400 transition-colors"
              >
                Not a member? Join us →
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030303] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-red-950/15 to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 px-6 py-5"
      >
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Image
              src="/stack-daily-logo-white.png"
              alt="Stack Daily"
              width={400}
              height={120}
              className="h-24 w-auto"
            />
            <div className="flex items-center gap-3">
              <span className="text-zinc-600 text-[11px] tracking-[0.2em] font-medium uppercase">Step</span>
              <span className="text-white text-sm font-mono font-medium">{step}/{TOTAL_STEPS}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-[2px] bg-zinc-800/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 via-red-400 to-red-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
        </div>
      </motion.div>

      {/* Main content - centered */}
      <div className="relative z-10 flex items-center justify-center px-6" style={{ minHeight: 'calc(100vh - 100px)' }}>
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {step === 1 && (
                <div className="text-center">
                  <h1 className="text-white text-3xl md:text-4xl font-light tracking-tight mb-10">
                    What's your name?
                  </h1>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => updateField('name', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your name"
                    className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-600 text-white text-2xl py-4 outline-none transition-colors duration-300 placeholder:text-zinc-700 text-center font-light"
                    autoFocus
                  />
                </div>
              )}

              {step === 2 && (
                <div className="text-center">
                  <h1 className="text-white text-3xl md:text-4xl font-light tracking-tight mb-10">
                    What's your Telegram?
                  </h1>
                  <div className="flex items-center justify-center border-b border-zinc-800 focus-within:border-zinc-600 transition-colors duration-300">
                    <span className="text-zinc-600 text-2xl font-light">@</span>
                    <input
                      type="text"
                      value={formData.telegram}
                      onChange={e => updateField('telegram', e.target.value.replace('@', ''))}
                      onKeyDown={handleKeyDown}
                      placeholder="username"
                      className="flex-1 bg-transparent text-white text-2xl py-4 outline-none placeholder:text-zinc-700 text-center font-light"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center">
                  <h1 className="text-white text-3xl md:text-4xl font-light tracking-tight mb-10">
                    What's your X handle?
                  </h1>
                  <input
                    type="text"
                    value={formData.xProfile}
                    onChange={e => updateField('xProfile', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="x.com/handle"
                    className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-600 text-white text-xl py-4 outline-none transition-colors duration-300 placeholder:text-zinc-700 text-center font-light"
                    autoFocus
                  />
                </div>
              )}

              {step === 4 && (
                <div>
                  <h1 className="text-white text-3xl md:text-4xl font-light tracking-tight mb-8 text-center">
                    What are your skills?
                  </h1>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPERTISE_OPTIONS.map(skill => (
                      <motion.button
                        key={skill}
                        onClick={() => toggleExpertise(skill)}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-xl text-left text-sm transition-all duration-200 ${
                          formData.expertise.includes(skill)
                            ? 'bg-zinc-800 text-white border border-zinc-700'
                            : 'bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 hover:text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {skill}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div>
                  <h1 className="text-white text-3xl md:text-4xl font-light tracking-tight mb-8 text-center">
                    How long have you been working?
                  </h1>
                  <div className="space-y-2">
                    {EXPERIENCE_OPTIONS.map(option => (
                      <motion.button
                        key={option.value}
                        onClick={() => updateField('experienceLevel', option.value)}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-5 rounded-xl text-left transition-all duration-200 ${
                          formData.experienceLevel === option.value
                            ? 'bg-zinc-800 text-white border border-zinc-700'
                            : 'bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 hover:text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div>
                  <h1 className="text-white text-3xl md:text-4xl font-light tracking-tight mb-8 text-center">
                    What's your monthly rate?
                  </h1>
                  <div className="space-y-2">
                    {MONTHLY_RATE_OPTIONS.map(option => (
                      <motion.button
                        key={option.value}
                        onClick={() => updateField('monthlyRate', option.value)}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-5 rounded-xl text-left transition-all duration-200 ${
                          formData.monthlyRate === option.value
                            ? 'bg-zinc-800 text-white border border-zinc-700'
                            : 'bg-zinc-900/50 border border-zinc-800/50 text-zinc-500 hover:text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 7 && (
                <div className="text-center">
                  <h1 className="text-white text-3xl md:text-4xl font-light tracking-tight mb-8">
                    What's your biggest win?
                  </h1>
                  <textarea
                    value={formData.biggestWin}
                    onChange={e => updateField('biggestWin', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Your proudest achievement..."
                    className="w-full bg-zinc-900/50 border border-zinc-800/50 focus:border-zinc-700 text-white text-lg px-6 py-5 rounded-xl outline-none transition-colors duration-200 placeholder:text-zinc-700 resize-none h-32 font-light"
                    autoFocus
                  />
                </div>
              )}

              {step === 8 && (
                <div className="text-center">
                  <h1 className="text-white text-3xl md:text-4xl font-light tracking-tight mb-3">
                    Do you have a portfolio?
                  </h1>
                  <p className="text-zinc-600 text-sm mb-10">Optional</p>
                  <input
                    type="text"
                    value={formData.portfolio}
                    onChange={e => updateField('portfolio', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="yoursite.com"
                    className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-600 text-white text-xl py-4 outline-none transition-colors duration-200 placeholder:text-zinc-700 text-center font-light"
                    autoFocus
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex items-center justify-between"
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors text-sm group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Back</span>
            </button>

            <motion.button
              onClick={handleNext}
              disabled={!canProceed()}
              whileHover={canProceed() ? { scale: 1.05, y: -2 } : {}}
              whileTap={canProceed() ? { scale: 0.98 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className={`relative px-10 py-4 rounded-full font-medium transition-all duration-300 overflow-hidden border ${
                canProceed()
                  ? 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white hover:shadow-lg hover:shadow-zinc-900/50'
                  : 'border-zinc-800 text-zinc-700 cursor-not-allowed'
              }`}
            >
              <span className="relative">
                {step === TOTAL_STEPS ? 'Generate Card' : 'Continue'}
              </span>
            </motion.button>
          </motion.div>

          {/* Enter hint */}
          <AnimatePresence>
            {canProceed() && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center text-zinc-700 text-xs mt-6 tracking-[0.2em] uppercase"
              >
                Press Enter ↵
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
