# Plog 手写字体

手写几十个字，生成专属手写字体，用于给照片添加文案。

## 功能

- **手写采集**：在手机浏览器上逐字手写样本（30 个汉字 + 英文字母）
- **AI 字体生成**：后端分析笔迹风格，生成完整字符集并打包为 TTF 字体
- **照片编辑器**：上传照片，用手写字体添加文案，导出图片
- **字体下载**：下载 TTF 文件安装到系统，在 Canva/PS 等工具中使用

## 本地运行

### 前端

```bash
cd frontend
npm install
npm run dev
```

浏览器打开 http://localhost:5173

### 后端

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 部署

### 前端（Cloudflare Pages）

1. 将项目推送到 GitHub
2. 在 [Cloudflare Pages](https://pages.cloudflare.com) 连接仓库
3. 构建命令：`cd frontend && npm install && npm run build`
4. 输出目录：`frontend/dist`
5. 设置环境变量 `VITE_API_URL` 指向后端地址

### 后端（魔搭 ModelScope Spaces）

1. 注册 [魔搭社区](https://modelscope.cn) 账号
2. 创建新 Space，选择 FastAPI 模板
3. 将 `backend/` 目录内容上传
4. Space 会自动安装 `requirements.txt` 并启动

## 技术栈

- **前端**：React 18 + Vite + React Router
- **后端**：Python FastAPI + fonttools + Pillow
- **字体生成**：笔迹向量化 → TTF 打包
