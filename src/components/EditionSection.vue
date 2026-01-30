<template>
	<section class="edition-section">
        <h2 v-if="title">{{ title }}</h2>
        <div>
            <p v-if="wikitext" v-html="wikitextToHtml(wikitext)"></p>
            <div v-if="pages" class="image-carousel">
                <a v-for="p in pages" :href="p.url || titleToLink(p.title)">
                    <img :src="p.image">
                </a>
            </div>
            <slot />
        </div>
    </section>
</template>

<script>
import { CdxButton, CdxIcon } from '@wikimedia/codex';
import { cdxIconLogoWikimedia, cdxIconLogoCodex } from '@wikimedia/codex-icons';

import { wikitextToHtml, titleToLink } from '../libraries';
export default {
	name: 'EditionSection',
    props: {
        title: {
            type: String,
            default: ''
        },
        wikitext: {
            type: String
        },
        pages: {
            type: Array
        }
    },
	components: {
		CdxButton,
		CdxIcon
	},
	setup( { title, wikitext, pages } ) {
		return {
            titleToLink,
            wikitextToHtml,
            wikitext,
			title,
            pages
		};
	}
};
</script>

<style scoped lang="less">
.edition-section {
    margin-top: 50px;
    background: white;
    border: 4px groove #000;
    padding: 12px;
    box-shadow: 6px 6px 0 #000;
    color: black;
}

.edition-section h2 {
    margin-bottom: 25px;
}

.image-carousel {
    margin-top: 25px;
    width: 100%;
    overflow-x: scroll;
    display: grid; /* Defines the container as a grid */
    grid-template-columns: repeat(3, 1fr); /* Creates 3 columns of equal width */
    grid-template-rows: repeat(3, 1fr);
    img {
        width: 200px;
        height: 200px;
        object-fit: cover;
    }
}

ul {
    margin-left: 30px;
}
</style>
