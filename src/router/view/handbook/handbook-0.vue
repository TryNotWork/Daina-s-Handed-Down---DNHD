<template>
    <div class="handbook-0">
        <p style="font-size: 48px; text-align: center;line-height: 250px;">套装讲解与马匹升级</p>
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick" tab-position="left">
            <el-tab-pane label="强化套装" name="1">
                <el-tabs v-model="innerActiveName1" @tab-click="handleClick" type="border-card">
                    <el-tab-pane :label="item.title" :name="item.name" v-for="item in items1" :key="item.name">
                        <img v-lazy="item.url" style="width: 40%; height: auto;">
                    </el-tab-pane>
                </el-tabs>

            </el-tab-pane>
            <el-tab-pane label="基本套装" name="2">
                <el-tabs v-model="innerActiveName2" @tab-click="handleClick" type="border-card">
                    <el-tab-pane :label="item.title" :name="item.name" v-for="item in items2" :key="item.name">
                        <img v-lazy="item.url" style="width: 40%; height: auto;">
                    </el-tab-pane>
                </el-tabs>
            </el-tab-pane>
            <el-tab-pane label="马匹升级" name="3">
                <el-tabs v-model="innerActiveName3" @tab-click="handleClick" type="border-card">
                    <el-tab-pane :label="item.title" :name="item.name" v-for="item in items3" :key="item.name">
                        <img v-lazy="item.url" style="width: 40%; height: auto;">
                    </el-tab-pane>
                </el-tabs>
            </el-tab-pane>
        </el-tabs>
    </div>
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
            activeName: '1',
            innerActiveName1: '1',
            innerActiveName2: '8',
            innerActiveName3: '11',
            items1: [
                {
                    title: '神御套装',
                    name: '1',
                    url: require('@/assets/imgs/handbook/equip/1.jpg'),
                },
                {
                    title: '狂怒套装',
                    name: '2',
                    url: require('@/assets/imgs/handbook/equip/2.jpg'),
                },
                {
                    title: '龙象套装',
                    name: '3',
                    url: require('@/assets/imgs/handbook/equip/3.jpg'),
                },
                {
                    title: '通天套装',
                    name: '4',
                    url: require('@/assets/imgs/handbook/equip/4.jpg'),
                },
                {
                    title: '嗜血套装',
                    name: '5',
                    url: require('@/assets/imgs/handbook/equip/5.jpg'),
                },
                {
                    title: '魔血套装',
                    name: '6',
                    url: require('@/assets/imgs/handbook/equip/6.jpg'),
                },
                {
                    title: '祈祷套装',
                    name: '7',
                    url: require('@/assets/imgs/handbook/equip/7.jpg'),
                }
            ],
            items2: [
                {
                    title: '将军套装',
                    name: '8',
                    url: require('@/assets/imgs/handbook/equip/8.jpg'),
                },
                {
                    title: '逆魔套装',
                    name: '9',
                    url: require('@/assets/imgs/handbook/equip/9.jpg'),
                },
                {
                    title: '神武套装',
                    name: '10',
                    url: require('@/assets/imgs/handbook/equip/10.jpg'),
                }
            ],
            items3: [
                {
                    title: '马匹升级',
                    name: '11',
                    url: require('@/assets/imgs/handbook/equip/11.jpg'),
                }
            ]
        };
    },
    methods: {
        handleChange(activeNames) {
            this.activeNames = activeNames;
        },
    },
}
</script>

<style scoped>
.handbook-0 {
    width: 80%;
    min-height: 1000px;
}

:deep(.el-tabs__header.is-top) {
    width: 100%;
    height: 64px;
}

:deep(.el-tabs__item.is-top) {
    font-size: 24px;
    line-height: 96px;
    height: 64px;
}

:deep(.el-tabs__content) {
    width: 100%;
}

:deep(.el-collapse-item__title) {
    font-size: 32px;
    text-align: center;
    line-height: 64px;
}

:deep(.el-collapse-item__title:hover) {
    color: #007bff;
}

:deep(.el-collapse-item__content) {
    display: flex;
    justify-content: center;
}

.demo-tabs>* {
    overflow: visible;
}

:deep(.el-icon) {
    width: 32px;
    height: 32px;
    font-size: 32px;
}

:deep(.el-tabs__item) {
    font-size: 48px;
    line-height: 96px;
    height: 96px;
}
</style>