<template>
    <h1 style="line-height: 100px;font-size: 32px;">精美壁纸</h1>
    <p style="line-height: 30px;font-size: 24px;">这里是精美壁纸展示区域，您可以在下方的图片中点击查看您喜欢的壁纸。</p>
    <div class="handbook-1">
        <div class="wallpaper-list">
            <el-image
            class="wallpaper-item"
            v-for="(item) in wallpaperList"
            :key="item.url"
            :src="item.url"
            :alt="item.alt"
            fit="cover"
            :preview-src-list="[item.url]"
            :preview-teleported="true"
            scale="0.9"
            />
        </div>
    </div>

</template>

<script>
import { ElImage } from 'element-plus';

export default {
    components: {
        ElImage,
    },
    data() {
        return {
            wallpaperList: [
                { url: require(`@/assets/imgs/handbook/wallpaper/1.png`), alt: "风景壁纸1" },
                { url: require(`@/assets/imgs/handbook/wallpaper/2.png`), alt: "风景壁纸2" },
                { url: require(`@/assets/imgs/handbook/wallpaper/3.png`), alt: "风景壁纸3" },
                { url: require(`@/assets/imgs/handbook/wallpaper/4.png`), alt: "风景壁纸4" },
                { url: require(`@/assets/imgs/handbook/wallpaper/5.png`), alt: "风景壁纸5" },
                { url: require(`@/assets/imgs/handbook/wallpaper/6.png`), alt: "风景壁纸6" },
                { url: require(`@/assets/imgs/handbook/wallpaper/7.png`), alt: "风景壁纸7" },
                { url: require(`@/assets/imgs/handbook/wallpaper/8.png`), alt: "风景壁纸8" }
            ]
        }
    },
}
</script>

<style>
.handbook-1 {
    width: 100%;
}

.wallpaper-list {
    display: grid;
    grid-template-columns: repeat(5, 300px);
    gap: 16px;
    justify-content: center;
    padding: 20px;
    grid-auto-rows: 200px;
}

.wallpaper-item {
    width: 100% !important;
  height: 100% !important;
  display: block !important;
}

:deep(.el-image__inner) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}
</style>