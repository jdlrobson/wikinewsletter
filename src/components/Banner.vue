<template>
    <div class="frw-banner frw-banner--dismissible" role="banner">
        <div class="frw-banner-logo frw-banner-logo--globe">
            <img src="https://en.wikipedia.org/static/images/icons/wikipedia.png" class="frw-logo frw-logo-globe" alt="Wikipedia">
        </div>
        <div class="frw-banner-content">
            <p class="frw-banner-message">If this newsletter was fun and Wikipedia has given you useful knowledge this month, please consider a donation or an edit to support Wikipedia for months to come. There are no small contributions: every edit counts, every donation counts.</p>
            <a href="https://donate.wikimedia.org" class="frw-donate-button frw-donate-button--medium" role="button"><span class="frw-button-text">Donate</span></a>
            <a href="https://en.wikipedia.org/wiki/Special:Random" class="frw-donate-button frw-donate-button--medium" role="button"><span class="frw-button-text">Edit</span></a>
        </div>
    </div>
</template>
<style>
.frw-banner {
    position: relative;
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 20px 24px;
    font-family: var(--frw-font-family);
    background-color: var(--frw-color-background-subtle);
    border: 1px solid var(--frw-color-border-subtle);
    border-radius: var(--frw-border-radius);
    box-shadow: var(--frw-box-shadow);
}
.frw-banner-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
}
.frw-banner-content {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    flex: 1;
}
.frw-donate-button {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    padding: 10px 20px !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Lato, Helvetica, Arial, sans-serif !important;
    font-weight: 700 !important;
    font-size: 1rem !important;
    line-height: 1.4 !important;
    text-decoration: none !important;
    text-transform: none !important;
    letter-spacing: normal !important;
    color: #fff !important;
    background-color: #36c !important;
    background-image: none !important;
    border: none !important;
    border-radius: 24px !important;
    cursor: pointer !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
    transition: background-color 100ms ease, box-shadow 100ms ease !important;
    margin: 0 !important;
    vertical-align: middle !important;
}
</style>
<script>
export default {
    name: 'Banner'
};
</script>