/**
 * Immersive Backgrounds Module
 * Generates detailed location descriptions for background image prompts
 */

import { extensionSettings } from '../../core/state.js';

let isEnabled = false;

/**
 * Toggle immersive backgrounds feature
 * @param {boolean} enabled - Whether the feature is enabled
 */
export function toggleImmersiveBackgrounds(enabled) {
    isEnabled = enabled;
    if (enabled) {
        initImmersiveBackgrounds();
    } else {
        cleanupImmersiveBackgrounds();
    }
}

/**
 * Initialize immersive backgrounds based on saved state
 */
export function initImmersiveBackgrounds() {
    isEnabled = extensionSettings.enableImmersiveBackgrounds || false;
}

/**
 * Clean up immersive backgrounds
 */
export function cleanupImmersiveBackgrounds() {
    isEnabled = false;
}
