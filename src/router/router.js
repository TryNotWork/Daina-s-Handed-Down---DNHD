import { createWebHistory, createRouter } from 'vue-router';
import home from '@/router/page/page-home.vue';
import { nextTick } from 'vue';

const cors = {
    path: '/cors', component: () => import('@/router/router-cors.vue')
}

const notice = {
    path: '/notice', component: () => import('@/router/page/page-notice.vue'),
    children: [
        { path: '/notice/:id', component: () => import('@/router/view/notice-articles.vue') },
        { path: '/notice/signatory', component: () => import('@/components/page-notice/center/regionalism-2.vue') },
    ]
}

const forum = {
    path: '/forum', component: () => import('@/router/page/page-forum.vue')
}

const streaming = {
    path: '/streaming', component: () => import('@/router/page/page-streaming.vue')
}

const strategy = {
    path: '/strategy', component: () => import('@/router/page/page-strategy.vue'),
    redirect: '/strategy/1-1',
    children: [
        // 职业讲解
        { path: '/strategy/1-1', component: () => import('@/router/view/strategy/strategy-1.vue') },
        // 技能介绍
        { path: '/strategy/2-1', component: () => import('@/router/view/strategy/strategy-2.vue') },
        { path: '/strategy/2-2', component: () => import('@/router/view/strategy/strategy-2.vue') },
        { path: '/strategy/2-3', component: () => import('@/router/view/strategy/strategy-2.vue') },
        // 地图攻略
        { path: '/strategy/5-1', component: () => import('@/router/view/strategy/strategy-5-1.vue') },
        { path: '/strategy/5-2', component: () => import('@/router/view/strategy/strategy-5-2.vue') },
        { path: '/strategy/5-3', component: () => import('@/router/view/strategy/strategy-5-3.vue') },
        { path: '/strategy/5-4', component: () => import('@/router/view/strategy/strategy-5-4.vue') },
        { path: '/strategy/5-5', component: () => import('@/router/view/strategy/strategy-5-5.vue') },
        { path: '/strategy/5-6', component: () => import('@/router/view/strategy/strategy-5-6.vue') },
        // 物品合成
        { path: '/strategy/3-1', component: () => import('@/router/view/strategy/strategy-3.vue') },
        // 道具使用
        { path: '/strategy/4-1', component: () => import('@/router/view/strategy/strategy-4.vue') },
    ]
}

const handbook = {
    path: '/handbook', component: () => import('@/router/page/page-handbook.vue'),
    redirect: '/handbook/equip',
    children: [
        // 装备图鉴
        { path: '/handbook/equip', component: () => import('@/router/view/handbook/handbook-0.vue') },
        // 壁纸展示
        { path: '/handbook/wallpaper', component: () => import('@/router/view/handbook/handbook-1.vue') }
    ]
}

const routes = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: home },
    notice,
    forum,
    streaming,
    strategy,
    handbook,
    cors,
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    if (to.path !== from.path) {
        window.scrollTo(0, 0);
    }
    next();
});

/**
 * 区分百度相关环境（百度App内置浏览器/百度浏览器）
 * @returns {Object} 详细区分结果，适配不同场景
 */
function distinguishBaiduEnv() {
    const ua = window.navigator.userAgent || '';

    // 百度核心标识（优先级：baiduboxapp > Baidu，避免误判）
    const isBaiduApp = /baiduboxapp/i.test(ua); // 百度App内置浏览器（你的目标环境）
    const isBaiduBrowser = /BaiduBrowser/i.test(ua); // 独立百度浏览器（旧版）
    const isBaiduRelated = isBaiduApp || isBaiduBrowser || /Baidu/i.test(ua); // 所有百度相关环境

    // 联动检测内核（避免和X5混淆，你的UA是SP-engine，非X5）
    const isX5Kernel = /TBS\/\d+/.test(ua); // X5内核标识（TBS）
    const isSpEngine = /SP-engine\/\d+/.test(ua); // 百度SP引擎标识（你的环境）

    return {
        isBaiduRelated: isBaiduRelated, // 是否是百度相关环境（含App/浏览器）
        isBaiduApp: isBaiduApp, // 是否是百度App内置浏览器（核心区分）
        isBaiduBrowser: isBaiduBrowser, // 是否是独立百度浏览器
        kernel: isX5Kernel ? 'X5' : isSpEngine ? 'SP-engine' : 'Chromium/其他', // 内核类型
        ua: ua // 原始UA（方便调试）
    };
}

const baiduEnv = distinguishBaiduEnv();

router.afterEach((to) => {
    if (to.path == '/home' && baiduEnv.isBaiduApp) {
        nextTick(() => {
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
        })
    }
});

export default router