<template>
    <div class="relative min-h-screen w-full overflow-hidden">
      <!-- 背景图片 + 模糊效果 -->
      <div
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${backgroundImage})` }"
      >
        <div class="absolute inset-0 backdrop-blur-md bg-black/20"></div>
      </div>

      <!-- 内容区域 -->
      <div class="relative z-10 min-h-screen flex flex-col items-center
  justify-center p-4">
        <!-- Logo 和标题 -->
        <div class="mb-12">
          <h1 class="text-white text-center mb-2 text-6xl font-light tracking-wider">    
            CUChat
          </h1>
          <p class="text-white/80 text-center text-xl font-light">
            {{ isLogin ? 'Sign in' : 'Sign Up' }}
          </p>
        </div>

        <!-- 表单区域 -->
        <div class="w-full max-w-md">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- 邮箱输入 -->
            <AuthInput
              v-if="isLogin"
              v-model="loginForm.email"
              type="text"
              placeholder="Email or Username"
              :icon="UserIcon"
              required
            />
            <AuthInput
              v-else
              v-model="registerForm.email"
              type="email"
              placeholder="Email"
              :icon="MailIcon"
              required
            />

            <!-- 用户名（仅注册时显示） -->
            <AuthInput
              v-if="!isLogin"
              v-model="registerForm.username"
              type="text"
              placeholder="Username"
              :icon="UserIcon"
              required
            />

            <!-- 密码输入 -->
            <AuthInput
              v-if="isLogin"
              v-model="loginForm.password"
              type="password"
              placeholder="Password"
              :icon="LockIcon"
              required
            />
            <AuthInput
              v-else
              v-model="registerForm.password"
              type="password"
              placeholder="Password (at least 6 characters)"
              :icon="LockIcon"
              required
            />

            <!-- 提交按钮 -->
            <AuthButton
              type="submit"
              variant="primary"
              :loading="loading"
            >
              {{ isLogin ? 'Login' : 'Sign Up' }}
            </AuthButton>

            <!-- 分割线 -->
            <div class="relative my-8">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-white/30"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="px-4 bg-transparent text-white/70">OR</span>
              </div>
            </div>

            <!-- Google OAuth 按钮 -->
            <AuthButton
              type="button"
              variant="secondary"
              :loading="googleLoading"
              @click="handleGoogleLogin"
            >
              <div class="flex items-center justify-center gap-3">
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56
  12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21
  3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98
  7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86
  0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84
  14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1        
  12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21
  1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6     
  3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </div>
            </AuthButton>
          </form>

          <!-- 切换登录/注册 -->
          <div class="text-center mt-8">
            <p class="text-white/80">
              {{ isLogin ? "Don't have an account yet? " : "Already have an account?" }}
              <button
                @click="toggleMode"
                class="text-white hover:underline transition-all font-medium"
              >
                {{ isLogin ? 'Sign Up' : 'Sign in' }}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { reactive, ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { User as UserIcon, Message as MailIcon, Lock as LockIcon } from
  '@element-plus/icons-vue'
  import { useUserStore } from '@/stores/user'
  import { login, register, getCurrentUser } from '@/api/auth'
  import AuthInput from '@/components/ui/AuthInput.vue'
  import AuthButton from '@/components/ui/AuthButton.vue'

  const router = useRouter()
  const userStore = useUserStore()

  // 背景图片
  const backgroundImage = '/images/auth-bg.png'

  // 登录/注册模式切换
  const isLogin = ref(true)

  // 登录表单
  const loginForm = reactive({
    email: '',
    password: ''
  })

  // 注册表单
  const registerForm = reactive({
    username: '',
    email: '',
    password: ''
  })

  const loading = ref(false)
  const googleLoading = ref(false)

  // 切换登录/注册模式
  const toggleMode = () => {
    isLogin.value = !isLogin.value
    loginForm.email = ''
    loginForm.password = ''
    registerForm.username = ''
    registerForm.email = ''
    registerForm.password = ''
  }

  // 处理表单提交
  const handleSubmit = async () => {
    if (isLogin.value) {
      await handleLogin()
    } else {
      await handleRegister()
    }
  }

  // 登录逻辑
  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      ElMessage.warning('Please enter email and password')
      return
    }

    loading.value = true

    try {
      const response = await login({
        email: loginForm.email,
        password: loginForm.password
      })

      if (response.success) {
        userStore.setToken(response.token)
        const userResponse = await getCurrentUser()
        if (userResponse.success) {
          userStore.setUser(userResponse.user)
        }
        ElMessage.success('Login successful!')
        router.push('/chat')
      } else {
        ElMessage.error(response.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login failed:', error)
      ElMessage.error(error.response?.data?.message || 'Login failed, please try again')
    } finally {
      loading.value = false
    }
  }

  // 注册逻辑
  const handleRegister = async () => {
    if (!registerForm.username || !registerForm.email || !registerForm.password) {       
      ElMessage.warning('Please fill in all required fields')
      return
    }

    if (registerForm.password.length < 6) {
      ElMessage.warning('Password must be at least 6 characters')
      return
    }

    loading.value = true

    try {
      const response = await register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        nickname: registerForm.username
      })

      if (response.success) {
        ElMessage.success('Registration successful! Please login')
        isLogin.value = true
        loginForm.email = registerForm.email
        registerForm.username = ''
        registerForm.email = ''
        registerForm.password = ''
      } else {
        ElMessage.error(response.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration failed:', error)
      ElMessage.error(error.response?.data?.message || 'Registration failed, please try again')
    } finally {
      loading.value = false
    }
  }

  // Google OAuth 登录
  const handleGoogleLogin = () => {
    googleLoading.value = true
    window.location.href = 'http://localhost:3000/api/auth/google'
    setTimeout(() => {
      googleLoading.value = false
    }, 3000)
  }

  // 处理 OAuth 回调
  const fetchUserInfo = async () => {
    try {
      const userResponse = await getCurrentUser()
      if (userResponse.success) {
        userStore.setUser(userResponse.user)
        router.push('/chat')
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
    }
  }

  onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const authStatus = urlParams.get('auth')
    const token = urlParams.get('token')
    const error = urlParams.get('error')

    if (authStatus === 'success' && token) {
      userStore.setToken(token)
      ElMessage.success('Google login successful!')
      fetchUserInfo()
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (error === 'auth_failed') {
      ElMessage.error('Google login failed, please try again')
    } else if (error === 'token_generation_failed') {
      ElMessage.error('Token generation failed, please contact administrator')
    }
  })
  </script>