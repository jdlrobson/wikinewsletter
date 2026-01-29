const readableMonth = ( m ) => {
	return [ 'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'][ m ];
};

const getNextEditionMonth = () => {
	const todayDate = (new Date());
	const currentMonthInteger = todayDate.getMonth();
	return currentMonthInteger === 0 ? 11 : currentMonthInteger - 1;
};

const titleToLink = ( t ) => `https://en.wikipedia.org/wiki/${t}`;

const userPageLink = ( u ) => titleToLink( `User:${u}`);

const wikitextToHtml = ( text ) => {
	return text.replace( /\[\[ ([^\]]*) \]\]/g, ( _a, t ) =>  {
    	return `[[ <a href="${titleToLink(t)}">${t}</a> ]]`;
	} );
};

export {
	userPageLink,
	titleToLink,
	wikitextToHtml,
    getNextEditionMonth,
    readableMonth
}