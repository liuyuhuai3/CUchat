 <template>
    <div class="login-container">
      <el-card class="login-card">
        <template #header>
          <div class="card-header">
            <h2>欢迎登录</h2>
          </div>
        </template>

        <el-form :model="loginForm" label-position="top">
          <el-form-item label="邮箱">
            <el-input
              v-model="loginForm.email"
              placeholder="请输入邮箱"
              prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item label="密码">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="handleLogin"
              style="width: 100%"
              :loading="loading"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <el-divider>或</el-divider>

        <el-button 
          @click="handleGoogleLogin"
          style="width: 100%"
          :loading="googleLoading">
          <el-icon><Connection /></el-icon>
          <span style="margin-left: 8px">使用Google登录</span>
        </el-button>

        <div class="footer-text">
          还没有账号？
          <router-link to="/register"
  class="link">立即注册</router-link>
        </div>
      </el-card>
    </div>
  </template>

  <script setup>
  import { reactive, ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { Connection, Message, Lock } from '@element-plus/icons-vue';
  import { useUserStore } from '@/stores/user';
  import { login, getCurrentUser } from '@/api/auth';
import { el } from 'element-plus/es/locale/index.mjs';

  const router = useRouter();
  const userStore = useUserStore();

  const loginForm = reactive({
    email: '',
    password: ''
  });

  const loading = ref(false);
  const googleLoading = ref(false);

  // 检查 URL 参数，处理 OAuth 回调结果
  onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    
    if (authStatus === 'success' && token) {
      // 保存 token
      userStore.setToken(token);
      console.log('✅ Google 登录成功，Token 已保存');
      // 提示成功消息
      ElMessage.success('Google 登录成功！');

      // 获取用户信息
      fetchUserInfo();

      // 清除 URL 参数
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error === 'auth_failed') {
      // 提示错误消息
      ElMessage.error('Google 登录失败，请重试');
    } else if (error === 'token_generation_failed') {
      ElMessage.error('Token生成失败，请联系管理员');
    }
  });

  const fetchUserInfo = async () => {
    try {
      const userResponse = await getCurrentUser();
      if (userResponse.success) {
        userStore.setUser(userResponse.user);
        console.log('✅ 用户信息已保存:', userResponse.user);
        router.push('/chat');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const handleLogin = async () => {
    // 验证表单
    if (!loginForm.email || !loginForm.password) {
      ElMessage.warning('请输入邮箱和密码');
      return;
    }

    loading.value = true;

    try {
      // 调用登录 API
      const response = await login({
        email: loginForm.email,
        password: loginForm.password
      });

      if (response.success) {
        // 保存 token
        userStore.setToken(response.token);

        // 获取用户信息
        const userResponse = await getCurrentUser();
        if (userResponse.success) {
          userStore.setUser(userResponse.user);
          console.log('✅ 用户信息已保存:', userResponse.user);
        }

        ElMessage.success('登录成功！');
        router.push('/chat');

        // 跳转到聊天页面
        router.push('/chat');
      } else {
        ElMessage.error(response.message || '登录失败');
      }
    } catch (error) {
      console.error('登录失败:', error);
      ElMessage.error(error.response?.data?.message || '登录失败，请重试');
    } finally {
      loading.value = false;
    }
  };

  const handleGoogleLogin = () => {
    googleLoading.value = true;
    console.log('🔗 跳转到 Google 认证...');

    // 直接跳转到后端的 Google OAuth2 认证路由
    window.location.href = 'http://localhost:3000/api/auth/google';

    // 3秒后重置加载状态，防止按钮一直显示加载
    setTimeout(() => {
      googleLoading.value = false;
    }, 3000);
  };
  </script>

  <style scoped>
  .login-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);     
  }

  .login-card {
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