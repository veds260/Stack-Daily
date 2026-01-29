'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toPng } from 'html-to-image';

interface ShareableCardProps {
  xProfile: string;
  name: string;
}

const TELEGRAM_LINK = 'https://t.me/+q3abpE3xjGszMGQ1';

export default function ShareableCard({ xProfile, name }: ShareableCardProps) {
  const [profilePicUrl, setProfilePicUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const username = xProfile.replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//, '').replace(/\/$/, '');
        const picUrl = `https://unavatar.io/twitter/${username}?fallback=https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png`;

        setProfilePicUrl(picUrl);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch profile picture:', error);
        setProfilePicUrl('https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png');
        setIsLoading(false);
      }
    };

    fetchProfilePic();
  }, [xProfile]);

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#030303',
      });

      const link = document.createElement('a');
      link.download = 'stack-daily-application.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download image:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current || isCopied) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#030303',
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy image:', error);
    }
  };

  return (
    <div className="w-full max-w-lg">
      {/* Glass card container - this is what gets downloaded */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{
          scale: 1.01,
          boxShadow: "0 0 60px rgba(239, 68, 68, 0.15)",
        }}
        className="relative w-full bg-zinc-950/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-12 md:p-16 transition-all duration-500 hover:border-zinc-700/50 hover:bg-zinc-900/30"
      >
        {/* Stack logo top right */}
        <div className="absolute top-6 right-6">
          <Image
            src="/stack-daily-logo-white.png"
            alt="Stack Daily"
            width={120}
            height={36}
            className="h-8 w-auto opacity-80"
          />
        </div>

        {/* Card content */}
        <div className="text-center">
          {/* Profile Picture */}
          {isLoading ? (
            <div className="w-32 h-32 bg-zinc-800 rounded-full animate-pulse mx-auto mb-8" />
          ) : (
            <div className="relative mb-8 inline-block">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
              <img
                src={profilePicUrl}
                alt={name}
                className="relative w-32 h-32 rounded-full border-2 border-red-500/30 object-cover"
              />
            </div>
          )}

          {/* Name */}
          <h1 className="text-white text-4xl md:text-5xl font-semibold mb-6 tracking-tight">
            {name}
          </h1>

          {/* Message */}
          <p className="text-zinc-400 text-lg md:text-xl mb-3">
            I just applied for
          </p>
          <p className="text-white text-2xl md:text-3xl font-semibold tracking-tight">
            Stack Daily Inner Circle
          </p>
        </div>
      </motion.div>

      {/* Action buttons outside the card */}
      <div className="flex gap-3 mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopy}
          disabled={isCopied}
          className="flex-1 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-colors disabled:bg-green-500 disabled:text-white flex items-center justify-center gap-2"
        >
          {isCopied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 px-6 py-3 bg-zinc-800 text-white rounded-full font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </>
          )}
        </motion.button>

        <motion.a
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-6 py-3 bg-zinc-800 text-white rounded-full font-medium hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
          </svg>
          Join Telegram
        </motion.a>
      </div>

      <p className="text-zinc-600 text-sm text-center mt-4">
        Share this on X to show you're part of the movement
      </p>
    </div>
  );
}
