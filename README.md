# 存续院项目前端安装指南

## 🚀 系统要求

- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- Git

## 📥 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/your-username/ContinuityIns.git
cd ContinuityIns/FrontEnd
```

### 2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 3. 环境配置

在项目根目录创建以下环境配置文件：

**.env.development**

```env
VITE_API_BASE_URL=http://localhost:8080 // 开发后端API 地址
```

**.env.production**

```env
VITE_API_BASE_URL=http://your-api-domain.com // 部署后端API 地址
```

### 4. 启动开发服务器

```bash
# 使用 npm
npm run dev

# 或使用 yarn
yarn dev
```

### 5. 构建生产版本

```bash
# 使用 npm
npm run build

# 或使用 yarn
yarn build
```

## 📁 项目结构

```
FrontEnd/
├── src/
│   ├── api/          # API 接口
│   ├── assets/       # 静态资源
│   ├── components/   # 通用组件
│   ├── router/       # 路由配置
│   ├── store/        # 状态管理
│   ├── views/        # 页面组件
│   └── App.vue       # 根组件
├── public/           # 公共资源
└── package.json      # 项目配置
```

## 🔧 配置说明

### API 配置

在 http.js 中可配置 API 请求基础设置：

```javascript
export const baseConfig = {
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
}
```

### 路由配置

在 index.js 中配置路由规则：

```javascript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  // ...其他路由
]
```

## 🚨 注意事项

1. 确保 Node.js 版本满足要求
2. 本地开发时需正确配置 API 地址
3. 提交代码前运行测试和代码检查：
   ```bash
   npm run lint
   npm run test
   ```

## 🆘 常见问题

### 1. 安装依赖失败

```bash
# 清理 npm 缓存
npm cache clean --force
# 重新安装
npm install
```

### 2. 开发服务器启动失败

- 检查端口占用情况
- 确认环境变量配置正确

## 📞 技术支持

如遇问题，请：

1. 查看项目 Wiki
2. 提交 Issue
3. 联系技术支持团队

## 📝 许可证

MIT License

---

祝您开发愉快！🎉
