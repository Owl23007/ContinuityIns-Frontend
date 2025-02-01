<template>
    <div class="chat-container">
      <div class="chat-box">
        <div v-for="(message, index) in messages" :key="index" :class="{'user-message': message.user, 'ai-message': !message.user}">
          {{ message.text }}
        </div>
      </div>
      <div class="input-box">
        <input v-model="userInput" @keyup.enter="sendMessage" placeholder="输入消息..." />
        <button @click="sendMessage">发送</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import OpenAI from 'openai';
  
  const openai = new OpenAI({
    apiKey: 'sk-253fe62aad82496d88baba0c316d4754',
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    dangerouslyAllowBrowser: true
  });
  
  const messages = ref([]);
  const userInput = ref('');
  
  const sendMessage = async () => {
    if (userInput.value.trim() === '') return;
  
    // 添加用户消息到消息列表
    messages.value.push({ text: userInput.value, user: true });
  
    // 保存用户输入
    const userMessage = userInput.value;
    userInput.value = '';
  
    try {
      // 调用 OpenAI API
      const completion = await openai.chat.completions.create({
        model: "deepseek-r1",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userMessage }
        ],
      });
  
      // 添加 AI 回复到消息列表
      const aiMessage = completion.choices[0].message.content.trim();
      messages.value.push({ text: aiMessage, user: false });
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
    }
  };
  </script>
  
  <style scoped>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 600px;
    margin: 0 auto;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .chat-box {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }
  
  .input-box {
    display: flex;
    padding: 8px;
    border-top: 1px solid #ddd;
  }
  
  input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button {
    padding: 8px 16px;
    margin-left: 8px;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .user-message {
    text-align: right;
    margin: 8px 0;
  }
  
  .ai-message {
    text-align: left;
    margin: 8px 0;
  }
  </style>