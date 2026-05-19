<script setup lang="ts">
const props = defineProps<{
  length?: number;
  modelValue?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  complete: [value: string];
}>();

const length = props.length ?? 6;
const digits = ref<string[]>(Array(length).fill(""));
const inputs = ref<HTMLInputElement[]>([]);

function onInput(index: number, e: Event) {
  const input = e.target as HTMLInputElement;
  const val = input.value.replace(/\D/g, "").slice(-1); // digits only, last char
  digits.value[index] = val;
  emit("update:modelValue", digits.value.join(""));

  if (val && index < length - 1) {
    inputs.value[index + 1]?.focus();
  }

  if (digits.value.every((d) => d !== "")) {
    emit("complete", digits.value.join(""));
  }
}

function onKeydown(index: number, e: KeyboardEvent) {
  if (e.key === "Backspace") {
    if (digits.value[index]) {
      digits.value[index] = "";
      emit("update:modelValue", digits.value.join(""));
    } else if (index > 0) {
      inputs.value[index - 1]?.focus();
    }
  }
  if (e.key === "ArrowLeft" && index > 0) inputs.value[index - 1]?.focus();
  if (e.key === "ArrowRight" && index < length - 1)
    inputs.value[index + 1]?.focus();
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault();
  const pasted =
    e.clipboardData?.getData("text").replace(/\D/g, "").slice(0, length) ?? "";
  pasted.split("").forEach((char, i) => {
    digits.value[i] = char;
  });
  emit("update:modelValue", digits.value.join(""));
  const nextEmpty = digits.value.findIndex((d) => !d);
  const focusIndex = nextEmpty === -1 ? length - 1 : nextEmpty;
  inputs.value[focusIndex]?.focus();
  if (digits.value.every((d) => d !== "")) {
    emit("complete", digits.value.join(""));
  }
}

function onFocus(e: FocusEvent) {
  (e.target as HTMLInputElement).select();
}
</script>

<template>
  <div class="flex gap-2 justify-center">
    <input
      v-for="(_, index) in length"
      :key="index"
      :ref="
        (el) => {
          if (el) inputs[index] = el as HTMLInputElement;
        }
      "
      :value="digits[index]"
      type="text"
      inputmode="numeric"
      maxlength="1"
      class="w-11 h-12 text-center text-base font-mono font-bold border border-gray-200 rounded-lg bg-white text-gray-900 outline-none focus:border-[#00c885] focus:ring-2 focus:ring-[#00c885]/20 transition-all duration-150 select-all"
      @input="onInput(index, $event)"
      @keydown="onKeydown(index, $event)"
      @paste="onPaste"
      @focus="onFocus"
    />
  </div>
</template>
