<template>
    <div class="article-upload">
      <!-- 封面图片裁剪 -->
      <div class="cropper-area">
        <input type="file" accept="image/*" @change="handleFileChange" />
        <vue-cropper
          v-if="imageSrc"
          ref="cropper"
          :src="imageSrc"
          :aspect-ratio="16/9"
          preview=".preview"
        ></vue-cropper>
        
        <!-- 预览 -->
        <div class="preview"></div>
        <button @click="cropImage" v-if="imageSrc">裁剪完成</button>
      </div>
  
      <!-- 文章表单 -->
      <form @submit.prevent="submitArticle">
        <div class="form-group">
          <label>标题</label>
          <input v-model="articleForm.title" required />
        </div>
  
        <div class="form-group">
          <label>内容</label>
          <textarea 
            v-model="articleForm.content"
            required
            rows="10"
          ></textarea>
        </div>
  
        <button type="submit">发布文章</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import VueCropper from 'vue-cropper'
  import axios from 'axios'
  import { uploadArticle_post } from '@/api/article'
  
  const imageFile = ref(null)
  const imageSrc = ref('')
  const cropper = ref(null)
  
  // 表单数据
  const articleForm = ref({
    title: '',
    content: '',
    coverImage: null
  })
  
  // 处理文件选择
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      imageFile.value = file
      imageSrc.value = URL.createObjectURL(file)
    }
  }
  
  // 执行裁剪
  const cropImage = async () => {
    const cropFile = await fetch(cropper.value.getCroppedCanvas().toDataURL())
      .then(res => res.blob())
      .then(blob => new File([blob], imageFile.value.name, 
        { type: imageFile.value.type }))
  
    // 如果项目变大,可将这里的上传逻辑替换为OSS上传
    const formData = new FormData()
    formData.append('file', cropFile)
    
    const { data } = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    articleForm.value.coverImage = data.url
  }
  
  // 修改后的提交文章逻辑：获取 token 并传入正确的参数
  const submitArticle = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        return;
      }
      const { title, content, coverImage } = articleForm.value;
      if (!coverImage) {
        articleForm.value.coverImage = 'https://img.yourdomain.com/default.jpg';
      }
      await uploadArticle_post(token, title, content, coverImage, 'PUBLISHED');
      alert('文章发布成功!');
      resetForm();
    } catch (error) {
      console.error('提交失败:', error);
      alert('发布失败，请重试');
    }
  }
  
  const resetForm = () => {
    articleForm.value = { title: '', content: '', coverImage: null }
    imageSrc.value = ''
  }
  </script>
  
  <style scoped>
  .article-upload {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #ffffff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 30px auto;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  input, textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s;
  }
  
  input:focus, textarea:focus {
    border-color: #0066cc;
    outline: none;
  }
  
  .cropper-area {
    margin-bottom: 2rem;
    border: 1px dashed #aaa;
    border-radius: 4px;
    padding: 15px;
  }
  
  .preview {
    width: 200px;
    height: 112.5px;
    overflow: hidden;
    margin-top: 10px;
  }

  button {
    padding: 10px 20px;
    background-color: #007acc;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  button:hover {
    background-color: #005fa3;
  }
  </style>
