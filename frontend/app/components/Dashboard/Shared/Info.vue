<script setup lang="ts">
import { Mail, MapPin, Globe } from "lucide-vue-next";

// 1. Define the interface for the user data
interface UserData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  location?: string;
  role: string;
  avatarUrl?: string;
  language?: string;
}

// 2. Define the Props
interface Props {
  user: UserData;
}

// 3. Set the props
const props = defineProps<Props>();
</script>

<template>
  <div
    class="flex flex-col lg:flex-row items-center md:items-start gap-8 rounded-xl font-mono"
  >
    <div class="relative shrink-0">
      <div
        class="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-sm bg-neutral-100"
      >
        <img
          :src="props.user.avatarUrl || '/default-avatar.jpg'"
          :alt="props.user.firstName + ' ' + props.user.lastName"
          class="w-full h-full object-cover"
        />
      </div>
    </div>

    <div class="flex-1 flex flex-col gap-4 text-neutral-800">
      <h1
        class="text-3xl font-black tracking-tight text-center lg:text-left uppercase"
      >
        {{ props.user.firstName }} {{ props.user.lastName }}
      </h1>
      <p>@{{ props.user.username }} | {{ props.user.role }}</p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-3 mt-2">
        <div class="flex items-center gap-3 group">
          <Mail
            class="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors"
          />
          <span class="text-sm font-bold lowercase tracking-tight">
            {{ props.user.email }}
          </span>
        </div>

        <div class="flex items-center gap-3 group">
          <MapPin
            class="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors"
          />
          <span class="text-sm font-bold capitalize tracking-tight">
            {{ props.user.location || "Unknown Location" }}
          </span>
        </div>

        <div class="flex items-center gap-3 group">
          <Globe
            class="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors"
          />
          <span class="text-sm font-bold tracking-tight">
            {{ props.user.language || "English (US)" }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
