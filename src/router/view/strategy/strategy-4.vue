<template>
    <el-tabs type="border-card" class="strategy-1" style="width: 100%;">
        <el-tab-pane v-for="item in li" :key="item.type" :label="item.type" style="width: 500px;">
            <el-image :src="item.imgurl" :alt="item.type" width="100%" height="100%">
            </el-image>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
import { ElTabs, ElTabPane, ElImage } from 'element-plus';

export default {
    components: {
        ElTabs,
        ElTabPane,
        ElImage,
    },
    data() {
        return {
            li: [
                {
                    type: '斧头信号令',
                    imgurl: require('@/assets/imgs/strategy/4/futou.jpg')
                },
                {
                    type: '天书集',
                    imgurl: require('@/assets/imgs/strategy/4/tianshu.jpg')
                },
                {
                    type: '完整天书',
                    imgurl: require('@/assets/imgs/strategy/4/wzts.jpg')
                },
                {
                    type: '书页残卷',
                    imgurl: require('@/assets/imgs/strategy/4/sycj.jpg')
                }
            ]
        }
    }
}
</script>

<style scoped>
.strategy-1 {
    --el-font-size-base: 24px;
    --el-tabs-header-height: 50px;
}
</style>