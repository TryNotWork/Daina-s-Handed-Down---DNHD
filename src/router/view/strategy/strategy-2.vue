<template>
    <el-carousel height="500px" style="width: 100%;" class="carousel">
        <el-carousel-item
            v-for="(item, index) in imgPath[this.$route.path.split('/')[this.$route.path.split('/').length - 1]]"
            :key="index">
            <img v-lazy="require(`@/assets/imgs/strategy/2/${item}.png`)" alt="" width="100%" height="100%">
        </el-carousel-item>
    </el-carousel>
</template>

<script>
import { ElCarousel, ElCarouselItem } from 'element-plus';

export default {
    components: { ElCarousel, ElCarouselItem },
    data() {
        return {
            imgPath: {
                "2-1": ["2-1-a", "2-1-b", "2-1-c", "2-1-d", "2-1-e"],
                "2-2": ["2-2-a", "2-2-b", "2-2-c", "2-2-d"],
                "2-3": ["2-3-a", "2-3-b", "2-3-c", "2-3-d", "2-3-e"],
            }
        }
    },
}
</script>

<style>
.carousel {
    --el-carousel-arrow-background: rgba(0, 0, 0, .5);
}

.el-carousel__indicators--horizontal {
    bottom: 25px;
}

.el-carousel__arrow{
    top: 57%;
}
</style>