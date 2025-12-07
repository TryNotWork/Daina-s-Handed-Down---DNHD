<template>
    <div class="regionalism-2">
        <CircularGallery :bend="5" text-color="#ff6b6b" :border-radius="0.1" font="bold 24px Arial"
            :scroll-speed="3" :autoScrollSpeed="0.05" :lazy-load="false">
            <img v-for="item in 20" :key="item" :src="require('@/assets/imgs/carousel/CircularGallery/' + item + '.webp')" alt="">
        </CircularGallery>
    </div>
</template>

<script>
import CircularGallery from '@/components/page-home/center/CircularGallery.vue';

export default {
    components: {
        CircularGallery,
    }
}
</script>

<style scoped>
.regionalism-2 {
    width: 100%;
    height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
