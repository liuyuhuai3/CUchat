<template>
  <div class="relative h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
    <!-- 连接状态指示器 -->
    <div v-if="!isConnected" class="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-90 max-w-md">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
      >
        <template #title>
          连接已断开，正在重连...
        </template>
      </el-alert>
    </div>

    <!-- Main Container -->
    <div class="h-full flex">
      <!-- Sidebar - Online Users List -->
      <div class="w-80 h-full bg-slate-800/50 backdrop-blur-sm border-r border-white/10 flex flex-col">
        <!-- Sidebar Header -->
        <div class="p-4 border-b border-white/10">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-white text-2xl font-light tracking-wider">CUChat</h1>      
            <div class="relative" ref="settingsRef">
              <button
                @click="showSettingsMenu = !showSettingsMenu"
                class="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                title="Settings"
              >
                <Settings class="w-5 h-5" />
              </button>

              <!-- Settings Dropdown Menu -->
              <div
                v-if="showSettingsMenu"
                v-motion
                :initial="{ opacity: 0, y: -10 }"
                :enter="{ opacity: 1, y: 0, transition: { duration: 200 } }"
                class="absolute right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-md rounded-lg shadow-xl border border-white/10 overflow-hidden z-50"
              >
                <button
                  @click="() => { showSettingsMenu = false; handleUserCommand('profile') }"
                  class="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
                >
                  <UserIcon class="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <div class="border-t border-white/10"></div>
                <button
                  @click="() => { showSettingsMenu = false;handleUserCommand('logout') }"
                  class="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 transition-colors"
                >
                  <LogOut class="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
          <!-- Online Count -->
          <div class="flex items-center gap-2 text-white/80">
            <Users class="w-4 h-4" />
            <span class="text-sm">{{ onlineUsers.length }} Online</span>
          </div>
        </div>

        <!-- Online Users List -->
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <div class="p-4">
            <h3 class="text-white/60 text-sm mb-3">Online Users</h3>
            <div class="space-y-2">
              <div
                v-for="user in onlineUsers"
                :key="user.id"
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div class="relative">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center">
                    <span class="text-white text-sm">{{ user.username?.charAt(0) || 'U' }}</span>
                  </div>
                  <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-800"></div>
                </div>
                <span class="text-white text-sm">{{ user.username }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="flex-1 flex flex-col">
        <!-- Chat Header with Gradient -->
        <div class="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <Users class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 class="text-white text-xl font-light tracking-wide">CU Chat</h2>     
              <p class="text-white/80 text-sm">{{ onlineUsers.length }} members online</p>
            </div>
          </div>
        </div>

        <!-- vue-advanced-chat Component -->
        <div class="flex-1 relative chat-background">
          <vue-advanced-chat
            :current-user-id="userStore.user?.id.toString()"
            :rooms="JSON.stringify(chatStore.rooms)"
            :messages="JSON.stringify(chatStore.formattedMessages)"
            :messages-loaded="chatStore.messagesLoaded"
            :loading-rooms="chatStore.loadingRooms"
            :rooms-loaded="chatStore.roomsLoaded"
            :single-room="true"
            :room-id="chatStore.currentRoom.roomId"
            :show-emojis="true"
            :show-reaction-emojis="true"
            :show-files="true"
            :show-audio="true"
            :textarea-action-enabled="true"
            height="100%"
            @fetch-messages="handleFetchMessages"
            @send-message="handleSendMessage"
            @edit-message="handleEditMessage"
            @delete-message="handleDeleteMessage"
            @typing-message="handleTyping"
            @send-message-reaction="handleSendReaction"
            @open-file="handleOpenFile"
            @textarea-action-handler="openStickerPicker"
          >
            <!-- Custom Footer with Toolbar -->
            <template #room-header>
              <div></div>
            </template>

            <!-- Sticker 按钮 -->
            <template #custom-action-icon>
              <div style="font-size: 20px;" title="发送贴纸">STICKER</div>
            </template>
          
            <!-- Custom toolbar before textarea -->
            <template #room-footer-prepend>
              <div class="custom-toolbar">
                <!-- Emoji Button -->
                <button
                  @click="toggleEmojiPicker"
                  :class="['custom-toolbar-btn', { active: showEmojiPicker }]"
                  title="Emoji"
                  type="button"
                >
                  <Smile :size="20" />
                </button>

                <!-- Sticker Button -->
                <button
                  @click="openStickerPicker"
                  :class="['custom-toolbar-btn', { active: showStickerDialog }]"
                  title="Sticker"
                  type="button"
                >
                  <Sticker :size="20" />
                </button>

                <!-- Image Upload Button -->
                <button
                  @click="triggerImageUpload"
                  class="custom-toolbar-btn image-upload-btn"
                  title="上传图片"
                  type="button"
                >
                  <ImageIcon :size="20" />
                </button>
                <input
                  ref="imageInputRef"
                  type="file"
                  accept="image/*"
                  @change="handleImageUpload"
                  style="display: none;"
                />

                <!-- Voice Recording Button -->
                <button
                  @click="toggleVoiceRecording"
                  :class="['custom-toolbar-btn', { active: isRecording }]"
                  title="Voice Message"
                  type="button"
                >
                  <Mic :size="20"/>
                </button>
              </div>
            </template>
          </vue-advanced-chat>
                  
          <!-- Sticker 选择器弹窗 -->
          <el-dialog v-model="showStickerDialog" width="450px" title="选择贴纸"> 
            <GiphyPicker @select-gif="handleSelectGif"/>
          </el-dialog>

          <!-- Emoji Picker Popup -->
          <div v-if="showEmojiPicker" class="emoji-picker-popup">
            <emoji-picker-element
@emoji-click="handleEmojiClick"></emoji-picker-element>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import GiphyPicker from '@/components/GiphyPicker.vue'; // 导入 GiphyPicker
// import axios from 'axios';
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, ArrowDown, SwitchButton } from '@element-plus/icons-vue';
import { useSocket } from '@/composables/useSocket';
import { useChatStore } from '@/stores/chat';
import { useUserStore } from '@/stores/user';
import { getMessages } from '@/api/chat';
import { addReaction } from '@/api/chat';
import { convertMessagesToChatMessages } from '@/utils/chatAdapter';
import { watch } from 'vue';
import { getCurrentUser } from '@/api/auth';
import request from '@/utils/request';
import { Settings, Users, User as UserIcon, LogOut, Smile, Sticker, Image as ImageIcon, Mic } from 'lucide-vue-next';

const stickerIcon = '❤️'
const router = useRouter();
const chatStore = useChatStore();
const userStore = useUserStore();
const showStickerDialog = ref(false);
const showSettingsMenu = ref(false);
const settingsRef = ref(null)
const showEmojiPicker = ref(false)
const imageInputRef = ref(null)
const isRecording = ref(false)

// 打开 Sticker 选择器的方法
const openStickerPicker = () => {
  console.log('打开 Sticker 选择器')
  showStickerDialog.value = true
}

// Toggle emoji picker
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

// Trigger image upload
const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

// Handle image upload
const handleImageUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.error('请选择图片文件')
      return
    }

    // 检查文件大小（例如限制为 10MB）
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      ElMessage.error('图片大小不能超过 10MB')
      return
    }

    // 构造符合 uploadFile 函数期望的文件对象格式
    const fileExtension = file.name.split('.').pop().toLowerCase()
    const fileObj = {
      blob: file,
      name: file.name.substring(0, file.name.lastIndexOf('.')),
      type: file.type,
      extension: fileExtension,
      size: file.size
    }

    console.log('开始上传图片:', fileObj)

    // 上传文件
    const uploadedUrl = await uploadFile(fileObj)

    if (!uploadedUrl) {
      ElMessage.error('图片上传失败')
      return
    }

    // 发送图片消息
    const messageData = {
      roomId: chatStore.currentRoom.roomId || '1',
      content: '',
      messageType: 'image',
      fileUrl: uploadedUrl,
      thumbnailUrl: uploadedUrl,
      fileName: file.name,
      fileSize: file.size
    }

    sendMessage(messageData)
    ElMessage.success('图片已发送')

  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  } finally {
    // Reset input
    event.target.value = ''
  }
}

// Toggle voice recording
const toggleVoiceRecording = () => {
  isRecording.value = !isRecording.value
  // 这里可以集成你现有的语音录制逻辑
}

// Handle emoji click from picker
const handleEmojiClick = (event) => {
  const emoji = event.detail.unicode
  // 将 emoji 插入到输入框
  // 这需要与 vue-advanced-chat 的输入框交互
  console.log('Emoji selected:', emoji)
  showEmojiPicker.value = false
}

// 使用WebSocket Composable
const {
  isConnected,
  onlineUsers,
  initSocket,
  joinRoom,
  leaveRoom,
  sendMessage,
  sendTyping,
  editMessage,
  deleteMessage,
  disconnect
} = useSocket();

// 用户菜单命令处理
const handleUserCommand = async (command) => {
  switch (command) {
    case 'profile':
      // 跳转到个人资料页
      router.push('/profile');
      break;
    case 'logout':
      // 退出登录
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        userStore.logout();
        disconnect();
        router.push('/login');
        ElMessage.success('已退出登录');
      } catch (error) {
        // 用户取消退出
        console.log('取消退出登录');
      }
      break;
  }
};

// 组件挂载时初始化
onMounted(async () => {

    // 添加调试信息
  console.log('  用户信息:', userStore.user);
  console.log('  用户 ID:', userStore.user?.id);
  console.log('  Token:', userStore.token);

  // 检查登录状态
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }

// 如果用户信息不存在，尝试重新获取
if (!userStore.user) {
  console.log('⚠️ 用户信息为空，尝试重新获取...');
  try {
    const userResponse = await getCurrentUser();
    if (userResponse.success) {
      userStore.setUser(userResponse.user);
      console.log('✅ 用户信息已加载:', userStore.user);
    }
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error);
    router.push('/login');
    return;
  }
}

  // 初始化 WebSocket
  initSocket();

  // 加入默认房间
  setTimeout(() => {
    joinRoom('1');
  }, 500);

  setTimeout(replaceStickerIcon, 1000);

  // Add settings menu click outside listener
  document.addEventListener('mousedown', handleSettingsClickOutside)
});

// ⭐⭐⭐ 在这里添加替换图标的代码 ⭐⭐⭐
  const replaceStickerIcon = () => {
    const btn = document.querySelector('.vac-svg-button');       
    if (btn) {
      btn.innerHTML = '';

      const heart = document.createElement('div');
      heart.textContent = '❤️';
      heart.style.fontSize = '20px';
      heart.style.cursor = 'pointer';
      heart.style.display = 'flex';
      heart.style.alignItems = 'center';
      heart.style.justifyContent = 'center';     
      heart.style.width = '24px';
      heart.style.height = '24px';
      heart.style.transition = 'transform 0.2s';

      heart.addEventListener('mouseenter', ()  => {
        heart.style.transform = 'scale(1.2)';    
      });
      heart.addEventListener('mouseleave', ()  => {
        heart.style.transform = 'scale(1)';      
      });

      btn.appendChild(heart);
    //   console.log('✅ Sticker 图标已替换为 ❤️');
    // } else {
    //   console.warn('⚠️ 未找到按钮，3秒后重试...');
    //   setTimeout(replaceStickerIcon, 3000);      
    }
  };

  setTimeout(replaceStickerIcon, 1000);

  // Handle click outside for settings menu
  const handleSettingsClickOutside = (event) => {
    if (settingsRef.value && !settingsRef.value.contains(event.target)) {
      showSettingsMenu.value = false
    }
  }


// 组件卸载时清理
onUnmounted(() => {
  // 离开房间（但不断开连接）
  if (chatStore.currentRoom.roomId) {
    leaveRoom(chatStore.currentRoom.roomId);
  }
  // Remove settings menu click outside listener
  document.removeEventListener('mousedown', handleSettingsClickOutside)
});

// ============================================
// 处理 vue-advanced-chat 事件
// ============================================

// 自动滚动到底部的函数
const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.vac-container-scroll');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
};

watch(() => chatStore.messages, (newMessages, oldMessages) => {
  if (newMessages.length > 0) {
    const lastMsg = newMessages[newMessages.length - 1];
    console.log('  最新消息:', lastMsg);
    console.log('  消息的 senderId:', lastMsg.senderId, '类型:', typeof lastMsg.senderId);
    console.log('  当前用户 ID:', userStore.user?.id, '类型:', typeof userStore.user?.id);
    console.log('  是否相等?', lastMsg.senderId === userStore.user?.id?.toString());

    // 当有新消息时，自动滚动到底部
    if (oldMessages && newMessages.length > oldMessages.length) {
      scrollToBottom();
    }
  }
}, { deep: true });
/**
 * 加载历史消息
 */
const handleFetchMessages = async ({ room, options } = {}) => {
  try {
    chatStore.setLoadingMessages(true);

    // 如果没有 room，使用默认房间
    const roomId = room?.roomId || chatStore.currentRoom.roomId || '1';

    if (options?.reset) {
      chatStore.clearMessages();
    }

    const response = await getMessages(roomId, {
      page: chatStore.currentPage,
      pageSize: chatStore.pageSize
    });

    if (response.success && response.messages.length > 0) {
      const chatMessages = convertMessagesToChatMessages(
        response.messages,
        userStore.user.id
      );

      chatStore.prependMessages(chatMessages);
      chatStore.currentPage++;
    } else {
      chatStore.setMessagesLoaded(true);
    }

  } catch (error) {
    console.error('加载消息失败:', error);
  } finally {
    chatStore.setLoadingMessages(false);
  }
};

  /**
 * 上传文件到服务器
 */
const uploadFile = async (file) => {
  try {
    // 打印文件对象的完整结构
    console.log('  上传文件对象:', file);
    console.log('  文件对象键:', Object.keys(file));
    console.log('  file.blob:', file.blob);
    console.log('  file.file:', file.file);
    console.log('  file.name:', file.name);
    console.log('  file.type:', file.type);

    const formData = new FormData();
    //   修复：构造完整文件名（带扩展名）
    const fullFileName = file.extension
      ? `${file.name}.${file.extension}`  // 如果有扩展名，拼接
      : file.name;
    console.log('✅ 完整文件名:', fullFileName);
      //   创建带正确文件名的 File 对象
    const fileToUpload = new File([file.blob], fullFileName, {
      type: file.type
    });

    console.log('  准备上传的 File 对象:', fileToUpload);

    let uploadUrl = '/upload/file';
    let fieldName = 'file';

    // 根据文件类型选择上传接口
    if (file.audio) {
      uploadUrl = '/upload/audio';
      fieldName = 'audio';
    } else if (['png', 'jpg', 'jpeg', 'gif',
'webp'].includes(file.extension)) {
      uploadUrl = '/upload/image';
      fieldName = 'image';
    }

    //   上传 File 对象（带文件名）而不是直接上传 Blob
    formData.append(fieldName, fileToUpload);

    // 使用 request 实例而不是 axios
    const response = await request.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('✅ 上传响应:', response);

    if (response.success) {
      console.log('  返回的文件 URL:', response.data.url);
      return response.data.url;
    } else {
      throw new Error(response.message || '上传失败');
    }
  } catch (error) {
    console.error('文件上传失败:', error);
    ElMessage.error('文件上传失败');
    return null;
  }
};
/**
 * 发送消息
 */
const handleSendMessage = async (eventData) => {
  try {
    // 从 CustomEvent 的 detail[0] 中提取数据
    const { content, roomId, files, replyMessage } = eventData.detail[0];

    console.log('  发送消息:', { content, roomId, files, replyMessage });

    // 验证内容
    if (!content && (!files || files.length === 0)) {
      console.warn('消息内容和文件都为空，取消发送');
      return;
    }

    const messageData = {
      roomId: roomId || '1',
      content: content || '',
      messageType: 'text'
    };

    // 如果有文件，先上传
    if (files && files.length > 0) {
      const file = files[0];

      // 上传文件到服务器
      const uploadedUrl = await uploadFile(file);
      
      
      if (!uploadedUrl) return; // 上传失败则不发送消息

      messageData.fileUrl = uploadedUrl;
      messageData.fileSize = file.size;
      messageData.fileName = file.name;

      if (file.audio) {
        messageData.messageType = 'audio';
        messageData.audioDuration = file.duration;
      } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(file.extension)) {
        messageData.messageType = 'image';
        messageData.thumbnailUrl = uploadedUrl;
      }
    }

    // 如果是回复消息
    if (replyMessage) {
      messageData.replyToId = parseInt(replyMessage._id);
    }

    // 通过 WebSocket 发送
    sendMessage(messageData);

    // 发送消息后自动滚动到底部
    scrollToBottom();

  } catch (error) {
    console.error('发送消息失败:', error);
    ElMessage.error('发送消息失败');
  }};

  
  // 处理选择 GIF Sticker
  const handleSelectGif = async (gif) => {
  try {
    const messageData = {
      roomId: chatStore.currentRoom.roomId || '1',
      content: '',
      messageType: 'image',
      fileUrl: gif.url,
      fileName: gif.name
    };  // ← 这里需要分号

    sendMessage(messageData);  // ← 添加这行：实际发送消息

    // 发送贴纸后自动滚动到底部
    scrollToBottom();

  } catch (error) {  // ← catch 前需要 } 闭合 try 块
    console.error('发送表情包失败:', error);
    ElMessage.error('发送表情包失败');
  }
}; 

/**
 * 处理添加 Emoji 到输入框
 */
const handleAddEmoji = (emojiUnicode) => {
  console.log('  Chat.vue 收到 emoji:', emojiUnicode)  // 添加这行
  // 获取输入框元素
  const textarea = document.querySelector('#roomTextarea')  
  console.log('  找到的输入框:', textarea)  // 添加这行    

  if (textarea) {
    // 在光标位置插入 emoji
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value

    textarea.value = text.substring(0, start) + emojiUnicode    
  + text.substring(end)

    // 触发 input 事件，让 vue-advanced-chat 感知到变化
    textarea.dispatchEvent(new Event('input', { bubbles:        
true }))

    // 恢复光标位置
    const newPosition = start + emojiUnicode.length
    textarea.setSelectionRange(newPosition, newPosition)        
    textarea.focus()
    console.log('✅ Emoji 已插入')  // 添加这行
  }else {
    console.warn('⚠️ 未找到输入框，无法插入 emoji')  // 添加这行
  }
};

/**
 * 编辑消息
 */
const handleEditMessage = ({ roomId, messageId, newContent }) => {
  editMessage({
    messageId: parseInt(messageId),
    content: newContent,
    roomId: roomId || '1'
  });
};

/**
 * 删除消息
 */
const handleDeleteMessage = ({ roomId, message }) => {
  deleteMessage({
    messageId: parseInt(message._id),
    roomId: roomId || '1'
  });
};

/**
 * 正在输入
 */
let typingTimeout = null;

const handleTyping = ({ message, roomId }) => {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  if (message && message.length > 0) {
    sendTyping(roomId || '1', true);

    typingTimeout = setTimeout(() => {
      sendTyping(roomId || '1', false);
    }, 3000);
  } else {
    sendTyping(roomId || '1', false);
  }
};  //   handleTyping 到这里结束

/**
 * 发送 emoji 反应
 */
const handleSendReaction = async ({ roomId, messageId, reaction, remove }) => {
  try {
    await addReaction(messageId, reaction.emoji, remove);
    // 通过 WebSocket 通知其他用户（可选）
    // socket.emit('reaction', { messageId, reaction, remove });
  } catch (error) {
    ElMessage.error('操作失败');
  }
};  //   handleSendReaction 独立的函数

/**
 * 打开/下载文件
 */
const handleOpenFile = ({ message, file }) => {
  if (file.url) {
    window.open(file.url, '_blank');
  } else {
    ElMessage.warning('文件 URL 不可用');
  }
};  //   handleOpenFile 独立的函数
</script>

<style scoped>
/* Custom scrollbar for sidebar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Chat background with image */
.chat-background {
  position: relative;
  overflow: hidden;
}

.chat-background::before {
  content: '';
  position: relative;
  height: 100%; /* 确保容器 有高度 */
  overflow: hidden; /* 防止 背景溢出 */ 
  inset: 0;
  background-image: url('/images/chat-bg.png');
  background-size: cover;
  background-position: center;
  opacity: 0.15; /* 降低透明度，让背景更柔和 */
  z-index: 0;
  pointer-events: none;
}

/* Override vue-advanced-chat styles */
:deep(.vac-card-window) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
}

:deep(.vac-rooms-container) {
  display: none !important;
}

:deep(.vac-room-header) {
  display: none !important;
}

/* 输入区域容器 */
:deep(.vac-room-footer) {
  background: rgba(30, 41, 59, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 1rem 1.5rem !important; /* 16px 24px */
}

:deep(.vac-textarea) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 0.5rem !important; /* 8px */
  padding: 0.75rem 1rem !important; /* 12px 16px */
  font-size: 0.9375rem !important; /* 15px */
  line-height: 1.5 !important;
  transition: all 0.2s ease !important;
}

/* 聚焦时的效果 */
:deep(.vac-textarea:focus) {
  outline: none !important;
  border-color: rgba(6, 182, 212, 0.5) !important; /* cyan-500 */
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1) !important;
  background: rgba(255, 255, 255, 0.15) !important;
}

/* 聚焦时的效果 */
:deep(.vac-textarea:focus) {
  outline: none !important;
  border-color: rgba(6, 182, 212, 0.5) !important; /* cyan-500 */
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1) !important;
  background: rgba(255, 255, 255, 0.15) !important;
}

/* Placeholder 样式 */
:deep(.vac-textarea::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.vac-icon-textarea) {
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.vac-icon-textarea:hover) {
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.vac-svg-button) {
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.vac-svg-button:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

/* Message bubbles with transparency */
/* 接收方消息气泡 - 白色半透明 + 玻璃效果 */
:deep(.vac-message-box) {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-radius: 1rem !important; /* 16px */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  padding: 0.75rem 1.25rem !important; /* 12px 20px */
}

/* 发送方消息气泡 - 青色半透明 + 玻璃效果 */
:deep(.vac-message-current .vac-message-box) {
  background: rgba(34, 211, 238, 0.8) !important; /* cyan-400 with 80% opacity */      
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  color: white !important;
  box-shadow: 0 4px 16px rgba(34, 211, 238, 0.2) !important;
}

/* 消息气泡圆角优化 - 添加小缺角效果 */
:deep(.vac-message-current .vac-message-box) {
  border-bottom-right-radius: 0.25rem !important; /* 4px - 右下角小圆角 */
}

:deep(.vac-message-box:not(.vac-message-current)) {
  border-bottom-left-radius: 0.25rem !important; /* 4px - 左下角小圆角 */
}

/* 消息文字 */
:deep(.vac-text-message) {
  color: inherit !important;
  line-height: 1.5 !important;
  word-wrap: break-word !important;
}

/* Send button styling */
:deep(.vac-icon-send) {
  background: linear-gradient(to right,
    oklch(0.715 0.143 215.221), /* cyan-500 */
    oklch(0.704 0.14 182.503)   /* teal-500 */
  ) !important;
  color: white !important;
  border-radius: 9999px !important;
  padding: 0.75rem !important; /* 12px */
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3) !important;
  transition: all 0.2s ease !important;
  border: none !important;
}

:deep(.vac-icon-send:hover) {
  background: linear-gradient(to right,
    oklch(0.609 0.126 221.723), /* cyan-600 */
    oklch(0.6 0.118 184.704)    /* teal-600 */
  ) !important;
  box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4) !important;
  transform: scale(1.05);
}

:deep(.vac-icon-send:active) {
  transform: scale(0.95);
}

/* 确保消息区域在背景之上 */
:deep(.vac-messages-container) {
  position: relative !important;
  z-index: 1 !important;
  background: transparent !important;
  flex: 1 !important;
}

:deep(.vac-container-scroll) {
  background: transparent !important;
  overflow-y: auto !important;
  height: 100% !important;
}

/* 聊天区域滚动条样式 (可加可不加) */
:deep(.vac-container-scroll)::-webkit-scrollbar {
  width: 8px;
}

:deep(.vac-container-scroll)::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.vac-container-scroll)::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

:deep(.vac-container-scroll)::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
} 

/* Username styling */
:deep(.vac-username) {
  color: #1f2937 !important;
  font-weight: 500 !important;
}

/* Timestamp styling */
:deep(.vac-text-timestamp) {
  font-size: 0.6875rem !important; /* 11px */
  opacity: 0.7 !important;
  margin-top: 0.25rem !important;
}

:deep(.vac-message-current .vac-text-timestamp) {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* File upload styling */
:deep(.vac-image-container),
:deep(.vac-file-container) {
  border-radius: 12px !important;
  overflow: hidden !important;
}

/* Emoji picker styling */
:deep(.vac-emojis-container) {
  background: rgba(30, 41, 59, 0.95) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
}

:deep(.vac-emoji-element) {
  transition: transform 0.2s !important;
}

:deep(.vac-emoji-element:hover) {
  transform: scale(1.2) !important;
  background: rgba(255, 255, 255, 0.1) !important;
}



/* Hide default vue-advanced-chat action buttons */
:deep(.vac-icon-emoji),
:deep(.vac-icon-emoji-reaction),
:deep(.vac-image-file),
:deep(.vac-icon-audio) {
  display: none !important;
}

/* Keep only textarea and send button visible */
:deep(.vac-box-footer) {
  display: flex !important;
  align-items: center !important;
  gap: 0.75rem !important; /* 12px */
  max-width: 64rem !important; /* 1024px */
  margin: 0 auto !important;
}

/* 隐藏 vue-advanced-chat 默认的工具按钮 */
:deep(.vac-icon-emoji),
:deep(.vac-icon-emoji-reaction),
:deep(.vac-image-file),
:deep(.vac-icon-audio) {
  display: none !important;
}

/* Custom toolbar buttons container */
.custom-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-right: 12px;
}

.custom-toolbar-btn {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.625rem; /* 10px */
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 40px;
  min-height: 40px;
}

.custom-toolbar-btn:hover {
  color: white;
  background: rgba(6, 182, 212, 0.2);
  border-color: rgba(6, 182, 212, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
}

.custom-toolbar-btn.active {
  color: white;
  background: rgba(6, 182, 212, 0.3);
  border-color: rgba(6, 182, 212, 0.5);
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
}

/* 录音按钮激活状态 */
.custom-toolbar-btn.recording {
  background: rgba(239, 68, 68, 0.5) !important; /* red-500/50 */
  color: white !important;
}

/* 图片上传按钮特殊样式 */
.image-upload-btn {
  position: relative;
}

.image-upload-btn:hover {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(20, 184, 166, 0.3)) !important;
  border-color: rgba(6, 182, 212, 0.6) !important;
}

/* 确保自定义工具栏显示 */
:deep(.vac-room-footer) {
  display: flex !important;
  align-items: center !important;
  flex-wrap: nowrap !important;
}

:deep(.vac-box-footer) {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  gap: 0 !important;
}

/* Emoji picker popup */
.emoji-picker-popup {
  position: absolute;
  bottom: 80px;
  left: 24px;
  z-index: 1000;
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

emoji-picker-element {
  --background-color: transparent;
  --border-color: rgba(255, 255, 255, 0.1);
  --category-emoji-size: 1.5rem;
}

</style>