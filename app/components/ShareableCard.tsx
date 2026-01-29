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
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const username = xProfile.replace(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\//, '').replace(/\/$/, '');
        const unavatarUrl = `https://unavatar.io/twitter/${username}`;

        // Use proxy to avoid CORS issues with html-to-image
        const picUrl = `/api/proxy-image?url=${encodeURIComponent(unavatarUrl)}`;

        setProfilePicUrl(picUrl);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch profile picture:', error);
        setProfilePicUrl('/api/proxy-image?url=https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png');
        setIsLoading(false);
      }
    };

    fetchProfilePic();
  }, [xProfile]);

  const handleShareToX = async () => {
    if (!cardRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#030303',
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Try Web Share API first (works on mobile and some browsers)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'stack-daily-application.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'stack-daily-application.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          text: 'I just applied for Stack Daily Inner Circle! 🚀',
        });
      } else {
        // Fallback: Download and open Twitter
        const link = document.createElement('a');
        link.download = 'stack-daily-application.png';
        link.href = dataUrl;
        link.click();

        // Open Twitter compose
        setTimeout(() => {
          const tweetText = encodeURIComponent('I just applied for Stack Daily Inner Circle! 🚀\n\nCheck it out 👇');
          window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
        }, 500);
      }
    } catch (error) {
      console.error('Failed to share to X:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      {/* Glass card container */}
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
        {/* Stack logo top right - 50% larger, small padding */}
        <div className="absolute top-4 right-4">
          <Image
            src="/stack-daily-logo-white.png"
            alt="Stack Daily"
            width={270}
            height={81}
            className="h-18 w-auto opacity-90"
            style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
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
          <h1 className="text-white text-3xl md:text-4xl font-light mb-8 tracking-tight">
            {name}
          </h1>

          {/* Message */}
          <p className="text-zinc-500 text-base mb-3">
            I just applied for
          </p>
          <p className="text-white text-xl md:text-2xl font-medium tracking-tight">
            Stack Daily Inner Circle
          </p>
        </div>
      </motion.div>

      {/* Button layout */}
      <div className="flex gap-3 mt-6">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleShareToX}
          disabled={isDownloading}
          className="flex-1 px-5 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Sharing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Share to X
            </>
          )}
        </motion.button>

        <motion.a
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="flex-1 px-5 py-3 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.082-1.227-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.245-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.142.121.1.155.234.171.332-.01.068.012.286 0 .454z"/>
          </svg>
          Join Telegram
        </motion.a>
      </div>

      <p className="text-zinc-600 text-xs text-center mt-5">
        Share this on X to show you're part of the movement
      </p>
    </div>
  );
}
