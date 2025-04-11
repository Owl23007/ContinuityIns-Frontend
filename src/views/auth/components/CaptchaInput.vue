<template>
    <base-input v-model="captchaValue" label="验证码" required :has-error="hasError" :error-message="errorMessage"
        maxLength="4">
        <template #icon>
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="shield-check"
                class="svg-inline--fa fa-shield-check" role="img" viewBox="0 0 512 512" width="16" height="16">
                <path fill="currentColor" d="..." />
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
    errorMessage: String
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const captchaValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})
</script>
