<template>
  <div>
    <div class="password-strength" :data-strength="strength">
      <div
        class="strength-bar"
        :style="{ width: percentage + '%', backgroundColor: color }"
      ></div>
    </div>
    <div class="strength-text" :style="{ color }">
      {{ text }}
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  password: {
    type: String,
    required: true,
  },
});

const strength = computed(() => {
  if (!props.password) return 0;
  return calculateScore(props.password);
});

const percentage = computed(() => (strength.value / 6) * 100);

const color = computed(() => {
  if (strength.value <= 2) return "#f56565";
  if (strength.value <= 4) return "#f6ad55";
  return "#48bb78";
});

const text = computed(() => {
  if (strength.value <= 2) return "弱";
  if (strength.value <= 4) return "中等";
  return "强";
});

const calculateScore = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  return score;
};
</script>
