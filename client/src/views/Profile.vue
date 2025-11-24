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
        <!-- 头像区域 -->
        <div class="avatar-section">
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
  console.log('displayName computed:', formData.nickname, user.username);
  return formData.nickname || user.username;
});

const hasChanges = computed(() => {
  return formData.nickname !== user.nickname ||
         formData.age !== user.age ||
         formData.bio !== user.bio;
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

  // 创建本地预览
  const reader = new FileReader();
  reader.onload = (e) => {
    user.avatar_url = e.target.result;
    ElMessage.success('头像已更新（演示功能）');
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
};

// 提交表单
const handleSubmit = async () => {
  if (!hasChanges.value) return;

  try {
    loading.value = true;
    
    const updateData = {};
    if (formData.nickname !== user.nickname) updateData.nickname = formData.nickname;
    if (formData.age !== user.age) updateData.age = formData.age;
    if (formData.bio !== user.bio) updateData.bio = formData.bio;

    console.log('发送更新请求:', updateData);
    
    const response = await updateProfile(updateData);
    
    console.log('更新响应:', response);
    
    // 注意：由于 request 直接返回 data，这里直接使用 response.success
    if (response.success) {
      // 更新本地数据
      Object.assign(user, response.user);
      userStore.updateUserInfo(response.user);
      ElMessage.success('个人资料更新成功！');
    } else {
      ElMessage.error(response.message || '更新失败');
    }
  } catch (error) {
    console.error('更新失败:', error);
    ElMessage.error('更新失败，请重试: ' + (error.response?.data?.message || error.message));
  } finally {
    loading.value = false;
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
    
    // 注意：由于 request 直接返回 data，这里直接使用 response.success
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

onMounted(() => {
  loadUserData();
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
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.avatar-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  margin: 0 auto 16px;
  border: 4px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s;
}

.avatar-wrapper:hover {
  border-color: #409eff;
  transform: scale(1.05);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
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
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
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

/* 表单项目保持默认的左右分布，但内容左对齐 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }
  
  .profile-form {
    padding: 20px;
  }
  
  .avatar-section {
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


