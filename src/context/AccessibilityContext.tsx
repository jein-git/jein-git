import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { AccessibilitySettings } from '../types';

type FontScaleValue = 'normal' | 'large' | 'xlarge';

type AccessibilityContextType = {
  fontScale: FontScaleValue;
  highContrast: boolean;
  voiceGuide: boolean;
  setFontScale: (scale: FontScaleValue) => void;
  toggleHighContrast: () => void;
  toggleVoiceGuide: () => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'ctb_font_scale';

const FONT_SIZES: Record<FontScaleValue, string> = {
  normal: '16px',
  large: '18px',
  xlarge: '20px',
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScaleState] = useState<FontScaleValue>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [voiceGuide, setVoiceGuide] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['normal', 'large', 'xlarge'].includes(stored)) {
      setFontScaleState(stored as FontScaleValue);
    }

    const storedAccessibility = localStorage.getItem('ctb_accessibility');
    if (storedAccessibility) {
      try {
        const settings = JSON.parse(storedAccessibility);
        if (settings.highContrast !== undefined) setHighContrast(settings.highContrast);
        if (settings.voiceGuide !== undefined) setVoiceGuide(settings.voiceGuide);
      } catch (e) {
        console.error('Failed to parse accessibility settings:', e);
      }
    }
  }, []);

  // Apply font size to document.documentElement
  useEffect(() => {
    const html = document.documentElement;
    const fontSize = FONT_SIZES[fontScale];

    // Set inline style
    html.style.fontSize = fontSize;

    // Set data attribute
    html.setAttribute('data-font-scale', fontScale);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, fontScale);

    // Console log for verification
    console.log(`[Accessibility] Font scale applied: ${fontScale} → fontSize: ${fontSize}`);
    console.log(`[Accessibility] HTML style.fontSize:`, html.style.fontSize);
    console.log(`[Accessibility] HTML data-font-scale:`, html.getAttribute('data-font-scale'));
  }, [fontScale]);

  // Apply high contrast class
  useEffect(() => {
    const html = document.documentElement;
    if (highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }

    // Save to localStorage
    localStorage.setItem('ctb_accessibility', JSON.stringify({
      fontScale,
      highContrast,
      voiceGuide,
    }));
  }, [highContrast, fontScale, voiceGuide]);

  const setFontScale = (scale: FontScaleValue) => {
    setFontScaleState(scale);
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const toggleVoiceGuide = () => {
    setVoiceGuide((prev) => !prev);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        highContrast,
        voiceGuide,
        setFontScale,
        toggleHighContrast,
        toggleVoiceGuide,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
