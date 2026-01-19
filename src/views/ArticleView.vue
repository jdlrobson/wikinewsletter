<template>
	<div class="article-view">
		<div v-if="status === 'loading'" class="article-view__loading">
			<CdxProgressBar />
			<p>Loading article...</p>
		</div>

		<div v-else-if="status === 'error'" class="article-view__error">
			<CdxMessage type="error">
				{{ error }}
			</CdxMessage>
		</div>

		<template v-else-if="status === 'ready'">
			<h1 class="article-view__title">{{ pageTitle }}</h1>
			<article
				class="article-view__content mw-body-content mw-parser-output"
				v-html="articleHtml"
				@click="handleLinkClick"
			/>
		</template>
	</div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CdxProgressBar, CdxMessage } from '@wikimedia/codex';
import { getArticle } from '@/services/wikipedia';

export default {
	name: 'ArticleView',
	components: {
		CdxProgressBar,
		CdxMessage
	},
	setup() {
		const route = useRoute();
		const router = useRouter();

		const articleHtml = ref( '' );
		const status = ref( 'loading' ); // loading | ready | error
		const error = ref( '' );

		// Format the page title for display (replace underscores with spaces)
		const pageTitle = computed( () => {
			const title = route.params.title || '';
			return decodeURIComponent( title ).replace( /_/g, ' ' );
		} );

		/**
		 * Fetch and display the article.
		 */
		const fetchArticle = async () => {
			const { title } = route.params;

			if ( !title ) {
				return;
			}

			status.value = 'loading';
			error.value = '';

			try {
				articleHtml.value = await getArticle( title );
				status.value = 'ready';
			} catch ( e ) {
				console.error( 'Failed to fetch article:', e );
				error.value = e.message || 'Failed to load article';
				status.value = 'error';
			}
		};

		// Fetch article when route params change
		watch(
			() => route.params.title,
			() => {
				fetchArticle();
			},
			{ immediate: true }
		);

		/**
		 * Handle clicks on article content to intercept internal links.
		 *
		 * @param {Event} event - Click event
		 */
		const handleLinkClick = ( event ) => {
			// Find the closest anchor element (handles clicks on nested elements)
			const link = event.target.closest( 'a' );
			if ( !link ) {
				return;
			}

			const href = link.getAttribute( 'href' );
			if ( !href ) {
				return;
			}

			// Check if this is an internal wiki link
			if ( href.startsWith( '/wiki/' ) ) {
				event.preventDefault();
				// Preserve query params (e.g., color-mode) when navigating
				router.push( {
					path: href,
					query: route.query
				} );
			}
			// External links (https://) will navigate normally
		};

		return {
			articleHtml,
			status,
			error,
			pageTitle,
			handleLinkClick
		};
	}
};
</script>

<style scoped lang="less">
@import '@wikimedia/codex-design-tokens/theme-wikimedia-ui.less';

.article-view {
	max-width: 960px;
	margin: 0 auto;
	padding: @spacing-100;

	&__loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: @spacing-100;
		padding: @spacing-200;
		color: @color-subtle;

		:deep( .cdx-progress-bar ) {
			width: 200px;
		}
	}

	&__error {
		padding: @spacing-100;
	}

	&__title {
		font-size: @font-size-xxx-large;
		font-family: @font-family-serif;
		color: @color-base;
		line-height: @line-height-xxx-small;
		margin: 0 0 @spacing-100;
		padding-bottom: @spacing-75;
		border-bottom: @border-subtle;
	}

	&__content {
		line-height: @line-height-medium;

		// Codex Accordion styling
		:deep( .cdx-accordion ) {
			clear: both;

			summary {
				align-items: center;
			}

			.cdx-accordion__header__title {
				font-size: @font-size-xx-large;
				font-weight: @font-weight-normal;
				font-family: @font-family-serif;
				padding: @spacing-50 0;
			}
		}

		:deep( .cdx-accordion + .cdx-accordion ) {
			border-color: @border-color-muted;
		}
	}

	// Mobile skin overrides
	.app--mobile & {
		margin: @spacing-75 auto 0 auto;
	}

	.app--mobile &__title {
		margin-left: @spacing-100;
		margin-right: @spacing-100;
		border-color: @border-color-muted;
	}

	.app--mobile &__content :deep( > section:first-child ) {
		padding-left: @spacing-100;
		padding-right: @spacing-100;
	}
}
</style>
