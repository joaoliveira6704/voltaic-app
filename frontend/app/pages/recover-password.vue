<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia"; // Ensure storeToRefs is imported if not auto-imported
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const authStore = useAuthStore();
const { resetStep } = storeToRefs(authStore);

const email = ref("");
const token = ref("");
const isSubmitting = ref(false);
const { t } = useI18n();

definePageMeta({
    layout: false,
});

useHead({
    title: t("recoverPassword.title"),
});

const handleEmailInput = async () => {
    if (!email.value || isSubmitting.value) return;

    isSubmitting.value = true;
    try {
        console.log("Calling sendRecoveryEmail", email.value);
        await authStore.sendRecoveryEmail(email.value);
    } catch (error) {
        console.error(error);
    } finally {
        isSubmitting.value = false;
    }
};

const handleTokenInput = async () => {
    if (!token.value || isSubmitting.value) return;

    isSubmitting.value = true;
    try {
        console.log("Calling validateResetToken", token.value);
        await authStore.validateResetToken(token.value);
    } catch (error) {
        console.error(error);
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div
        class="w-full flex flex-col min-h-screen items-center justify-center py-12 md:py-24 px-4"
    >
        <div
            class="w-full max-w-[400px] rounded-xl border border-gray-100 bg-white dark:bg-[#0a0a0a] dark:border-[#232323] dark:text-white/50 p-6 shadow-sm md:p-10 space-y-6"
        >
            <!-- STEP 1: Enter Email Screen -->
            <div v-if="resetStep === 'email'" class="space-y-6">
                <div class="w-fit m-auto select-none">
                    <NuxtImg src="/voltaic-logo.png" width="75" />
                </div>
                <div class="space-y-1 text-center mb-4">
                    <h1
                        class="text-lg font-bold uppercase text-gray-900 dark:text-white"
                    >
                        {{ t("recoverPassword.heading") }}
                    </h1>
                    <p class="text-[10px] text-gray-400 uppercase">
                        {{ t("recoverPassword.instruction") }}
                    </p>
                </div>

                <form class="space-y-6" @submit.prevent="handleEmailInput">
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
                            :disabled="isSubmitting"
                            class="h-11 border-gray-200 focus-visible:ring-[#00c885]"
                        />
                    </div>

                    <Button
                        type="submit"
                        :disabled="isSubmitting"
                        class="w-full h-12 bg-[#007bff] hover:bg-[#0069d9] uppercase text-sm transition-all disabled:opacity-50"
                    >
                        <span v-if="isSubmitting">{{ t("loading") }}</span>
                        <span v-else>{{
                            t("recoverPassword.sendInstructions")
                        }}</span>
                    </Button>
                </form>
            </div>

            <!-- STEP 2: Input Token Screen -->
            <div v-else-if="resetStep === 'token'" class="space-y-6">
                <div class="w-fit m-auto select-none">
                    <NuxtImg src="/voltaic-logo.png" width="75" />
                </div>
                <div class="space-y-1 text-center mb-4">
                    <h1
                        class="text-lg font-bold uppercase text-gray-900 dark:text-white"
                    >
                        {{
                            t(
                                "recoverPassword.inputTokenHeading",
                                "Input Token",
                            )
                        }}
                    </h1>
                    <p class="text-[10px] text-gray-400 uppercase">
                        {{
                            t(
                                "recoverPassword.inputTokenSub",
                                "Enter your Token",
                            )
                        }}
                    </p>
                </div>

                <form class="space-y-6" @submit.prevent>
                    <div class="flex justify-center">
                        <!-- Ensure PinInput is properly registered or imported globally -->
                        <PinInput
                            v-model="token"
                            :length="6"
                            :disabled="isSubmitting"
                            @complete="handleTokenInput"
                        />
                    </div>
                </form>
            </div>

            <!-- STEP 3: Change Password Screen -->
            <div v-else-if="resetStep === 'password'" class="space-y-6">
                <div class="w-fit m-auto select-none">
                    <NuxtImg src="/voltaic-logo.png" width="75" />
                </div>
                <div class="space-y-1 text-center mb-4">
                    <h1
                        class="text-lg font-bold uppercase text-gray-900 dark:text-white"
                    >
                        {{
                            t(
                                "recoverPassword.newPasswordHeading",
                                "Input new Password",
                            )
                        }}
                    </h1>
                    <p class="text-[10px] text-gray-400 uppercase">
                        {{
                            t(
                                "recoverPassword.newPasswordSub",
                                "Enter new Password",
                            )
                        }}
                    </p>
                </div>

                <form class="space-y-6">
                    <NewPassword />
                </form>
            </div>

            <!-- STEP 4: Success Message Screen -->
            <div
                v-else-if="resetStep === 'success'"
                class="space-y-6 text-center py-4"
            >
                <div class="w-fit m-auto select-none mb-2">
                    <NuxtImg src="/voltaic-logo.png" width="75" />
                </div>
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
                <h1
                    class="text-lg font-bold uppercase text-gray-900 dark:text-white"
                >
                    {{
                        t(
                            "recoverPassword.updatedHeading",
                            "Your password has been updated",
                        )
                    }}
                </h1>
            </div>

            <!-- Shared Global Footer Option -->
            <div
                class="pt-6 text-center border-t border-gray-50 dark:border-[#232323] mt-6"
            >
                <NuxtLink
                    to="/login"
                    class="text-[10px] text-[#007bff] font-bold hover:underline uppercase"
                    @click="authStore.$reset()"
                >
                    {{ t("nav.login", "Back to Login") }}
                </NuxtLink>
            </div>
        </div>
    </div>
</template>
