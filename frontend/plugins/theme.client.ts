export const useTheme = () => {
    const colorMode = useColorMode();
    const userStore = useUserStore();
    const { currentUser } = storeToRefs(userStore);

    const isDark = computed(() => colorMode.value === "dark");

    const toggle = async () => {
        const next = !isDark.value;
        console.log(
            "toggling to",
            next,
            "current colorMode:",
            colorMode.preference,
        );
        colorMode.preference = next ? "dark" : "light";
        console.log(
            "colorMode after set:",
            colorMode.preference,
            colorMode.value,
        );
        if (currentUser.value) {
            await userStore.editUserProfile({
                preferences: { darkMode: next },
            });
        }
    };

    return { isDark, toggle };
};
