<script setup lang="ts">
import { Mail, Phone, MapPin, Globe } from "lucide-vue-next";

// 1. Define the interface for the user data
interface UserData {
  name: string;
  email: string;
  phone: string;
  location: string;
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
    class="flex flex-col md:flex-row items-center md:items-start gap-8 p-6 bg-white rounded-xl border border-neutral-100 font-mono"
  >
    <div class="relative shrink-0">
      <div
        class="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-sm bg-neutral-100"
      >
        <img
          :src="props.user.avatarUrl || '/default-avatar.png'"
          :alt="props.user.name"
          class="w-full h-full object-cover"
        />
      </div>
      <div
        class="absolute bottom-2 right-2 w-6 h-6 bg-green-400 border-4 border-white rounded-full"
      ></div>
    </div>

    <div class="flex-1 flex flex-col gap-4 text-neutral-800">
      <h1
        class="text-3xl font-black tracking-tight text-center md:text-left uppercase"
      >
        {{ props.user.name }}
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 mt-2">
        <div class="flex items-center gap-3 group">
          <Mail
            class="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors"
          />
          <span class="text-sm font-bold lowercase tracking-tight">
            {{ props.user.email }}
          </span>
        </div>

        <div class="flex items-center gap-3 group">
          <Phone
            class="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors"
          />
          <span class="text-sm font-bold tracking-tight">
            {{ props.user.phone }}
          </span>
        </div>

        <div class="flex items-center gap-3 group">
          <MapPin
            class="w-5 h-5 text-neutral-400 group-hover:text-black transition-colors"
          />
          <span class="text-sm font-bold capitalize tracking-tight">
            {{ props.user.location }}
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
