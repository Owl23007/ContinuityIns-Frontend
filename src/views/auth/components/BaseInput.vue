<template>
  <div class="input-group" :class="{ error: hasError }">
    <input
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :required="required"
      :class="{ filled: !!modelValue }"
      :maxlength="maxLength"
      :placeholder="placeholder"
    />
    <label>{{ label }}</label>
    <span class="icon">
      <slot name="icon"></slot>
    </span>
    <slot name="append"></slot>
    <transition name="fade">
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </transition>
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  type: {
    type: String,
    default: "text",
  },
  required: {
    type: Boolean,
    default: false,
  },
  hasError: Boolean,
  errorMessage: String,
  maxLength: Number,
  placeholder: String,
});

defineEmits(["update:modelValue"]);
</script>
