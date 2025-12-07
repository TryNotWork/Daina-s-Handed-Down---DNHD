<template>
    <div class="article">
        <p style="line-height: 100px;font-size: 48px;margin-top: 75px;">|&nbsp;&nbsp;&nbsp;签约商行&nbsp;&nbsp;&nbsp;|</p>
        <div style="width: 80%;height: 300px;" class="scroll-container">
            <div class="top-wrapper">
                <div v-for="item in dataSignatory" :key="item.id + '-1'" class="top">
                    <div class="headportrait" v-lazy:background-image="item.headPortrait"></div>
                    <div v-lazy:background-image="require('@/assets/imgs/notice/headportrait/b.png')"
                        class="headportrait-img"></div>
                    <p style="position: absolute;top: 210px;z-index: 4;font-size: 32px;color: white;">{{ item.name }}
                    </p>
                </div>
                <div v-for="item in dataSignatory" :key="item.id + '-2'" class="top">
                    <div class="headportrait" v-lazy:background-image="item.headPortrait"></div>
                    <div v-lazy:background-image="require('@/assets/imgs/notice/headportrait/b.png')"
                        class="headportrait-img"></div>
                    <p style="position: absolute;top: 210px;z-index: 4;font-size: 32px;color: white;">{{ item.name }}
                    </p>
                </div>
            </div>
        </div>

        <div style="width: 80%;height: 275px;box-sizing: border-box;padding: 40px 0;">
            <p style="line-height: 100px;font-size: 48px;text-align: center;">|&nbsp;&nbsp;&nbsp;招募招商&nbsp;&nbsp;&nbsp;|</p>
            <p style="font-size: 24px;line-height: 72px;text-align: center;">
                携手代呐传世商行，以同心之力塑生态之美，以共济之姿拓财富之途。敬请联系代呐商务，共启传世合作～</p>
        </div>

        <el-table :data="dataSignatory" style="width: 80%" class="custom-table" :cell-style="{ fontSize: '32px' }"
            :header-cell-style="{ fontSize: '48px' }" border>
            <el-table-column type="index" label=" " align="center" width="80"></el-table-column>
            <el-table-column prop="name" label="商行名称" align="center"></el-table-column>
            <el-table-column prop="status" label="商行状态" align="center">
                <template #default="scope">
                    <div :style="scope.row.status == '已签约' ? 'color: green;' : scope.row.status == '招商中' ? '' : 'color: red;'">
                        {{ scope.row.status }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="wechat" label="商行微信" align="center"></el-table-column>
            <el-table-column prop="qq" label="商行QQ" align="center"></el-table-column>
            <el-table-column label="联系商行" align="center">
                <template #default="scope">
                    <p class="company-logo" @click="showCompanyLogo(scope.row)">点击查看</p>
                </template>
            </el-table-column>
        </el-table>

        <el-drawer v-model="drawer" :append-to-body="true" :size="drawerSize">
            <img :src="drawerImg.wechat" style="width: 250px;" />
            <img :src="drawerImg.qq" style="width: 250px;" />
        </el-drawer>
    </div>
</template>

<script>
import { ElTable, ElTableColumn, ElDrawer } from 'element-plus';

export default {
    components: {
        ElTable,
        ElTableColumn,
        ElDrawer
    },
    data() {
        return {
            dataSignatory: null,
            drawer: false,
            drawerImg: {
                wechat: "",
                qq: "",
            },
            drawerSize: "30%"
        }
    },
    created() {
        const noticeSignatory = JSON.parse(localStorage.getItem('noticeSignatory'));
        const date = new Date().getTime();
        if (!noticeSignatory || date - noticeSignatory.date > 1000 * 60 * 5) {
            fetch('https://api.yncs2022.com/noticeSignatory')
                .then(response => response.json())
                .then(resData => {
                    const noticeSignatory = {
                        date: new Date().getTime(),
                        data: resData.data
                    };
                    localStorage.setItem('noticeSignatory', JSON.stringify(noticeSignatory));
                    this.signatory(noticeSignatory.data);
                })
                .catch(error => console.error(error));
        } else {
            this.signatory(noticeSignatory.data);
        }

        if (window.innerWidth < 768) {
            this.drawerSize = "80%";
        }
    },
    methods: {
        signatory(noticeSignatoryData) {
            this.dataSignatory = noticeSignatoryData;
            const demo = [
                {
                    "id": "招商中",
                    "headPortrait": "https://api.yncs2022.com/headPortrait/000000.png",
                    "name": "招商中",
                    "wechat": "招商中",
                    "qq": "招商中",
                    "status": "招商中"
                },
                {
                    "id": "招商中",
                    "headPortrait": "https://api.yncs2022.com/headPortrait/000000.png",
                    "name": "招商中",
                    "wechat": "招商中",
                    "qq": "招商中",
                    "status": "招商中"
                },
                {
                    "id": "招商中",
                    "headPortrait": "https://api.yncs2022.com/headPortrait/000000.png",
                    "name": "招商中",
                    "wechat": "招商中",
                    "qq": "招商中",
                    "status": "招商中"
                },
                {
                    "id": "招商中",
                    "headPortrait": "https://api.yncs2022.com/headPortrait/000000.png",
                    "name": "招商中",
                    "wechat": "招商中",
                    "qq": "招商中",
                    "status": "招商中"
                },
                {
                    "id": "...",
                    "headPortrait": "https://api.yncs2022.com/headPortrait/000000.png",
                    "name": "...",
                    "wechat": "...",
                    "qq": "...",
                    "status": "..."
                }
            ]

            this.dataSignatory.push(...demo);
        },
        showCompanyLogo(item) {
            this.drawer = true;
            this.drawerImg.wechat = item.wechatUrl;
            this.drawerImg.qq = item.qqUrl;
        }
    }
}
</script>

<style scoped>
.article {
    width: 100%;
    height: 2000px;
    padding: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-size: 100%;
    background-repeat: no-repeat;
}

.top {
    position: relative;
    width: 300px;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    scrollbar-width: none;
    margin: 0 !important;
}

.headportrait {
    width: 100px;
    height: 100px;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    border-radius: 50%;
    position: absolute;
    top: 80px;
    margin-left: -2px;
}

.headportrait-img {
    width: 250px;
    height: 200px;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    z-index: 2;
}

.scroll-container {
    overflow-x: hidden;
    width: 80%;
    height: 300px;
    position: relative;
}

.scroll-container .top-wrapper {
    display: flex;
    animation: scroll 30s linear infinite;
    will-change: transform;
    width: max-content;
    gap: 0 !important;
    overflow: visible;
}

@keyframes scroll {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(-50%);
    }
}

:deep(.custom-table .el-table__cell .cell) {
    line-height: 60px !important;
}

:deep(.custom-table .el-table__header th .cell) {
    line-height: 72px !important;
}

.company-logo:hover {
    cursor: pointer;
}
</style>