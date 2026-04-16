<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const email = ref("");
const isSubmitted = ref(false);

definePageMeta({
  layout: false,
});

const handleRecovery = () => {
  if (email.value) {
    console.log("Recovery email sent to:", email.value);
    isSubmitted.value = true;
  }
};
</script>

<template>
  <div
    class="w-full flex flex-col items-center justify-center py-12 md:py-24 px-4"
  >
    <div
      class="w-full max-w-[400px] rounded-xl border border-gray-100 bg-white p-6 shadow-sm md:p-10"
    >
      <div v-if="!isSubmitted" class="space-y-6">
        <div class="space-y-1 text-center mb-4">
          <h1
            class="font-mono text-lg font-bold uppercase tracking-tight text-gray-900"
          >
            Recover Password
          </h1>
          <p
            class="font-mono text-[10px] text-gray-400 uppercase tracking-wider"
          >
            Enter your email to receive instructions
          </p>
        </div>

        <form @submit.prevent="handleRecovery" class="space-y-6">
          <div class="space-y-2">
            <Label
              for="email"
              class="font-mono text-xs font-bold uppercase text-gray-500 tracking-wider"
            >
              Email
            </Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="Value"
              required
              class="h-11 font-mono border-gray-200 focus-visible:ring-[#00c885]"
            />
          </div>

          <Button
            type="submit"
            class="w-full h-12 bg-[#007bff] hover:bg-[#0069d9] font-mono uppercase tracking-widest text-sm transition-all"
          >
            Send Instructions
          </Button>
        </form>
      </div>

      <div v-else class="text-center space-y-6 py-4">
        <div class="space-y-2">
          <div
            class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#00c885]/10 text-[#00c885] mb-2"
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
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <p class="font-mono text-sm font-bold text-gray-900 uppercase">
            Check your inbox
          </p>
          <p class="font-mono text-[10px] text-gray-500">
            Recovery instructions sent to <br />
            <span class="text-[#007bff] font-bold underline">{{ email }}</span>
          </p>
        </div>

        <Button
          variant="outline"
          @click="isSubmitted = false"
          class="w-full font-mono text-[10px] uppercase tracking-widest h-10 border-gray-100"
        >
          Try another email
        </Button>
      </div>

      <div class="pt-6 text-center border-t border-gray-50 mt-6">
        <NuxtLink
          to="/login"
          class="font-mono text-[10px] text-[#007bff] font-bold hover:underline uppercase tracking-tight"
        >
          Back to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
