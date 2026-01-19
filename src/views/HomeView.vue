<template>
	<div class="home-view">
		<div class="home-view__hero">
			<h1 class="home-view__title">WikiHack Starter</h1>
			<p class="home-view__subtitle">
				A prototyping environment for Wikipedia reader features
			</p>
		</div>

		<div class="home-view__quick-links">
			<h2 class="home-view__section-title">Quick Links</h2>
			<div class="home-view__links">
				<RouterLink
					v-for="article in quickLinks"
					:key="article.title"
					:to="getArticleRoute( article.title )"
					class="home-view__link"
				>
					{{ article.label }}
				</RouterLink>
			</div>
		</div>
	</div>
</template>

<script>
import { RouterLink, useRoute } from 'vue-router';

export default {
	name: 'HomeView',
	components: {
		RouterLink
	},
	setup() {
		const route = useRoute();

		const quickLinks = [
			{ title: 'JavaScript', label: 'JavaScript' },
			{ title: 'Wikipedia', label: 'Wikipedia' },
			{ title: 'Vue.js', label: 'Vue.js' },
			{ title: 'MediaWiki', label: 'MediaWiki' },
			{ title: 'Wikimedia_Foundation', label: 'Wikimedia Foundation' }
		];

		/**
		 * Generate route object for an article, preserving query params.
		 *
		 * @param {string} title - Article title
		 * @return {Object} Vue Router location object
		 */
		const getArticleRoute = ( title ) => ( {
			name: 'article',
			params: { title },
			query: route.query
		} );

		return {
			quickLinks,
			getArticleRoute
		};
	}
};
</script>

<style scoped lang="less">
@import '@wikimedia/codex-design-tokens/theme-wikimedia-ui.less';

.home-view {
	max-width: 600px;
	margin: 0 auto;
	padding: @spacing-200 @spacing-100;

	&__hero {
		text-align: center;
		margin-bottom: @spacing-200;
	}

	&__title {
		font-size: @font-size-xxx-large;
		font-weight: @font-weight-bold;
		color: @color-base;
		margin-bottom: @spacing-50;
	}

	&__subtitle {
		font-size: @font-size-medium;
		color: @color-subtle;
		margin-bottom: @spacing-200;
	}

	&__section-title {
		font-size: @font-size-medium;
		font-weight: @font-weight-semi-bold;
		color: @color-subtle;
		margin-bottom: @spacing-75;
	}

	&__links {
		display: flex;
		flex-wrap: wrap;
		gap: @spacing-50;
	}

	&__link {
		display: inline-block;
		padding: @spacing-50 @spacing-75;
		background: @background-color-interactive-subtle;
		border-radius: @border-radius-pill;
		color: @color-progressive;
		text-decoration: none;
		font-size: @font-size-small;
		transition: background-color @transition-duration-medium @transition-timing-function-system;

		&:hover {
			background: @background-color-progressive-subtle;
		}
	}
}
</style>
