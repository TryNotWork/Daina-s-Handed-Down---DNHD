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
                    name: '铁血魔宫文字版路线图',
                    title: '死水沼泽 -> 铁血魔城 -> 铁血魔攻 -> 叹息回廊 -> 铁血魔宫',
                    icon: require('@/assets/ui/png/button/09.png'),
                    iconActive: require('@/assets/ui/png/button/09-active.png'),
                    link: require('@/assets/imgs/strategy/5/5-1.png'),
                },
                {
                    name: '地下魔域八层文字版路线图',
                    title: '死水沼泽 -> 魔域一层 -> 魔域二层 -> 魔域三层 -> 魔域四层 -> 魔域五层 -> 魔域六层 -> 心之魔域 -> 魔域七层 -> 魔域八层',
                    icon: require('@/assets/ui/png/button/11.png'),
                    iconActive: require('@/assets/ui/png/button/11-active.png'),
                    link: require('@/assets/imgs/strategy/5/5-2.png'),
                },
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