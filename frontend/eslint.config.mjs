// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "vue/html-self-closing": [
      "error",
      {
        html: {
          void: "never", // Disallows <img /> -> Enforces <img>
          normal: "always", // Enforces <div />
          component: "always", // Enforces <MyComponent />
        },
        svg: "always",
        math: "always",
      },
    ],
  },
});
