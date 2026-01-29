<template>
	<footer class="app-footer">
		<div class="app-footer__content">
			<p class="app-footer__license">
				Content is available under
				<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">
					CC BY-SA 4.0
				</a>
				unless otherwise noted.
			</p>

			<div class="app-footer__buttons">
				
			</div>
		</div>
	</footer>
</template>

<script>
import { CdxButton, CdxIcon } from '@wikimedia/codex';
import { cdxIconLogoWikimedia, cdxIconLogoCodex } from '@wikimedia/codex-icons';

export default {
	name: 'AppFooter',
	components: {
		CdxButton,
		CdxIcon
	},
	setup() {
		return {
			cdxIconLogoWikimedia,
			cdxIconLogoCodex
		};
	}
};
</script>

<style scoped lang="less">
@import '@wikimedia/codex-design-tokens/theme-wikimedia-ui.less';

.app-footer {
	background-color: @background-color-neutral;
	border-top: @border-width-base @border-style-base @border-color-muted;
	padding: @spacing-100;
	margin-top: auto;

	&__content {
		max-width: 960px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: @spacing-75;

		@media ( min-width: @min-width-breakpoint-tablet ) {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}

	&__license {
		font-size: @font-size-small;
		color: @color-subtle;
		margin: 0;

		a {
			color: @color-progressive;

			&:visited {
				color: @color-visited;
			}
		}
	}

	&__buttons {
		display: flex;
		flex-wrap: wrap;
		gap: @spacing-50;
	}
}
</style>
