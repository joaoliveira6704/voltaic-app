export default defineNuxtPlugin(() => {
  const { locale, setLocale } = useI18n();
  const userStore = useUserStore();

  watch(
    () => userStore.currentUser?.preferences?.language,
    (savedLocale) => {
      if (savedLocale && savedLocale !== locale.value) {
        setLocale(savedLocale);
      }
    },
  );
});
