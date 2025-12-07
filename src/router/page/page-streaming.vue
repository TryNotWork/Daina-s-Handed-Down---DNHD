<template>
    <div class="main">
        <!-- <mainTop></mainTop>

        <mainCenter></mainCenter>

        <mainBottom></mainBottom> -->
        <div class="main-top" v-lazy:background-image="require('@/assets/imgs/backgrounds/top-back/strategy.png')">
        </div>
    </div>
</template>

<script>
// import mainTop from '@/components/page-streaming/main-top.vue';
// import mainCenter from '@/components/page-streaming/main-center.vue';
// import mainBottom from '@/components/page-streaming/main-bottom.vue';

// export default {
//     components: {
//         mainTop,
//         mainCenter,
//         mainBottom,
//     }
// }
</script>

<style scoped>
/* 视口 */
.main {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* 视口 --> 顶部 */
.main-top {
    width: 100%;
    height: 350px;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    position: relative;
    overflow: visible;
}
</style>