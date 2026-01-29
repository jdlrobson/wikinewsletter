<template>
    <div class="feature">
        <img :src="image" alt="" class="section-image" />
        <div>
        <slot></slot>
        </div>
    </div>
</template>
<style>
.feature {
    display: flex;    gap: 8px;
        align-items: center;
}
.feature img { width: 240px; min-height: 240px; object-fit: cover; height: auto;}
</style>
<script>
export default {
    name: 'Feature',
    props: {
        image: {
            type: String
        }
    },
    setup( { image }) {
        return {
            image
        };
    }
};
</script>