const fs = require('fs');
const path = require('path');
const os = require('os');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 获取用户系统目录下的 .claude/settings.json 文件路径
function getUserSettingsPath() {
  return path.join(os.homedir(), '.claude', 'settings.json');
}

// 确保目录存在
function ensureDirectoryExists(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 读取用户设置
app.get('/api/settings', (req, res) => {
  try {
    const settingsPath = getUserSettingsPath();

    if (!fs.existsSync(settingsPath)) {
      // 如果文件不存在，返回空的对象
      return res.json({
        env: {},
        apiSettings: {
          timeout: 3000000,
          retryAttempts: 3,
          retryDelay: 1000
        }
      });
    }

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    res.json(settings);
  } catch (error) {
    console.error('读取设置失败:', error);
    res.status(500).json({ error: '读取设置失败' });
  }
});

// 更新用户设置
app.post('/api/settings', (req, res) => {
  try {
    const { env, apiSettings } = req.body;
    const settingsPath = getUserSettingsPath();

    // 确保目录存在
    ensureDirectoryExists(settingsPath);

    let currentSettings = {};
    if (fs.existsSync(settingsPath)) {
      currentSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }

    // 更新env和apiSettings字段，保留其他字段
    const updatedSettings = {
      ...currentSettings,
      env: env || {},
      apiSettings: apiSettings || {
        timeout: 3000000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    };

    fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2), 'utf8');
    res.json({ success: true, message: '设置保存成功' });
  } catch (error) {
    console.error('保存设置失败:', error);
    res.status(500).json({ error: '保存设置失败' });
  }
});

// 获取用户主目录路径（用于调试）
app.get('/api/user-home', (req, res) => {
  res.json({ homeDir: os.homedir(), settingsPath: getUserSettingsPath() });
});

app.listen(PORT, () => {
  console.log(`Settings API server running on http://localhost:${PORT}`);
  console.log(`Settings file path: ${getUserSettingsPath()}`);
});