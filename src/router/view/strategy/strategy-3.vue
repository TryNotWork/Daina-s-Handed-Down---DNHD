<template>
    <el-tabs type="border-card" class="strategy-1" style="width: 100%;">
        <el-tab-pane v-for="item in li" :key="item.type" :label="item.type" style="width: 800px;">
            <img v-lazy="item.imgurl" :alt="item.type" width="100%" height="100%">
        </el-tab-pane>
    </el-tabs>
</template>

<script>
import { ElTabs, ElTabPane } from 'element-plus';

export default {
    components: {
        ElTabs,
        ElTabPane,
    },
    data() {
        return {
            li: [
                {
                    type: '宝石合成',
                    imgurl: require('@/assets/imgs/strategy/3/baoshi.png')
                },
                {
                    type: '勋章合成',
                    imgurl: require('@/assets/imgs/strategy/3/xunzhang.png')
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