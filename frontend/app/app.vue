<script setup>
const colorMode = useColorMode();
const userStore = useUserStore();

await userStore.fetchCurrentUser();

console.log("[APP MOUNT] colorMode.value:", colorMode.value);
console.log("[APP MOUNT] colorMode.preference:", colorMode.preference);
console.log("[APP MOUNT] currentUser:", userStore.currentUser);
console.log(
    "[APP MOUNT] darkMode pref:",
    userStore.currentUser?.preferences?.darkMode,
);
</script>
<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
