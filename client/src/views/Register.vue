<template>
    <div class="register-container">
      <el-card class="register-card">
        <template #header>
          <div class="card-header">
            <h2>创建账号</h2>
          </div>
        </template>

        <el-form :model="registerForm" label-position="top">
          <el-form-item label="用户名">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item label="邮箱">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item label="密码">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（至少6位）"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item label="昵称（可选）">
            <el-input
              v-model="registerForm.nickname"
              placeholder="请输入昵称"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleRegister"
              style="width: 100%"
              :loading="loading"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>

        <div class="footer-text">
          已有账号？
          <router-link to="/login"
  class="link">立即登录</router-link>
        </div>
      </el-card>
    </div>
  </template>

  <script setup>
  import { reactive, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { User, Message, Lock } from '@element-plus/icons-vue';
  import { register } from '@/api/auth';

  const router = useRouter();

  const registerForm = reactive({
    username: '',
    email: '',
    password: '',
    nickname: ''
  });

  const loading = ref(false);

  const handleRegister = async () => {
    // 验证表单
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      ElMessage.warning('请填写必填项（用户名、邮箱、密码）');
      return;
    }

    if (registerForm.password.length < 6) {
      ElMessage.warning('密码至少需要6位');
      return;
    }

    loading.value = true;

    try {
      // 调用注册 API
      const response = await register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        nickname: registerForm.nickname || registerForm.username
      });

      if (response.success) {
        ElMessage.success('注册成功！请登录');

        // 跳转到登录页面
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } else {
        ElMessage.error(response.message || '注册失败');
      }
    } catch (error) {
      console.error('注册失败:', error);
      ElMessage.error(error.response?.data?.message || '注册失败，请重试');
    } finally {
      loading.value = false;
    }
  };
  </script>

  <style scoped>
  .register-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);     
  }

  .register-card {
    width: 420px;
  }

  .card-header h2 {
    margin: 0;
    text-align: center;
    color: #303133;
  }

  .footer-text {
    text-align: center;
    margin-top: 20px;
    color: #606266;
  }

  .link {
    color: #409eff;
    text-decoration: none;
  }

  .link:hover {
    text-decoration: underline;
  }
  </style>