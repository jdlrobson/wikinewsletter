/**
 * Color mode composable for dark/light mode support.
 * Checks URL param first, then falls back to system preference.
 */

import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

/**
 * Manage color mode (light/dark) based on URL param or system preference.
 *
 * @return {Object} Color mode state and helpers
 */
export function useColorMode() {
	const route = useRoute();

	// System preference media query
	const prefersDark = ref( false );
	let mediaQuery = null;

	/**
	 * Update prefersDark from system preference.
	 *
	 * @param {MediaQueryListEvent} event - Media query change event
	 */
	const updateSystemPreference = ( event ) => {
		prefersDark.value = event.matches;
	};

	onMounted( () => {
		mediaQuery = window.matchMedia( '(prefers-color-scheme: dark)' );
		prefersDark.value = mediaQuery.matches;
		mediaQuery.addEventListener( 'change', updateSystemPreference );
	} );

	onUnmounted( () => {
		if ( mediaQuery ) {
			mediaQuery.removeEventListener( 'change', updateSystemPreference );
		}
	} );

	/**
	 * Color mode from URL param (if present).
	 * Param name: color-mode
	 * Values: 'dark' or 'light'
	 */
	const urlColorMode = computed( () => {
		const param = route.query[ 'color-mode' ];
		if ( param === 'dark' || param === 'light' ) {
			return param;
		}
		return null;
	} );

	/**
	 * Whether dark mode is active.
	 * URL param takes precedence, then falls back to system preference.
	 */
	const isDark = computed( () => {
		if ( urlColorMode.value !== null ) {
			return urlColorMode.value === 'dark';
		}
		return prefersDark.value;
	} );

	/**
	 * Current color mode name.
	 */
	const colorMode = computed( () => isDark.value ? 'dark' : 'light' );

	return {
		isDark,
		colorMode,
		urlColorMode,
		prefersDark
	};
}
