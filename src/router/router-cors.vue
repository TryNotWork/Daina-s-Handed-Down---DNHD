<template>
    <span></span>
</template>

<script>
export default {
    beforeCreate() {
        const key = this.$route.query.key;
        this.$router.push({ path: "/" + key });
    }
}
</script>