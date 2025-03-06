# EngineerLab

EngineerLab 是一个本地聊天工具，使用 Ollama 的 deepseek-coder:1.5b 模型进行对话。

## 前置要求

1. Node.js 18+ 和 npm
2. Python 3.8+
3. Ollama（已安装并运行 deepseek-coder:1.5b 模型）

## 安装步骤

### 前端设置

1. 安装依赖：
```bash
npm install
```

2. 运行开发服务器：
```bash
npm run dev
```

### 后端设置

1. 进入服务器目录：
```bash
cd server
```

2. 创建虚拟环境（推荐）：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. 安装依赖：
```bash
pip install -r requirements.txt
```

4. 运行服务器：
```bash
uvicorn main:app --reload
```

## 使用说明

1. 确保 Ollama 服务正在运行，并且已经下载了 deepseek-coder:1.5b 模型
2. 打开浏览器访问 http://localhost:3000
3. 创建新的对话或选择现有对话
4. 开始聊天！

## 功能特点

- 支持多个对话会话
- 可自定义对话名称
- 实时对话响应
- 简洁现代的用户界面 