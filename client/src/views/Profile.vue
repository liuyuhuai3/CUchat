<template>
  <div class="relative min-h-screen w-full overflow-hidden">
    <!-- Background image with blur -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url(${backgroundImage})` }"
    >
      <div class="absolute inset-0 backdrop-blur-md bg-black/20"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 min-h-screen flex flex-col items-center p-8">
      <!-- Header -->
      <div class="w-full max-w-2xl mb-8">
        <button
          @click="navigateBack"
          class="text-white/80 hover:text-white flex items-center gap-2
transition-colors mb-4"
        >
          <arrow-left class="w-5 h-5" />
          <span>Back to Chat</span>
        </button>
        <h1 class="text-white text-4xl font-light tracking-wider">Personal
Profile</h1>
        <p class="text-white/60 text-sm mt-1">Manage your personal information</p>     
      </div>

      <!-- Profile Form -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 400 } }"
        class="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl    
  p-8 max-h-[calc(100vh-12rem)] overflow-y-auto profile-scrollbar"
      >
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Profile Avatar -->
          <div class="flex flex-col items-center mb-8">
            <div class="relative">
              <div class="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400       
to-teal-400 flex items-center justify-center overflow-hidden cursor-pointer"
@click="triggerAvatarUpload">
                <img v-if="user.avatar_url" :src="user.avatar_url" class="w-full       
h-full object-cover" />
                <span v-else class="text-white text-4xl">{{
displayName.charAt(0).toUpperCase() }}</span>
              </div>
              <button
                type="button"
                @click="triggerAvatarUpload"
                class="absolute bottom-0 right-0 bg-gradient-to-r from-cyan-500        
to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-full p-2
shadow-lg transition-all"
              >
                <Camera class="w-4 h-4" />
              </button>
              <input
                ref="avatarInput"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                @change="handleAvatarUpload"
                class="hidden"
              />
            </div>
            <p class="text-gray-600 text-sm mt-4">
              Name: <span class="text-gray-800">{{ displayName }}</span>, ID: <span    
  class="text-gray-800">{{ user.id }}</span>
            </p>
          </div>

          <!-- Upload Progress -->
          <div v-if="uploading" class="mb-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full     
transition-all"
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
            <p class="text-center text-sm text-cyan-600 mt-2">Uploading... {{
uploadProgress }}%</p>
          </div>

          <!-- User ID Field (Read-only) -->
          <div class="space-y-2">
            <label class="text-gray-700 font-medium">User ID</label>
            <div class="relative">
              <input
                type="text"
                :value="user.id"
                readonly
                class="w-full bg-gray-50 border border-gray-200 text-gray-400 px-4     
py-3 rounded-lg cursor-not-allowed"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400     
text-sm">Cannot modify</span>
            </div>
          </div>

          <!-- Email Field (Read-only) -->
          <div class="space-y-2">
            <label class="text-gray-700 font-medium">Email Address</label>
            <div class="relative">
              <input
                type="email"
                :value="user.email"
                readonly
                class="w-full bg-gray-50 border border-gray-200 text-gray-400 px-4     
py-3 rounded-lg cursor-not-allowed"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400     
text-sm">Cannot modify</span>
            </div>
          </div>

          <!-- Username/Nickname Field -->
          <div class="space-y-2">
            <label class="text-gray-700 font-medium">Nickname</label>
            <div class="relative">
              <input
                type="text"
                v-model="formData.nickname"
                placeholder="Enter your nickname"
                maxlength="50"
                class="w-full bg-white border border-gray-300 text-gray-800 px-4       
py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50
focus:border-cyan-500 transition-all"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400     
text-sm">
                {{ formData.nickname.length }}/50
              </span>
            </div>
          </div>

          <!-- Age Field -->
          <div class="space-y-2">
            <label class="text-gray-700 font-medium">Age</label>
            <div class="relative">
              <input
                type="number"
                v-model.number="formData.age"
                placeholder="Enter your age"
                min="1"
                max="120"
                class="w-full bg-white border border-gray-300 text-gray-800 px-4       
py-3 pr-24 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50
focus:border-cyan-500 transition-all"
              />

              <!-- Button Container -->
              <div class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">       
                <!-- Increment/Decrement Buttons -->
                <div class="flex flex-col">
                  <button
                    type="button"
                    @click.stop="incrementAge"
                    class="px-2 py-0.5 bg-gray-100 hover:bg-cyan-500
hover:text-white border border-gray-300 rounded-t transition-colors"
                    title="Increment"
                  >
                    <Plus class="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    @click.stop="decrementAge"
                    class="px-2 py-0.5 bg-gray-100 hover:bg-cyan-500
hover:text-white border border-gray-300 border-t-0 rounded-b transition-colors"        
                    title="Decrement"
                  >
                    <Minus class="w-3 h-3" />
                  </button>
                </div>

                <!-- Dropdown Button -->
                <button
                  type="button"
                  @click="showAgeDropdown = !showAgeDropdown"
                  class="px-2 py-2 bg-gray-100 hover:bg-cyan-500 hover:text-white border border-gray-300 rounded transition-colors"
                  title="Select from list"
                >
                  <chevron-down v-if="!showAgeDropdown" class="w-4 h-4" />
                  <chevron-up v-else class="w-4 h-4" />
                </button>
              </div>

              <!-- Age Dropdown -->
              <div
                v-if="showAgeDropdown"
                v-motion
                :initial="{ opacity: 0, y: -10 }"
                :enter="{ opacity: 1, y: 0 }"
                ref="ageDropdownRef"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-300       
rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                <button
                  v-for="age in ageOptions"
                  :key="age"
                  type="button"
                  @click="selectAge(age)"
                  class="w-full px-4 py-2 text-left hover:bg-cyan-50
transition-colors text-gray-800"
                >
                  {{ age }}
                </button>
              </div>
            </div>
          </div>

          <!-- Gender Field -->
          <div class="space-y-2">
            <label class="text-gray-700 font-medium">Gender</label>
            <div class="relative">
              <input
                type="text"
                :value="getGenderLabel(formData.gender)"
                readonly
                @click="showGenderDropdown = !showGenderDropdown"
                class="w-full bg-white border border-gray-300 text-gray-800 px-4       
py-3 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50
focus:border-cyan-500 transition-all cursor-pointer"
              />

              <!-- Dropdown Button -->
              <button
                type="button"
                @click="showGenderDropdown = !showGenderDropdown"
                class="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-2
bg-gray-100 hover:bg-cyan-500 hover:text-white border border-gray-300 rounded
transition-colors"
                title="Select gender"
              >
                <chevron-down v-if="!showGenderDropdown" class="w-4 h-4" />
                <chevron-up v-else class="w-4 h-4" />
              </button>

              <!-- Gender Dropdown -->
              <div
                v-if="showGenderDropdown"
                v-motion
                :initial="{ opacity: 0, y: -10 }"
                :enter="{ opacity: 1, y: 0 }"
                ref="genderDropdownRef"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-300       
rounded-lg shadow-lg overflow-hidden"
              >
                <button
                  v-for="option in genderOptions.slice(1)"
                  :key="option.value"
                  type="button"
                  @click="selectGender(option.value)"
                  class="w-full px-4 py-2 text-left hover:bg-cyan-50
transition-colors text-gray-800"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Bio Field -->
          <div class="space-y-2">
            <label class="text-gray-700 font-medium">Personal Bio</label>
            <div class="relative">
              <textarea
                v-model="formData.bio"
                placeholder="Tell us about yourself..."
                rows="4"
                maxlength="800"
                class="w-full bg-white border border-gray-300 text-gray-800 px-4       
py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50
focus:border-cyan-500 transition-all resize-none"
              />
              <span class="absolute right-4 bottom-3 text-gray-400 text-sm">
                {{ formData.bio.length }}/800
              </span>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="pt-4 border-t border-gray-200 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">User ID</span>
              <span class="text-gray-400">{{ user.id }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Registration Date</span>
              <span class="text-gray-400">{{ formatDate(user.created_at) }}</span>     
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Last Modified</span>
              <span class="text-gray-400">{{ formatDate(user.updated_at) }}</span>     
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 pt-6">
            <button
              type="submit"
              :disabled="!hasChanges || loading"
              class="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500
hover:from-cyan-600 hover:to-teal-600 text-white py-3 px-8 rounded-lg
transition-all shadow-lg hover:shadow-xl disabled:opacity-50
disabled:cursor-not-allowed font-medium"
            >
              <span v-if="loading">Saving...</span>
              <span v-else>Confirm Changes</span>
            </button>
            <button
              type="button"
              @click="resetForm"
              :disabled="!hasChanges || loading"
              class="px-8 py-3 border border-gray-300 text-gray-700
hover:bg-gray-50 rounded-lg transition-all disabled:opacity-50
disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="handleSignOut"
              class="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg       
transition-all"
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { getProfile, updateProfile } from '@/api/profile';
import { getCurrentUser } from '@/api/auth'
import { Camera, Plus, Minus } from '@element-plus/icons-vue'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-vue-next'

const userStore = useUserStore();
const router = useRouter();
const avatarInput = ref(null);
const loading = ref(false);
const loadingUserData = ref(true);

const showAgeDropdown = ref(false)
const showGenderDropdown = ref(false)
const ageDropdownRef = ref(null)
const genderDropdownRef = ref(null)

// 背景图片
const backgroundImage = '/images/auth-bg.png'

// 性别选项
const genderOptions = [
  { value: '', label: 'Please select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
]

// 状态变量
const hasError = ref(false);
const isDevelopment = ref(import.meta.env.MODE === 'development');
const uploading = ref(false);
const uploadProgress = ref(0);
const newAvatarFile = ref(null);

// 用户数据
const user = reactive({
  id: null,
  username: '',
  email: '',
  nickname: '',
  age: null,
  gender: '',
  bio: '',
  avatar_url: '',
  created_at: '',
  updated_at: ''
});

// 表单数据
const formData = reactive({
  nickname: '',
  age: null,
  gender: '',
  bio: ''
});

// 计算属性
const displayName = computed(() => {
  // console.log('displayName computed:', formData.nickname, user.username);
  return formData.nickname || user.username;
});

const hasChanges = computed(() => {
  return formData.nickname !== user.nickname ||
         formData.age !== user.age ||
         formData.bio !== user.bio ||
         !!newAvatarFile.value;
});

// hasNewAvatar 计算属性
const hasNewAvatar = computed(() => {
  return !!newAvatarFile.value;
});

// 在模板渲染前添加调试
console.log('Profile.vue 组件初始化完成');

// 触发头像上传
const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

// 处理头像上传
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB');
    return;
  }
  // 保存文件
  newAvatarFile.value = file;

  // 创建本地预览
  const reader = new FileReader();
  reader.onload = (e) => {
    user.avatar_url = e.target.result;
    ElMessage.success('头像已选择，点击保存更改以上传');  // 提示信息
  };
  reader.readAsDataURL(file);

  event.target.value = '';
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    nickname: user.nickname || '',
    age: user.age || null,
    gender: user.gender || '',
    bio: user.bio || ''
  });

  // 清空新头像文件
  newAvatarFile.value = null;
  if (avatarInput.value) {
    avatarInput.value.value = '';
  }

  // 恢复原始头像
  if (user.original_avatar_url) {
    user.avatar_url = user.original_avatar_url;
  }

};

// 提交表单
const handleSubmit = async () => {
  if (!hasChanges.value) return;

  try {
    loading.value = true;
    uploading.value = true;
    uploadProgress.value = 0;
    
    // 创建 FormData 对象
    const formDataToSend = new FormData();

    // 添加文本字段
    if (formData.nickname !== user.nickname) {
      formDataToSend.append('nickname', formData.nickname);
    }
    if (formData.age !== user.age) {
      formDataToSend.append('age', formData.age);
    }
    if (formData.gender !== user.gender) {
      formDataToSend.append('gender', formData.gender)
    }
    if (formData.bio !== user.bio) {
      formDataToSend.append('bio', formData.bio);
    }

    // 添加头像文件
    if (newAvatarFile.value) {
      formDataToSend.append('avatar', newAvatarFile.value);
    }

    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10;
      }
    }, 200);
    
    const response = await updateProfile(formDataToSend);
    
    console.log('更新响应:', response);

    clearInterval(progressInterval);
    uploadProgress.value = 100;
    
    // 由于 request 直接返回 data，这里直接使用 response.success
    if (response.success) {
      // 更新本地数据
      Object.assign(user, response.user);
      userStore.updateUserInfo(response.user);

      // 清空新头像文件
      newAvatarFile.value = null;
      if (avatarInput.value) {
        avatarInput.value.value = '';
      }

      ElMessage.success('个人资料更新成功！');
    } else {
      ElMessage.error(response.message || '更新失败');
    }
  } catch (error) {
    console.error('更新失败:', error);
    ElMessage.error('更新失败，请重试: ' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未获取';
  try {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return '日期格式错误';
  }
};

// 加载用户数据
const loadUserData = async () => {
  try {
    loadingUserData.value = true;
    console.log('开始获取用户资料...');
    
    const response = await getProfile();
    console.log('用户资料响应:', response);
    
    // 由于 request 直接返回 data，这里直接使用 response.success
    if (response.success) {
      const userData = response.user;
      console.log('用户数据:', userData);
      
      Object.assign(user, userData);
      resetForm();
      ElMessage.success('用户资料加载成功');
    } else {
      console.error('API 返回失败:', response);
      ElMessage.error(response.message || '获取用户资料失败');
    }
  } catch (error) {
    console.error('加载用户数据失败:', error);
    ElMessage.error('加载用户信息失败: ' + (error.response?.data?.message || error.message));
  } finally {
    loadingUserData.value = false;
    console.log('加载完成，loadingUserData:', loadingUserData.value);
  }
};

// 错误处理函数
const handleError = (error) => {
  console.error('Profile.vue 错误:', error);
  hasError.value = true;
};

// Age 操作方法
const incrementAge = () => {
  const currentAge = formData.age || 0
  if (currentAge < 120) {
    formData.age = currentAge + 1
  }
}

const decrementAge = () => {
  const currentAge = formData.age || 0
  if (currentAge > 1) {
    formData.age = currentAge - 1
  }
}

const selectAge = (age) => {
  formData.age = age
  showAgeDropdown.value = false
}

// 计算属性：年龄选项列表
const ageOptions = computed(() => {
  return Array.from({ length: 120 }, (_, i) => i + 1)
})

// Gender 操作方法
const selectGender = (gender) => {
  formData.gender = gender
  showGenderDropdown.value = false
}

const getGenderLabel = (value) => {
  const option = genderOptions.find(opt => opt.value === value)
  return option ? option.label : 'Please select gender'
}

// 处理点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  if (ageDropdownRef.value && !ageDropdownRef.value.contains(event.target)) {
    showAgeDropdown.value = false
  }
  if (genderDropdownRef.value && !genderDropdownRef.value.contains(event.target)) {    
    showGenderDropdown.value = false
  }
}

onMounted(() => {
  try {
    loadUserData();
  } catch (error) {
    handleError(error);
  }
  document.addEventListener('mousedown', handleClickOutside)
});

const navigateBack = () => {
    router.push('/chat')
}

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const handleSignOut = async () => {
  try {
    await ElMessageBox.confirm('Are you sure you want to sign out?', 'Confirm', {      
      confirmButtonText: 'Sign Out',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })

    userStore.logout()
    router.push('/login')
    ElMessage.success('Signed out successfully')
  } catch {
    // User cancelled
  }
}

</script>


<style scoped>
  .profile-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.5) transparent;
    margin-right: -16px;
    padding-right: 8px;
  }

  .profile-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .profile-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    margin: 8px 0;
  }

  .profile-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .profile-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.7);
  }

  /* 隐藏 number 输入框的原生箭头 (Chrome, Safari, Edge) */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* 隐藏 number 输入框的原生箭头 (Firefox) */
  input[type="number"] {
    -moz-appearance: textfield;
  }
  </style>