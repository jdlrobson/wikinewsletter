/**
 * Wikipedia API service for fetching articles and search results.
 * Uses the Parsoid HTML endpoint and Action API.
 */
import {  getNextEditionMonth } from '../libraries';
import { intro, mostReadText, retroMostReadText } from './boilerplate.js';
const USER_AGENT = 'WikiHackStarter/0.1 (Wikimedia Hackathon Prototype)';
import IGNORE_TITLES from '../../data/ignore.json' assert { type: 'json' };

export async function prepareThankyous() {
	const thankYous = {
		total: 3203,
		paths: [
			{ from: 'Jdlrobson', to: 'Spartan' },
			{ from: 'SnugglyMcSnuggles', to: 'MrX' },
			{ from: 'EricGardner', to: 'AnneT' }
		]
	};
	return Promise.resolve( thankYous );
}

export async function getMostReadPages( month, year ) {
	// add one since months are 0-indexed
	const mm = String( month + 1 ).padStart( 2, '0' );
	const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${year}/${mm}/all-days`;
	let response;
	try {
		response = await fetch( url );
	} catch ( e ) {
		return [];
	}

	if ( !response.ok ) {
		return [];
	}

	const json = await response.json();
	const articles = ( json && json.items && json.items[ 0 ] && json.items[ 0 ].articles ) || [];

	const pages = articles
		.map( ( a ) => ( {
			title: a.article ? decodeURIComponent( a.article ).replace( / /g, '_' ) : a.article,
			image: '',
			rank: a.rank ? Number( a.rank ) : undefined,
			views: a.views
		} ) )
		.sort( ( a, b ) => ( a.rank || Infinity ) - ( b.rank || Infinity ) )
		.filter( ( p ) => IGNORE_TITLES.filter( ( ignore ) => p.title.indexOf( ignore ) > -1 ).length === 0 )
		.slice( 0, 50 );

	const pagesWithThumbnails = await fetchPageThumbnails( pages, 250 );
	return pagesWithThumbnails.filter( ( p ) => p.image );
};

/**
 * Given an array of pages (with `title`), query MediaWiki's `pageimages`
 * API to fetch 250px thumbnails and attach them to the `image` property.
 * Handles batching (50 titles per request) and CORS via `origin=*`.
 */
export async function fetchPageThumbnails( pages, size = 250 ) {
	if ( !Array.isArray( pages ) || pages.length === 0 ) return pages;

	const BATCH_SIZE = 50;
	// map titles (normalized with underscores) to page objects
	const titleMap = new Map();
	pages.forEach( ( p ) => {
		const key = ( p.title || '' ).replace( / /g, '_' );
		titleMap.set( key, p );
	} );

	const keys = Array.from( titleMap.keys() );
	for ( let i = 0; i < keys.length; i += BATCH_SIZE ) {
		const batch = keys.slice( i, i + BATCH_SIZE );
		const titlesParam = batch.map( ( t ) => encodeURIComponent( t ) ).join( '|' );
		const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pilimit=10&redirects=1&pithumbsize=${size}&origin=*&titles=${titlesParam}`;
		try {
			const res = await fetch( url );
			if ( !res.ok ) continue;
			const json = await res.json();
			if ( json && json.query && json.query.pages ) {
				Object.values( json.query.pages ).forEach( ( pg ) => {
					const titleKey = ( pg.title || '' ).replace( / /g, '_' );
					const target = titleMap.get( titleKey );
					if ( target && pg.thumbnail && pg.thumbnail.source ) {
						target.image = pg.thumbnail.source;
					}
				} );
			}
		} catch ( e ) {
			// ignore batch errors and continue
		}
	}

	return pages;
}

export async function prepareMostRead( month, year, text ) {
	const mostReadPages = await getMostReadPages( month, year );

	const mostRead = {
		pages: mostReadPages,
		month,
		year,
		text
	};
	return Promise.resolve( mostRead );
}

export async function prepareQuestion() {
	const questionResponse = await fetch('/data/questions.txt');
	const questions = (await questionResponse.text()).split('\n').map((line) => {
		const cols = line.split(',');
		return {
			title: cols[1],
			text: cols[0]
		}
	} ).slice(1).sort(() => 0.5 - Math.random() ).slice(0, 10 );
	const questionsWithThumbs = await fetchPageThumbnails( questions, 250 );
	console.log(questionsWithThumbs);
	const question = questionsWithThumbs[Math.floor(Math.random()*questionsWithThumbs.length)];
	return Promise.resolve( question );
}

async function prepareDiffBlog( month, year ) {
	const url = '/data/blog.rss';

	try {
 		const res = await fetch( url );
 		if ( !res.ok ) return { pages: [] };
 		const txt = await res.text();

 		// Parse feed XML (supports RSS <item> and Atom <entry>)
 		const parser = new DOMParser();
 		const xml = parser.parseFromString( txt, 'application/xml' );
 		const nodes = Array.from( xml.querySelectorAll( 'item, entry' ) );

 		const posts = nodes.map( ( node ) => {
 			const titleNode = node.querySelector( 'title' );
 			let link = '';
 			// Atom: <link rel="alternate" href="..."/> or <link href="..."/>
 			const altLink = node.querySelector( 'link[rel="alternate"]' ) || node.querySelector( 'link[href]' );
 			if ( altLink ) {
 				link = altLink.getAttribute && altLink.getAttribute( 'href' ) ? altLink.getAttribute( 'href' ) : altLink.textContent || '';
 			} else {
 				const linkNode = node.querySelector( 'link' );
 				link = linkNode ? ( linkNode.textContent || '' ) : '';
 			}

 			const pub = node.querySelector( 'pubDate, published, updated' );
 			const pubDate = pub ? new Date( pub.textContent ) : null;

 			return {
 				title: titleNode ? titleNode.textContent.trim() : '',
 				url: link,
 				pubDate
 			};
 		} ).filter( ( p ) => p.pubDate );
 		// Input `month` is 0-indexed elsewhere; match by month and year
 		const filtered = posts.filter( ( p ) => {
 			return true;
 			/*const d = p.pubDate;
			return d.getFullYear() === year && d.getMonth() === month;*/
 		} ).map( ( p ) => ( { title: p.title, url: p.url } ) );

 		return { pages: filtered };
 	} catch ( e ) {
 		return { pages: [] };
 	}
}

async function prepareSocials() {
	return Promise.resolve( {
		pages: [
			{
				label: 'The future of knowledge is yours to protect',
				url: 'https://www.tiktok.com/@wikipedia/video/7571112168255425799?is_from_webapp=1&sender_device=pc&web_id=7600929926498420255'
			}
		]
	} );
}

async function preparePotd( month, year ) {
	// Build template title like `Template:Potd/2025-12` (month +1 since month is 0-indexed)
	const mm = String( month + 1 ).padStart( 2, '0' );
	const templateTitle = `Template:Potd/${year}-${mm}`;
	const apiBase = 'https://commons.wikimedia.org/w/api.php';
	const imagesUrl = `${apiBase}?action=query&format=json&prop=images&titles=${encodeURIComponent( templateTitle )}&formatversion=2&imlimit=40&origin=*`;

	const fallback = {
		pages: []
	};

	try {
		const r = await fetch( imagesUrl );
		if ( !r.ok ) return fallback;
		const j = await r.json();
		const page = ( j && j.query && j.query.pages && j.query.pages[0] ) || null;
		const images = ( page && page.images ) ? page.images.map( ( i ) => i.title ) : [];
		if ( images.length === 0 ) return fallback;

		// Batch imageinfo requests (titles joined by |). Commons supports origin=* for CORS.
		const titlesParam = images.map( ( t ) => encodeURIComponent( t ) ).join( '|' );
		const infoUrl = `${apiBase}?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=320&titles=${titlesParam}&formatversion=2&origin=*`;
		const r2 = await fetch( infoUrl );
		if ( !r2.ok ) return fallback;
		const j2 = await r2.json();
		const pages = ( j2 && j2.query && j2.query.pages ) ? j2.query.pages.map( ( pg ) => {
			const info = ( pg.imageinfo && pg.imageinfo[0] ) || null;
			const thumb = info && ( info.thumburl || info.url || ( info.thumbnail && info.thumbnail.source ) );
			const fileUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent( pg.title )}`;
			return {
				title: pg.title,
				image: thumb || '',
				url: fileUrl
			};
		} ) : [];

		return { pages: pages.sort(() => Math.random() < 0.5 ? -1 : 1) };
	} catch ( e ) {
		return fallback;
	}
};

export async function prepareEdition() {
	const month = getNextEditionMonth();
	let year = ( new Date() ).getFullYear();
	if ( month === 11 ) {
		year -= 1;
	}

	// fetch and await
	const mostRead = await prepareMostRead( month, year, mostReadText );
	const mostReadArchive = await prepareMostRead( month, year - 5, retroMostReadText );
	const question = await prepareQuestion();
	const thankYous = await prepareThankyous();
	const diffBlog = await prepareDiffBlog( month, year );
	const socials = await prepareSocials();
	const potd = await preparePotd( month, year );

	return {
		socials,
		draft: true,
		potd,
		mostReadArchive,
		diffBlog,
		thankYous,
		question,
		mostRead,
		intro,
		month,
		year,
	};
};

export async function getQuestion() {
	const q = prepareQuestion();
	return q;
}

/**
 * Fetch an article's HTML from the Parsoid endpoint.
 *
 * @param {string} title - Article title
 * @return {Promise<string>} HTML content of the article
 */
export async function getArticle( title ) {
	const url = `/data/${title}.json`;

	const response = await fetch( url, {
		headers: {
			'Api-User-Agent': USER_AGENT
		}
	} );

	if ( !response.ok ) {
		throw new Error( `Failed to fetch article: ${ response.status } ${ response.statusText }` );
	}

	try {
		const json = await response.json();
		return json;
	} catch ( e ) {
		return prepareEdition();
	}
}

