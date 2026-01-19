<template>
	<div class="app" :class="{ 'app--dark': isDark, 'app--mobile': isMobile }">
		<AppHeader />
		<main class="app__main">
			<RouterView />
		</main>
		<AppFooter />
	</div>
</template>

<script>
import { RouterView } from 'vue-router';
import AppHeader from '@/components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useColorMode } from '@/composables/useColorMode';
import { WIKI_SKIN } from '@/config';

export default {
	name: 'App',
	components: {
		RouterView,
		AppHeader,
		AppFooter
	},
	setup() {
		const { isDark, colorMode } = useColorMode();
		const isMobile = WIKI_SKIN === 'mobile';

		return {
			isDark,
			colorMode,
			isMobile
		};
	}
};
</script>

<style lang="less">
@import '@wikimedia/codex-design-tokens/theme-wikimedia-ui.less';
@import '@wikimedia/codex-design-tokens/theme-wikimedia-ui-mixin-dark.less';

* {
	box-sizing: @box-sizing-base;
	margin: @spacing-0;
	padding: @spacing-0;
}

html {
	// Background color for overscroll areas on touch devices
	background: @background-color-base;

	&:has( .app--dark ) {
		.cdx-mode-dark();
	}
}

body {
	font-family: @font-family-system-sans;
	line-height: @line-height-medium;
}

.app {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background: @background-color-base;
	color: @color-base;

	&__main {
		flex: 1;
	}

	// Wikipedia content overrides using Codex design tokens
	// Scoped to .mw-parser-output to match Wikipedia's specificity
	// These work in both light and dark mode since tokens resolve to correct values
	.mw-parser-output {
		// Infoboxes
		.infobox {
			background-color: @background-color-neutral-subtle;
			border-color: @border-color-base;
			color: @color-base;

			// Element selectors
			table {
				background-color: transparent;
			}

			a {
				color: @color-progressive;

				&:visited {
					color: @color-visited;
				}
			}

			// Infobox sub-components
			.infobox-header,
			.infobox-above {
				background-color: @background-color-neutral;
				color: @color-emphasized;
			}

			.infobox-subheader {
				background-color: @background-color-neutral-subtle;
			}

			.infobox-label {
				color: @color-subtle;
			}

			.infobox-data,
			.infobox-full-data {
				color: @color-base;
			}

			.infobox-below {
				background-color: @background-color-neutral;
			}
		}

		// Sidebar boxes (similar to infoboxes)
		.sidebar {
			background-color: @background-color-neutral-subtle;
			border-color: @border-color-base;
		}

		// Navigation boxes
		.navbox {
			background-color: @background-color-neutral-subtle;
			border-color: @border-color-base;

			.navbox-title {
				background-color: @background-color-neutral;
			}

			.navbox-group {
				background-color: @background-color-neutral;
			}

			.navbox-even {
				background-color: @background-color-neutral-subtle;
			}

			.navbox-odd {
				background-color: @background-color-base;
			}
		}

		// Message boxes (ambox, tmbox, etc.)
		.ambox,
		.tmbox,
		.ombox,
		.cmbox,
		.fmbox {
			background-color: @background-color-neutral-subtle;
			border-color: @border-color-base;
			color: @color-base;

			table {
				background-color: transparent;
			}

			a {
				color: @color-progressive;

				&:visited {
					color: @color-visited;
				}
			}

			.mbox-text,
			.mbox-text-span {
				color: @color-base;
			}

			.mbox-small {
				color: @color-subtle;
			}
		}

		// Ambox type variants (colored left borders)
		.ambox {
			&-notice {
				border-left-color: @color-notice;
			}

			&-content,
			&-style {
				border-left-color: @color-warning;
			}

			&-delete,
			&-serious {
				border-left-color: @color-error;
			}

			&-protection,
			&-legal {
				border-left-color: @color-subtle;
			}
		}

		// Hatnotes
		.hatnote {
			color: @color-subtle;
		}
	}

	// Apply dark mode CSS custom properties when .app--dark is active
	&--dark {
		.cdx-mode-dark();

		// Invert elements marked with skin-invert (e.g., math notation, diagrams)
		// so they remain readable against dark backgrounds
		.skin-invert {
			filter: invert( 1 ) hue-rotate( 180deg );
		}
	}

	// Mobile-responsive styles (only when WIKI_SKIN is 'mobile')
	&--mobile {
		.mw-parser-output .infobox {
			border-color: @border-color-subtle;
			margin-left: @spacing-75;
			margin-bottom: @spacing-75;
			padding: 0;

			tr {
				border-bottom: @border-width-base @border-style-base @border-color-muted;

				&:last-child {
					border-bottom: none;
				}
			}

			th,
			td {
				padding: @spacing-50;
				margin: 0;
			}
		}

		// Additional responsive styles below mobile breakpoint
		@media ( max-width: @max-width-breakpoint-mobile ) {
			.mw-parser-output .infobox {
				float: none;
				margin-left: 0;
				margin-right: 0;
				font-size: @font-size-small;
				position: relative;
				margin-bottom: @spacing-100;
				display: flex;
				flex: 1 1 100%;
				flex-flow: column nowrap;
				width: 100%;
				max-width: 100%;
				text-align: start;

				// Make table structure full-width
				> tbody {
					display: flex;
					flex-flow: column nowrap;
					width: 100%;
				}

				tr {
					display: flex;
					flex-flow: row wrap;
					width: 100%;
				}

				th,
				td {
					display: block;
					flex: 1;
					min-width: 0;
					box-sizing: border-box;
				}
			}
		}
	}
}
</style>
