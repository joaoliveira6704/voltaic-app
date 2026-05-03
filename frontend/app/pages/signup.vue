<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const form = ref({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    acceptedTerms: true,
});

definePageMeta({ layout: "landing" });

useHead({
    title: "Voltaic - Register",
    meta: [
        {
            name: "description",
            content:
                "Register for a new Voltaic account to manage your EV charging sessions.",
        },
    ],
});

const handleRegister = async () => {
    try {
        const response = await $fetch(
            "http://localhost:3000/api/auth/register",
            {
                method: "POST",
                body: {
                    username: form.value.username,
                    firstName: form.value.firstName,
                    lastName: form.value.lastName,
                    email: form.value.email,
                    password: form.value.password,
                    role: "client",
                },
            },
        );

        console.log("Register successful:", response);
        alert("Register successful!");

        await navigateTo("/login");
    } catch (err: unknown) {
        console.error("Register failed:", err);

        const error = err as {
            message?: string;
            data?: { error?: string };
        };

        const errorMessage =
            error.data?.error || error.message || "An unknown error occurred";

        alert(`Register failed: ${errorMessage}`);
    }
};
</script>

<template>
    <div class="w-full flex flex-col items-center justify-center py-12 px-4">
        <div class="flex items-end gap-1 mb-10 select-none">
            <NuxtImg src="/voltaic-logo.png" width="150" />
        </div>

        <Card
            class="w-full max-w-[420px] dark:border-[#232323] dark:bg-[#0a0a0a] shadow-sm overflow-hidden"
        >
            <CardContent class="p-6 md:p-10">
                <form class="space-y-6" @submit.prevent="handleRegister">
                    <div class="space-y-2">
                        <Label
                            for="username"
                            class="font-mono text-xs font-bold uppercase text-white/50"
                            >Username</Label
                        >
                        <Input
                            id="username"
                            v-model="form.username"
                            type="text"
                            placeholder="johndoe123"
                            class="h-11 font-mono dark:border-[#232323]"
                        />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <Label
                                for="firstName"
                                class="font-mono text-xs font-bold uppercase text-white/50"
                                >First Name</Label
                            >
                            <Input
                                id="firstName"
                                v-model="form.firstName"
                                placeholder="John"
                                class="h-11 font-mono dark:border-[#232323]"
                            />
                        </div>
                        <div class="space-y-2">
                            <Label
                                for="lastName"
                                class="font-mono text-xs font-bold uppercase text-white/50"
                                >Last Name</Label
                            >
                            <Input
                                id="lastName"
                                v-model="form.lastName"
                                placeholder="Doe"
                                class="h-11 font-mono dark:border-[#232323]"
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <Label
                            for="email"
                            class="font-mono text-xs font-bold uppercase text-white/50"
                            >Email</Label
                        >
                        <Input
                            id="email"
                            v-model="form.email"
                            type="email"
                            placeholder="example@voltaic.com"
                            class="h-11 font-mono dark:border-[#232323]"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label
                            for="password"
                            class="font-mono text-xs font-bold uppercase text-white/50"
                            >Password</Label
                        >
                        <Input
                            id="password"
                            v-model="form.password"
                            type="password"
                            placeholder="********"
                            class="h-11 font-mono dark:border-[#232323]"
                        />
                    </div>

                    <div class="flex items-center gap-3">
                        <Checkbox
                            id="terms"
                            v-model:checked="form.acceptedTerms"
                            class="mt-1 dark:text-white"
                        />
                        <div class="grid gap-1">
                            <Label
                                for="terms"
                                class="font-mono text-[10px] text-gray-900 dark:text-white cursor-pointer"
                            >
                                I agree with the Terms & Conditions
                            </Label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        class="w-full h-12 bg-[#007bff] hover:bg-[#0069d9] font-mono uppercase dark:text-black tracking-widest text-sm"
                    >
                        Register
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
</template>
