 <template>
    <div class="giphy-picker">
      <!-- 搜索框 -->
      <el-input
        v-model="searchQuery"
        placeholder="搜索 GIF/Sticker..."
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <!-- Sticker 网格 -->
      <div class="sticker-grid">
        <div
          v-for="gif in gifs"
          :key="gif.id"
          class="sticker-item"
          @click="selectGif(gif)"
        >
          <img :src="gif.images.fixed_height_small.url" :alt="gif.title"      
  />
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { ref } from 'vue'
  import { GiphyFetch } from '@giphy/js-fetch-api'
  import { Search, Loading } from '@element-plus/icons-vue'

  const emit = defineEmits(['select-gif'])

  // 替换为你的 Giphy API Key
  const gf = new GiphyFetch('YMcP0rQRM1m02d6pIkstKVHN8wfGuzQb')

  const searchQuery = ref('')
  const gifs = ref([])
  const loading = ref(false)

  // 初始加载热门 Stickers
  const loadTrendingStickers = async () => {
    loading.value = true
    try {
      const { data } = await gf.trending({ limit: 20, type: 'stickers' })     
      gifs.value = data
    } catch (error) {
      console.error('加载 Giphy 失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 搜索 Stickers
  let searchTimeout = null
  const handleSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      if (!searchQuery.value.trim()) {
        loadTrendingStickers()
        return
      }

      loading.value = true
      try {
        const { data } = await gf.search(searchQuery.value, {
          limit: 20,
          type: 'stickers'
        })
        gifs.value = data
      } catch (error) {
        console.error('搜索失败:', error)
      } finally {
        loading.value = false
      }
    }, 500) // 防抖 500ms
  }

  // 选择 GIF
  const selectGif = (gif) => {
    emit('select-gif', {
      url: gif.images.original.url,
      name: gif.title || 'sticker',
      width: gif.images.original.width,
      height: gif.images.original.height
    })
  }

  // 组件加载时获取热门 Stickers
  loadTrendingStickers()
  </script>

  <style scoped>
  .giphy-picker {
    width: 100%;
    max-width: 400px;
    height: 400px;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 8px;
    padding: 15px;
  }

  .el-input {
    margin-bottom: 15px;
  }

  .sticker-grid {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    overflow-y: auto;
    padding: 5px;
  }

  .sticker-item {
    cursor: pointer;
    border-radius: 6px;
    overflow: hidden;
    transition: transform 0.2s;
    background: #f5f7fa;
  }

  .sticker-item:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .sticker-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .loading {
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    font-size: 24px;
    color: #409eff;
  }
  </style>