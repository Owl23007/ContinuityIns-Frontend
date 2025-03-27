<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>关于我们</h4>
        <p>存续院致力于提供优质内容与交流平台</p>
      </div>
      <div class="footer-section">
        <h4>联系方式</h4>
        <p>邮箱: contact@example.com</p>
      </div>
      <div class="footer-section">
        <h4>快速链接</h4>
        <ul>
          <li><router-link to="/about">关于</router-link></li>
          <li><router-link to="/policy">隐私政策</router-link></li>
          <li><router-link to="/terms">使用条款</router-link></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} 存续院. 保留所有权利.</p>
    </div>
  </footer>
</template>

<script setup>
// 无状态组件
</script>

<style scoped>
.footer {
  background-color: #f8f9fa;
  padding: 30px 0 10px;
  margin-top: 40px;
}

.footer-content {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-section {
  flex: 1;
  min-width: 200px;
  padding: 0 20px;
  margin-bottom: 20px;
}

.footer-section h4 {
  margin-bottom: 15px;
  font-weight: 600;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 8px;
}

.footer-section a {
  color: #495057;
  text-decoration: none;
}

.footer-section a:hover {
  text-decoration: underline;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  margin-top: 20px;
}
</style>
