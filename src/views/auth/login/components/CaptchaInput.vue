<template>
  <base-input
    v-model="captchaValue"
    label="验证码"
    required
    :has-error="hasError"
    :error-message="errorMessage"
    maxLength="4"
  >
    <template #icon>
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="shield-check"
        class="svg-inline--fa fa-shield-check"
        role="img"
        viewBox="0 0 512 512"
        width="16"
        height="16"
        style="display: block"
      >
        <path
          fill="currentColor"
          d="M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM222.2 356.9l-104-104c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l87 87 123-123c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-140 140c-9.4 9.4-24.6 9.4-33.9 0z"
        />
      </svg>
    </template>
    <template #append>
      <div class="captcha-image" @click="$emit('refresh')">
        <img :src="imageUrl" alt="验证码" v-if="imageUrl" />
        <div class="captcha-loading" v-else>
          <div class="mini-loader"></div>
        </div>
      </div>
    </template>
  </base-input>
</template>

<script setup>
import { computed } from 'vue'
import BaseInput from './BaseInput.vue'

const props = defineProps({
  modelValue: String,
  imageUrl: String,
  hasError: Boolean,
  errorMessage: String,
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const captchaValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>
