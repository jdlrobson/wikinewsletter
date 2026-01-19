/**
 * Wikipedia API service for fetching articles and search results.
 * Uses the Parsoid HTML endpoint and Action API.
 */

import { WIKI_LANG, WIKI_SKIN, WIKI_SECTIONS_EXPANDED } from '@/config';

const USER_AGENT = 'WikiHackStarter/0.1 (Wikimedia Hackathon Prototype)';

/**
 * Fetch an article's HTML from the Parsoid endpoint.
 *
 * @param {string} title - Article title
 * @return {Promise<string>} HTML content of the article
 */
export async function getArticle( title ) {
	const encodedTitle = encodeURIComponent( title.replace( / /g, '_' ) );
	const url = `https://${ WIKI_LANG }.wikipedia.org/api/rest_v1/page/html/${ encodedTitle }`;

	const response = await fetch( url, {
		headers: {
			'Api-User-Agent': USER_AGENT
		}
	} );

	if ( !response.ok ) {
		throw new Error( `Failed to fetch article: ${ response.status } ${ response.statusText }` );
	}

	const html = await response.text();

	// Parse the HTML document
	const parser = new DOMParser();
	const doc = parser.parseFromString( html, 'text/html' );

	// Remove base tag to prevent URL conflicts
	const baseTag = doc.querySelector( 'base' );
	if ( baseTag ) {
		baseTag.remove();
	}

	// Remove stylesheet links (we load CSS separately via ResourceLoader)
	doc.querySelectorAll( 'link[rel="stylesheet"]' ).forEach( ( link ) => link.remove() );

	// Extract inline styles from head and move them to body
	// These contain article-specific styles like .hatnote
	const headStyles = doc.querySelectorAll( 'head style' );
	const bodyContent = doc.body;
	headStyles.forEach( ( style ) => {
		bodyContent.insertBefore( style.cloneNode( true ), bodyContent.firstChild );
	} );

	// Convert relative article links to internal SPA routes
	// This allows clicking links to navigate within the app
	doc.querySelectorAll( 'a[href^="./"]' ).forEach( ( link ) => {
		const href = link.getAttribute( 'href' );
		const title = href.slice( 2 ); // Remove "./"

		// Check if this is a special page, file, or other non-article link
		const isSpecialLink = title.startsWith( 'Special:' ) ||
			title.startsWith( 'File:' ) ||
			title.startsWith( 'Category:' ) ||
			title.startsWith( 'Help:' ) ||
			title.startsWith( 'Wikipedia:' ) ||
			title.startsWith( 'Template:' ) ||
			title.startsWith( 'Talk:' );

		if ( isSpecialLink ) {
			// External link for special pages
			link.setAttribute( 'href', `https://${ WIKI_LANG }.wikipedia.org/wiki/${ title }` );
			link.setAttribute( 'target', '_blank' );
			link.setAttribute( 'rel', 'noopener' );
		} else {
			// Internal SPA route for regular articles
			link.setAttribute( 'href', `/wiki/${ title }` );
		}
	} );

	// Fix protocol-relative URLs for images
	doc.querySelectorAll( 'img[src^="//"]' ).forEach( ( img ) => {
		img.setAttribute( 'src', 'https:' + img.getAttribute( 'src' ) );
	} );
	doc.querySelectorAll( 'img[srcset]' ).forEach( ( img ) => {
		const srcset = img.getAttribute( 'srcset' );
		img.setAttribute( 'srcset', srcset.replace( /\/\//g, 'https://' ) );
	} );

	// Add mw-heading classes for Minerva styling
	// Parsoid outputs clean <h2>, <h3>, etc. but Minerva expects mw-heading wrappers
	doc.querySelectorAll( 'h1, h2, h3, h4, h5, h6' ).forEach( ( heading ) => {
		const level = heading.tagName.charAt( 1 ); // e.g., '2' from 'H2'
		heading.classList.add( 'mw-heading', `mw-heading${ level }` );
	} );

	// In mobile mode, wrap top-level sections in collapsible <details> elements
	// Uses Codex Accordion CSS-only markup structure
	if ( WIKI_SKIN === 'mobile' ) {
		// Find top-level sections (direct children of body with h2 headings)
		const topLevelSections = bodyContent.querySelectorAll( ':scope > section' );

		topLevelSections.forEach( ( section ) => {
			const heading = section.querySelector( ':scope > h2' );
			if ( !heading ) {
				// Skip sections without h2 (like the lead section)
				return;
			}

			// Create details element with Codex accordion class
			const details = doc.createElement( 'details' );
			details.className = 'cdx-accordion';
			if ( WIKI_SECTIONS_EXPANDED ) {
				details.setAttribute( 'open', '' );
			}

			// Create summary element
			const summary = doc.createElement( 'summary' );

			// Create header structure matching Codex accordion
			const header = doc.createElement( 'span' );
			header.className = 'cdx-accordion__header';

			// Create title span with the heading text
			const title = doc.createElement( 'span' );
			title.className = 'cdx-accordion__header__title';
			title.textContent = heading.textContent;

			header.appendChild( title );
			summary.appendChild( header );

			// Create content wrapper for remaining content
			const content = doc.createElement( 'div' );
			content.className = 'cdx-accordion__content';

			// Move all children except the heading into content wrapper
			while ( section.firstChild ) {
				if ( section.firstChild === heading ) {
					section.removeChild( heading );
				} else {
					content.appendChild( section.firstChild );
				}
			}

			// Assemble the details element
			details.appendChild( summary );
			details.appendChild( content );

			// Replace section with details
			section.parentNode.replaceChild( details, section );
		} );
	}

	return bodyContent.innerHTML;
}

/**
 * Search for Wikipedia articles using the OpenSearch API.
 *
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 * @return {Promise<Array<{title: string, description: string}>>} Search results
 */
export async function searchArticles( query, limit = 10 ) {
	if ( !query || query.trim().length === 0 ) {
		return [];
	}

	const params = new URLSearchParams( {
		action: 'opensearch',
		search: query,
		limit: limit.toString(),
		namespace: '0',
		format: 'json',
		origin: '*'
	} );

	const url = `https://${ WIKI_LANG }.wikipedia.org/w/api.php?${ params }`;

	const response = await fetch( url, {
		headers: {
			'Api-User-Agent': USER_AGENT
		}
	} );

	if ( !response.ok ) {
		throw new Error( `Search failed: ${ response.status } ${ response.statusText }` );
	}

	const data = await response.json();

	// OpenSearch returns: [query, [titles], [descriptions], [urls]]
	const titles = data[ 1 ] || [];
	const descriptions = data[ 2 ] || [];

	return titles.map( ( title, index ) => ( {
		title,
		description: descriptions[ index ] || ''
	} ) );
}

/**
 * Get the ResourceLoader URL for Wikipedia's CSS.
 *
 * @return {string} URL to load Wikipedia styles
 */
export function getResourceLoaderUrl() {
	const isMobile = WIKI_SKIN === 'mobile';

	const modules = [
		'mediawiki.skinning.content.parsoid',
		'mediawiki.skinning.interface',
		'site.styles',
		'ext.cite.styles',
		'ext.cite.parsoid.styles'
	];

	// Add skin-specific modules
	if ( isMobile ) {
		modules.push( 'skins.minerva.styles' );
	}

	const skin = isMobile ? 'minerva' : 'vector-2022';

	return `https://${ WIKI_LANG }.wikipedia.org/w/load.php?modules=${ modules.join( '|' ) }&only=styles&skin=${ skin }`;
}
