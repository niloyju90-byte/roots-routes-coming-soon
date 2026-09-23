import React, { useState, useEffect, useRef } from 'react';
import type { SiteConfig } from '../types';
import { saveSiteConfig } from '../lib/storage';

interface VideoLandingProps {
  config: SiteConfig;
  onUpdateConfig?: (newConfig: SiteConfig) => void;
}

const CODE_SNIPPET_1 = `#import <Foundation/Foundation.h>
#import "LegacyAppDelegate.h"
@implementation LegacyController
(void)initHardwareStack {
    self.memoryBuffer = [[NSData alloc] init];
    if ([self.delegate respondsToSelector:@selector(didStart)]) {
        [self.delegate performSelector:@selector(didStart)];
    }
    NSLog(@"Stack Initialized: %@", self.uuid);
}`;

const CODE_SNIPPET_2 = `@implementation LegacyController
(void)initHardwareStack {
    self.memoryBuffer = [[NSData alloc] init];
    if ([self.delegate respondsToSelector:@selector(didStart)]) {
        [self.delegate performSelector:@selector(didStart)];
    }
}`;

const CODE_SNIPPET_3 = `#import <Foundation/Foundation.h>
#import "LegacyAppDelegate.h"
(void)initHardwareStack {
    self.memoryBuffer = [[NSData alloc] init];
}`;

export const VideoLanding: React.FC<VideoLandingProps> = ({ config, onUpdateConfig }) => {
  const [hasRealVideo, setHasRealVideo] = useState<boolean>(true);
  const [videoUrl, setVideoUrl] = useState<string>('/video.mp4');
  const [isDriveIframe, setIsDriveIframe] = useState<boolean>(false);
  const [driveEmbedUrl, setDriveEmbedUrl] = useState<string>('');
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [linkInput, setLinkInput] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Animation cycle state for the recreated video
  const [typedTitle, setTypedTitle] = useState<string>('');
  const [showComingSoon, setShowComingSoon] = useState<boolean>(false);
  const [comingSoonOpacity, setComingSoonOpacity] = useState<number>(0);
  const [cursorVisible, setCursorVisible] = useState<boolean>(true);
  const [activeGlitch, setActiveGlitch] = useState<boolean>(false);

  // Helper to parse Google Drive URLs
  const parseGoogleDriveId = (url: string): string | null => {
    const match =
      url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      url.match(/id=([a-zA-Z0-9_-]+)/) ||
      url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  // Check if a real video file or URL exists
  useEffect(() => {
    async function checkVideoSource() {
      // 1. Check if public/video.mp4 exists (local downloaded file)
      try {
        const res = await fetch('/video.mp4', { method: 'HEAD' });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.startsWith('video/')) {
          setVideoUrl('/video.mp4');
          setHasRealVideo(true);
          setIsDriveIframe(false);
          return;
        }
      } catch {
        // Fallback to checking config
      }

      // 2. Check if user configured a video URL in config
      if (config.videoUrl && config.videoUrl.trim() !== '') {
        const rawUrl = config.videoUrl.trim();
        const driveId = parseGoogleDriveId(rawUrl);
        if (driveId) {
          setIsDriveIframe(true);
          setDriveEmbedUrl(`https://drive.google.com/file/d/${driveId}/preview`);
          setHasRealVideo(true);
          setVideoUrl(rawUrl);
          return;
        }

        setVideoUrl(rawUrl);
        setHasRealVideo(true);
        setIsDriveIframe(false);
        return;
      }

      setHasRealVideo(false);
    }

    checkVideoSource();
  }, [config.videoUrl]);

  // Ensure HTML5 video autoplays in muted loop
  useEffect(() => {
    if (hasRealVideo && !isDriveIframe && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay error:', err);
      });
    }
  }, [hasRealVideo, isDriveIframe, videoUrl]);

  // Cursor blink timer
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Keyboard shortcut listener: double-click or pressing 'L' opens the Google Drive link modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'l' || e.key === 'L') && !showLinkModal) {
        setShowLinkModal(true);
      }
      if (e.key === 'Escape' && showLinkModal) {
        setShowLinkModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLinkModal]);

  // Handle Google Drive Link Save
  const handleSaveDriveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) return;

    const trimmed = linkInput.trim();
    const driveId = parseGoogleDriveId(trimmed);

    if (driveId) {
      setIsDriveIframe(true);
      setDriveEmbedUrl(`https://drive.google.com/file/d/${driveId}/preview`);
      setHasRealVideo(true);
      setVideoUrl(trimmed);
    } else {
      setIsDriveIframe(false);
      setHasRealVideo(true);
      setVideoUrl(trimmed);
    }

    const updatedConfig = { ...config, videoUrl: trimmed };
    await saveSiteConfig(updatedConfig);
    if (onUpdateConfig) {
      onUpdateConfig(updatedConfig);
    }

    setShowLinkModal(false);
  };

  // Main 20-second video animation cycle matching the user's video frames
  useEffect(() => {
    if (hasRealVideo) return;

    let isMounted = true;
    const fullText = 'rnr.bd';

    const runCycle = async () => {
      if (!isMounted) return;

      // Reset
      setTypedTitle('');
      setShowComingSoon(false);
      setComingSoonOpacity(0);
      setActiveGlitch(false);

      // Phase 1: Pause briefly (0s - 0.8s)
      await new Promise((r) => setTimeout(r, 800));
      if (!isMounted) return;

      // Phase 2: Type "rnr.bd" character by character (0.8s - 3s)
      for (let i = 1; i <= fullText.length; i++) {
        if (!isMounted) return;
        setTypedTitle(fullText.slice(0, i));
        await new Promise((r) => setTimeout(r, 380));
      }

      // Phase 3: "Coming Soon" fades in (3s - 4.2s)
      setShowComingSoon(true);
      setComingSoonOpacity(1);

      // Phase 4: Hold and pulse subtly with occasional glitch (4.2s - 16s)
      const glitchTimer1 = setTimeout(() => {
        if (!isMounted) return;
        setActiveGlitch(true);
        setTimeout(() => setActiveGlitch(false), 200);
      }, 5000);

      const glitchTimer2 = setTimeout(() => {
        if (!isMounted) return;
        setActiveGlitch(true);
        setTimeout(() => setActiveGlitch(false), 300);
      }, 10000);

      await new Promise((r) => setTimeout(r, 12500));
      if (!isMounted) return;

      clearTimeout(glitchTimer1);
      clearTimeout(glitchTimer2);

      // Phase 5: Fade out "Coming Soon" (16.7s - 17.5s)
      setComingSoonOpacity(0);
      await new Promise((r) => setTimeout(r, 600));

      // Phase 6: Backspace "rnr.bd" (17.5s - 19.5s)
      for (let i = fullText.length - 1; i >= 0; i--) {
        if (!isMounted) return;
        setTypedTitle(fullText.slice(0, i));
        await new Promise((r) => setTimeout(r, 260));
      }

      // Phase 7: Short pause before loop restarts (19.5s - 20.5s)
      await new Promise((r) => setTimeout(r, 800));
      if (isMounted) {
        runCycle();
      }
    };

    runCycle();

    return () => {
      isMounted = false;
    };
  }, [hasRealVideo]);

  return (
    <div
      onDoubleClick={() => setShowLinkModal(true)}
      className="fixed inset-0 w-screen h-screen bg-black overflow-hidden select-none flex items-center justify-center font-sans"
    >
      {/* 1. GOOGLE DRIVE IFRAME VIDEO (IF GOOGLE DRIVE URL PROVIDED) */}
      {hasRealVideo && isDriveIframe && driveEmbedUrl ? (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <iframe
            src={driveEmbedUrl}
            title="Google Drive Video"
            className="w-full h-full border-0 pointer-events-none scale-105"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        </div>
      ) : hasRealVideo && videoUrl ? (
        /* 2. DIRECT HTML5 VIDEO (MP4/WEBM) */
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          onLoadedMetadata={(e) => {
            e.currentTarget.play().catch(() => {});
          }}
          onError={() => {
            console.warn('Video failed to play, switching to animation');
            setHasRealVideo(false);
          }}
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        /* 3. EXACT REPRODUCTION OF USER'S VIDEO ANIMATION IN 60FPS */
        <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center pointer-events-none">
          {/* Background: Aerial Lake City at Dusk */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-10000 ease-out scale-105"
            style={{
              backgroundImage: "url('/images/rnr_bg.jpg')",
              filter: 'brightness(0.7) contrast(1.15) saturate(1.1)',
            }}
          />

          {/* Vignette and Moody Cinematic Grading */}
          <div className="absolute inset-0 bg-radial-vignette opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/80" />

          {/* Floating Green Code Matrix Overlays (Objective-C Foundation blocks from video) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-45 mix-blend-screen">
            {/* Top-left code block */}
            <pre className="absolute top-[8%] left-[6%] sm:left-[10%] text-[10px] sm:text-[12px] font-mono text-[#38e874] leading-relaxed tracking-wide drop-shadow-[0_0_8px_rgba(56,232,116,0.6)] select-none">
              {CODE_SNIPPET_1}
            </pre>

            {/* Top-right floating code block */}
            <pre className="absolute top-[18%] right-[5%] sm:right-[12%] text-[9px] sm:text-[11px] font-mono text-[#28c760]/80 leading-relaxed tracking-wider drop-shadow-[0_0_6px_rgba(40,199,96,0.5)] select-none hidden md:block">
              {CODE_SNIPPET_2}
            </pre>

            {/* Bottom-left code block */}
            <pre className="absolute bottom-[10%] left-[8%] sm:left-[12%] text-[9px] sm:text-[11px] font-mono text-[#38e874]/70 leading-relaxed select-none">
              {CODE_SNIPPET_3}
            </pre>

            {/* Bottom-right code block */}
            <pre className="absolute bottom-[12%] right-[8%] sm:right-[15%] text-[9px] sm:text-[10px] font-mono text-[#28c760]/60 leading-relaxed select-none hidden lg:block">
              {CODE_SNIPPET_2}
            </pre>
          </div>

          {/* Subtle CRT Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 120, 0.08) 3px, transparent 4px)',
            }}
          />

          {/* Center Core: "rnr.bd" and "Coming Soon" with Terminal Cursor */}
          <div
            className={`relative z-20 flex flex-col items-center justify-center text-center px-4 transition-all duration-300 ${
              activeGlitch ? 'translate-x-[2px] skew-x-1 opacity-90' : 'translate-x-0 skew-x-0 opacity-100'
            }`}
          >
            {/* Main "rnr.bd" Title */}
            <div className="flex items-center justify-center">
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] select-none font-sans">
                {typedTitle}
              </h1>
              {/* Terminal Block Cursor */}
              <span
                className={`inline-block w-3 sm:w-4 md:w-5 h-8 sm:h-12 md:h-16 ml-2 bg-[#38e874] shadow-[0_0_12px_#38e874] transition-opacity duration-100 ${
                  cursorVisible ? 'opacity-90' : 'opacity-0'
                }`}
              />
            </div>

            {/* "Coming Soon" Subtitle in Elegant Golden Serif Italic */}
            <div
              className="mt-3 sm:mt-5 transition-all duration-1000 ease-out select-none"
              style={{
                opacity: comingSoonOpacity,
                transform: showComingSoon ? 'translateY(0px)' : 'translateY(12px)',
              }}
            >
              <p
                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic tracking-wide text-[#e8c77b] drop-shadow-[0_2px_20px_rgba(232,199,123,0.5)]"
                style={{
                  textShadow: '0 0 25px rgba(232, 199, 123, 0.45), 0 2px 4px rgba(0, 0, 0, 0.8)',
                }}
              >
                Coming Soon
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. GOOGLE DRIVE LINK MODAL (TRIGGERABLE BY DOUBLE-CLICK OR 'L' KEY) */}
      {showLinkModal && (
        <div
          onClick={() => setShowLinkModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl p-6 text-stone-100 shadow-2xl space-y-4"
          >
            <div>
              <h3 className="text-base font-semibold text-white">গুগল ড্রাইভ বা ভিডিও লিঙ্ক দিন</h3>
              <p className="text-xs text-stone-400 mt-1">
                আপনার Google Drive শেয়ার লিঙ্কটি এখানে পেস্ট করুন:
              </p>
            </div>

            <form onSubmit={handleSaveDriveLink} className="space-y-3">
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="https://drive.google.com/file/d/.../view"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-rose-500 font-mono"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200 bg-stone-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#c93d51] hover:bg-rose-700"
                >
                  সেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
