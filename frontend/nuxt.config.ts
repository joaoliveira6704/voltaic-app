// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  experimental: {
    defaults: {
      nuxtLink: {
        prefetch: false, // Desativa o prefetch automático ao ver o link
        prefetchOn: {
          visibility: false, // Não carrega quando o link aparece no ecrã
          interaction: false, // Não carrega ao passar o rato (hover/focus)
        },
      },
    },
  },
  app: {
    head: {
      title: "Voltaic",
      htmlAttrs: {
        lang: "en",
      },
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/voltaic-logo.svg",
        },
      ],
    },
  },
  css: ["sweetalert2/dist/sweetalert2.min.css", "~/assets/css/tailwind.css"],
  devtools: { enabled: true },
  vite: {
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "class-variance-authority",
        "@vueuse/core",
        "reka-ui",
        "clsx",
        "tailwind-merge",
        "lucide-vue-next",
        "gsap",
        "gsap/ScrollTrigger",
        "sweetalert2",
        "vue-sonner",
        "vue-chartjs",
        "chart.js",
      ],
    },
  },
  runtimeConfig: {
    apiBaseUrl: process.env.NUXT_API_BASE_URL || 'http://localhost:3000',
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '',
    },
  },
  devServer: {
    port: 5173,
  },
  modules: [
    "@nuxtjs/color-mode",
    "shadcn-nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxt/image",
    "@nuxt/eslint",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
  ],
  i18n: {
    strategy: "no_prefix",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "pt", name: "Português", file: "pt.json" },
      { code: "es", name: "Español", file: "es.json" },
    ],
    defaultLocale: "en",
    langDir: "locales/",
  },
  image: {
    domains: ["www.carlogos.org"],
  },
  colorMode: {
    classSuffix: "",
    dataValue: "theme", // makes it add 'dark' not 'dark-mode'
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: "@/components/ui",
  },
  tailwindcss: {
    exposeConfig: true,
  },
  components: {
    dirs: [
      { path: "~/components/ui", pathPrefix: false },
      { path: "~/components/cards", pathPrefix: false },
      { path: "@/layouts", pathPrefix: false },
      { path: "~/components/Dashboard", pathPrefix: false },
      { path: "~/components/stations", pathPrefix: false },
      { path: "~/components", pathPrefix: false },
    ],
  },
});
