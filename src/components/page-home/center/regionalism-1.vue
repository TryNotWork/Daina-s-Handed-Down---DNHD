<template>
    <div class="regionalism-2" v-lazy:background-image="require('@/assets/imgs/backgrounds/notice-border.png')">
        <el-carousel class="left" :interval="2000" height="400px">
            <el-carousel-item v-for="item in imgs" :key="item">
                <img alt="" v-lazy="item" style="width: 100%; height: 100%; object-fit: cover;">
            </el-carousel-item>
        </el-carousel>
        <div class="right">
            <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
                <el-tab-pane label="综合" name="all">
                    <ul style="list-style: none;">
                        <li v-for="item in list" :key="item" class="lis" @click="goNotice(item.id)">
                            <p>
                                <span class="lis-title">{{ item.title }}</span><span>{{ item.time }}</span>
                            </p>
                        </li>
                    </ul>
                </el-tab-pane>
                <el-tab-pane label="活动" name="activity">
                    <p>暂无活动</p>
                </el-tab-pane>
                <el-tab-pane label="公告" name="system">
                    <ul style="list-style: none;">
                        <li v-for="item in list" :key="item" class="lis" @click="goNotice(item.id)">
                            <p>
                                <span class="lis-title">{{ item.title }}</span><span>{{ item.time }}</span>
                            </p>
                        </li>
                    </ul>
                </el-tab-pane>
                <el-tab-pane label="新区" name="new">
                    <p>暂无新区</p>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>
import { ElCarousel, ElCarouselItem, ElTabs, ElTabPane } from 'element-plus';

export default {
    components: {
        ElCarousel,
        ElCarouselItem,
        ElTabs,
        ElTabPane,
    },
    props: {
        list: {
            type: Array,
            default: () => [],
        }
    },
    mounted() {
        const tab = document.querySelectorAll('.el-tabs__item.is-top');
        tab.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.activeName = item.id.replace('tab-', '');
            })
        })
    },
    data() {
        return {
            activeName: 'all',
            imgs: [
                require('@/assets/imgs/carousel/notice/a.jpg'),
                require('@/assets/imgs/carousel/notice/b.jpg'),
                require('@/assets/imgs/carousel/notice/c.jpg'),
                require('@/assets/imgs/carousel/notice/d.jpg'),
                require('@/assets/imgs/carousel/notice/e.jpg'),
            ]
        }
    },
    methods: {
        goNotice(id) {
            this.$router.push({
                path: '/notice/' + id,
            })
        }
    }
}
</script>

<style scoped>
.regionalism-2 {
    width: 100%;
    height: 450px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-size: 1875px 100%;
    background-repeat: no-repeat;
    background-position: center center;
}

.left {
    width: 1200px;
    height: 400px;
    border-radius: 15px 0 0 15px;
}

.right {
    width: 600px;
    height: 400px;
    border-left: 0;
    padding: 15px;
    overflow: auto;
    scrollbar-width: none;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 1);
    border-radius: 0 15px 15px 0;
}

.right>ul {
    overflow: auto;
}

.lis>p {
    padding: 5px 0;
    display: flex;
    justify-content: space-around;
    font-size: 24px;
    line-height: 24px;
    color: rgba(0, 0, 0, 0.8);
}

.lis-title {
    display: inline-block;
    width: 400px;
    line-height: 24px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.lis>p:hover {
    color: #d69823da;
    cursor: pointer;
}

.bottom {
    width: 100%;
    height: 100px;
}

:deep(.el-tabs__item) {
    font-size: 24px;
    line-height: 24px;
    color: rgba(0, 0, 0, 0.8);
}

:deep(.el-tabs__item.is-active) {
    font-size: 24px;
    line-height: 24px;
    color: rgba(255, 165, 0, 1);
}

:deep(.el-tabs__active-bar.is-top) {
    background-color: rgba(255, 165, 0, 1);
}
</style>