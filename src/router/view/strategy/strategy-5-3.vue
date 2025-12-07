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
                    name: '角斗场文字路线图',
                    title: '热砂荒漠 -> 机关之路 -> 盘道四 -> 回旋通道二 -> 盘道三 -> 角斗场',
                    icon: require('@/assets/ui/png/button/03.png'),
                    iconActive: require('@/assets/ui/png/button/03-active.png'),
                    link: require('@/assets/imgs/strategy/5/3-1.png'),
                },
                {
                    name: '中枢大殿文字路线图',
                    title: '热砂荒漠 -> 机关之路 -> 中专厅二 -> 机关道四 -> 中枢大殿',
                    icon: require('@/assets/ui/png/button/04.png'),
                    iconActive: require('@/assets/ui/png/button/04-active.png'),
                    link: require('@/assets/imgs/strategy/5/3-2.png'),
                },
                {
                    name: '五蛇殿文字路线图',
                    title: '热砂荒漠 -> 蛇魔谷 -> 地穴入口 -> 盘蛇道 -> 百虫穴 -> 环道 -> 蛇之骸 -> 蛇环阵 -> 五蛇殿',
                    icon: require('@/assets/ui/png/button/05.png'),
                    iconActive: require('@/assets/ui/png/button/05-active.png'),
                    link: require('@/assets/imgs/strategy/5/3-3.png'),
                },
                {
                    name: '逆魔大殿文字路线图',
                    title: '热砂荒漠 -> 跃马平原 -> 逆魔古刹一层 -> 逆魔古刹二层 -> 逆魔古刹三层 -> 逆魔古刹四层 -> 太极阵 -> 逆魔古刹六层',
                    icon: require('@/assets/ui/png/button/06.png'),
                    iconActive: require('@/assets/ui/png/button/06-active.png'),
                    link: require('@/assets/imgs/strategy/5/3-4.png'),
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