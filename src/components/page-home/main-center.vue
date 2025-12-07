<template>
    <div class="main-center">

        <div class="center-content">
            <p class="title">独家研发&nbsp;&nbsp;历经一年&nbsp;&nbsp;为你带来最完善的游戏体验</p>
            <regionalism1 :list="list"></regionalism1>
        </div>

        <div class="downloads-container"
            v-lazy:background-image="require('@/assets/imgs/backgrounds/top-back/downback.webp')">
            <div class="button-container">
                <a href="javascript:alert('暂未开放下载, 敬请期待! (12月8号首测)');">
                    <img v-lazy="buttonImgs.default1" alt="" @mouseenter="loadHoverImage(buttonImgs.hover1, $event)"
                        width="300px" @mouseleave="resetBackground(buttonImgs.default1, $event)">
                </a>
                <a href="javascript:alert('暂未开放下载, 敬请期待! (12月8号首测)');">
                    <img v-lazy="buttonImgs.default2" alt="" @mouseenter="loadHoverImage(buttonImgs.hover2, $event)"
                        width="300px" @mouseleave="resetBackground(buttonImgs.default2, $event)">
                </a>
            </div>
            <img v-lazy="require('@/assets/imgs/backgrounds/advertising.png')" alt=""
                style="width: 600px; object-fit: contain;">
            <img v-lazy="require('@/assets/imgs/backgrounds/advertising1.png')" alt=""
                style="width: 600px; object-fit: contain;">
        </div>

        <p class="title" id="character-show">角色展示</p>
        <regionalism3></regionalism3>

        <p class="title" id="map-show">地图展示</p>
        <regionalism4></regionalism4>

        <p class="title" id="monster-show">怪物展示</p>
        <regionalism2></regionalism2>

        <p class="title" id="skill-show">技能展示</p>
        <regionalism5 v-if="isShowBall"></regionalism5>
        <div v-else style="margin-bottom: 250px; width: 100%;">
            <p class="title" style="text-align: center;font-size: 64px;color: white;">
                电脑访问查看更多或点击查看技能介绍界面
            </p>
            <a href="strategy/2-1" style="
                background-color: rgb(0 107 179);
                display: block;
                width: 650px;
                height: 150px;
                line-height: 150px;
                text-align: center;
                font-size: 64px;
                color: white;
                border-radius: 50px;
                margin-top: 100px;
                margin-left: calc(50% - 325px);
            ">
                前往技能介绍
            </a>
        </div>
    </div>
</template>

<script>
import regionalism1 from '@/components/page-home/center/regionalism-1.vue';
import regionalism2 from '@/components/page-home/center/regionalism-2.vue';
import regionalism3 from '@/components/page-home/center/regionalism-3.vue';
import regionalism4 from '@/components/page-home/center/regionalism-4.vue';
import regionalism5 from '@/components/page-home/center/regionalism-5.vue';
import { getNoticeData } from '@/tools/request.js';

export default {
    components: {
        regionalism1,
        regionalism2,
        regionalism3,
        regionalism4,
        regionalism5,
    },
    mounted() {
        getNoticeData().then(noticeData => {
            this.list = noticeData;
        });

        const ua = navigator.userAgent;
        const isWeChatOniPhone = /iPhone/.test(ua) && /MicroMessenger/.test(ua);

        if (isWeChatOniPhone) {
            this.isShowBall = false;
        }

        const baiduEnv = this.distinguishBaiduEnv();

        if (baiduEnv.isBaiduApp || !this.isShowBall) {
            const back = document.getElementById('back');
            back.replaceChildren();

            const img = document.createElement('img');
            img.src = '/back.jpg';
            img.style.width = '100%';
            img.style.height = '100%';
            back.appendChild(img);

            const character = document.getElementById('character');
            const characterCard = character.querySelectorAll('.card');
            const characterGlass = character.querySelectorAll('.glass');
            const characterCardContent = character.querySelectorAll('.card__content');

            character.className = '';
            characterCard.forEach(item => item.className = '');
            characterGlass.forEach(item => item.className = '');
            characterCardContent.forEach(item => item.className = '');

            const characterCardImg = character.querySelectorAll('img');

            character.style = `
          display: flex;
          justify-content: center;
          align-items: center;
        `;

            characterCard.forEach(item => item.style = `
          width: 480px;
          height: 600px;
        `);

            characterCardImg.forEach(item => item.style = `
          width: 100%;
          height: 100%;
        `);
        }
    },
    data() {
        return {
            list: [],
            buttonImgs: {
                default1: require('@/assets/ui/png/a1.webp'),
                hover1: require('@/assets/ui/png/a2.webp'),
                default2: require('@/assets/ui/png/b1.webp'),
                hover2: require('@/assets/ui/png/b2.webp'),
            },
            isShowBall: true,
        }
    },
    methods: {
        loadHoverImage(hoverImg, event) {
            event.target.src = hoverImg;
        },
        resetBackground(defaultImg, event) {
            event.target.src = defaultImg;
        },
        distinguishBaiduEnv() {
            const ua = window.navigator.userAgent || '';
            const isBaiduApp = /baiduboxapp/i.test(ua);
            const isBaiduBrowser = /BaiduBrowser/i.test(ua);
            const isBaiduRelated = isBaiduApp || isBaiduBrowser || /Baidu/i.test(ua);
            const isX5Kernel = /TBS\/\d+/.test(ua);
            const isSpEngine = /SP-engine\/\d+/.test(ua);

            return {
                isBaiduRelated: isBaiduRelated,
                isBaiduApp: isBaiduApp,
                isBaiduBrowser: isBaiduBrowser,
                kernel: isX5Kernel ? 'X5' : isSpEngine ? 'SP-engine' : 'Chromium/其他',
                ua: ua
            };
        }
    }
}
</script>

<style scoped>
.main-center {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 20px;
}

.title {
    width: 100%;
    height: 128px;
    font-size: 64px;
    text-align: center;
    line-height: 128px;
    color: rgb(247, 219, 118);
}

.center-content {
    width: 100%;
    height: 750px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(to bottom,
            rgba(165, 42, 42, 1) 0%,
            rgba(165, 42, 42, .9) 40%,
            rgba(165, 42, 42, .7) 60%,
            rgba(165, 42, 42, .5) 80%,
            rgba(165, 42, 42, 0) 100%);
}

.downloads-container {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-evenly;
    width: 100%;
    height: 450px;
    background-size: 1875px 100%;
    background-repeat: no-repeat;
    background-position: center center;
    margin-bottom: 50px;
}

.button-container {
    display: flex;
    flex-direction: column;
}
</style>
