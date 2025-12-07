<template>
  <div class="design-container">
    <nav>
      <div class="nav-top">
        <div class="icon"></div>
        &nbsp;&nbsp;&nbsp;
        <RouterLink class="router-li" to="/home">首&nbsp;页</RouterLink>
        <RouterLink class="router-li" to="/cors?key=notice">公&nbsp;告</RouterLink>
        <RouterLink class="router-li" to="/forum">论&nbsp;坛</RouterLink>
        <RouterLink class="router-li" to="/streaming">直&nbsp;播</RouterLink>
        <RouterLink class="router-li" to="/strategy">攻&nbsp;略</RouterLink>
        <RouterLink class="router-li" to="/handbook">图&nbsp;鉴</RouterLink>
        <a class="router-li" href="javascript:;">下&nbsp;载</a>
        <musicButton></musicButton>
      </div>
      <hr style="position: relative;top: -2px;border: 1px solid rgba(255, 255, 255, 0.5);z-index: 10;" />
      <div class="nav-bottom">
        <ul class="nav-bottom-ul">
          <li style="width: 80px;"></li>
          &nbsp;&nbsp;&nbsp;
          <li class="nav-bottom-li">
            <a href="#character-show" @click="go('/home')">角色展示</a>
            <a href="#map-show" @click="go('/home')">地图展示</a>
            <a href="#monster-show" @click="go('/home')">怪物展示</a>
            <a href="#skill-show" @click="go('/home')">技能展示</a>
          </li>
          <li class="nav-bottom-li">
            <a href="javascript:;" @click="go('/cors?key=notice')">立即前往</a>
            <!-- <a href="javascript:;" @click="go('/cors?key=notice/signatory')">签约商行</a> -->
          </li>
          <li class="nav-bottom-li">
            <a href="javascript:;" @click="expect">敬请期待</a>
          </li>
          <li class="nav-bottom-li">
            <a href="javascript:;" @click="expect">敬请期待</a>
          </li>
          <li class="nav-bottom-li">
            <a href="javascript:;" @click="go('/strategy/1-1')">职业讲解</a>
            <a href="javascript:;" @click="go('/strategy/2-1')">技能介绍</a>
            <a href="javascript:;" @click="go('/strategy/5-1')">地图攻略</a>
            <a href="javascript:;" @click="go('/strategy/3-1')">物品合成</a>
            <a href="javascript:;" @click="go('/strategy/4-1')">道具使用</a>
          </li>
          <li class="nav-bottom-li">
            <a href="javascript:;" @click="go('/handbook/equip')">装备图鉴</a>
            <a href="javascript:;" @click="expect">武器信息</a>
            <a href="javascript:;" @click="expect">游戏道具</a>
            <a href="javascript:;" @click="go('/handbook/wallpaper')">游戏壁纸</a>
          </li>
          <li class="nav-bottom-li">
            <a href="javascript:alert('暂未开放下载, 敬请期待! (12月8号首测)');">完整客户端</a>
            <a href="javascript:alert('暂未开放下载, 敬请期待! (12月8号首测)');">微端下载</a>
            <a href="javascript:alert('暂未开放下载, 敬请期待! (12月8号首测)');">登录器下载</a>
          </li>
        </ul>
      </div>
    </nav>

    <main>
      <RouterView />
    </main>

    <footer>
      <officialMedia></officialMedia>
      <gfooter></gfooter>
    </footer>
  </div>

  <SplashCursor :SIM_RESOLUTION="128" :DYE_RESOLUTION="1440" :CAPTURE_RESOLUTION="512" :DENSITY_DISSIPATION="3.5"
    :VELOCITY_DISSIPATION="2" :PRESSURE="0.1" :PRESSURE_ITERATIONS="20" :CURL="3" :SPLAT_RADIUS="0.2"
    :SPLAT_FORCE="6000" :SHADING="true" :COLOR_UPDATE_SPEED="10" :BACK_COLOR="{ r: 0.5, g: 0, b: 0 }"
    :TRANSPARENT="true"></SplashCursor>
</template>

<script>
import officialMedia from '@/components/official-media.vue';
import gfooter from '@/components/g-footer.vue';
import SplashCursor from './SplashCursor.vue';
import musicButton from '@/components/ui/music-button.vue';

export default {
  components: { officialMedia, gfooter, SplashCursor, musicButton },  
  mounted() {
    const DESIGN_WIDTH = 1920;
    const container = document.querySelector('.design-container');
    
    function setScale() {
      const screenWidth = window.innerWidth;
      const scale = screenWidth / DESIGN_WIDTH;
      container.style.transform = `scale(${scale})`;
      container.style.transformOrigin = 'left top';
      container.style.marginLeft = `${(screenWidth - DESIGN_WIDTH * scale) / 2}px`;
    }

    setScale();

    window.addEventListener('resize', setScale);
  },
  methods: {
    go(path) {
      this.$router.push(path);
    },
    expect() {
      alert('敬请期待');
    }
  }
}
</script>

<style scoped>
.icon {
  width: 80px;
  height: 80px;
  background-image: url('~@/../public/favicon.ico');
  background-size: 100%;
  background-repeat: no-repeat;
  cursor: pointer;
  flex-shrink: 0;
}

nav {
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: column;
  position: absolute;
  transition: .5s;
  background: linear-gradient(to bottom,
      rgba(0, 0, 0, .88) 0%,
      rgba(0, 0, 0, .98) 33%,
      rgba(0, 0, 0, .68) 90%,
      rgba(0, 0, 0, 0) 100%);
  z-index: 10;
  position: fixed;
  overflow: hidden;
}

.nav-top,
.nav-bottom-ul {
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: center;
  flex-direction: row;
  flex-shrink: 0;
}

.nav-bottom-ul {
  height: 240px;
  margin-top: 15px;
}

.nav-bottom {
  width: 100%;
  height: 240px;
}

nav:hover {
  height: 280px;
  background: linear-gradient(to bottom,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, .9) 40%,
      rgba(0, 0, 0, .7) 60%,
      rgba(0, 0, 0, .5) 80%,
      rgba(0, 0, 0, 0) 100%);
}

.router-li {
  width: 150px;
  height: 80px;
  padding: 0 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  list-style: none;
  color: rgb(225, 225, 225);
}

.nav-bottom-li {
  width: 150px;
  height: auto;
  margin-left: 1px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-bottom-li a {
  height: 30px;
  padding: 0 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  line-height: 20px;
  color: rgb(242, 194, 111);
}

.router-li:hover,
.nav-bottom-li a:hover {
  color: rgb(202, 108, 20);
}

.nav-bottom-li a:hover {
  border-bottom: 1px solid rgb(181, 135, 24);
}

.router-link-active {
  color: rgb(253, 240, 165);
  height: 60px;
  position: relative;
  top: 10px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
}
</style>
