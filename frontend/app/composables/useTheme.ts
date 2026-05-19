export const useTheme = () => {
    const colorMode = useColorMode();
    const userStore = useUserStore();
    const { currentUser } = storeToRefs(userStore);

    const isDark = computed(() => colorMode.value === "dark");

    const toggle = async () => {
        const next = !isDark.value;
        colorMode.preference = next ? "dark" : "light";
        if (currentUser.value) {
            await userStore.editUserProfile({
                preferences: { darkMode: next },
            });
        }
    };

    return { isDark, toggle };
};
