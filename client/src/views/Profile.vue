<template>
  <div class="profile-page">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h2>个人资料</h2>
          <p class="subtitle">管理您的账户信息</p>
        </div>
      </template>

      <div class="profile-content">
        <!-- 错误边界 -->
        <div v-if="hasError" class="error-boundary">
          <el-alert
            title="页面加载失败"
            type="error"
            description="个人资料页面加载时出现错误，请刷新页面重试"
            show-icon
            :closable="false"
          />
        </div>

        <!-- 调试信息 -->
        <!--
        <div class="debug-info" v-if="isDevelopment">
          <el-alert
            title="调试信息"
            type="info"
            :description="`用户ID: ${user.id}, 用户名: ${user.username}`"
            show-icon
            :closable="true"
          />
        </div>
        -->
        

        <!-- 头像区域 -->
        <div class="avatar-section">
          <!-- 在头像区域内部添加上传进度显示 -->
          <div v-if="uploading" class="upload-progress">
            <el-progress :percentage="uploadProgress" :show-text="false" />
            <p>上传中... {{ uploadProgress }}%</p>
          </div>

          <div class="avatar-container">
            <div class="avatar-upload" @click="triggerAvatarUpload">
              <el-avatar 
                :size="120" 
                :src="user.avatar_url" 
                fit="cover"
                class="avatar"
              >
                {{ displayName?.charAt(0)?.toUpperCase() || 'U' }}
              </el-avatar>
              <div class="avatar-overlay">
                <el-icon><Camera /></el-icon>
                <span>更换头像</span>
              </div>
            </div>
            <input 
              ref="avatarInput"
              type="file" 
              accept="image/jpeg,image/png,image/gif"
              @change="handleAvatarUpload"
              style="display: none;"
            />
          </div>
          <p class="upload-tip">支持 JPG、PNG 格式，大小不超过 5MB</p>
        </div>

        <!-- 基本信息表单 -->
        <el-form 
          :model="formData" 
          label-width="100px" 
          class="profile-form"
          @submit.prevent="handleSubmit"
        >
          <el-form-item label="用户名">
            <el-input 
              v-model="user.username" 
              disabled 
              placeholder="用户名"
            >
              <template #append>
                <el-tag type="info" size="small">不可修改</el-tag>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="邮箱地址">
            <el-input 
              v-model="user.email" 
              disabled 
              placeholder="邮箱地址"
            >
              <template #append>
                <el-tag type="info" size="small">不可修改</el-tag>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="昵称">
            <el-input 
              v-model="formData.nickname" 
              placeholder="请输入昵称"
              maxlength="50"
              show-word-limit
              clearable
            />
          </el-form-item>

          <el-form-item label="年龄">
            <el-input-number 
              v-model="formData.age" 
              :min="1" 
              :max="150" 
              placeholder="请输入年龄"
              controls-position="right"
            />
          </el-form-item>

          <el-form-item label="个人简介">
            <el-input
              v-model="formData.bio"
              type="textarea"
              :rows="3"
              placeholder="介绍一下自己..."
              maxlength="500"
              show-word-limit
              resize="none"
            />
          </el-form-item>

          <el-divider content-position="left">系统信息</el-divider>

          <el-form-item label="用户ID">
            <div class="readonly-field">{{ user.id || '-' }}</div>
          </el-form-item>

          <el-form-item label="注册时间">
            <div class="readonly-field">{{ formatDate(user.created_at) }}</div>
          </el-form-item>

          <el-form-item label="最后更新">
            <div class="readonly-field">{{ formatDate(user.updated_at) }}</div>
          </el-form-item>

          <el-form-item class="form-actions">
            <el-button 
              type="primary" 
              @click="handleSubmit"
              :loading="loading"
              :disabled="!hasChanges"
            >
              <el-icon><Check /></el-icon>
              保存更改
            </el-button>
            <el-button 
              @click="resetForm"
              :disabled="!hasChanges || loading"
            >
              <el-icon><Close /></el-icon>
              取消
            </el-button>
            <el-button 
              type="text" 
              @click="$router.back()"
            >
              返回
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Camera } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { getProfile, updateProfile } from '@/api/profile';

const userStore = useUserStore();
const avatarInput = ref(null);
const loading = ref(false);
const loadingUserData = ref(true);

// 新增的状态变量
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
  bio: '',
  avatar_url: '',
  created_at: '',
  updated_at: ''
});

// 表单数据
const formData = reactive({
  nickname: '',
  age: null,
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

// 添加：hasNewAvatar 计算属性
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
    bio: user.bio || ''
  });

  // 清空新头像文件
  newAvatarFile.value = null;
  if (avatarInput.value) {
    avatarInput.value.value = '';
  }

  // 添加：恢复原始头像
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

onMounted(() => {
  try {
    loadUserData();
  } catch (error) {
    handleError(error);
  }
});
</script>


<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
}

.centered-layout {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-boundary {
  width: 100%;
  max-width: 600px;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
  width: 100%;
}

.profile-header h1 {
  color: #303133;
  font-size: 28px;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.profile-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.loading-state {
  width: 100%;
  text-align: center;
  padding: 40px 0;
}

.loading-text {
  margin-top: 10px;
  color: #909399;
}

.debug-info {
  width: 100%;
  margin-bottom: 20px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-container {
  display: inline-block;
  margin-bottom: 12px;
}

/* 头像上传区域样式 */
.avatar-upload {
  position: relative;
  display: inline-block;
  cursor: pointer;
  border-radius: 50%;
  width: 120px; /* 与头像大小一致 */
  height: 120px; /* 与头像大小一致 */
  overflow: hidden; /* 确保圆形边界 */
}

.avatar {
  width: 100%;
  height: 100%;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.avatar-overlay span {
  font-size: 12px;
}

.avatar-tip {
  color: #909399;
  font-size: 12px;
  margin: 0;
}

.profile-form {
  width: 100%;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 表单项目保持默认的左右分布，内容左对齐 */
:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
  text-align: left;
}

/* 标准输入框样式 - 统一大小 */
.standard-input :deep(.el-input__inner) {
  width: 100%;
  text-align: left;
}

.standard-textarea :deep(.el-textarea__inner) {
  width: 100%;
  text-align: left;
  resize: none;
}

/* 年龄输入框特殊样式 */
.age-input :deep(.el-input__inner) {
  width: 120px; /* 年龄输入框较小 */
  text-align: left;
}

.system-info {
  width: 100%;
  margin: 30px 0 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.system-title {
  color: #303133;
  font-size: 18px;
  margin: 0 0 20px 0;
  font-weight: 600;
  text-align: left;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
}

.info-value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  width: 100%;
}

.form-actions .el-button {
  margin: 0 8px;
  min-width: 100px;
}

/* 上传进度样式 */
.upload-tip {
  margin: 0;
  color: #909399;
  font-size: 12px;
}

.upload-progress {
  margin-top: 12px;
  text-align: center;
}

.upload-progress p {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }
  
  .profile-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .form-actions .el-button {
    width: 100%;
    margin: 0;
  }
  
  /* 在移动端，年龄输入框也使用全宽 */
  .age-input :deep(.el-input__inner) {
    width: 100%;
  }
}
</style>


