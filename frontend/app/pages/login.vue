<script setup lang="ts">
import { ref } from "vue";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const form = ref({
  name: "",
  email: "",
  contact: "",
  password: "",
  language: "",
  acceptedTerms: true,
});

function onSubmit() {
  console.log("Registration Data:", form.value);
}
</script>

<template>
  <div
    class="min-h-screen w-full flex flex-col items-center justify-center bg-white p-4"
  >
    <div class="flex items-end gap-1 mb-8 select-none">
      <svg
        viewBox="0 0 16 16"
        class="h-12 w-auto text-[#00c885]"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M11 0L4.5 9.5H8L5 16L11.5 6.5H8L11 0Z" />
      </svg>
      <span
        class="text-5xl font-mono leading-none tracking-tighter text-gray-900"
        >ol&zwnj;taic</span
      >
    </div>

    <form
      @submit.prevent="onSubmit"
      class="w-full max-w-[400px] rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-10"
    >
      <div class="space-y-5">
        <div class="space-y-2">
          <Label
            for="name"
            class="font-mono text-sm font-semibold text-gray-700"
            >Name</Label
          >
          <Input
            id="name"
            v-model="form.name"
            placeholder="Value"
            class="h-11 border-gray-200"
          />
        </div>

        <div class="space-y-2">
          <Label
            for="email"
            class="font-mono text-sm font-semibold text-gray-700"
            >Email</Label
          >
          <Input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Value"
            class="h-11 border-gray-200"
          />
        </div>

        <div class="space-y-2">
          <Label
            for="contact"
            class="font-mono text-sm font-semibold text-gray-700"
            >Contact</Label
          >
          <Input
            id="contact"
            v-model="form.contact"
            placeholder="Value"
            class="h-11 border-gray-200"
          />
        </div>

        <div class="space-y-2">
          <Label
            for="password"
            class="font-mono text-sm font-semibold text-gray-700"
            >Password</Label
          >
          <Input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Value"
            class="h-11 border-gray-200"
          />
        </div>

        <div class="space-y-2">
          <Label
            for="language"
            class="font-mono text-sm font-semibold text-gray-700"
            >Choose language</Label
          >
          <Select v-model="form.language">
            <SelectTrigger class="h-11 border-gray-200 font-mono">
              <SelectValue placeholder="<ticket id>" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="pt">Portuguese</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex items-start gap-3 pt-2">
          <Checkbox
            id="terms"
            v-model:checked="form.acceptedTerms"
            class="mt-1"
          />
          <div class="grid gap-1 leading-none">
            <Label
              for="terms"
              class="font-mono text-sm font-bold text-gray-900 cursor-pointer"
            >
              Label
            </Label>
            <p class="font-mono text-xs text-gray-500">Description</p>
          </div>
        </div>

        <div class="pt-4">
          <Button
            type="submit"
            class="w-full h-12 bg-[#007bff] hover:bg-[#0069d9] text-base font-medium transition-colors"
          >
            Register
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>
