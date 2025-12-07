<template>
    <div style="width: 100%; height: 1000px;">
        <p style="font-size: 24px; color: white;text-align: center;">点击查看技能展示</p>
        <DomeGallery :grayscale="false" :openedImageWidth="'800px'" :openedImageHeight="'450px'">
            <div v-for="(item, index) in 58" :key="item"
                :data-img-url="require(`@/assets/imgs/carousel/DomeGallery/${index + 1}.jpg`)"
                :data-video-url="require(`@/assets/imgs/carousel/DomeGallery/${index + 1}.mp4`)" alt="Item 1">
            </div>
        </DomeGallery>
    </div>
</template>

<script>
import DomeGallery from './DomeGallery.vue';

export default {
    components: {
        DomeGallery,
    }
}
</script>