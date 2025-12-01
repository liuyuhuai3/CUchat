  <template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 10 }"
    :enter="{ opacity: 1, y: 0 }"
    class="absolute bottom-20 left-1/2
  -translate-x-1/2 bg-gradient-to-r
  from-red-500/95 to-pink-500/95
  backdrop-blur-md rounded-2xl px-6 py-4
  flex items-center gap-4 z-50
  shadow-2xl border border-white/20"
  >
    <!-- 录音图标动画 -->
    <div class="relative flex
  items-center justify-center">
      <div
        v-motion
        :animate="{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }"
        :transition="{
          duration: 1500,
          repeat: Infinity,
          ease: 'easeInOut'
        }"
        class="absolute w-12 h-12 bg-white/30 rounded-full"/>
      <div class="relative w-10 h-10
  bg-white rounded-full flex
  items-center justify-center">
        <Mic :size="20"
  class="text-red-500" />
      </div>
    </div>
  
    <!-- 波形可视化 -->
    <div class="flex items-center
  gap-1 h-12">
      <div
        v-for="i in 20"
        :key="i"
        v-motion
        :animate="{ height: isRecording ? `${Math.max(8,audioLevel*40)}px` :'8px' }"
        class="w-1 bg-white rounded-full"
        style="min-height: 8px"
      />
    </div>
  
    <!-- 时间显示 -->
    <div class="flex flex-colitems-center">
      <span class="text-white/80 text-xs">Recording</span>
      <span class="text-white text-lgtabular-nums">{{formatTime(recordingTime) }}</span>
    </div>
  
    <!-- 操作按钮 -->
    <div class="flex items-center
  gap-2 ml-2">
      <!-- 取消 -->
      <button
        @click="handleCancel"
        class="w-10 h-10 bg-white/20
  hover:bg-white/30 text-white
  rounded-full flex items-center
  justify-center transition-colors"
      >
        <X :size="20" />
      </button>
  
      <!-- 发送 -->
      <button
        @click="handleSend"
        class="w-10 h-10 bg-white
  hover:bg-white/90 text-red-500
  rounded-full flex items-center
  justify-center transition-all
  shadow-lg"
      >
        <Send :size="20" />
      </button>
    </div>
  </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted }
  from 'vue';
  import { Mic, X, Send } from
  'lucide-vue-next';
  
  const emit =
  defineEmits(['recording-complete',
  'cancel', 'error']);
  
  const isRecording = ref(false);
  const recordingTime = ref(0);
  const audioLevel = ref(0);
  const mediaRecorder = ref(null);
  const audioChunks = ref([]);
  let recordingInterval = null;
  let audioContext = null;
  let analyser = null;
  let animationFrame = null;
  
  onMounted(() => {
  startRecording();
  });
  
  onUnmounted(() => {
  cleanup();
  });
  
  const startRecording = async () => {
  try {
    const stream = await
  navigator.mediaDevices.getUserMedia({
  audio: true });
  
    // 创建 MediaRecorder
    mediaRecorder.value = new
  MediaRecorder(stream);
  
  
  mediaRecorder.value.ondataavailable =
  (event) => {
      if (event.data.size > 0) {
  
  audioChunks.value.push(event.data);
      }
    };
  
    mediaRecorder.value.onstop = () =>
  {
      const audioBlob = new
  Blob(audioChunks.value, { type:
  'audio/webm' });
      if (audioChunks.value.length >      
1. ){
     emit('recording-complete',
audioBlob, recordingTime.value);
   }
 };
  
   // 音频可视化
   audioContext = new AudioContext();
   analyser =
  audioContext.createAnalyser();
   const source = audioContext.create
  MediaStreamSource(stream);
   source.connect(analyser);
   analyser.fftSize = 256;
  
   // 开始录音
   mediaRecorder.value.start();
   isRecording.value = true;
  
   // 开始计时
   recordingInterval = setInterval(() => {
     recordingTime.value++;
   }, 1000);
  
   // 开始可视化
   visualize();
  } catch (error) {
   console.error('Error accessingmicrophone:', error);
   emit('error', 'Unable to accessmicrophone');
   emit('cancel');
  }
  };
  
  const visualize = () => {
  if (!analyser) return;
  
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  
  const updateLevel = () => {
   analyser.getByteFrequencyData(dataArray);
   const average =
  dataArray.reduce((a, b) => a + b) /
  dataArray.length;
   audioLevel.value = average / 255;
   animationFrame =
  requestAnimationFrame(updateLevel);
  };
  
  updateLevel();
  };
  
  const handleSend = () => {
  if (mediaRecorder.value &&
  mediaRecorder.value.state ===
  'recording') {
   mediaRecorder.value.stop();
   isRecording.value = false;
   cleanup();
  }
  };
  
  const handleCancel = () => {
  if (mediaRecorder.value &&
  mediaRecorder.value.state ===
  'recording') {
   mediaRecorder.value.stop();
   audioChunks.value = [];
   isRecording.value = false;
   cleanup();
  }
  emit('cancel');
  };
  
  const cleanup = () => {
  if (recordingInterval) {
   clearInterval(recordingInterval);
   recordingInterval = null;
  }
  if (animationFrame) {
  
  cancelAnimationFrame(animationFrame);
   animationFrame = null;
  }
  if (audioContext) {
   audioContext.close();
   audioContext = null;
  }
  if (mediaRecorder.value) {
   const stream =
  mediaRecorder.value.stream;
   stream.getTracks().forEach(track=> track.stop());
  }
  };
  
  const formatTime = (seconds) => {
  const mins = Math.floor(seconds /
  60);
  const secs = seconds % 60;
  return
 ` ${mins}:${secs.toString().padStart(2,     '0')}`;
  };
  </script>