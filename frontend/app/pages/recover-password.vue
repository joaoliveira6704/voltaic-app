<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const email = ref("");
const isSubmitted = ref(false);
const isSubmitting = ref(false);
const { t } = useI18n();

definePageMeta({
    layout: false,
});

useHead({
    title: t("recoverPassword.title"),
});

const handleRecovery = async () => {
    if (email.value) {
        isSubmitting.value = true;
        console.log("Recovery email sent to:", email.value);
        isSubmitted.value = true;
        isSubmitting.value = false;
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
                    <h1 class="text-lg font-bold uppercase text-gray-900">
                        {{ t("recoverPassword.heading") }}
                    </h1>
                    <p class="text-[10px] text-gray-400 uppercase">
                        {{ t("recoverPassword.instructions") }}
                    </p>
                </div>

                <form @submit.prevent="handleRecovery" class="space-y-6">
                    <div class="space-y-2">
                        <Label
                            for="email"
                            class="text-xs font-bold uppercase text-gray-500"
                        >
                            {{ t("recoverPassword.email") }}
                        </Label>
                        <Input
                            id="email"
                            v-model="email"
                            type="email"
                            :placeholder="t('recoverPassword.emailPlaceholder')"
                            required
                            class="h-11 border-gray-200 focus-visible:ring-[#00c885]"
                        />
                    </div>

                    <Button
                        type="submit"
                        :disabled="isSubmitting"
                        class="w-full h-12 bg-[#007bff] hover:bg-[#0069d9] uppercase text-sm transition-all disabled:opacity-50"
                    >
                        <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {{ t("loading") }}
                        </span>
                        <span v-else>{{ t("recoverPassword.sendInstructions") }}</span>
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
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <p class="text-sm font-bold text-gray-900 uppercase">
                        {{ t("recoverPassword.checkInbox") }}
                    </p>
                    <p class="text-[10px] text-gray-500">
                        {{ t("recoverPassword.instructionsSent") }} <br />
                        <span class="text-[#007bff] font-bold underline">{{
                            email
                        }}</span>
                    </p>
                </div>

                <Button
                    variant="outline"
                    @click="isSubmitted = false"
                    class="w-full text-[10px] uppercase h-10 border-gray-100"
                >
                    {{ t("recoverPassword.tryAnotherEmail") }}
                </Button>
            </div>

            <div class="pt-6 text-center border-t border-gray-50 mt-6">
                <NuxtLink
                    to="/login"
                    class="text-[10px] text-[#007bff] font-bold hover:underline uppercase"
                >
                    {{ t("nav.login") }}
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
