<script setup lang="ts">
import { Skeleton } from "~/components/ui/Skeleton";
import { Mail, MapPin, Globe } from "lucide-vue-next";
import { createAvatar } from "@dicebear/core";
import { bottts } from "@dicebear/collection";
import type { Preferences } from "~/stores/user";

// 1. Define the interface for the user data
interface UserData {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    companyId: string;
    role: string;
    avatarUrl?: string;
    language?: string;
    preferences?: Preferences;
}

// 2. Define the Props
interface Props {
    user: UserData;
}

// 3. Set the props
const props = defineProps<Props>();
const { t } = useI18n();
const config = useRuntimeConfig();

const { data: companyName, pending } = await useAsyncData(
    `company-${props.user.companyId}`,
    async () => {
        try {
            const response = await $fetch<{ name: string }>(
                `${config.public.apiBaseUrl}/api/companies/${props.user.companyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${useCookie("token").value}`,
                    },
                },
            );
            return response.name;
        } catch {
            return t("info.unknownCompany");
        }
    },
    {
        // Only run if the user isn't a client or admin (logic from your template)
        watch: [() => props.user.companyId],
        immediate: props.user.role !== "client" && props.user.role !== "admin",
    },
);

const avatar = createAvatar(bottts, {
    seed: `${props.user.username}`,
    backgroundColor: ["#F0F0F0"],
});

const avatarUrl: string = avatar.toDataUri();

const sendEmail = () => {
    window.location.href = `mailto:${props.user.email}`;
};
</script>

<template>
    <div
        class="flex flex-col lg:flex-row items-center md:items-start gap-8 rounded-xl"
    >
        <div class="relative shrink-0">
            <div
                class="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#232323] shadow-sm bg-neutral-100 dark:bg-[#1A1A1A]"
            >
                <img
                    :src="avatarUrl"
                    :alt="props.user.firstName + ' ' + props.user.lastName"
                    class="w-full h-full object-cover"
                >
            </div>
        </div>

        <div
            class="flex-1 flex flex-col gap-4 text-neutral-800 dark:text-white"
        >
            <div>
                <h1
                    class="text-3xl font-black text-center lg:text-left uppercase"
                >
                    {{ props.user.firstName }} {{ props.user.lastName }}
                </h1>
                <h2 class="font-semibold mt-2">
                    <template
                        v-if="
                            props.user.role !== 'client'
                        "
                    >
                        <template v-if="pending">
                            <Skeleton class="h-5 w-40" />
                        </template>
                        <template v-else-if="companyName">
                            {{ companyName }} -
                            {{ props.user.role.toLocaleUpperCase() }}
                        </template>
                        <template v-else>
                            {{ props.user.role.toLocaleUpperCase() }}
                        </template>
                    </template>
                </h2>
            </div>
            <p class="text-white/80">@{{ props.user.username }}</p>

            <div class="grid grid-cols-1 lg:grid-cols-2 mt-2">
                <div
                    class="flex items-center gap-3 group cursor-pointer"
                    @click="sendEmail"
                >
                    <Mail
                        class="w-5 h-5 text-neutral-400 group-hover:text-black dark:group-hover:text-green-500 transition-colors"
                    />
                    <span class="text-sm font-bold lowercase">
                        {{ props.user.email }}
                    </span>
                </div>

                <div class="flex items-center gap-3 group">
                    <Globe
                        class="w-5 h-5 text-neutral-400 group-hover:text-black dark:group-hover:text-green-500s transition-colors"
                    />
                    <span class="text-sm font-bold">
                        {{
                            t(
                                `lang.${props.user.preferences?.language || "en"}`,
                            )
                        }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
