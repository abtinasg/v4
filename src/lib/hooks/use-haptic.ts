/**
 * Haptic Feedback Hook
 * Provides haptic feedback for mobile browsers
 */

import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [10, 50, 10],
  error: [20, 100, 20, 100, 20],
  warning: [30, 50, 30],
};

export function useHaptic() {
  const triggerHaptic = useCallback((pattern: HapticPattern = 'light') => {
    // Check if vibration API is supported
    if (!navigator.vibrate) {
      return;
    }

    const vibrationPattern = HAPTIC_PATTERNS[pattern];
    navigator.vibrate(vibrationPattern);
  }, []);

  // Haptic feedback for button clicks
  const handleClick = useCallback((callback?: () => void) => {
    return (e: React.MouseEvent | React.TouchEvent) => {
      triggerHaptic('light');
      callback?.();
    };
  }, [triggerHaptic]);

  // Haptic feedback for successful actions
  const success = useCallback(() => {
    triggerHaptic('success');
  }, [triggerHaptic]);

  // Haptic feedback for errors
  const error = useCallback(() => {
    triggerHaptic('error');
  }, [triggerHaptic]);

  return {
    triggerHaptic,
    handleClick,
    success,
    error,
  };
}
