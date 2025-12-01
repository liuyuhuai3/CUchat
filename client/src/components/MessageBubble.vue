 <template>
    <div :class="['chat',
  message.isCurrentUser ? 'chat-end' :      
  'chat-start']">
      <div class="chat-image avatar">       
        <div class="w-10 rounded-full">     
          <img :src="message.avatar ||      
  '/default-avatar.png'" />
        </div>
      </div>
      <div class="chat-header">
        {{ message.username }}
        <time class="text-xs opacity-50">{{ 
  formatTime(message.timestamp) }}</time>   
      </div>
      <div class="chat-bubble">{{
  message.text }}</div>
    </div>
  </template>

  <script setup>
  const props = defineProps({
    message: { type: Object, required: true }
  });

  const formatTime = (timestamp) => {       
    const date = new Date(timestamp);       
    return date.toLocaleTimeString('zh-CN', {
   hour: '2-digit', minute: '2-digit' });   
  };
  </script>