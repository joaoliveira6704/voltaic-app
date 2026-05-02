<script setup>
defineProps({
    title: String,
    buttonText: String,
});
defineEmits(["add"]);

const searchTerm = defineModel("search");
</script>

<template>
    <div class="flex-1 py-2 pr-4 min-w-0 overflow-y-auto">
        <slot name="modal" />
        <Grid :split-cell-d="userRole === 'admin'">
            <template #cell-a>
                <DashboardCard title="Admin">
                    <NavGroup role="admin" />
                </DashboardCard>
            </template>
            <template #cell-b>
                <DashboardCard
                    :title="title"
                    :has-btn="true"
                    :button-text="buttonText"
                    @btn-click="$emit('add')"
                >
                    <Input
                        v-model="searchTerm"
                        type="text"
                        class="my-4 border border-black rounded-md text-xs"
                        placeholder="Search..."
                    />
                    <slot />
                </DashboardCard>
            </template>
        </Grid>
    </div>
</template>
