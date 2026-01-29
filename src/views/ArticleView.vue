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
			<h1 class="article-view__title">Issue <span>{{ pageTitle }}</span></h1>
			<em>{{ month }} {{  year }}</em>
			<CdxMessage type="warning" v-if="isDraft">
				<p>This is a draft! Please take an editorial pass and publish when you are happy with your changes.</p>
				<CdxButton action="progressive" @click="onPublish">Publish to e-mail and website</CdxButton>
			</CdxMessage>
			<p v-for="text in intro" v-html="wikitextToHtml(text)"></p>
			<edition-section
				:title="`🔥 Most read in ${month}`"
				:wikitext="mostRead.text"
				:pages="mostRead.pages"
			>
			<p>See how familiar this month's topics were by playing the <a href="https://wikigrid.netlify.app/">WikiGrid game</a>.</p>
			</edition-section>
			<edition-section
				:title="`📝 News from the movement`"
			>
			</edition-section>

			<edition-section
				:title="`🎥 On the socials`"
			>
				<p>Did you know Wikipedia has a TikTok channel? In case you missed it here's the latest video from the TikTok channel.</p>
				<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@wikipedia/video/7597425624315170066" data-video-id="7597425624315170066" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="@wikipedia" href="https://www.tiktok.com/@wikipedia?refer=embed">@wikipedia</a> Meet the people behind Wikipedia: building, protecting, and expanding knowledge for everyone <a title="wikipedia25" target="_blank" href="https://www.tiktok.com/tag/wikipedia25?refer=embed">#Wikipedia25</a> <a target="_blank" title="♬ Meet the people behind Wikipedia - Wikipedia" href="https://www.tiktok.com/music/Meet-the-people-behind-Wikipedia-7597425692138195719?refer=embed">♬ Meet the people behind Wikipedia - Wikipedia</a> </section> </blockquote>
				<p>Follow Wikipedia on social media: <a>instagram</a> <a>facebook</a>.</p>
			</edition-section>
			<edition-section
				:title="`📅 In another time`"
				:wikitext="mostReadArchive.text.replace( '$2', `${readableMonth( mostReadArchive.month )} ${mostReadArchive.year}`)"
				:pages="mostReadArchive.pages"
			>
			</edition-section>
			
			<edition-section
				:title="`❓ Question for ${month}`"
			>
				<p>Let's spark some curiosity with a question. Do you know the answer?</p>
				<Feature :image="question.image">
					<p>{{  question.text }}</p>
			        <a :href="titleToLink( question.title)">Find out on Wikipedia</a>
				</Feature>
				<cdx-button v-if="isDraft" @click="updateQuestion">Choose another</cdx-button>
			</edition-section>
			
			<edition-section
				:title="`📸 Images of ${month}`"
			>
				<p>In case you missed all the pictures of the day that have been featured over the last month, here's a chance to pause and take in their beauty! Thanks to our contributors for sharing these beautiful images. Did you know you can contribute your own images to help illustrate Wikipedia by uploading to <a href="https://commons.wikimedia.org/wiki/Special:UploadWizard">Wikimedia Commons?</a>. Explore all the featured pictures on <a href="">Wikimedia Commons</a></p>
			</edition-section>
			
			<edition-section
				:title="`❤️ WikiLove`"
			>
				<Feature image="wikilove.jpg">
					<p>Wikipedia is made by humans. This month <strong>{{  thankYous.total }}</strong> editors got thanked for changes to Wikipedia in the last week.</p>
					<p>This month <span v-for="(thanks, i) in thankYous.paths">
						<span v-if="i > 0 && thankYous.paths.length > 2">, </span>
						<span v-if="i > 0 && i === thankYous.paths.length - 1"> and </span><a :href="userPageLink(thanks.from)">{{ thanks.from }}</a> thanked <a :href="userPageLink(thanks.to)">{{ thanks.to }}</a></span>.</p>
					<p>Who are you thankful for this month? Take some time to think who deserves your thanks either by grabbing a coffee, <a href="#">attending a local events</a>, reaching out on <a href="https://">Facebook</a>, <a href="https://">Discord</a>, or <a href="https://en.wikipedia.org/wiki/Special:userLogin?campaign=wikipedia-weekly-newsletter-thanks">logging in to Wikipedia and writing on their talk page or hitting the thank button</a>.</p>
				</Feature>
			</edition-section>
			<edition-section>
				<p>I hope you enjoyed issue {{ pageTitle }} of the Wikipedia Monthly newsletter! If so please share with a friend.</p>
				<p>All issues are <a href="https://jdlrobson.com/wikipedia/">available online</a>. Please like and subscribe!</p>
				<form action="https://" method="post">
					<cdx-text-input placeholder="x@x.com" type="email"></cdx-text-input>
					<cdx-button action="progressive">sign up for future emails</cdx-button>
				</form>
			</edition-section>
			<banner />
		</template>
	</div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import Banner from '../components/Banner.vue';
import EditionSection from '../components/EditionSection.vue';
import { useRoute, useRouter } from 'vue-router';
import { CdxProgressBar, CdxMessage, CdxTextInput, CdxButton } from '@wikimedia/codex';
import { getArticle, getQuestion } from '@/services/editions';
import { readableMonth, wikitextToHtml, titleToLink, userPageLink } from '../libraries';
import Feature from '../components/Feature.vue';

export default {
	name: 'ArticleView',
	components: {
		Banner,
		CdxButton,
		Feature,
		EditionSection,
		CdxProgressBar,
		CdxTextInput,
		CdxMessage
	},
	setup() {
		const route = useRoute();
		const status = ref( 'loading' ); // loading | ready | error
		const error = ref( '' );

		// Format the page title for display (replace underscores with spaces)
		const pageTitle = computed( () => {
			const title = route.params.title || '';
			return decodeURIComponent( title ).replace( /_/g, ' ' );
		} );


		const isDraft = ref( true );
		const question = ref( {} );
		const mostRead = ref( {} );
		const mostReadArchive = ref( {} );
		const thankYous = ref( {} );
		const year = ref( '' );
		const month = ref( '' );
		const intro = ref( '' );
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
				const data = await getArticle( title );
				isDraft.value = data.draft;
				year.value = data.year;
				month.value = readableMonth( data.month );
				intro.value = data.intro;
				mostRead.value = data.mostRead;
				question.value = data.question;
				thankYous.value = data.thankYous;
				mostReadArchive.value = data.mostReadArchive;
				status.value = 'ready';
			} catch ( e ) {
				console.error( 'Failed to fetch article:', e );
				error.value = e.message || 'Failed to load article';
				status.value = 'error';
			}
		};

		const updateQuestion = async () => {
			question.value = {};
			const newQuestion = await getQuestion();
			question.value = newQuestion;
		};

		// Fetch article when route params change
		watch(
			() => route.params.title,
			() => {
				fetchArticle();
			},
			{ immediate: true }
		);

		// https://www.tiktok.com/embed.js is tiktok embed
		onMounted(() => {
		});
		const onPublish = () => {
			alert( 'For now you\'ll have to imagine this worked!' );
			console.log(
				JSON.stringify( {
					draft: false,
					year: year.value,
					month: month.value,
					intro: intro.value,
					mostRead: mostRead.value,
					question: question.value,
					thankYous: thankYous.value,
					mostReadArchive: mostReadArchive.value,		
				} )
			);
		}
		return {
			updateQuestion,
			readableMonth,
			onPublish,
			isDraft,
			wikitextToHtml,
			userPageLink, titleToLink,
			year, month, intro, mostRead, question, thankYous, mostReadArchive,
			status,
			error,
			pageTitle
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

		span {
			display: inline-block;
			padding: 2px 6px;
			background: var(--neon-cyan);
			border: 2px solid #000;
		}
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
