<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const emit = defineEmits<{
  submit: [password: string];
}>();

const authStore = useAuthStore();
const { isLoading } = storeToRefs(authStore);

const newPassword = ref("");
const confirmPassword = ref("");
const error = ref("");

async function handleSubmit() {
  error.value = "";

  if (newPassword.value.length < 8) {
    error.value = "Password must be at least 8 characters.";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = "Passwords do not match.";
    return;
  }

  await authStore.resetPassword(newPassword.value);
}
</script>

<template>
  <div class="space-y-6">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="space-y-2">
        <Label
          for="newPassword"
          class="text-xs font-bold uppercase text-gray-500"
        >
          New Password
        </Label>
        <Input
          id="newPassword"
          v-model="newPassword"
          type="password"
          placeholder="Min. 8 characters"
          required
          class="h-11 border-gray-200 focus-visible:ring-[#00c885]"
        />
      </div>

      <div class="space-y-2">
        <Label
          for="confirmPassword"
          class="text-xs font-bold uppercase text-gray-500"
        >
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          required
          class="h-11 border-gray-200 focus-visible:ring-[#00c885]"
        />
      </div>

      <p v-if="error" class="text-[10px] text-red-500 uppercase font-bold">
        {{ error }}
      </p>

      <Button
        type="submit"
        :disabled="isLoading"
        class="w-full h-12 bg-[#007bff] hover:bg-[#0069d9] uppercase text-sm transition-all"
      >
        {{ isLoading ? "Updating..." : "Update Password" }}
      </Button>
    </form>
  </div>
</template>
