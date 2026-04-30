export default defineNuxtPlugin(() => {
  const { locale, setLocale } = useI18n();
  const userStore = useUserStore();

  watchEffect(() => {
    const savedLocale = userStore.currentUser?.preferences?.language;
    if (savedLocale && savedLocale !== locale.value) {
      setLocale(savedLocale);
    }
  });
});
