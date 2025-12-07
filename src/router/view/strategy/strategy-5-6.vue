<template>
    <el-tabs type="border-card" class="tabs">
        <el-tab-pane v-for="item in buttons" :key="item.link">
            <template #label>
                <img v-lazy="item.icon" style="width: 100%; height: 100%;"
                    @mouseenter="loadHoverImage(item.iconActive, $event)"
                    @mouseleave="loadHoverImage(item.icon, $event)">
            </template>
            <h1 style="text-align: center; padding: 25px 0;line-height: 60px;">
                <span style="font-size: 48px;line-height: 200px;">
                    {{ item.name }}
                </span><br />
                <span>
                    {{ item.title }}
                </span>
            </h1>
            <img v-lazy="item.link" style="width: 100%; height: 100%;">
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
            buttons: [
                {
                    name: '通天塔文字版路线图',
                    title: '西域奇境 -> 一手遮天 -> 二道廊线 -> 三角排楼 -> 四方擂台 -> 五行宫殿 -> 六道轮回 -> 七旋关卡 -> 八仙纵横 -> 九重云霄',
                    icon: require('@/assets/ui/png/button/10.png'),
                    iconActive: require('@/assets/ui/png/button/10-active.png'),
                    link: require('@/assets/imgs/strategy/5/6-1.png'),
                }
            ]
        }
    },
    methods: {
        loadHoverImage(src, event) {
            event.target.src = src;
        }
    }
}
</script>

<style scoped>
.tabs {
    height: 100%;
    --el-tabs-header-height: 50px;
}

:deep(.el-tabs__nav-scroll) {
  display: flex;
  justify-content: center;
}
</style>