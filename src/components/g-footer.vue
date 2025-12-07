<template>
    <div class="main">
        <div class="footer">
            <div class="left">
                <img alt="" src="/favicon.ico" class="icon">
            </div>

            <div class="center">
                <p>抵制不良游戏&nbsp;拒绝盗版游戏&nbsp;注意自我保护&nbsp;谨防受骗上当</p>
                <p>适度游戏益脑&nbsp;沉迷游戏伤身&nbsp;合理安排时间&nbsp;享受健康生活</p>
                <br>
                <h3>本游戏适合18（含）以上玩家娱乐</h3>
                <p>温州宏峰网络科技有限公司&nbsp;版权所有 ©2025-{{ new Date().getFullYear() }} yncs2022.com ALL RIGHTS RESERVED</p>
            </div>

            <div class="right">
                <p>投诉QQ：931638247</p>
                <p>
                    <a href="javascript:;">浙ICP备2025209262号</a>
                    &nbsp;
                    <a href="javascript:;">浙ICP备2025209262号-1</a>
                </p><br>
                <p>
                    <a href="javascript:;">关于我们</a>|
                    <a href="javascript:;">服务条款</a>|
                    <a href="javascript:;">广告服务</a>|
                    <a href="javascript:;">人事招聘</a>
                </p>
                <p>
                    <a href="javascript:;">游戏客服</a>|
                    <a href="javascript:;">商务合作</a>|
                    <a href="javascript:;">正版申明</a>|
                    <a href="javascript:;">维权举报</a>
                </p>
            </div>

            <a href="https://www.12377.cn" v-lazy:background-image="require('@/assets/ui/png/12377.png')"
                class="SDGCOPYRIGHT-img"></a>
        </div>

    </div>
</template>

<style scoped>
.main {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 1);
}

.footer {
    margin: 0 auto;
    width: 80%;
    height: 168px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.icon {
    width: 100px;
    height: 100px;
}

.center,
p {
    color: rgb(141, 141, 141);
}

p {
    font-size: 18px;
    line-height: 20px;
}

a {
    color: rgb(141, 141, 141);
}

a:hover {
    color: orangered;
}

.SDGCOPYRIGHT-img {
    display: block;
    background-color: white;
    width: 200px;
    height: 50px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}
</style>