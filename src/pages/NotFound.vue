<template>
    <div class="not-found-container">
      <div class="content">
        <!-- 动态404文字 -->
        <div class="error-code">
          <span>4</span>
          <div class="orbit">
            <div class="planet"></div>
          </div>
          <span>4</span>
        </div>
  
        <!-- 主要提示信息 -->
        <h1 class="title">页面迷失在数字宇宙中</h1>
        <p class="description">
          我们尝试联系这个页面，但它似乎正在进行深空旅行<br>
          或许你可以通过下面的导航返回安全区域
        </p>
  
        <!-- 交互按钮 -->
        <div class="actions">
          <router-link to="/" class="home-button">
            <span>返回地球（首页）</span>
            <svg viewBox="0 0 13 10" height="10px" width="15px">
              <path d="M1,5 L11,5"></path>
              <polyline points="8 1 12 5 8 9"></polyline>
            </svg>
          </router-link>
        </div>
  
        <!-- 星空装饰 -->
        <div class="stars">
          <div v-for="i in 50" :key="i" class="star" :style="starStyle(i)"></div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      starStyle(index) {
        return {
          '--size': Math.random() * 3 + 1 + 'px',
          '--x': Math.random() * 100 + '%',
          '--y': Math.random() * 100 + '%',
          '--delay': Math.random() * 2 + 's',
          '--duration': Math.random() * 3 + 2 + 's'
        };
      }
    }
  };
  </script>
  
  <style scoped>
  .not-found-container {
    min-height: 100vh;
    height: 100%;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: 'Helvetica Neue', sans-serif;
    position: relative;
    overflow: hidden;
  }
  
  .content {
    transform: translateY(-50px);
    text-align: center;
    padding: 2rem;
    position: relative;
    z-index: 1;
    margin-bottom: 2rem;
  }
  
  .error-code {
    font-size: 8rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
    color: rgba(255,255,255,0.9);
    text-shadow: 0 0 15px rgba(255,255,255,0.5);
  }
  
  .orbit {
    width: 120px;
    height: 120px;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    margin: 0 1rem;
    position: relative;
    animation: rotate 20s linear infinite;
  }
  
  .planet {
    width: 20px;
    height: 20px;
    background: #e94560;
    border-radius: 50%;
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: 0 0 15px #e94560;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .title {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #fff;
    line-height: 1.3;
  }
  
  .description {
    color: rgba(255,255,255,0.8);
    margin-bottom: 2rem;
    line-height: 1.6;
  }
  
  .home-button {
    /* 交互按钮 */
    /*在最上层*/
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    padding: 1rem 2rem;
    background: #e94560;
    color: white;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .home-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(233, 69, 96, 0.4);
  }
  
  .home-button svg {
    margin-left: 0.8rem;
    stroke: white;
    width: 20px;
    height: 20px;
  }
  
  .home-button path, .home-button polyline {
    stroke-width: 2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  
  .stars {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  
  .star {
    position: absolute;
    width: var(--size);
    height: var(--size);
    background: rgba(255,255,255,0.8);
    border-radius: 50%;
    top: var(--y);
    left: var(--x);
    animation: twinkle var(--duration) var(--delay) infinite;
  }
  
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
  
  @media (max-width: 768px) {
    .error-code {
      font-size: 5rem;
    }
    
    .orbit {
      width: 80px;
      height: 80px;
      margin: 0 0.5rem;
    }
    
    .title {
      font-size: 1.4rem;
    }
  }
  </style>