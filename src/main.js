import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { getResourceLoaderUrl } from '@/services/wikipedia';

import '@wikimedia/codex/dist/codex.style.css';
import '@wikimedia/codex-design-tokens/theme-wikimedia-ui-root.css';

// Load Wikipedia's CSS via ResourceLoader
const wikiStyles = document.createElement( 'link' );
wikiStyles.rel = 'stylesheet';
wikiStyles.href = getResourceLoaderUrl();
document.head.appendChild( wikiStyles );

const app = createApp( App );
app.use( router );
app.mount( '#app' );
