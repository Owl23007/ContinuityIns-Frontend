<template>
    <base-input v-model="password" :type="showPassword ? 'text' : 'password'" :label="label" :required="required"
        :has-error="hasError" :error-message="errorMessage">
        <template #icon>
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="lock" class="svg-inline--fa fa-lock"
                role="img" viewBox="0 0 448 512" width="16" height="16">
                <path fill="currentColor"
                    d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z" />
            </svg>
        </template>
        <template #append>
            <button type="button" class="password-toggle" @click="togglePassword">
                <svg v-if="showPassword" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye-slash"
                    class="svg-inline--fa fa-eye-slash" role="img" viewBox="0 0 640 512" width="16" height="16">
                    <path fill="currentColor" d="..." />
                </svg>
                <svg v-else aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye"
                    class="svg-inline--fa fa-eye" role="img" viewBox="0 0 576 512" width="16" height="16">
                    <path fill="currentColor" d="..." />
                </svg>
            </button>
        </template>
    </base-input>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseInput from './BaseInput.vue'

const props = defineProps({
    modelValue: String,
    label: String,
    required: Boolean,
    hasError: Boolean,
    errorMessage: String
})

const emit = defineEmits(['update:modelValue'])
const showPassword = ref(false)

const password = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const togglePassword = () => {
    showPassword.value = !showPassword.value
}
</script>
