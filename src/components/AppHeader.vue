<template>
	<header class="app-header">
		<div class="app-header__brand">
			<RouterLink to="/" class="app-header__logo">
				WikiHack
			</RouterLink>
		</div>

		<div class="app-header__spacer" />

		<div class="app-header__actions">
			<div v-if="searchExpanded" class="app-header__search">
				<ArticleSearch
					ref="searchRef"
					@navigate="onSearchNavigate"
				/>
			</div>

			<CdxButton
				weight="quiet"
				aria-label="Search"
				@click="toggleSearch"
			>
				<CdxIcon :icon="cdxIconSearch" />
			</CdxButton>
		</div>
	</header>
</template>

<script>
import { ref, nextTick } from 'vue';
import { RouterLink } from 'vue-router';
import { CdxButton, CdxIcon } from '@wikimedia/codex';
import { cdxIconSearch } from '@wikimedia/codex-icons';
import ArticleSearch from '@/components/ArticleSearch.vue';

export default {
	name: 'AppHeader',
	components: {
		RouterLink,
		CdxButton,
		CdxIcon,
		ArticleSearch
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
	gap: @spacing-75;
	padding: @spacing-75 @spacing-100;
	background: @background-color-base;
	border-bottom: @border-subtle;

	&__brand {
		flex-shrink: 0;
	}

	&__logo {
		font-size: @font-size-large;
		font-weight: @font-weight-bold;
		color: @color-base;
		text-decoration: none;

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

	&__search {
		width: 280px;
	}
}
</style>
