<template>
    <div class="profile-page">
      <h1>个人资料</h1>
      <form @submit.prevent="updateProfile">
        <!-- TODO: 添加头像上传 -->
        <input type="file" accept="image/*" />

        <input v-model="nickname" placeholder="昵称（文本）" />
        <input v-model="age" type="number" placeholder="年龄（数字）" />
        <textarea v-model="bio" placeholder="个人简介"></textarea>

        <button type="submit">保存</button>
      </form>
    </div>
  </template>

  <script setup>
  import { ref } from 'vue';

  const nickname = ref('');
  const age = ref(0);
  const bio = ref('');

  const updateProfile = () => {
    // TODO: 实现更新资料
    console.log('更新资料');
  };
  </script>