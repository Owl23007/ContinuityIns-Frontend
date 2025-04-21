<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>关于我们</h4>
        <p>存续院致力于提供优质内容与交流平台</p>
        <div class="social-links">
          <a
            href="https://github.com/Owl23007"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            class="social-link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
              ></path>
            </svg>
          </a>
        </div>
      </div>
      <div class="footer-section">
        <h4>联系方式</h4>
        <p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="vertical-align: middle; margin-right: 8px"
          >
            <path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
            ></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <a href="mailto:mailofowlwork@gmail.com" class="contact-link"
            >mailofowlwork@gmail.com</a
          >
        </p>
      </div>
      <div class="footer-section">
        <h4>快速链接</h4>
        <ul>
          <li><router-link to="/about">关于</router-link></li>
          <li><router-link to="/policy">隐私政策</router-link></li>
          <li><router-link to="/terms">使用条款</router-link></li>
          <li><router-link to="/feedback">意见反馈</router-link></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} 存续院. 保留所有权利.</p>
      <p class="icp-info">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          >鄂ICP备2024073383号-1</a
        >
      </p>
    </div>
  </footer>
</template>

<script setup>
// 无状态组件
</script>

<style scoped>
.footer {
  background-color: white;
  z-index: 10;
  color: var(--text-secondary);
  padding: 3rem 1rem 1rem;
  margin-top: auto;
  width: 100%;
  box-shadow: 0 -1px 3px var(--shadow-color);
}

.footer-content {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  max-width: var(--container-width);
  margin: 0 auto;
  gap: 2rem;
}

.footer-section {
  flex: 1;
  min-width: 250px;
  padding: 0 1rem;
}

.footer-section h4 {
  color: var(--text-primary);
  margin-bottom: 1.2rem;
  font-weight: 600;
  font-size: 1.1rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.footer-section h4::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 2rem;
  height: 2px;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.footer-section:hover h4::after {
  width: 3rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 0.8rem;
  transition: transform 0.2s ease;
}

.footer-section ul li:hover {
  transform: translateX(5px);
}

.footer-section a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-section a:hover {
  color: var(--primary-color);
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--hover-bg);
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--primary-color);
  color: #ffffff;
  transform: translateY(-3px);
}

.social-link:hover svg {
  stroke: #ffffff;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  margin-top: 2rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.icp-info {
  margin-top: 0.5rem;
}

.icp-info a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.icp-info a:hover {
  color: var(--primary-color);
}

.contact-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
}

.contact-link:hover {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .footer {
    padding: 2rem 1rem 1rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 1.5rem;
  }

  .footer-section {
    min-width: 100%;
    padding: 0;
    text-align: center;
  }

  .footer-section h4::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .social-links {
    justify-content: center;
  }

  .footer-section ul li:hover {
    transform: none;
  }
}
</style>
