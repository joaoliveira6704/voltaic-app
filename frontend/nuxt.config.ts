// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  app: {
    head: {
      title: "Voltaic",
      htmlAttrs: {
        lang: "en",
      },
      link: [{ rel: "icon", type: "image/x-icon", href: "/voltaic-logo.svg" }],
    },
  },
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
      ],
    },
  },
  devServer: {
    port: 5173,
  },
  modules: [
    "shadcn-nuxt",
    "@nuxtjs/tailwindcss",
    "@nuxt/image",
    "@nuxt/eslint",
  ],
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
      { path: "~/components/layout", pathPrefix: false },
      { path: "~/components", pathPrefix: false },
    ],
  },
});
