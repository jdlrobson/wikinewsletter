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
			{ from: 'HaeB', to: 'X' },
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
		const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=thumbnail&pithumbsize=${size}&origin=*&titles=${titlesParam}`;
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
			text: cols[0],
			image: 'todo.svg'
		}
	} );
	const question = questions[Math.floor(Math.random()*questions.length-1)];
	console.log('>>',question);
	return Promise.resolve( question );
}

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

	return {
		draft: true,
		mostReadArchive,
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

