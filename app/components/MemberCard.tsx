'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FormData, calculateTitle, isValidUrl, MONTHLY_RATE_OPTIONS } from '../types';

interface MemberCardProps {
  data: FormData;
  onBack: () => void;
}

const TELEGRAM_LINK = 'https://t.me/stackdailyy';

export default function MemberCard({ data, onBack }: MemberCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cardImageBlob, setCardImageBlob] = useState<Blob | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const [profilePicBase64, setProfilePicBase64] = useState<string>('');

  const titleInfo = calculateTitle(data.experienceLevel, data.biggestWin);

  // Better X username extraction
  const xUsername = data.xProfile
    .replace(/^https?:\/\//, '')
    .replace(/^(www\.)?(x|twitter)\.com\//, '')
    .replace(/\/$/, '')
    .split('/')[0]
    .split('?')[0];

  const profilePicUrl = `/api/avatar?username=${xUsername}`;

  // Pre-load profile picture as base64 for reliable download
  useEffect(() => {
    const loadProfilePic = async () => {
      try {
        const response = await fetch(profilePicUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePicBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch {
        // Use fallback
        setProfilePicBase64(`https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=18181b&color=fff&size=128`);
      }
    };
    loadProfilePic();
  }, [profilePicUrl, data.name]);
  const hasValidPortfolio = data.portfolio.trim() !== '' && isValidUrl(data.portfolio);
  const cardLink = hasValidPortfolio
    ? data.portfolio
    : `https://t.me/${data.telegram.replace('@', '')}`;

  const stackDailyUrl = 'https://stackdaily.xyz';

  const monthlyRateLabel = MONTHLY_RATE_OPTIONS.find(opt => opt.value === data.monthlyRate)?.label || '';

  const isTopTier = titleInfo.title === 'Legend' || titleInfo.title === 'OG';

  useEffect(() => {
    QRCode.toDataURL(cardLink, {
      width: 100,
      margin: 0,
      color: {
        dark: '#ffffff',
        light: '#00000000',
      },
    }).then(setQrCode);
  }, [cardLink]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardContainerRef.current) return;

    const rect = cardContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = (y - centerY) / 8;
    const tiltY = (centerX - x) / 8;

    setTilt({ x: tiltX, y: tiltY });
    setGlowPosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }, []);

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovering(false);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const generateCardBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#0a0a0a',
      });

      const response = await fetch(dataUrl);
      return await response.blob();
    } catch (error) {
      console.error('Failed to generate card blob:', error);
      return null;
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#0a0a0a',
      });

      const link = document.createElement('a');
      link.download = `${data.name.replace(/\s+/g, '-').toLowerCase()}-stack-daily-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download card:', error);
    }

    setIsDownloading(false);
  };

  const shareMessage = `Just joined the Stack Daily community as a ${titleInfo.title}.\n\nMake your own card: ${stackDailyUrl}/card`;

  const copyShareMessage = () => {
    navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    setIsSharing(true);

    const blob = await generateCardBlob();

    if (blob && navigator.share && navigator.canShare) {
      const file = new File([blob], `${data.name.replace(/\s+/g, '-').toLowerCase()}-stack-daily-card.png`, {
        type: 'image/png',
      });

      const shareData = {
        text: shareMessage,
        files: [file],
      };

      if (navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          setIsSharing(false);
          return;
        } catch (error) {
          console.log('Share cancelled or failed:', error);
        }
      }
    }

    setCardImageBlob(blob);
    setShowShareModal(true);
    setIsSharing(false);
  };

  const shareToTwitter = async () => {
    await downloadCard();
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-4 md:p-8">
      {/* Interactive Card Container */}
      <div
        ref={cardContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        className="relative cursor-pointer"
        style={{ perspective: '1000px' }}
      >
        {/* The Card */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-[420px] max-w-[90vw] rounded-2xl overflow-hidden"
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? 1.02 : 1})`,
            transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Clean dark background */}
          <div className="absolute inset-0 bg-[#0c0c0c]" />

          {/* Subtle border */}
          <div className={`absolute inset-0 rounded-2xl border transition-colors duration-300 ${
            isHovering ? 'border-zinc-700' : 'border-zinc-800/70'
          }`} />

          {/* Subtle spotlight on hover */}
          {isHovering && (
            <div
              className="absolute inset-0 transition-opacity duration-200"
              style={{
                background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, rgba(255,255,255,0.03) 0%, transparent 50%)`,
              }}
            />
          )}

          {/* Card content */}
          <div className="relative p-7">
            {/* Header - Big logo and title */}
            <div className="flex items-start justify-between mb-8">
              <Image
                src="/stack-daily-logo-white.png"
                alt="Stack Daily"
                width={200}
                height={60}
                className="h-14 w-auto"
              />
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                titleInfo.title === 'Legend'
                  ? 'bg-red-500 text-white'
                  : titleInfo.title === 'OG'
                  ? 'bg-zinc-800 text-red-400 border border-red-500/30'
                  : titleInfo.title === 'Operator'
                  ? 'bg-zinc-800 text-white'
                  : 'bg-zinc-800/50 text-zinc-400'
              }`}>
                {titleInfo.title}
              </div>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-5 mb-6">
              <img
                src={profilePicBase64 || profilePicUrl}
                alt={data.name}
                className="w-20 h-20 rounded-full object-cover border border-zinc-800"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=18181b&color=fff&size=128`;
                }}
              />
              <div>
                <h2 className="text-white text-2xl font-semibold">{data.name}</h2>
                <p className="text-zinc-500 text-sm">@{xUsername}</p>
                <p className={`text-sm mt-1 ${isTopTier ? 'text-red-400' : 'text-zinc-500'}`}>
                  {titleInfo.description}
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {data.expertise.slice(0, 5).map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-zinc-900 rounded-lg text-zinc-400 text-xs border border-zinc-800/50"
                >
                  {skill}
                </span>
              ))}
              {data.expertise.length > 5 && (
                <span className="px-3 py-1.5 bg-zinc-900/50 rounded-lg text-zinc-500 text-xs">
                  +{data.expertise.length - 5}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-8 py-5 mb-6 border-y border-zinc-800/50">
              {monthlyRateLabel && (
                <div>
                  <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-1">Rate</p>
                  <p className="text-white font-medium">{monthlyRateLabel}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] text-zinc-600 uppercase tracking-wider mb-1">Telegram</p>
                <p className="text-white font-medium">@{data.telegram}</p>
              </div>
            </div>

            {/* Biggest W */}
            <div className="bg-zinc-900/50 rounded-xl p-5 mb-6 border border-zinc-800/30">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-2">Biggest W</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{data.biggestWin}</p>
            </div>

            {/* Footer */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-zinc-600 text-[11px] uppercase tracking-wider">Stack Daily</p>
                <p className="text-zinc-700 text-[10px]">Member since 2025</p>
              </div>
              {qrCode && (
                <img src={qrCode} alt="QR" className="w-14 h-14 opacity-50" />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Personalized message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-zinc-600 text-sm"
      >
        Welcome, <span className="text-white">{data.name.split(' ')[0]}</span>
      </motion.p>

      {/* Actions */}
      <div className="mt-6 flex gap-4">
        <motion.button
          onClick={downloadCard}
          disabled={isDownloading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3.5 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {isDownloading ? 'Saving...' : 'Download'}
        </motion.button>
        <motion.button
          onClick={handleShare}
          disabled={isSharing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3.5 bg-red-500 text-white rounded-full font-medium hover:bg-red-400 transition-colors disabled:opacity-50"
        >
          {isSharing ? 'Preparing...' : 'Share'}
        </motion.button>
      </div>

      <button
        onClick={onBack}
        className="mt-4 text-zinc-600 hover:text-white transition-colors text-sm"
      >
        ← Edit
      </button>

      <p className="mt-10 text-zinc-700 text-sm">
        <a
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-500 transition-colors"
        >
          Join Stack Daily →
        </a>
      </p>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800"
          >
            <h3 className="text-white text-lg font-medium mb-4">Share your card</h3>

            {cardImageBlob && (
              <div className="mb-4 rounded-xl overflow-hidden border border-zinc-800">
                <img
                  src={URL.createObjectURL(cardImageBlob)}
                  alt="Your card"
                  className="w-full"
                />
              </div>
            )}

            <div className="bg-zinc-950 rounded-xl p-4 mb-4 border border-zinc-800">
              <p className="text-zinc-400 text-sm whitespace-pre-line">{shareMessage}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyShareMessage}
                className="flex-1 px-4 py-3 bg-zinc-800 text-white rounded-xl text-sm hover:bg-zinc-700 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy text'}
              </button>
              <button
                onClick={shareToTwitter}
                className="flex-1 px-4 py-3 bg-white text-black rounded-xl text-sm hover:bg-zinc-100 transition-colors"
              >
                Post to X
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 py-2 text-zinc-500 hover:text-white transition-colors text-sm"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
