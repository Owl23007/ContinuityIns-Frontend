#!js
<template>
  <div class="settings-container">
    <div class="settings-header">
      <h1>账号设置</h1>
      <div class="settings-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="{ active: activeTab === tab.id }"
          class="tab-button"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <div class="settings-content">
      <!-- 账号安全设置 -->
      <div v-if="activeTab === 'security'" class="settings-section">
        <h2>账号安全</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>修改密码</h3>
            <p>定期更换密码可以提高账号安全性</p>
          </div>
          <button @click="showPasswordModal = true" class="action-button">
            修改密码
          </button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>邮箱验证</h3>
            <p>{{ user.emailVerified ? "已验证" : "未验证" }}</p>
          </div>
          <button
            v-if="!user.emailVerified"
            @click="sendVerificationEmail"
            class="action-button"
          >
            验证邮箱
          </button>
        </div>
      </div>

      <!-- 通知设置 -->
      <div v-if="activeTab === 'notifications'" class="settings-section">
        <h2>通知设置</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>站内消息</h3>
            <p>接收新消息、回复等通知</p>
          </div>
          <el-switch v-model="notificationSettings.messages" />
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>邮件通知</h3>
            <p>接收重要的邮件通知</p>
          </div>
          <el-switch v-model="notificationSettings.email" />
        </div>
      </div>

      <!-- 隐私设置 -->
      <div v-if="activeTab === 'privacy'" class="settings-section">
        <h2>隐私设置</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>个人主页可见性</h3>
            <p>控制其他用户是否能够查看您的个人主页</p>
          </div>
          <el-select v-model="privacySettings.profileVisibility">
            <el-option label="所有人可见" value="public" />
            <el-option label="仅关注者可见" value="followers" />
            <el-option label="仅自己可见" value="private" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 密码修改模态框 -->
    <el-dialog
      v-model="showPasswordModal"
      title="修改密码"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form
        :model="passwordForm"
        :rules="passwordRules"
        ref="passwordFormRef"
      >
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            show-password
            placeholder="请输入当前密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPasswordModal = false">取消</el-button>
          <el-button type="primary" @click="handleChangePassword">
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useAuthStore } from "@/stores/auth";
import { ElMessage } from "element-plus";

const authStore = useAuthStore();
const user = ref(authStore.user);

// 标签页配置
const tabs = [
  { id: "security", name: "账号安全" },
  { id: "notifications", name: "通知设置" },
  { id: "privacy", name: "隐私设置" },
];
const activeTab = ref("security");

// 通知设置
const notificationSettings = reactive({
  messages: true,
  email: true,
});

// 隐私设置
const privacySettings = reactive({
  profileVisibility: "public",
});

// 密码修改相关
const showPasswordModal = ref(false);
const passwordFormRef = ref(null);
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordRules = {
  currentPassword: [
    { required: true, message: "请输入当前密码", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 8, message: "密码长度不能少于8个字符", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;

  try {
    await passwordFormRef.value.validate();
    // TODO: 调用修改密码API
    ElMessage.success("密码修改成功");
    showPasswordModal.value = false;
  } catch (error) {
    console.error("密码修改失败:", error);
  }
};

// 发送验证邮件
const sendVerificationEmail = async () => {
  try {
    // TODO: 调用发送验证邮件API
    ElMessage.success("验证邮件已发送，请查收");
  } catch (error) {
    ElMessage.error("验证邮件发送失败，请稍后重试");
  }
};
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-nav {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.tab-button.active {
  background: var(--el-color-primary);
  color: white;
}

.settings-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-info h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--el-text-color-primary);
}

.setting-info p {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
}

.action-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--el-border-color);
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}
</style>
