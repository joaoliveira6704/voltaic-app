<script setup lang="ts">
import { useError } from "#app";

const error = useError();
const router = useRouter();
useHead({
    title: "Voltaic - Not Found",
});
</script>

<template>
    <div
        class="min-h-screen flex flex-col items-center justify-center font-mono bg-white"
    >
        <div class="flex flex-col items-center gap-6 text-center px-4">
            <p class="text-8xl font-black text-green-100 select-none">
                {{ error?.statusCode }}
            </p>

            <div class="flex flex-col gap-2">
                <h1
                    class="text-xl font-bold uppercase tracking-tight text-green-900"
                >
                    Page not found
                </h1>
                <p class="text-sm text-gray-400 max-w-xs">
                    The page you're looking for doesn't exist or has been moved.
                </p>
            </div>

            <Button
                @click="router.back()"
                class="uppercase tracking-tight text-xs font-bold hover:text-green-500"
            >
                Go Back
            </Button>
        </div>
    </div>
</template>
