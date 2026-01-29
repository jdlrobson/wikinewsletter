import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import '@wikimedia/codex/dist/codex.style.css';
import '@wikimedia/codex-design-tokens/theme-wikimedia-ui-root.css';


const app = createApp( App );
app.use( router );
app.mount( '#app' );
