<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const authStore = useAuthStore();
const { resetStep } = storeToRefs(authStore);

const email = ref("");
const token = ref("");

definePageMeta({
  layout: false,
});

useHead({
  title: "Voltaic - Recover Password",
});

const handleEmailInput = async () => {
  if (email.value) {
    console.log("Calling sendRecoveryEmail", email.value);
    await authStore.sendRecoveryEmail(email.value);
  }
};
const handleTokenInput = async () => {
  if (token.value) {
    console.log("Calling validateResetToken", token.value);
    await authStore.validateResetToken(token.value);
  }
};
</script>

<template>
  <div
    class="w-full flex flex-col min-h-screen items-center justify-center py-12 md:py-24 px-4"
  >
    <div
      class="w-full max-w-[400px] rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:p-10"
    >
      <div v-if="resetStep === `email`" class="space-y-6">
        <div class="space-y-1 text-center mb-4">
          <h1 class="text-lg font-bold uppercase text-gray-900">
            Recover Password
          </h1>
          <p class="text-[10px] text-gray-400 uppercase">
            Enter your email to receive instructions
          </p>
        </div>

        <form class="space-y-6" @submit.prevent="handleEmailInput">
          <div class="space-y-2">
            <Label
              for="email"
              class="text-xs font-bold uppercase text-gray-500"
            >
              Email
            </Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="Value"
              required
              class="h-11 border-gray-200 focus-visible:ring-[#00c885]"
            />
          </div>

          <Button
            type="submit"
            class="w-full h-12 bg-[#007bff] hover:bg-[#0069d9] uppercase text-sm transition-all"
          >
            Send Instructions
          </Button>
        </form>
      </div>
      <div v-if="resetStep === `token`" class="space-y-6">
        <div class="space-y-1 text-center mb-4">
          <h1 class="text-lg font-bold uppercase text-gray-900">Input Token</h1>
          <p class="text-[10px] text-gray-400 uppercase">Enter your Token</p>
        </div>

        <form class="space-y-6">
          <PinInput v-model="token" :length="6" @complete="handleTokenInput" />
        </form>
      </div>
      <div v-if="resetStep === `password`" class="space-y-6">
        <div class="space-y-1 text-center mb-4">
          <h1 class="text-lg font-bold uppercase text-gray-900">
            Input new Password
          </h1>
          <p class="text-[10px] text-gray-400 uppercase">Enter new Password</p>
        </div>

        <form class="space-y-6">
          <NewPassword />
        </form>
      </div>
      <div v-if="resetStep === 'success'" class="space-y-6">
        <div class="space-y-4 text-center">
          <div
            class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#00c885]/10 text-[#00c885]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 class="text-lg font-bold uppercase text-gray-900">
            Your password has been updated
          </h1>
        </div>
      </div>

      <div class="pt-6 text-center border-t border-gray-50 mt-6">
        <NuxtLink
          to="/login"
          class="text-[10px] text-[#007bff] font-bold hover:underline uppercase"
          @click="authStore.$reset"
        >
          Back to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
