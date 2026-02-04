<template>
	<div class="home-view">
		<div class="home-view__hero">
			<h1 class="home-view__title">Wikipedia Monthly</h1>
			<p class="home-view__subtitle">
				The unofficial monthly Wikipedia magazine.
			</p>
		</div>

		<div class="home-view__quick-links">
			<h2 class="home-view__section-title">Previous editions</h2>
			<ul class="home-view__links">
				<li v-for="article in editions">
					<RouterLink
						:key="article.title"
						:to="getArticleRoute( article.title )"
						class="home-view__link"
					>
						{{ article.label }}
					</RouterLink>
				</li>
			</ul>
			<h2 class="home-view__section-title">Draft the next edition</h2>
			<ul class="home-view__links">
				<li>
					<RouterLink
						key="__new"
						:to="getArticleRoute( nextEdition )"
						class="home-view__link"
					>
						[unpublished] Issue {{  nextEdition }} - {{ nextEditionMonthLabel }} {{  nextEditionYearLabel }}
					</RouterLink>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
import data from '../../data/index.json';
import { ref } from 'vue';
import { CdxButton, CdxIcon } from '@wikimedia/codex';
import { RouterLink, useRoute } from 'vue-router';
import {  getNextEditionMonth,
    readableMonth } from '../libraries';

export default {
	name: 'HomeView',
	components: {
		CdxButton,
		RouterLink
	},
	setup() {
		const route = useRoute();
		const editions = data.editions;
		const nextEdition = ref( editions.length + 1 );
		const nextEditionMonth = ref( getNextEditionMonth() );
		const nextEditionMonthLabel = ref( readableMonth( nextEditionMonth.value ) );
		const y = ( new Date() ).getFullYear();
		const nextEditionYearLabel = ref(
			String(
				nextEditionMonth.value === 11 ? y - 1 : y
			)
		);

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
			nextEditionMonth,
			nextEditionMonthLabel,
			nextEditionYearLabel,
			nextEdition,
			editions,
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
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: @spacing-50;
		flex-flow: column;
		margin-bottom: 40px;
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
