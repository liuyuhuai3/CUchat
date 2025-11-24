<template>
    <div class="picker-container" @click.stop>
      <el-popover
        placement="top"
        :width="300"
        trigger="click"
      >
        <template #reference>
          <el-button circle title="表情和贴纸">
            �
          </el-button>
        </template>

        <!-- Popover 内容：两个按钮 -->
        <div style="display: flex; gap: 10px; padding: 10px;">
          <el-button @click="openEmoji" style="flex: 1;">
            <el-icon><Promotion /></el-icon> Emoji
          </el-button>
          <el-button @click="openSticker" style="flex: 1;">
            <el-icon><Picture /></el-icon> Sticker
          </el-button>
        </div>
      </el-popover>

      <!-- Emoji Picker 弹窗 -->
      <el-dialog v-model="showEmoji" width="400px" title="选择 Emoji">
        <emoji-picker @emoji-click="onEmojiSelect" />
      </el-dialog>

      <!-- Sticker Picker 弹窗 -->
      <el-dialog v-model="showSticker" width="450px" title="选择贴纸">
        <GiphyPicker @select-gif="onStickerSelect" />
      </el-dialog>
    </div>
  </template>

  <script setup>
  import { ref } from 'vue'
  import { Promotion, Picture } from '@element-plus/icons-vue'
  import GiphyPicker from './GiphyPicker.vue'

  const emit = defineEmits(['select-emoji', 'select-sticker'])

  const showEmoji = ref(false)
  const showSticker = ref(false)

  const openEmoji = () => {
    console.log('� 打开 Emoji 选择器')
    showEmoji.value = true
  }

  const openSticker = () => {
    console.log('� 打开 Sticker 选择器')
    showSticker.value = true
  }

  const onEmojiSelect = (event) => {
    console.log('� 选择了 emoji:', event.detail.unicode)
    emit('select-emoji', event.detail.unicode)
    showEmoji.value = false
  }

  const onStickerSelect = (gif) => {
    console.log('� 选择了 sticker:', gif)
    emit('select-sticker', gif)
    showSticker.value = false
  }
  </script>

  <style scoped>
  .picker-container {
    display: inline-block;
  }
  </style>