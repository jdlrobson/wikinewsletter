<template>
	<header class="app-header">
		<div class="app-header__brand">
			<RouterLink to="/" class="app-header__logo">
				Wikipedia Monthly
			</RouterLink>
		</div>

		<div class="app-header__spacer" />

		<div class="app-header__actions">
		</div>
	</header>
	<div class="marquee"><span>Knowledge is power • Free content for everyone • Click, explore, remix • </span></div>
</template>

<script>
import { ref, nextTick } from 'vue';
import { RouterLink } from 'vue-router';
import { CdxButton, CdxIcon } from '@wikimedia/codex';
import { cdxIconSearch } from '@wikimedia/codex-icons';

export default {
	name: 'AppHeader',
	components: {
		RouterLink,
		CdxButton,
		CdxIcon
	},
	setup() {
		const searchExpanded = ref( false );
		const searchRef = ref( null );

		const toggleSearch = async () => {
			searchExpanded.value = !searchExpanded.value;

			// Focus the search input when expanding
			if ( searchExpanded.value ) {
				await nextTick();
				const input = searchRef.value?.$el?.querySelector( 'input' );
				if ( input ) {
					input.focus();
				}
			}
		};

		const onSearchNavigate = () => {
			// Collapse search after navigation
			searchExpanded.value = false;
		};

		return {
			cdxIconSearch,
			searchExpanded,
			searchRef,
			toggleSearch,
			onSearchNavigate
		};
	}
};
</script>

<style scoped lang="less">
@import '@wikimedia/codex-design-tokens/theme-wikimedia-ui.less';

.app-header {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	gap: @spacing-75;
	padding: @spacing-75 @spacing-100;
	border-bottom: @border-subtle;
	background: linear-gradient(90deg, var(--neon-pink), var(--neon-cyan));
	border-bottom: 6px solid var(--acid-yellow);

	&__brand {
		flex-shrink: 0;
	}

	&__logo {
		font-size: @font-size-large;
		font-weight: @font-weight-bold;
		color: white;
		text-decoration: none;
		text-shadow: 2px 2px 0 #000;

		&:hover {
			color: @color-progressive;
		}
	}

	&__spacer {
		flex: 1;
	}

	&__actions {
		display: flex;
		align-items: center;
		gap: @spacing-50;
	}
}

.marquee { white-space: nowrap; overflow: hidden; border: 3px inset #000; padding: 6px; background: #000; color: var(--acid-yellow); }
.marquee span { display: inline-block; padding-left: 100%; animation: scroll 18s linear infinite; }
@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-100%); } }
</style>
