<template>
    <div class="container" id="character">
        <div data-text="战士" style="--r:-15;" class="glass card">
            <img v-lazy="require('@/assets/imgs/character/20001.webp')" alt="">
            <div class="card__content">
                <h1>{{ character[1].type }}</h1>
                <h3>{{ character[1].desc }}</h3>
                <h2 class="war-cry">{{ character[1].warCry }}</h2>
            </div>
        </div>
        <div data-text="法师" style="--r:5;" class="glass card">
            <img v-lazy="require('@/assets/imgs/character/30001.webp')" alt="">
            <div class="card__content">
                <h1>{{ character[0].type }}</h1>
                <h3>{{ character[0].desc }}</h3>
                <h2 class="war-cry">{{ character[0].warCry }}</h2>
            </div>
        </div>
        <div data-text="道士" style="--r:25;" class="glass card">
            <img v-lazy="require('@/assets/imgs/character/40001.webp')" alt="">
            <div class="card__content">
                <h1>{{ character[2].type }}</h1>
                <h3>{{ character[2].desc }}</h3>
                <h2 class="war-cry">{{ character[2].warCry }}</h2>
            </div>
        </div>
    </div>

    <button class="button" @click="next">
        查看更多
        <svg fill="currentColor" viewBox="0 0 24 24" class="icon">
            <path clip-rule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"
                fill-rule="evenodd"></path>
        </svg>
    </button>
</template>

<script>
export default {
    data() {
        return {
            character: [
                {
                    id: "1-1",
                    type: "法师",
                    race: "人类",
                    desc: "经历三界之乱，一部分人类从操纵风火雷电的阿修罗那里学会了和元素沟通，召唤雷电、火焰的能力也就是后来所说的魔法。没有人敢轻视那瘦弱的躯体里所蕴涵的毁灭一切的力量。",
                    warCry: "电光火石 呼风唤雨"
                },
                {
                    id: "1-2",
                    type: "战士",
                    race: "人类",
                    desc: "自从太初创世纪经三界之乱一部分人类从强壮无比摧山裂石的魔族处学会了强化自己肉体的战斗技巧他们称这种能力为武术。战士们崇尚力量，强壮的身体是他们追求的目标。",
                    warCry: "生命不息 战斗不止"
                },
                {
                    id: "1-3",
                    type: "道士",
                    race: "人类",
                    desc: "很多人类修真者寻求到一种新的平和的力量，他们用精神和生命沟通，对生命和自然的理解无比深刻，这种力量被称为道术。可以用道术为他人治疗，也可利用符纸为媒介释放出道力。",
                    warCry: "毒攻愈术 虚怀若谷"
                }
            ]
        }
    },
    methods: {
        next() {
            this.$router.push({ path: "/strategy/1-1" });
        }
    }
}
</script>

<style scoped>
.container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 800px;
}

.container .glass {
    position: relative;
    width: 480px;
    height: 600px;
    background: linear-gradient(#fff2, transparent);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 25px 25px rgba(0, 0, 0, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.5s;
    border-radius: 10px;
    margin: 0 -135px;
    backdrop-filter: blur(5px);
    transform: rotate(calc(var(--r) * 1deg));
}

.container:hover .glass {
    transform: rotate(0deg);
    margin: 0 10px;
}

.container .glass::before {
    content: attr(data-text);
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 40px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
}

.container .glass img {
    font-size: 2.5em;
    fill: #fff;
}

.card {
    position: relative;
    width: 300px;
    height: 200px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow: 0 0 0 5px #ffffff80;
    transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card img {
    transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(255, 255, 255, 0.2);
}

.card__content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 20px;
    border-radius: 10px;
    box-sizing: border-box;
    background-color: #f2f2f2;
    transform: rotateX(-90deg);
    transform-origin: bottom;
    transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card:hover .card__content {
    transform: rotateX(0deg);
}

.card:hover img {
    scale: 0;
}

.card__content h1 {
    font-size: 48px;
    font-weight: bold;
    margin: 15px;
    text-align: center;
}

.card__content h3 {
    font-size: 32px;
    line-height: 1.5;
    margin-bottom: 20px;
    text-indent: 2em;
}

.card__content h2 {
    font-size: 28px;
    font-weight: bold;
    color: #ff4d4f;
}

.button {
    position: relative;
    transition: all 0.3s ease-in-out;
    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
    padding-block: 0.5rem;
    padding-inline: 1.25rem;
    background-color: rgb(0 107 179);
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffff;
    gap: 10px;
    font-weight: bold;
    border: 3px solid #ffffff4d;
    outline: none;
    overflow: hidden;
    font-size: 15px;
    cursor: pointer;
    margin: 35px;
}

.icon {
    width: 24px;
    height: 24px;
    transition: all 0.3s ease-in-out;
}

.button:hover {
    transform: scale(1.05);
    border-color: #fff9;
}

.button:hover .icon {
    transform: translate(4px);
}

.button:hover::before {
    animation: shine 1.5s ease-out infinite;
}

.button::before {
    content: "";
    position: absolute;
    width: 100px;
    height: 100%;
    background-image: linear-gradient(120deg,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.8),
            rgba(255, 255, 255, 0) 70%);
    top: 0;
    left: -100px;
    opacity: 0.6;
}

@keyframes shine {
    0% {
        left: -100px;
    }

    60% {
        left: 100%;
    }

    to {
        left: 100%;
    }
}
</style>
