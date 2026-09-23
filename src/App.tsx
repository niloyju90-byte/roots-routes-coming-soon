/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VideoLanding } from './components/VideoLanding';
import { getSiteConfig } from './lib/storage';
import type { SiteConfig } from './types';

export default function App() {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  // Load configuration on mount
  useEffect(() => {
    getSiteConfig().then((cfg) => {
      setConfig(cfg);
    });
  }, []);

  if (!config) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="w-screen h-screen bg-black overflow-hidden font-sans">
      {/* Exclusive Fullscreen Video Landing */}
      <VideoLanding
        config={config}
        onUpdateConfig={(newConfig) => setConfig(newConfig)}
      />
    </main>
  );
}
