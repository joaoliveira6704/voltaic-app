<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const form = ref({
  name: "",
  email: "",
  contact: "",
  password: "",
  language: "",
  acceptedTerms: true,
});

definePageMeta({ layout: "default" });
const handleRegister = () => console.log("Register:", form.value);
</script>

<template>
  <div class="w-full flex flex-col items-center justify-center py-12 px-4">
    <div class="flex items-end gap-1 mb-10 select-none">
      <NuxtImg src="/voltaic-logotype.png" width="300" />
    </div>

    <Card
      class="w-full max-w-[420px] border-gray-100 shadow-sm overflow-hidden"
    >
      <CardContent class="p-6 md:p-10">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div class="space-y-2">
            <Label
              for="name"
              class="font-mono text-xs font-bold uppercase text-gray-500"
              >Name</Label
            >
            <Input
              id="name"
              v-model="form.name"
              placeholder="John Doe"
              class="h-11 font-mono border-gray-200"
            />
          </div>
          <div class="space-y-2">
            <Label
              for="email"
              class="font-mono text-xs font-bold uppercase text-gray-500"
              >Email</Label
            >
            <Input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="example@voltaic.com"
              class="h-11 font-mono border-gray-200"
            />
          </div>
          <div class="space-y-2">
            <Label
              for="contact"
              class="font-mono text-xs font-bold uppercase text-gray-500"
              >Contact</Label
            >
            <Input
              id="contact"
              v-model="form.contact"
              placeholder="000-000-000"
              class="h-11 font-mono border-gray-200"
            />
          </div>
          <div class="space-y-2">
            <Label
              for="password"
              class="font-mono text-xs font-bold uppercase text-gray-500"
              >Password</Label
            >
            <Input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="********"
              class="h-11 font-mono border-gray-200"
            />
          </div>
          <div class="space-y-2">
            <Label class="font-mono text-xs font-bold uppercase text-gray-500"
              >Choose language</Label
            >
            <Select v-model="form.language" class="w-120">
              <SelectTrigger class="h-11 border-gray-200 font-mono"
                ><SelectValue placeholder="Select language"
              /></SelectTrigger>
              <SelectContent class="bg-white">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center gap-3">
            <Checkbox
              id="terms"
              v-model:checked="form.acceptedTerms"
              class="mt-1"
            />
            <div class="grid gap-1">
              <Label
                for="terms"
                class="font-mono text-[10px] text-gray-900 cursor-pointer"
                >I agree with the Terms & Conditions</Label
              >
            </div>
          </div>
          <Button
            type="submit"
            class="w-full h-12 bg-[#007bff] hover:bg-[#0069d9] font-mono uppercase tracking-widest text-sm"
            >Register</Button
          >
        </form>
      </CardContent>
    </Card>
  </div>
</template>
<style lang="postcss"></style>
