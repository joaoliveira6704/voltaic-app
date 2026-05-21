<script setup lang="ts">
import { Skeleton } from "~/components/ui/Skeleton";
import { Mail, Globe } from "lucide-vue-next";
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
        class="flex flex-col lg:flex-row items-center lg:items-start gap-8 rounded-xl"
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
            class="flex-1 flex flex-col gap-4 text-neutral-800 dark:text-white items-center lg:items-start w-full"
        >
            <div class="text-center lg:text-left">
                <h1 class="text-3xl font-black uppercase">
                    {{ props.user.firstName }} {{ props.user.lastName }}
                </h1>
                <h2 class="font-semibold mt-2">
                    <template v-if="props.user.role">
                        <template v-if="pending">
                            <Skeleton class="h-5 w-40 mx-auto lg:mx-0" />
                        </template>
                        <template v-else-if="props.user.companyName">
                            <div class="flex flex-col min-[500px]:flex-row min-[500px]:items-center gap-0.5 min-[500px]:gap-2">
                                <span>{{ props.user.companyName }}</span>
                                <span class="hidden min-[500px]:inline text-neutral-400">-</span>
                                <span>{{ props.user.role?.toUpperCase() }}</span>
                            </div>
                        </template>
                        <template v-else>
                            {{ props.user.role?.toUpperCase() }}
                        </template>
                    </template>
                </h2>
            </div>

            <p class="text-neutral-400 dark:text-white/80">
                @{{ props.user.username }}
            </p>

            <div class="flex flex-col gap-4 mt-4 items-center lg:items-start w-full">
                <div
                    class="flex items-center gap-3 group cursor-pointer"
                    @click="sendEmail"
                >
                    <Mail
                        class="w-5 h-5 text-neutral-400 group-hover:text-black dark:group-hover:text-green-500 transition-colors shrink-0"
                    />
                    <span class="text-sm font-bold lowercase break-all">
                        {{ props.user.email }}
                    </span>
                </div>
                <div class="flex items-center gap-3 group">
                    <Globe
                        class="w-5 h-5 text-neutral-400 group-hover:text-black dark:group-hover:text-green-500 transition-colors shrink-0"
                    />
                    <span class="text-sm font-bold">
                        {{ t(`lang.${props.user.preferences?.language || "en"}`) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
