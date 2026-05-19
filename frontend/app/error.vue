<script setup lang="ts">
import { useError } from "#app";

const { t } = useI18n();
const error = useError();
const router = useRouter();
useHead({
    title: t("error.title"),
});
</script>

<template>
    <div
        class="min-h-screen flex flex-col items-center justify-center bg-white"
    >
        <div class="flex flex-col items-center gap-6 text-center px-4">
            <p class="text-8xl font-black text-green-100 select-none">
                {{ error?.statusCode }}
            </p>

            <div class="flex flex-col gap-2">
                <h1 class="text-xl font-bold uppercase text-green-900">
                    {{ t("error.notFound") }}
                </h1>
                <p class="text-sm text-gray-400 max-w-xs">
                    {{ t("error.description") }}
                </p>
            </div>

            <Button
                @click="router.back()"
                class="uppercase text-xs font-bold hover:text-green-500"
            >
                {{ t("error.goBack") }}
            </Button>
        </div>
    </div>
</template>
