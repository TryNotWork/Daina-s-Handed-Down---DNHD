<template>
    <articles @closeArticle="closeArticle">
        <template #header>
            <h1>{{ title }}</h1>
        </template>
        <template #content>
            <div v-html="html"></div>
        </template>
    </articles>
</template>

<script>
import articles from '@/components/page-notice/center/regionalism-1.vue';
export default {
    components: {
        articles,
    },
    props: {
        title: {
            type: String,
            default: null,
        },
        html: {
            type: String,
            default: null,
        },
    },
    methods: {
        closeArticle() {
            this.$router.push({
                path: '/notice'
            })
            this.$emit('closeArticle');
        }
    }
}
</script>