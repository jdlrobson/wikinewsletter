<template>
	<CdxLookup
		v-model:selected="selectedValue"
		:menu-items="menuItems"
		:menu-config="menuConfig"
		placeholder="Search Wikipedia..."
		@input="onInput"
		@update:selected="onSelect"
	/>
</template>

<script>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CdxLookup } from '@wikimedia/codex';
import { searchArticles } from '@/services/wikipedia';

export default {
	name: 'ArticleSearch',
	components: {
		CdxLookup
	},
	emits: [ 'navigate' ],
	setup( props, { emit } ) {
		const route = useRoute();
		const router = useRouter();
		const selectedValue = ref( null );
		const menuItems = ref( [] );
		const menuConfig = ref( { visibleItemLimit: 6 } );

		let debounceTimer = null;

		const onInput = async ( value ) => {
			// Clear any pending debounce
			if ( debounceTimer ) {
				clearTimeout( debounceTimer );
			}

			if ( !value || value.trim().length === 0 ) {
				menuItems.value = [];
				return;
			}

			// Debounce search requests
			debounceTimer = setTimeout( async () => {
				try {
					const results = await searchArticles( value );
					menuItems.value = results.map( ( result ) => ( {
						value: result.title,
						label: result.title,
						description: result.description
					} ) );
				} catch ( error ) {
					console.error( 'Search failed:', error );
					menuItems.value = [];
				}
			}, 200 );
		};

		const onSelect = ( value ) => {
			if ( value ) {
				// Preserve query params (e.g., color-mode) when navigating
				router.push( {
					name: 'article',
					params: {
						title: value
					},
					query: route.query
				} );
				// Clear selection after navigation
				selectedValue.value = null;
				menuItems.value = [];
				emit( 'navigate' );
			}
		};

		return {
			selectedValue,
			menuItems,
			menuConfig,
			onInput,
			onSelect
		};
	}
};
</script>

<style scoped lang="less">
@import '@wikimedia/codex-design-tokens/theme-wikimedia-ui.less';

// Lookup component fills container width
:deep( .cdx-lookup ) {
	width: 100%;
}
</style>
