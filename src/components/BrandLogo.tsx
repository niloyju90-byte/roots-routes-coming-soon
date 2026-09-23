import React, { useState } from 'react';

export interface BrandLogoProps {
  variant?: 'mark' | 'full';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColorClass?: string;
  badgeOnly?: boolean;
  customLogoUrl?: string;
  logoDisplayMode?: 'symbol_and_text' | 'image_only';
  customLogoBadgeBg?: 'rose' | 'transparent' | 'white' | 'dark';
  altText?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  textColorClass,
  customLogoUrl,
  logoDisplayMode = 'symbol_and_text',
  customLogoBadgeBg = 'rose',
  altText = 'Roots & Routes Foundation',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: { badge: 'w-8 h-8 rounded-lg', text: 'text-sm' },
    md: { badge: 'w-10 h-10 sm:w-11 sm:h-11 rounded-xl', text: 'text-base sm:text-lg' },
    lg: { badge: 'w-14 h-14 rounded-2xl', text: 'text-xl sm:text-2xl' },
    xl: { badge: 'w-20 h-20 rounded-3xl', text: 'text-3xl sm:text-4xl' },
  };

  const imgSizeMap = {
    sm: 'h-8 max-w-[140px]',
    md: 'h-10 sm:h-11 max-w-[210px]',
    lg: 'h-14 sm:h-16 max-w-[290px]',
    xl: 'h-20 sm:h-22 max-w-[380px]',
  };

  const bgClassMap = {
    rose: 'bg-[#c93d51] shadow-md shadow-rose-950/20',
    transparent: 'bg-transparent',
    white: 'bg-white shadow-md shadow-stone-900/10 border border-stone-200',
    dark: 'bg-stone-900 shadow-md shadow-black/30 border border-white/10',
  };

  const currentSize = sizeMap[size];
  const badgeBgClass = bgClassMap[customLogoBadgeBg || 'rose'] || bgClassMap.rose;
  const hasCustomLogo = Boolean(customLogoUrl && customLogoUrl.trim() !== '' && !imgError);

  // SVG representation of the default white fluid "r" emblem
  const DefaultEmblemGlyph = (
    <svg viewBox="0 0 500 500" className="w-full h-full p-1.5 drop-shadow-xs" fill="none">
      <path
        d="M 68 266 C 104 220 170 148 224 154 C 254 158 252 190 238 244 C 285 192 355 144 402 152 C 438 158 454 195 435 230 C 412 272 355 264 322 232 C 286 198 258 214 234 262 C 205 320 162 402 140 402 C 128 402 126 388 136 354 C 155 292 216 195 214 178 C 212 168 198 170 178 186 C 140 216 92 268 74 282 C 64 288 62 274 68 266 Z"
        fill="#FFFFFF"
      />
    </svg>
  );

  // Case 1: Custom Logo provided and Display Mode is 'image_only' (user's PNG is full logo)
  if (hasCustomLogo && logoDisplayMode === 'image_only') {
    if (variant === 'full') {
      return (
        <div className={`inline-flex items-center select-none ${className}`}>
          <img
            src={customLogoUrl}
            alt={altText}
            onError={() => setImgError(true)}
            className={`w-auto object-contain transition-all duration-300 ${imgSizeMap[size]} ${
              customLogoBadgeBg === 'white' ? 'bg-white p-1 rounded-lg' : ''
            }`}
          />
        </div>
      );
    }
    // Mark only for image_only mode
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${currentSize.badge} ${badgeBgClass} ${className}`}
        title={altText}
      >
        <img
          src={customLogoUrl}
          alt={altText}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain p-0.5"
        />
      </div>
    );
  }

  // Emblem mark rendering (custom PNG or default SVG glyph)
  const EmblemContent = hasCustomLogo ? (
    <img
      src={customLogoUrl}
      alt={altText}
      onError={() => setImgError(true)}
      className="w-full h-full object-contain p-1 drop-shadow-xs"
    />
  ) : (
    DefaultEmblemGlyph
  );

  // Case 2: Mark variant
  if (variant === 'mark') {
    return (
      <div
        className={`relative inline-flex items-center justify-center shadow-lg shrink-0 overflow-hidden ${currentSize.badge} ${
          hasCustomLogo ? badgeBgClass : 'bg-[#c93d51] shadow-rose-950/20'
        } ${className}`}
        title={altText}
      >
        {EmblemContent}
      </div>
    );
  }

  // Case 3: Full variant with Emblem Badge + Typography
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Emblem Square */}
      <div
        className={`relative inline-flex items-center justify-center shadow-md shrink-0 overflow-hidden ${currentSize.badge} ${
          hasCustomLogo ? badgeBgClass : 'bg-[#c93d51] shadow-rose-950/20'
        }`}
      >
        {EmblemContent}
      </div>

      {/* Typography: Roots & Routes Foundation */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className={`font-serif font-bold tracking-tight text-[#c93d51] ${currentSize.text} ${textColorClass || ''}`}
        >
          Roots
        </span>
        <span
          className={`font-serif italic font-semibold tracking-wide text-[#c93d51] ${
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : size === 'xl' ? 'text-2xl' : 'text-sm sm:text-base'
          } ${textColorClass || ''}`}
        >
          <span className="font-serif italic font-normal not-italic">&amp;</span> Routes
        </span>
        <span
          className={`font-serif italic font-semibold tracking-wider text-[#c93d51] ${
            size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm' : size === 'xl' ? 'text-xl' : 'text-xs'
          } ${textColorClass || ''}`}
        >
          Foundation
        </span>
      </div>
    </div>
  );
};
