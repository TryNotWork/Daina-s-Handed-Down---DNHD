<template>
    <el-tabs type="border-card" class="strategy-1">
        <el-tab-pane v-for="item in character" :key="item.id" :label="item.type">
            <div class="main" v-lazy:background-image="item.imgurl">
                <div class="info">
                    <h1>{{ item.type }}</h1>
                    <h2>{{ item.warCry }}</h2>
                    <h3>种族 ：{{ item.race }}</h3>
                    <p>{{ item.desc }}</p>
                </div>
            </div>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
import { ElTabs, ElTabPane } from 'element-plus'
export default {
    components: {
        ElTabs,
        ElTabPane,
    },
    data() {
        return {
            character: [
                {
                    id: "1-1",
                    type: "法师",
                    race: "人类",
                    desc: "经历三界之乱，一部分人类从操纵风火雷电的阿修罗那里学会了和元素沟通，召唤雷电、火焰的能力也就是后来所说的魔法。没有人敢轻视那瘦弱的躯体里所蕴涵的毁灭一切的力量。",
                    warCry: "电光火石 呼风唤雨",
                    imgurl: require(`@/assets/imgs/strategy/1/1-1.png`)
                },
                {
                    id: "1-2",
                    type: "战士",
                    race: "人类",
                    desc: "自从太初创世纪经三界之乱一部分人类从强壮无比摧山裂石的魔族处学会了强化自己肉体的战斗技巧他们称这种能力为武术。战士们崇尚力量，强壮的身体是他们追求的目标。",
                    warCry: "生命不息 战斗不止",
                    imgurl: require(`@/assets/imgs/strategy/1/1-2.png`)
                },
                {
                    id: "1-3",
                    type: "道士",
                    race: "人类",
                    desc: "很多人类修真者寻求到一种新的平和的力量，他们用精神和生命沟通，对生命和自然的理解无比深刻，这种力量被称为道术。可以用道术为他人治疗，也可利用符纸为媒介释放出道力。",
                    warCry: "毒攻愈术 虚怀若谷",
                    imgurl: require(`@/assets/imgs/strategy/1/1-3.png`)
                }
            ],
        }
    },
    computed: {
        id() {
            return this.$route.path.split('/')[this.$route.path.split('/').length - 1];
        },
        info() {
            return this.character.find(item => item.id === this.id);
        }
    }
}
</script>

<style scoped>
.strategy-1{
    --el-font-size-base: 24px;
    --el-tabs-header-height: 50px;
}

.main {
    width: 100%;
    height: 800px;
    background-size: cover;
    background-repeat: no-repeat;
}

.info {
    width: 50%;
    height: 100%;
    padding: 75px;
    color: white;
}

.info>h1 {
    font-size: 48px;
    margin-bottom: 20px;
}

.info>h2 {
    font-size: 36px;
    margin-bottom: 20px;
}

.info>h3 {
    font-size: 24px;
    margin-bottom: 20px;
}

.info>p {
    font-size: 24px;
    margin-bottom: 20px;
    text-indent: 2em;
}
</style>