<template>
    <div class="sticker-picker-container" @click.stop>
      <el-popover
        placement="top"
        :width="430"
        trigger="click"
        popper-class="giphy-popover"
      >
        <template #reference>
          <div class="sticker-button"
  title="发送贴纸">
            �
          </div>
        </template>
        <GiphyPicker @select-gif="onSelectSticker" />
      </el-popover>
    </div>
  </template>

  <script setup>
  import GiphyPicker from './GiphyPicker.vue'

  const emit = defineEmits(['select-sticker'])

  const onSelectSticker = (gif) => {
    console.log('� 选择了 sticker:', gif)
    emit('select-sticker', gif)
  }
  </script>

  <style scoped>
  .sticker-picker-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .sticker-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 18px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .sticker-button:hover {
    transform: scale(1.2);
  }
  </style>