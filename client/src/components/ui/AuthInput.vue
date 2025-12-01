<template>
    <div class="relative">
      <!-- 图标 -->
      <div class="absolute left-0 top-1/2 -translate-y-1/2 text-white/60">
        <component :is="icon" class="w-5 h-5" />
      </div>

      <!-- 输入框 -->
      <input
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :required="required"
        class="w-full bg-transparent border-b-2 border-white/40 text-white placeholder:text-white/50 pl-8 pr-4 py-3 focus:outline-none focus:border-white transition-colors"
      />
    </div>
  </template>

  <script setup>
  defineProps({
    modelValue: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    icon: {
      type: Object,
      required: true
    },
    required: {
      type: Boolean,
      default: false
    }
  })

  defineEmits(['update:modelValue'])
  </script>