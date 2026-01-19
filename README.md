# Wikipedia Reader Prototype Starter Kit

A Vue 3 prototyping environment for experimenting with Wikipedia reader features. Built for hackathons and rapid iteration, this starter kit lets you test new UI ideas in front of real users with minimal setup.

## Features

- **Real Wikipedia content** - Fetches articles directly from Wikipedia's REST API
- **Configurable experience** - Switch between desktop (Vector 2022) and mobile (Minerva) skins
- **Dark mode support** - System preference detection with URL override
- **Wikimedia design system** - Built with [Codex](https://doc.wikimedia.org/codex/latest/) components and design tokens
- **Client-side only** - No backend required, deploy anywhere static sites are hosted

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Configuration

Edit `src/config.js` to customize the reading experience:

```javascript
// Wikipedia language edition (e.g., 'en', 'de', 'fr', 'es', 'ja')
export const WIKI_LANG = 'en';

// Skin: 'desktop' (Vector 2022) or 'mobile' (Minerva)
export const WIKI_SKIN = 'desktop';

// Whether sections start expanded in mobile skin
// Only applies when WIKI_SKIN is 'mobile'
export const WIKI_SECTIONS_EXPANDED = false;
```

### Language

Set `WIKI_LANG` to any Wikipedia language code to fetch content from that edition. The search and article APIs will automatically use the configured language.

### Skin

The `WIKI_SKIN` option controls the CSS styling applied to article content:

- **`'desktop'`** - Vector 2022 styling, content flows naturally
- **`'mobile'`** - Minerva styling with collapsible sections (accordion UI)

### Dark Mode

Dark mode is supported via:

1. **System preference** - Automatically detects `prefers-color-scheme: dark`
2. **URL parameter** - Add `?color-mode=dark` to force dark mode

The URL parameter takes precedence over system preference, making it easy to share links with a specific color scheme.

## Project Structure

```
src/
├── components/
│   ├── AppHeader.vue      # Search bar and navigation
│   ├── AppFooter.vue      # License and branding
│   └── ArticleSearch.vue  # Wikipedia search with autocomplete
├── composables/
│   └── useColorMode.js    # Dark mode detection
├── services/
│   └── wikipedia.js       # Wikipedia API client
├── views/
│   ├── HomeView.vue       # Landing page with quick links
│   └── ArticleView.vue    # Article display
├── App.vue                # Root component with global styles
├── config.js              # Configuration options
├── router.js              # Vue Router setup
└── main.js                # Application entry point
```

## Extending the Starter

This project is intentionally minimal to make it easy to extend.

### Adding New Components

1. Create your component in `src/components/`
2. Import and use Codex components for consistent styling
3. Use design tokens from `@wikimedia/codex-design-tokens` for spacing, colors, etc.

### Styling Wikipedia Content

Article HTML is rendered with the class `.mw-parser-output`. Override Wikipedia's default styles in `App.vue` within the `.mw-parser-output` block:

```less
.mw-parser-output {
    .your-custom-class {
        // Your styles here
    }
}
```

## Deployment

This is a static site with no server-side requirements. Deploy to any static hosting platform:

### Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

### Vercel

```bash
npm i -g vercel
vercel
```

### GitHub Pages

```bash
npm run build
# Deploy the dist/ folder
```

## Tech Stack

- [Vue 3](https://vuejs.org/) with Composition API
- [Vite](https://vitejs.dev/) for development and builds
- [Vue Router](https://router.vuejs.org/) for client-side routing
- [Codex](https://doc.wikimedia.org/codex/latest/) - Wikimedia's design system
- [Less](https://lesscss.org/) for CSS preprocessing

## API Usage

This project uses Wikipedia's public REST API:

- **Article content**: `/api/rest_v1/page/html/{title}`
- **Search**: `/w/api.php?action=opensearch`
- **Styling**: `/w/load.php` (ResourceLoader)

Please follow the [Wikimedia API etiquette](https://www.mediawiki.org/wiki/API:Etiquette) and include a descriptive User-Agent header (already configured in `src/services/wikipedia.js`).

## License

MIT
