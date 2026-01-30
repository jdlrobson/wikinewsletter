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
				:key="mostRead.pages.slice( 0, 9 ).map( p => p.title ).join('_')"
				:title="`🔥 Most read in ${month}`"
				:wikitext="mostReadTextComputed"
				:pages="mostRead.pages.slice( 0, 9 )"
			>
				<p>See how familiar this month's topics were by playing the <a href="https://wikigrid.netlify.app/">WikiGrid game</a>.</p>
				<cdx-button v-if="isDraft" @click="clickTweakMostRead">Tweak results</cdx-button>
			</edition-section>

			<!-- Tweak Most Read Dialog -->
			<CdxDialog v-if="showTweakDialog" @close="closeTweakDialog" title="Tweak" :open="true">	
				<p>Uncheck any pages you want to remove from the most-read list, then click Save.</p>
				<div v-for="(p, i) in mostRead.pages" :key="p.title">
					<CdxCheckbox v-model="tweakSelections[p.title]">{{ p.title.replace(/_/g, ' ') }}</CdxCheckbox>
				</div>
				<CdxButton @click="closeTweakDialog">Cancel</CdxButton>
				<CdxButton action="progressive" @click="saveTweakDialog">Save</CdxButton>
			</CdxDialog>
			<edition-section
				v-if="diffBlog.pages.length"
				:title="`📝 News from the movement`"
			>
				<p>Stay updated with the latest happenings in the Wikimedia movement through these insightful blog posts.</p>
				<ul>
					<li v-for="post in diffBlog.pages.slice( 0, 5 )">
						<a :href="post.url">{{ post.title }}</a>
					</li>
				</ul>
			</edition-section>

			<edition-section
				:title="`🎥 On the socials`"
				:pages="socials.pages.slice( 0, 5 )"
			>
			</edition-section>
			<edition-section
				:key="mostReadArchive.pages.slice( 0, 9 ).map( p => p.title ).join('_')"
				:title="`📅 In another time`"
				:wikitext="mostReadArchiveTextComputed"
				:pages="mostReadArchive.pages.slice( 0, 9 )"
			>
				<cdx-button v-if="isDraft" @click="clickTweakMostReadArchive">Tweak results</cdx-button>
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
import { CdxProgressBar, CdxMessage, CdxTextInput, CdxButton,
	CdxDialog, CdxCheckbox } from '@wikimedia/codex';
import { getArticle, getQuestion } from '@/services/editions';
import { readableMonth, wikitextToHtml, titleToLink, userPageLink } from '../libraries';
import Feature from '../components/Feature.vue';

export default {
	name: 'ArticleView',
	components: {
		Banner,
		CdxButton,
		CdxDialog,
		CdxCheckbox,
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
		const socials = ref( {} );
		const diffBlog = ref( {} );
		const thankYous = ref( {} );
		const year = ref( '' );
		const month = ref( '' );
		const intro = ref( '' );

		const mostReadTextSubstitution = ( pages ) => {
			return pages.length === 1 ? pages[ 0 ].title :
				pages.map( ( p, i ) => {
					const prefix = i === pages.length - 1 ?
							' and ': ( i === 0 ? '' : ', ' );
					return `${ prefix }[[ ${p.title.replace(/_/g, ' ')} ]]`;
				} ).join( '' );
		};
		
		const mostReadTextComputed = computed( () => {
			console.log('computed mostReadTextComputed', mostRead.value.pages.slice( 0, 9 ));
			const pages = mostRead.value.pages.slice( 0, 9 ) || []
			const text = mostRead.value.text;
			const rtnText = text.replace(
				'$1',
				mostReadTextSubstitution( pages )
			);
			console.log(rtnText);
			return rtnText;
		} );

		const mostReadArchiveTextComputed = computed( () => {
			const pages = mostReadArchive.value.pages.slice( 0, 9 ) || []
			const text = mostReadArchive.value.text;
			return text.replace(
				'$1',
				mostReadTextSubstitution( pages )
			).replace( '$2', `${readableMonth( mostReadArchive.value.month )} ${mostReadArchive.value.year}`)
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
				const data = await getArticle( title );
				isDraft.value = data.draft;
				year.value = data.year;
				diffBlog.value = data.diffBlog;
				month.value = readableMonth( data.month );
				intro.value = data.intro;
				mostRead.value = data.mostRead;
				question.value = data.question;
				thankYous.value = data.thankYous;
				mostReadArchive.value = data.mostReadArchive;
				socials.value = data.socials;
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
					socials: socials.value,
					diffBlog: diffBlog.value,
					mostRead: mostRead.value,
					question: question.value,
					thankYous: thankYous.value,
					mostReadArchive: mostReadArchive.value,		
				} )
			);
		}

		const showTweakDialog = ref( false );
		const tweakSelections = ref( {} );

		const clickTweakMostRead = () => {
			const pages = ( mostRead.value && mostRead.value.pages ) || [];
			const sel = {};
			pages.forEach( ( p ) => {
				sel[ p.title ] = true;
			} );
			tweakSelections.value = sel;
			showTweakDialog.value = true;
		};

		const clickTweakMostReadArchive = () => {

		};

		const closeTweakDialog = () => {
			showTweakDialog.value = false;
		};

		const saveTweakDialog = () => {
			const pages = ( mostRead.value && mostRead.value.pages ) || [];
			const filtered = pages.filter( ( p ) => !!tweakSelections.value[ p.title ] );
			mostRead.value.pages = filtered;
			showTweakDialog.value = false;
			console.log('tweakled')
		};
		return {
			clickTweakMostReadArchive,
			clickTweakMostRead,
			showTweakDialog,
			tweakSelections,
			saveTweakDialog,
			closeTweakDialog,
			mostReadArchiveTextComputed,
			mostReadTextComputed,
			updateQuestion,
			onPublish,
			isDraft,
			wikitextToHtml,
			userPageLink, titleToLink,
			year, month, intro, mostRead, question, thankYous, mostReadArchive, diffBlog, socials,
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
