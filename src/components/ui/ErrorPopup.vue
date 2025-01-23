
<template>
    <div class="error-popup-overlay" v-if="visible">
      <div class="error-popup">
        <div class="popup-header">
          <h3>提示信息</h3>
          <button class="close-icon" @click="handleClose">&times;</button>
        </div>
        <div class="popup-content">
          <p>{{ message }}</p>
        </div>
        <div class="popup-actions">
          <button class="confirm-button" @click="handleClose">确定</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      message: {
        type: String,
        required: true
      },
      visible: {
        type: Boolean,
        default: false
      }
    },
    emits: ['close'],
    methods: {
      handleClose() {
        this.$emit('close')
      }
    }
  }
  </script>
  
  <style scoped>
  .error-popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .error-popup {
    background: white;
    border-radius: 8px;
    width: 320px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  }
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
  }
  
  .popup-header h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
  }
  
  .close-icon {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0 8px;
  }
  
  .popup-content {
    padding: 20px 16px;
    color: #666;
  }
  
  .popup-actions {
    padding: 12px 16px;
    text-align: right;
    border-top: 1px solid #eee;
  }
  
  .confirm-button {
    padding: 8px 16px;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .confirm-button:hover {
    background: #38a169;
  }
  </style>