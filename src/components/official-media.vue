<template>
    <div class="main">
        <p style="color: black;font-size: 32px;margin-bottom: 25px;"><span
                style="color: orangered;font-weight: 900;">|&nbsp;</span>官方媒体</p>
        <div class="official-media">
            <div v-for="item in list" :key="item" style="display: flex;">
                <p style="display: flex;flex-direction: column;justify-content: space-evenly;">
                    <span v-for="item2 in item.name" :key="item2" style="font-size: 16px;">{{ item2 }}</span>
                </p>
                <a href="javascript:;" v-lazy:background-image="item.default" @mouseenter="loadHoverImage(item.hover, $event)"
                    @mouseleave="resetBackground(item.default, $event)"></a>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            list: [
                {
                    name: ['官', '方', '微', '信'],
                    default: require('@/assets/ui/svg/official-media/WX-normal.svg'),
                    hover: require('@/assets/ui/svg/official-media/WX-hover.svg')
                },
                {
                    name: ['官', '方', 'Q', 'Q'],
                    default: require('@/assets/ui/svg/official-media/QQ-normal.svg'),
                    hover: require('@/assets/ui/svg/official-media/QQ-hover.svg')
                },
                {
                    name: ['官', '方', '快', '手'],
                    default: require('@/assets/ui/svg/official-media/KS-normal.svg'),
                    hover: require('@/assets/ui/svg/official-media/KS-hover.svg')
                },
                {
                    name: ['官', '方', '抖', '音'],
                    default: require('@/assets/ui/svg/official-media/DY-normal.svg'),
                    hover: require('@/assets/ui/svg/official-media/DY-hover.svg')
                },
                {
                    name: ['官', '方', '哔', '站'],
                    default: require('@/assets/ui/svg/official-media/BL-normal.svg'),
                    hover: require('@/assets/ui/svg/official-media/BL-hover.svg')
                }
            ]
        }
    },
    methods: {
        loadHoverImage(hoverImg, e) {
            const el = e.currentTarget;

            if (!el._hoverImgLoaded) {
                const img = new Image();
                img.src = hoverImg;
                img.onload = () => {
                    el.style.backgroundImage = `url("${hoverImg}")`;
                    el._hoverImgLoaded = true;
                };
            } else {
                el.style.backgroundImage = `url("${hoverImg}")`;
            }
        },
        resetBackground(defaultImg, e) {
            const el = e.currentTarget;
            el.style.backgroundImage = `url("${defaultImg}")`;
        }
    }
}
</script>

<style scoped>
.main {
    width: 80%;
    margin: 0 auto;
    padding: 25px 0;
}

.official-media {
    display: flex;
    background-color: white;
    justify-content: space-around;
    flex-wrap: wrap;
}

.official-media>div {
    padding: 15px;
}

.official-media a {
    display: block;
    width: 80px;
    height: 80px;
    padding: 15px;
    background-position: center center;
    background-size: 100% 100%;
    margin-left: 15px;
}
</style>