/**
 * Wikipedia API service for fetching articles and search results.
 * Uses the Parsoid HTML endpoint and Action API.
 */
import {  getNextEditionMonth } from '../libraries';
import { intro, mostReadText, retroMostReadText } from './boilerplate.js';
const USER_AGENT = 'WikiHackStarter/0.1 (Wikimedia Hackathon Prototype)';

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
	const pages = [
		{
			title: 'XYZ',
			image: ''
		},
		{
			title: '2026 Adamuz train derailments',
			image: ''
		},
		{
			title: 'Proposed United_States acquisition of Greenland',
			image: ''
		}
	];
	return Promise.resolve( pages );
};

export async function prepareMostRead( month, year, text ) {
	const mostReadPages = await getMostReadPages( month, year );
	const mostReadTextSubstitution = mostReadPages.length === 1 ? mostReadPages[ 0 ].title :
		mostReadPages.map( ( p, i ) => {
				const prefix = i === mostReadPages.length - 1 ?
					' and ': ( i === 0 ? '' : ', ' );
				return `${ prefix }[[ ${p.title} ]]`;
		} ).join( '' );

	const mostRead = {
		pages: mostReadPages,
		month,
		year,
		text: text.replace(
			'$1',
			mostReadTextSubstitution
		)
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

