/**
 * Immersive Backgrounds Module
 * Generates background images when location changes
 */

import { extensionSettings } from '../../core/state.js';

// toastr is available globally via the toastr library loaded by SillyTavern
const toastr = globalThis.toastr || window.toastr;

let isEnabled = false;
let isGenerating = false;

/**
 * Generate background image from location description
 * @param {string} description - The location description to use as prompt
 */
export async function generateBackgroundFromDescription(description) {
    if (!extensionSettings.enableImmersiveBackgrounds) {
        return;
    }

    if (isGenerating) {
        console.log('[Immersive Backgrounds] Generation already in progress, skipping');
        return;
    }

    if (!description || !description.trim()) {
        console.log('[Immersive Backgrounds] No description provided');
        return;
    }

    try {
        isGenerating = true;
        console.log('[Immersive Backgrounds] Generating background with prompt:', description);

        // Import SlashCommandParser dynamically
        const { SlashCommandParser } = await import('../../../../../../../slash-commands/SlashCommandParser.js');

        // Call /imagine with our description in quiet mode
        // This uses the SD extension's image generation with user's settings
        const command = `/imagine ${description} quiet=true`;
        await SlashCommandParser.execute(command, 'imagine');
    } catch (error) {
        console.error('[Immersive Backgrounds] Generation failed:', error);
        if (toastr) {
            toastr.error('Failed to generate background image. Make sure Image Generation is configured.');
        }
    } finally {
        isGenerating = false;
    }
}

/**
 * Toggle immersive backgrounds feature
 * @param {boolean} enabled - Whether the feature is enabled
 */
export function toggleImmersiveBackgrounds(enabled) {
    isEnabled = enabled;
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
    isGenerating = false;
}
