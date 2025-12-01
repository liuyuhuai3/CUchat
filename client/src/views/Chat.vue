<template>
 <div class="relative min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      <!-- 保留：连接状态提示 -->
      <div v-if="!isConnected" class="fixed top-4 left-1/2-translate-x-1/2 z-[100] w-90 max-w-md">
        <el-alert type="warning" :closable="false" show-icon>
          <template #title>连接已断开，正在重连...</template>
        </el-alert>
      </div>

    <!-- Main Container -->
    <div class="h-screen flex">
      <!-- Sidebar - Online Users List -->
      <div class="w-80 bg-slate-800/50 backdrop-blur-sm border-r border-white/10 flex flex-col">
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

         <!-- ⭐⭐⭐
  替换：消息区域（参考 Cuchat
  ChatRoom.tsx line 571-654） -->
          <div
            ref="chatContainerRef"
            class="flex-1
  overflow-y-auto p-6 space-y-4
  custom-scrollbar"
            style="
              background-image:
  url('/images/chat-bg.png');
              background-size: cover;
              background-position:
  center;
            "
          >
            <div class="max-w-4xl
  mx-auto space-y-4">
              <!-- 消息列表 -->
              <MessageBubble
                v-for="msg in chatStore.messages"
                :key="msg.id"
                :message="msg"
              />
              <div
  ref="messagesEndRef"></div>
            </div>
          </div>

          <!-- ⭐⭐⭐替换：输入区域（参考 Cuchat ChatRoom.tsx line 656-828） -->
          <div class="bg-slate-800/90
  backdrop-blur-sm px-6 py-4 border-t
  border-white/10 relative">

            <!-- Emoji选择器 -->
            <div
              v-if="showEmojiPicker"
              ref="emojiPickerRef"
              v-motion
              :initial="{ opacity: 0, y:
   10 }"
              :enter="{ opacity: 1, y: 0
   }"
              class="absolute bottom-20
                      left-6 bg-slate-800/95
                      backdrop-blur-md rounded-lg shadow-xl
                      border border-white/10 p-4 z-50"
            >
              <div class="grid
              grid-cols-8 gap-2 max-w-sm max-h-96
              overflow-y-auto custom-scrollbar">
                <button
                  v-for="(emoji, index)
  in allEmojis"
                  :key="index"
                  type="button"

  @click="handleEmojiSelect(emoji)"
                  class="text-2xl
  hover:bg-white/10 rounded p-2
  transition-colors"
                >
                  {{ emoji }}
                </button>
              </div>
            </div>

            <!-- Sticker选择器 -->
            <el-dialog v-model="showStickerDialog" width="450px" title="选择贴纸">
              <GiphyPicker @select-gif="handleSelectGif" />
            </el-dialog>

            <!-- 语音录制组件 -->
            <VoiceRecorder
              v-if="isRecording"
              @recording-complete="handleRecordingComplete"
              @cancel="() => isRecording= false"
              @error="(error) => ElMessage.error(error)"
            />

            <!-- 输入框 -->
            <form @submit.prevent="handleSendMessage" class="max-w-4xlmx-auto">
              <div class="flexitems-center gap-3">
                <!-- Emoji按钮 -->
                <button type="button" @click="showEmojiPicker =!showEmojiPicker"
:class="['text-white/70 hover:text-white hover:bg-white/10rounded-full p-2 transition-colors', {'bg-white/10 text-white':showEmojiPicker }]"
                >
                  <Smile :size="20" />
                </button>

                <!-- Sticker按钮 -->
                <button type="button" @click="showStickerDialog = true" class="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                >
                  <Sticker :size="20" />
                </button>

                <!-- 图片上传按钮 -->
                <button type="button" @click="triggerImageUpload"
                  class="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
                >
                  <ImageIcon :size="20"/>
                </button>
                <input
                  ref="imageInputRef"
                  type="file"
                  accept="image/*" 
                  @change="handleImageUpload"
                  style="display: none"
                />

                <!-- 语音按钮 -->
                <button
                  type="button"
                  @click="isRecording =!isRecording"
:class="['text-white/70hover:text-white hover:bg-white/10rounded-full p-2 transition-colors', {'bg-red-500/50 text-white':isRecording }]"
                >
                  <Mic :size="20" />
                </button>

                <!-- 输入框 -->
                <input
                  ref="messageInputRef"
                  v-model="message"
                  type="text"
                  placeholder="Type a message..."
                  class="flex-1 bg-white/10 text-white placeholder:text-white/50 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />

                <!-- 发送按钮 -->
                <button
                  type="submit"

                  class="bg-gradient-to-r from-cyan-500
                  to-teal-500 hover:from-cyan-600
                  hover:to-teal-600 text-white
                  rounded-full p-3 transition-all
                  shadow-lg hover:shadow-xl"
                >
                  <Send :size="20" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import GiphyPicker from '@/components/GiphyPicker.vue'; // 导入 GiphyPicker
// import axios from 'axios';
import {ref, onMounted, onUnmounted, nextTick, watch, computed} from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, ArrowDown, SwitchButton } from '@element-plus/icons-vue';
import { useSocket } from '@/composables/useSocket';
import { useChatStore } from '@/stores/chat';
import { useUserStore } from '@/stores/user';
import { getMessages } from '@/api/chat';
import { addReaction } from '@/api/chat';
import { convertMessagesToChatMessages } from '@/utils/chatAdapter';
import { getCurrentUser } from '@/api/auth';
import request from '@/utils/request';
import { Settings, Users, User as UserIcon, LogOut, Smile, Sticker, Image as ImageIcon, Mic, Send} from 'lucide-vue-next';
import MessageBubble from '@/components/MessageBubble.vue';
import VoiceRecorder from '@/components/VoiceRecorder.vue';

const stickerIcon = '❤️'
const router = useRouter();
const chatStore = useChatStore();
const userStore = useUserStore();

const showSettingsMenu = ref(false);
const settingsRef = ref(null);
const message = ref('');
const showEmojiPicker = ref(false);
const showStickerDialog = ref(false);
const isRecording = ref(false);

// DOM 引用
const messageInputRef = ref(null);
// 输入框引用
const imageInputRef = ref(null);
// 图片上传input引用
const emojiPickerRef = ref(null);
// Emoji选择器引用
const messagesEndRef = ref(null);
// 消息列表底部锚点
const chatContainerRef = ref(null);
// 聊天容器引用

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
watch(() => chatStore.messages, (newMessages) => {
  if (newMessages.length > 0) {
    const lastMsg = newMessages[newMessages.length - 1];
    console.log('  最新消息:', lastMsg);
    console.log('  消息的 senderId:', lastMsg.senderId, '类型:', typeof lastMsg.senderId);
    console.log('  当前用户 ID:', userStore.user?.id, '类型:', typeof userStore.user?.id);
    console.log('  是否相等?', lastMsg.senderId === userStore.user?.id?.toString());
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

    // 根据文件类型选择上传接口
    let uploadUrl = '/upload/file';
    let fieldName = 'file';

    if (file.audio) {
      uploadUrl = '/upload/audio';
      fieldName = 'audio';
    } else if (['png', 'jpg', 'jpeg', 'gif','webp'].includes(file.extension)) {
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
const handleSendMessage = () => {
// 验证消息不为空
if (!message.value.trim()) return;
  
  // 构造消息数据（与后端API格式一致）
  const messageData = {
   roomId: chatStore.currentRoom.roomId ||
  '1',  // 房间ID
   content: message.value.trim(),
      // 消息内容
   messageType: 'text'
      // 消息类型
  };
  
  // 通过 WebSocket 发送消息
  sendMessage(messageData);
  
  // 清空输入框
  message.value = '';
  
  // 滚动到底部
  nextTick(() => {
   scrollToBottom();
  });
  };

  /**
  - 滚动到消息列表底部
  */
  const scrollToBottom = () => {
    if (messagesEndRef.value) {
      messagesEndRef.value.scrollIntoView({
        behavior: 'smooth',  // 平滑滚动
        block: 'end'         // 滚动到元素底部
      });
    }
  };

  
   /**
- 选择 GIF Sticker（参考 Cuchat
ChatRoom.tsx line 348-363）
*/
const handleSelectGif = async (gif) => {
try {
 // 构造消息数据
 const messageData = {
   roomId: chatStore.currentRoom.roomId || '1',
   content: '',                    //Sticker 没有文本内容
   messageType: 'image',           //Sticker 当作图片消息
   fileUrl: gif.url,               // GIF的 URL
   fileName: gif.name || 'sticker' //文件名
 };
  
   // 发送消息
   sendMessage(messageData);
  
   // 关闭选择器
   showStickerDialog.value = false;
  
   // 滚动到底部
   nextTick(() => {
     scrollToBottom();
   });
  } catch (error) {
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

/**
- Emoji 分类数据（完全参考 Cuchat
ChatRoom.tsx line 406-414）
*/
const emojiCategories = {
'Smileys': [
 '😀', '😃', '😄', '😁', '😆', '😅',
'🤣', '😂', '🙂', '🙃',
 '😉', '😊', '😇', '🥰', '😍', '🤩',
'😘', '😗', '😚', '😙',
 '🥲', '😋', '😛', '😜', '🤪', '😝',
'🤑', '🤗', '🤭', '🤫',
 '🤔', '🤐', '🤨', '😐', '😑', '😶',
'😏', '😒', '🙄', '😬',
 '🤥', '😌', '😔', '😪', '🤤', '😴'
],
'Emotions': [
 '😕', '😟', '🙁', '☹️', '😮', '😯',
'😲', '😳', '🥺', '😦',
 '😧', '😨', '😰', '😥', '😢', '😭',
'😱', '😖', '😣', '😞',
 '😓', '😩', '😫', '🥱', '😤', '😡',
'😠', '🤬', '😈', '👿',
 '💀', '☠️', '💩', '🤡', '👹', '👺',
'👻', '👽', '👾', '🤖'
],
'Gestures': [
 '👋', '🤚', '🖐️', '✋', '🖖', '👌',
'🤌', '🤏', '✌️', '🤞',
 '🤟', '🤘', '🤙', '👈', '👉', '👆',
'🖕', '👇', '☝️', '👍',
 '👎', '✊', '👊', '🤛', '🤜', '👏',
'🙌', '👐', '🤲', '🤝',
 '🙏', '✍️', '💅', '🤳', '💪'
],
'Hearts': [
 '❤️', '🧡', '💛', '💚', '💙', '💜',
'🤎', '🖤', '🤍', '💔',
 '❣️', '💕', '💞', '💓', '💗', '💖',
'💘', '💝', '💟'
],
'Symbols': [
 '✨', '⭐', '🌟', '💫', '✔️', '✅',
'❌', '❎', '🔥', '💯',
 '🎉', '🎊', '🎈', '🎁', '🏆', '🥇',
'🥈', '🥉', '⚡', '💥',
 '💢', '💦', '💨'
]
};

/**
- 扁平化所有 emoji（使用 computed
自动响应式）
*/
const allEmojis = computed(() => {
  return Object.values(emojiCategories).flat();
});

/**
- 选择 Emoji 并插入到输入框
*/
const handleEmojiSelect = (emoji) => {
  const input = messageInputRef.value;
    
    if (input) {
    // ======== 获取当前光标位置 ========
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;        
    
    // ======== 在光标位置插入 emoji ========
    const newValue =
      message.value.substring(0, start) +
    // 光标前的内容
      emoji +
    // emoji
      message.value.substring(end);
    // 光标后的内容
    
    message.value = newValue;
    
    // ======== 恢复光标位置 ========
    nextTick(() => {
      input.focus();  //
    让输入框重新获得焦点
      const newPosition = start +
    emoji.length;
      input.setSelectionRange(newPosition,
    newPosition);
    });
    } else {
    // 如果获取不到 input引用，直接追加到末尾
    message.value += emoji;
    }
    
    // 不关闭选择器，允许用户连续选择多个emoji
    // showEmojiPicker.value = false;  // ❌不要这行
};

  /**
- 点击外部关闭 Emoji 选择器
*/
const handleEmojiClickOutside = (event) => {
// 检查点击的元素是否在 emoji 选择器内部
if (emojiPickerRef.value && !emojiPickerRef.value.contains(event.target)) {
 showEmojiPicker.value = false;
}
};
  
  /**
- 在组件挂载时添加监听
*/
onMounted(() => {
// ... 你原有的挂载逻辑 ...
  
  // 添加 Emoji 选择器的点击外部监听
  document.addEventListener('mousedown',
  handleEmojiClickOutside);
  
  // 保留原有的 settings 菜单监听
  document.addEventListener('mousedown',
  handleSettingsClickOutside);
  });
  
  /**
- 在组件卸载时移除监听
*/
onUnmounted(() => {
// ... 你原有的卸载逻辑 ...
  
  // 移除监听
  document.removeEventListener('mousedown',
  handleEmojiClickOutside);
  document.removeEventListener('mousedown',
  handleSettingsClickOutside);
  });

   /**
- 语音录制完成（参考 Cuchat ChatRoom.tsx
line 227-240）
*/
const handleRecordingComplete = async(audioBlob, duration) => {
    try {
    console.log('录音完成:', { size:
    audioBlob.size, duration });
      
   // ======== 第一步：构造文件对象 ========
  
   // 创建音频文件对象（File API）
   const audioFile = new File(
     [audioBlob],
     `voice_${Date.now()}.webm`,  //使用时间戳命名
     { type: 'audio/webm' }
   );
  
   // 构造与 uploadFile 兼容的文件对象
   const fileObj = {
     blob: audioBlob,
     name: `voice_${Date.now()}`,
     type: 'audio/webm',
     extension: 'webm',
     size: audioBlob.size,
     audio: true  // ⭐重要：标记为音频文件
   };
  
   // ======== 第二步：上传到服务器 ========
  
   const uploadedUrl = await
  uploadFile(fileObj);
  
   if (!uploadedUrl) {
     ElMessage.error('语音上传失败');
     isRecording.value = false;
     return;
   }
  
   console.log('语音上传成功:',
  uploadedUrl);
  
   // ======== 第三步：发送语音消息========
  
   const messageData = {
     roomId: chatStore.currentRoom.roomId || '1',
     content: '',                    //语音消息没有文本内容
     messageType: 'audio',           // ⭐消息类型为音频
     fileUrl: uploadedUrl,           //音频文件 URL
     audioDuration: duration         //录音时长（秒）
   };
  
   sendMessage(messageData);
  
   // 关闭录音状态
   isRecording.value = false;
  
   // 滚动到底部
   nextTick(() => {
     scrollToBottom();
   });
  
   ElMessage.success('语音已发送');
  } catch (error) {
   console.error('语音发送失败:', error);
   ElMessage.error('语音发送失败');
   isRecording.value = false;
  }
  };

    /**
    - 取消录音（用户点击取消按钮）
    */
    const handleRecordingCancel = () => {
    console.log('取消录音');
    isRecording.value = false;
    // VoiceRecorder 组件会自动清理资源
    };
      
      /**
    - 录音出错（权限拒绝、设备占用等）
    */
    const handleRecordingError = (errorMessage) => {
    console.error('录音错误:', errorMessage);
    ElMessage.error(errorMessage);
    isRecording.value = false;
    };

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