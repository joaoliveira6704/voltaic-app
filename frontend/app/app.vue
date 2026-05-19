<script setup>
const colorMode = useColorMode();
const userStore = useUserStore();

if (useCookie("token").value) {
    userStore.fetchCurrentUser();
}
</script>
<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
