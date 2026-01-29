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

      // Always download the card
      const link = document.createElement('a');
      link.download = 'stack-daily-application.png';
      link.href = dataUrl;
      link.click();

      // Open Twitter compose with message to attach the image
      setTimeout(() => {
        const tweetText = encodeURIComponent('I just applied for Stack Daily Inner Circle! 🚀\n\nstackdaily.xyz\n\n(Attach the downloaded image to this post)');
        window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
      }, 500);
    } catch (error) {
      console.error('Failed to share to X:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      {/* Premium glass card container */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{
          scale: 1.005,
          boxShadow: "0 25px 50px -12px rgba(239, 68, 68, 0.25)",
        }}
        className="relative w-full bg-gradient-to-br from-zinc-950/80 via-zinc-900/70 to-zinc-950/80 backdrop-blur-2xl border border-zinc-800/60 rounded-[32px] p-16 md:p-20 transition-all duration-700 hover:border-red-500/30 shadow-2xl"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 pointer-events-none" />

        {/* Stack logo top right - 50% larger, small padding */}
        <div className="absolute top-5 right-5 z-10">
          <Image
            src="/stack-daily-logo-white.png"
            alt="Stack Daily"
            width={270}
            height={81}
            className="h-16 w-auto opacity-95"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
          />
        </div>

        {/* Card content */}
        <div className="text-center relative z-10">
          {/* Profile Picture */}
          {isLoading ? (
            <div className="w-36 h-36 bg-zinc-800 rounded-full animate-pulse mx-auto mb-10" />
          ) : (
            <div className="relative mb-10 inline-block">
              <div className="absolute inset-0 bg-red-500/30 rounded-full blur-2xl" />
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/20 to-transparent" />
                <img
                  src={profilePicUrl}
                  alt={name}
                  className="relative w-36 h-36 rounded-full border-[3px] border-red-500/40 object-cover shadow-xl"
                />
              </div>
            </div>
          )}

          {/* Name */}
          <h1 className="text-white text-4xl md:text-5xl font-light mb-10 tracking-tight leading-tight bg-gradient-to-br from-white via-white to-zinc-300 bg-clip-text text-transparent">
            {name}
          </h1>

          {/* Message */}
          <p className="text-zinc-400 text-lg mb-4 font-light tracking-wide">
            I just applied for
          </p>
          <p className="text-white text-2xl md:text-3xl font-medium tracking-tight leading-snug">
            Stack Daily Inner Circle
          </p>
        </div>
      </motion.div>

      {/* Premium button layout */}
      <div className="flex gap-4 mt-8">
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(255, 255, 255, 0.15)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShareToX}
          disabled={isDownloading}
          className="flex-1 px-6 py-4 bg-white text-black rounded-full text-sm font-semibold hover:bg-zinc-50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Preparing...
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
          whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(239, 68, 68, 0.2)" }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-full text-sm font-semibold hover:from-zinc-800 hover:to-zinc-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg border border-zinc-700/50"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.082-1.227-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.245-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.142.121.1.155.234.171.332-.01.068.012.286 0 .454z"/>
          </svg>
          Join Telegram
        </motion.a>
      </div>

      <p className="text-zinc-500 text-sm text-center mt-6 font-light">
        Click "Share to X" to download your card and post it
      </p>
    </div>
  );
}
