<script setup lang="ts">
interface Props {
    title?: string;
    description?: string;
    hasBtn?: boolean;
    buttonText?: string;
    scrollable?: boolean;
    hasLine?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    hasLine: true,
    title: "",
    description: "",
    buttonText: "",
});
defineEmits(["btnClick"]);
</script>

<template>
    <Card
        class="h-fit w-full flex flex-col items-center lg:items-start border-gray-100 dark:border-[#232323] shadow-[0px_0px_10px_2px_rgba(0,0,0,0.1)] overflow-hidden font-mono dark:bg-[#171717]"
    >
        <div v-if="title" class="flex flex-col gap-3 w-full">
            <CardHeader
                v-if="title || description"
                class="shrink-0 pb-0 flex flex-row justify-between w-full items-center"
            >
                <CardTitle
                    v-if="title"
                    class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white pt-0"
                >
                    {{ title }}
                </CardTitle>

                <Button
                    v-if="hasBtn"
                    class="hover:bg-green-600 hover:text-white dark:bg-[#171717] dark:text-white dark:border-[#333333] dark:hover:bg-green-900"
                    variant="outline"
                    @click="$emit('btnClick')"
                    >{{ buttonText }}</Button
                >
            </CardHeader>
            <div v-if="props.hasLine" class="px-16">
                <hr class="w-full dark:border-[#333333]" />
            </div>
        </div>

        <CardContent
            :class="[
                'flex-1 min-h-0 py-4 pb-0 pt-0 w-full items-center flex-col',
                scrollable
                    ? 'overflow-y-auto custom-scrollbar'
                    : 'overflow-hidden',
            ]"
        >
            <slot />
        </CardContent>

        <CardFooter
            v-if="$slots.footer"
            class="shrink-0 pt-4 border-t border-gray-50"
        >
            <slot name="footer" />
        </CardFooter>
    </Card>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #f1f1f1;
    border-radius: 10px;
}
</style>
