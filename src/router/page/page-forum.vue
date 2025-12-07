<template>
    <div class="main">
        <div class="main-top" v-lazy:background-image="require('@/assets/imgs/backgrounds/top-back/forum.png')">
            tyr
        </div>
    </div>
</template>

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
    height: 680px;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    position: relative;
    overflow: visible;
}
</style>