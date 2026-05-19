<script setup lang="ts">
import { useCompanyStore } from "~/stores/company";
import { Skeleton } from "~/components/ui/Skeleton";
const { t } = useI18n();
const companyStore = useCompanyStore();

const isPending = ref(true);

companyStore.fetchCurrentCompany().finally(() => {
    isPending.value = false;
});
</script>

<template>
    <div class="flex-1 py-4 px-2 min-w-0 overflow-y-auto space-y-6">
        <template v-if="isPending">
            <Skeleton class="h-8 w-[250px]" />
            <Skeleton class="h-32 w-full rounded-xl" />
        </template>
        <template v-else>
            <h1 class="text-2xl text-green-700 font-bold">
                {{ t("company.manage.title") }}
            </h1>
        </template>
    </div>
</template>
