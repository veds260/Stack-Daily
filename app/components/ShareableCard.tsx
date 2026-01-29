'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { toPng } from 'html-to-image';

interface ShareableCardProps {
  xProfile: string;
  name: string;
  isSuccessScreen: boolean;
}

export default function ShareableCard({ xProfile, name, isSuccessScreen }: ShareableCardProps) {
  const [profilePicUrl, setProfilePicUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        // Extract username from X profile URL
        const username = xProfile.replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//, '').replace(/\/$/, '');

        // Use unavatar service for reliable profile picture fetching
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

  // Success screen mode - just show profile picture and message
  if (isSuccessScreen) {
    return (
      <>
        {isLoading ? (
          <div className="w-24 h-24 bg-zinc-800 rounded-full animate-pulse mx-auto mb-6" />
        ) : (
          <div className="relative mb-6 inline-block">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
            <img
              src={profilePicUrl}
              alt={name}
              className="relative w-24 h-24 rounded-full border-2 border-red-500/30 object-cover"
            />
          </div>
        )}

        <h1 className="text-white text-2xl font-medium mb-3">
          Welcome, {name.split(' ')[0]}
        </h1>
        <p className="text-zinc-400 mb-3">
          I just applied for
        </p>
        <p className="text-white text-lg font-medium mb-10">
          Stack Daily Inner Circle
        </p>
      </>
    );
  }

  // Shareable card mode - show buttons and downloadable card
  return (
    <div className="w-full max-w-lg mt-6">
      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
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
              Copy Image
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
      </div>

      {/* Downloadable Card Preview */}
      <div ref={cardRef} className="relative w-full aspect-square bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 rounded-2xl p-8 border border-zinc-800/50 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/5 rounded-full blur-[60px]" />

        {/* Stack logo top right */}
        <div className="absolute top-6 right-6 z-20">
          <Image
            src="/stack-daily-logo-white.png"
            alt="Stack Daily"
            width={120}
            height={36}
            className="h-8 w-auto opacity-80"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
          {/* Profile Picture */}
          <div className="mb-6">
            {isLoading ? (
              <div className="w-28 h-28 bg-zinc-800 rounded-full animate-pulse" />
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
                <img
                  src={profilePicUrl}
                  alt={name}
                  className="relative w-28 h-28 rounded-full border-2 border-red-500/30 object-cover"
                />
              </div>
            )}
          </div>

          {/* Text */}
          <h2 className="text-white text-3xl font-medium mb-4 tracking-tight">
            {name}
          </h2>
          <p className="text-zinc-400 text-lg mb-2">
            I just applied for
          </p>
          <p className="text-white text-xl font-medium">
            Stack Daily Inner Circle
          </p>
        </div>
      </div>

      <p className="text-zinc-600 text-sm text-center mt-4">
        Share this on X to show you're part of the movement
      </p>
    </div>
  );
}
