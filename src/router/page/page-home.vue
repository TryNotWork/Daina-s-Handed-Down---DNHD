<template>
    <div class="main">
        <mainTop></mainTop>

        <mainCenter></mainCenter>

        <mainBottom></mainBottom>
    </div>
</template>

<script>
import mainTop from '@/components/page-home/main-top.vue';
import mainCenter from '@/components/page-home/main-center.vue';
import mainBottom from '@/components/page-home/main-bottom.vue';

export default {
    components: {
        mainTop,
        mainCenter,
        mainBottom,
    }
}
</script>

<style scoped>
.main {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: black;
}
</style>