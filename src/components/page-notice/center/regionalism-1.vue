<template>
    <div class="article">
        <div class="article-back">
            <img v-lazy="require('@/assets/ui/retreat.svg')" alt="" width="75px" height="75px" @click="goBack" style="cursor: pointer;">
        </div>

        <div class="article-header">
            <slot name="header">
                <h1>页面丢失 联系管理</h1>
            </slot>
        </div>

        <div class="article-content">
            <slot name="content">
                <h3>联系我们：<br>QQ：931638247</h3>
            </slot>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        goBack() {
            this.$emit('closeArticle');
        }
    }
}
</script>

<style scoped>
.article{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.article-back{
    width: 100%;
    padding: 50px 300px 0px 300px;
}

.article-header {
    width: 100%;
    padding: 25px 0;
    text-align: center;
    line-height: 120px;
    font-size: 30px;
}

.article-content {
    width: 100%;
    padding: 25px 0 50px 0;
}
</style>