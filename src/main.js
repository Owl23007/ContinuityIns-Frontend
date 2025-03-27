import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { useAuthStore } from './stores/auth'
// Import other dependencies...

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(ElementPlus)
// Use other plugins...

// Initialize auth state
const authStore = useAuthStore()
await authStore.initializeAuth()

app.mount('#app')