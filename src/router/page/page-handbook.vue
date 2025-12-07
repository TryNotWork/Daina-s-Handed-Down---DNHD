<template>
    <div class="main">
        <mainTop></mainTop>

        <mainCenter>
            
        </mainCenter>

        <!-- <mainBottom></mainBottom> -->
    </div>
</template>

<script>
import mainTop from '@/components/page-handbook/main-top.vue';
import mainCenter from '@/components/page-handbook/main-center.vue';
// import mainBottom from '@/components/page-notice/main-bottom.vue';

export default {
    components: {
        mainTop,
        mainCenter,
        // mainBottom,
    }
}
</script>

<style scoped>
.main {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>