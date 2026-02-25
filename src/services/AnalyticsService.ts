import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

/**
 * AnalyticsService – Singleton wrapper for Firebase Analytics & Crashlytics.
 *
 * Usage:
 *   import { analyticsService } from '../services/AnalyticsService';
 *   analyticsService.logEvent('button_press', { screen: 'Home' });
 *   analyticsService.logScreenView('HomeScreen');
 *   analyticsService.recordError(new Error('Something went wrong'));
 */
export const analyticsService = {
    /**
     * Log a custom event to Firebase Analytics.
     * @param name  Event name (snake_case, max 40 chars).
     * @param params Optional key-value pairs (values must be string | number).
     */
    logEvent: async (name: string, params?: Record<string, string | number>) => {
        try {
            await analytics().logEvent(name, params);
        } catch (e) {
            console.warn('[Analytics] logEvent failed:', e);
        }
    },

    /**
     * Log a screen_view event — call this on every screen focus.
     */
    logScreenView: async (screenName: string, screenClass?: string) => {
        try {
            await analytics().logScreenView({
                screen_name: screenName,
                screen_class: screenClass ?? screenName,
            });
        } catch (e) {
            console.warn('[Analytics] logScreenView failed:', e);
        }
    },

    /**
     * Associate all future events / crashes with a user ID.
     * Pass `null` to clear after logout.
     */
    setUserId: async (id: string | null) => {
        try {
            await analytics().setUserId(id);
            if (id) {
                await crashlytics().setUserId(id);
            }
        } catch (e) {
            console.warn('[Analytics] setUserId failed:', e);
        }
    },

    /**
     * Manually report a non-fatal error to Crashlytics.
     * Use for caught exceptions you still want visibility on.
     */
    recordError: (error: Error, context?: string) => {
        try {
            if (context) {
                crashlytics().log(context);
            }
            crashlytics().recordError(error);
        } catch (e) {
            console.warn('[Analytics] recordError failed:', e);
        }
    },

    /**
     * Add a breadcrumb log to the next crash report.
     */
    log: (message: string) => {
        try {
            crashlytics().log(message);
        } catch (e) {
            // silent
        }
    },

    /**
     * Set a custom key-value on all future crash reports.
     */
    setAttribute: async (key: string, value: string) => {
        try {
            await crashlytics().setAttribute(key, value);
        } catch (e) {
            // silent
        }
    },
};

/**
 * Install a global JS error handler so that uncaught errors
 * and unhandled promise rejections are forwarded to Crashlytics.
 * Call this ONCE at app startup (e.g. in App.tsx useEffect).
 */
export function installGlobalErrorHandler() {
    // ---- Uncaught JS errors ----
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
        crashlytics().log(`[Global] isFatal=${isFatal}`);
        crashlytics().recordError(error);
        // Still call the original RN handler (red box in dev, etc.)
        if (originalHandler) {
            originalHandler(error, isFatal);
        }
    });

    // ---- Unhandled promise rejections ----
    const tracking = require('promise/setimmediate/rejection-tracking');
    tracking.enable({
        allRejections: true,
        onUnhandled: (_id: number, error: Error | any) => {
            const err = error instanceof Error ? error : new Error(String(error));
            crashlytics().log('[UnhandledPromiseRejection]');
            crashlytics().recordError(err);
        },
        onHandled: () => { },
    });
}
