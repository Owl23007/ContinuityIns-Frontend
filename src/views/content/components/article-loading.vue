<template>
  <div class="loading-state">
    <div class="spinner-container">
      <div class="spinner"></div>
      <div class="spinner-text">加载中...</div>
    </div>
    <div class="loading-placeholder">
      <div class="placeholder-sidebar"></div>
      <div class="placeholder-content">
        <div class="placeholder-title"></div>
        <div class="placeholder-line"></div>
        <div class="placeholder-line"></div>
        <div class="placeholder-line"></div>
        <div class="placeholder-line short"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(24, 144, 255, 0.1);
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.spinner-text {
  color: #1890ff;
  font-weight: 500;
  font-size: 1.1rem;
}

.loading-placeholder {
  display: flex;
  width: 100%;
  gap: 2rem;
  opacity: 0.6;
}

.placeholder-sidebar {
  flex: 0 0 290px;
  height: 400px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%);
  border-radius: 16px;
}

.placeholder-content {
  flex: 1;
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
}

.placeholder-title {
  width: 70%;
  height: 2.5rem;
  background: #f0f7ff;
  margin-bottom: 2rem;
  border-radius: 4px;
}

.placeholder-line {
  height: 1.2rem;
  background: #f0f7ff;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.placeholder-line.short {
  width: 80%;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .loading-placeholder {
    flex-direction: column;
  }

  .placeholder-sidebar {
    flex: 0 0 150px;
  }
}

@media (max-width: 600px) {
  .placeholder-sidebar {
    display: none;
  }
}
</style>
