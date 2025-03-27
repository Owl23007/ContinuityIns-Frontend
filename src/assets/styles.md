# 存续院配色方案

## 主题色系

### 浅色主题
```css
:root {
  /* 主要颜色 */
  --primary-color: #2c3e50;     /* 深蓝灰 - 主要文字和重要元素 */
  --secondary-color: #3498db;   /* 亮蓝色 - 交互元素和强调 */
  --accent-color: #e74c3c;      /* 红色 - 重要提示和警告 */
  
  /* 背景色系 */
  --background-color: #ffffff;   /* 纯白 - 主背景 */
  --surface-color: #f8f9fa;     /* 浅灰 - 次要背景 */
  --hover-bg: #f0f2f5;          /* 浅灰蓝 - 悬浮背景 */
  
  /* 文字颜色 */
  --text-primary: #2c3e50;      /* 主要文字 */
  --text-secondary: #606f7b;    /* 次要文字 */
  --text-muted: #8795a1;        /* 淡化文字 */
  
  /* 功能色 */
  --success-color: #2ecc71;     /* 成功提示 */
  --warning-color: #f1c40f;     /* 警告提示 */
  --error-color: #e74c3c;       /* 错误提示 */
  --info-color: #3498db;        /* 信息提示 */
  
  /* 边框和阴影 */
  --border-color: #e0e0e0;
  --shadow-color: rgba(0, 0, 0, 0.15);
  
  /* 透明度 */
  --header-bg-alpha: 0.9;
}
```

### 深色主题
```css
[data-theme="dark"] {
  /* 主要颜色 */
  --primary-color: #ecf0f1;     /* 浅灰白 - 主要文字 */
  --secondary-color: #3498db;   /* 亮蓝色保持不变 */
  --accent-color: #e74c3c;      /* 红色保持不变 */
  
  /* 背景色系 */
  --background-color: #1a202c;  /* 深灰蓝 - 主背景 */
  --surface-color: #2d3748;     /* 中灰蓝 - 次要背景 */
  --hover-bg: #364153;          /* 亮灰蓝 - 悬浮背景 */
  
  /* 文字颜色 */
  --text-primary: #ecf0f1;      /* 主要文字 */
  --text-secondary: #a0aec0;    /* 次要文字 */
  --text-muted: #718096;        /* 淡化文字 */
  
  /* 边框和阴影 */
  --border-color: #4a5568;
  --shadow-color: rgba(255, 255, 255, 0.1);
}
```

## 使用指南

1. 主要文字和重要元素使用 `--primary-color`
2. 交互元素（按钮、链接）使用 `--secondary-color`
3. 重要提示和警告使用 `--accent-color`
4. 背景层次：
   - 主背景使用 `--background-color`
   - 卡片、模块背景使用 `--surface-color`
   - 悬浮状态使用 `--hover-bg`
5. 文字层次：
   - 标题和重要文字使用 `--text-primary`
   - 正文使用 `--text-secondary`
   - 辅助文字使用 `--text-muted`

## 响应式断点

```css
/* 桌面端大屏 */
@media (min-width: 1280px) {
  :root {
    --container-width: 1200px;
  }
}

/* 桌面端 */
@media (max-width: 1279px) {
  :root {
    --container-width: 960px;
  }
}

/* 平板端 */
@media (max-width: 768px) {
  :root {
    --container-width: 100%;
    --padding-x: 1.5rem;
  }
}

/* 手机端 */
@media (max-width: 480px) {
  :root {
    --padding-x: 1rem;
  }
}
```