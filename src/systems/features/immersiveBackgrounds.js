/**
 * Immersive Backgrounds Module
 * Generates background images when location changes
 */

import { extensionSettings } from '../../core/state.js';
import { executeSlashCommandsOnChatInput } from '../../../../../../../scripts/slash-commands.js';
import { eventSource, event_types } from '../../../../../../../script.js';

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

        // Call /sd with quiet=true to generate image without inserting in chat
        // This uses the SD extension's image generation with prompt_prefix applied
        const result = await executeSlashCommandsOnChatInput(
            `/sd quiet=true ${description}`,
            { clearChatInput: false }
        );
        console.log('[Immersive Backgrounds] Image generation result:', result);

        // Extract image URL from result
        const imageUrl = extractImageUrl(result);
        if (imageUrl) {
            console.log('[Immersive Backgrounds] Setting background with URL:', imageUrl);

            // Emit FORCE_SET_BACKGROUND event to set background and save per-chat
            const imgUrl = `url("${encodeURI(imageUrl)}")`;
            await eventSource.emit(event_types.FORCE_SET_BACKGROUND, { url: imgUrl, path: imageUrl });
        } else {
            console.warn('[Immersive Backgrounds] Could not extract image URL from result');
        }
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
 * Extracts image URL from /sd command result
 * Handles various result formats
 *
 * @param {any} result - Result from executeSlashCommandsOnChatInput
 * @returns {string|null} Image URL or null
 */
function extractImageUrl(result) {
    if (!result) return null;

    // Handle string result
    if (typeof result === 'string') {
        // Validate it looks like a URL or data URI
        if (result.startsWith('http') || result.startsWith('data:') || result.startsWith('/')) {
            return result;
        }
        return null;
    }

    // Handle object result with various possible properties
    if (typeof result === 'object') {
        // Try common properties
        const url = result.pipe || result.output || result.image || result.url || result.result;

        if (url && typeof url === 'string') {
            if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) {
                return url;
            }
        }
    }

    return null;
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