<template>
    <div class="main-center">
        <div v-show="!showArticle">
            <h1 style="text-align: center;line-height: 168px;padding: 50px 0;font-size: 60px;">官方公告</h1>
            <div class="rout">
                <a class="rout-a"></a>
                <router-link v-for="(item) in dataNotice" :key="item" :to="'/notice/' + item.id" class="rout-a"
                    @click="goNotice(item)">
                    <img v-lazy="require('@/assets/ui/svg/notice.svg')" alt=""
                        style="width: 30px;height: 30px;vertical-align: middle;">
                    <p style="width: 925px;display: flex;justify-content: space-between;">
                        {{ item.title }}
                        <span>{{ item.time }}</span>
                    </p>
                </router-link>
            </div>
        </div>

        <router-view v-show="showArticle" @closeArticle="closeArticle" :title="title" :html="html"></router-view>
    </div>
</template>

<script>
import { getNoticeData } from '@/tools/request.js';

export default {
    data() {
        return {
            showArticle: false,
            dataNotice: null,
            html: null,
            title: null
        }
    },
    methods: {
        goNotice(item) {
            this.showArticle = true;
            this.title = item.title;
            fetch(`https://api.yncs2022.com/notice-html/${item.id}/index.html`)
                .then(response => response.text())
                .then(resData => {
                    this.html = resData;
                })
                .catch(error => console.error(error));
        },
        closeArticle() {
            this.showArticle = false;
        },
        signatory() {
            this.showArticle = true;
        }
    },
    created() {
        if (this.$route.path == '/notice/signatory') {
            this.signatory();
        } else {
            getNoticeData().then(resData => {
                this.dataNotice = resData;
                const noticeId = this.$route.params.id;

                if (noticeId) {
                    console.log(this.dataNotice.find(item => item.id == noticeId));
                    this.goNotice(this.dataNotice.find(item => item.id == noticeId));
                }
            });
        }
    }
}
</script>

<style scoped>
.main-center {
    width: 100%;
}

.rout {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.rout-a {
    width: 1680px;
    font-size: 30px;
    line-height: 80px;
    display: flex;
    align-items: center;
    color: rgb(0, 0, 0);
    border-top: 1px solid rgb(0, 0, 0);
    border-bottom: 1px solid rgb(0, 0, 0);
    margin-top: -1px;
}

.rout-a:hover {
    color: #d69823da;
    cursor: pointer;
}

.rout-a>img {
    margin-left: 350px;
    margin-right: 25px;
}
</style>
