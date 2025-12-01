  <template>
    <div class="relative min-h-screen w-full overflow-hidden">
      <!-- 背景图片 - 清晰无模糊 -->
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      />

      <!-- 全屏可点击区域 -->
      <div
        @click="handleStart"
        @mousedown="isPressed = true"
        @mouseup="isPressed = false"
        @mouseleave="isPressed = false"
        :class="[
          'absolute inset-0 w-full h-full cursor-pointer bg-transparent z-10',
          'flex items-center justify-center',
          'transition-transform duration-200',
          isPressed ? 'scale-[0.98]' : 'scale-100'
        ]"
      >

        <!-- 底部提示（可选） -->
        <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-5
    pointer-events-none">
            <p class="text-white/60 text-sm font-light tracking-wide">
            Tap anywhere to continue
            </p>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const isPressed = ref(false)

  // 背景图片路径
  const backgroundImage = '/images/landing-bg.png'

  // 处理点击事件，跳转到登录页
  const handleStart = () => {
    // 添加轻微延迟，让动画完成
    setTimeout(() => {
      router.push('/login')
    }, 100)
  }
  </script>

  <style scoped>
  /* 确保页面充满整个视口 */
  div {
    -webkit-tap-highlight-color: transparent;
  }
  </style>