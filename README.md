# 🔴 PokéDexter (宝可梦图鉴探测器) ⚡

<p align="center">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="PokéDexter" width="160" />
</p>

<p align="center">
  <strong>基于 AI 视觉识别与 Web Audio 的沉浸式关都经典宝可梦图鉴机</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/AI_Vision-DeepSeek%20%7C%20Gemini-FF6F00" alt="AI Vision" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## 📖 项目简介 (Introduction)

**PokéDexter** 是一个在现代移动端及桌面浏览器上完美复刻初代关都地区（Kanto）经典实体宝可梦图鉴机的 Web 应用。

只需打开手机摄像头对准身边的宝可梦公仔、玩偶、手办或卡片，点击「开始扫描」，内置的 AI 多模态视觉模型即可瞬时识别目标宝可梦，触发经典的 **“我是谁？！ (Who's that Pokémon?)”** 剪影悬念过场、华丽金粉揭晓音效、经典 360° 旋转光芒背景，以及全语音图鉴解说与打字机字幕！

---

## ✨ 核心特性 (Features)

### 📸 1. 实时 AI 视觉探测 (AI Vision Scanner)
- **多模型支持**：支持自主切换 **DeepSeek** 与 **Google Gemini**（如 `gemini-2.5-flash`）。
- **极速低延迟**：优化提示词工程与推理 Token 边界，平均 1~2 秒内精准识别出对应宝可梦。
- **纯客户端隐私安全**：API Key 仅安全存储于本地浏览器的 `localStorage` 中，绝不经由第三方服务器中转。

### 🎭 2. 经典动画过场与揭晓 (Anime Reveal Experience)
- **悬念剪影（Who's that Pokémon?）**：识别成功后自动播放经典黑影悬念过场与倒计时，支持点击提前揭秘。
- **华丽揭晓与金粉礼花**：搭配专属 Fanfare 胜利号角与五彩粒子礼花（`canvas-confetti`）。
- **360° 无缝旋转光芒条纹**：致密无间歇的双色交替条纹，还原童年电视动画原版质感。
- **专属属性动态光环**：根据电、火、水、草等不同属性动态渲染霓虹光环与旋转轨道环。

### 🔊 3. 拟真机身音效与语音解说 (Audio & TTS)
- **Web Audio 纯合成音效**：雷达锁定、快门咔哒、按钮 3D 机械按压感、胜利揭晓号角等全套合成音效。
- **中文语音图鉴解说**：集成 Web Speech API（TTS），在揭晓时自动以宝可梦图鉴播音员声调播报属性、分类与官方生态解说。
- **打字机同步字幕**：字幕逐字滚动，支持点击屏幕任意位置快速跳过，并配备一键「🔊 重播」按钮。

### 📟 4. 极致拟物化实体机身 (Retro Physical Chassis)
- **经典大蓝宝石指示镜头**：探测中呼吸脉冲闪烁，解说播音时伴随音频波动光芒。
- **红黄绿三色状态 LED 指示灯**：根据识别状态交替流转闪烁。
- **CRT 怀旧显像管荧幕**：内嵌复古微扫描线条纹与反光边框。
- **沉浸式触感反馈**：调用移动端 Web Vibration API，带来真实的实体按键震动回馈。

### 📚 5. 关都 151 全图鉴库 (151 Pokédex Book)
- 完整内置第一世代（No.001 妙蛙种子 ~ No.151 梦幻）的官方中文名、属性、身高级别、重量与详细官方图鉴文本。
- 支持按名称、编号、属性实时搜索筛选，点击任意图鉴条目可直接进入大屏解说详情页。

### 📱 6. 移动端极佳体验 & 局域网调试 (Mobile First & LAN)
- 适配 iPhone 与主流 Android 机型（`100dvh` 满屏贴合、安全区 Safe Area 适配）。
- 开箱即用支持本地 HTTPS 自签名证书，解决手机浏览器调用相机所需的 WebRTC 权限限制。
- 内置「手机连接」二维码与局域网 IP 直连向导，方便同一 Wi-Fi 下快速扫码上机体验。

---

## 🛠️ 技术栈 (Tech Stack)

| 领域 | 技术方案 | 说明 |
| :--- | :--- | :--- |
| **前端框架** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | 最新 React 19 特性与强类型支持 |
| **构建工具** | [Vite 8](https://vite.dev/) + [@tailwindcss/vite](https://tailwindcss.com/) | 极速秒级 HMR 与 Tailwind CSS v4 引擎 |
| **视觉模型** | DeepSeek API / Google Gemini API | 多模态图像识别能力 |
| **图形与特效** | Tailwind CSS v4 + Canvas-Confetti | 纯 CSS 动画（旋转光芒、雷达脉冲）与五彩纸屑 |
| **音频方案** | Web Audio API + Web Speech Synthesis (TTS) | 纯前端合成物理机身音效与语音讲解 |
| **图标库** | [Lucide React](https://lucide.dev/) | 现代化极简矢量图标 |

---

## 🚀 快速上手 (Getting Started)

### 1. 克隆项目并安装依赖

确保您的开发环境安装了 **Node.js 18+**：

```bash
# 克隆代码库
git clone https://github.com/amsun10/pokedexter.git
cd pokedexter

# 安装依赖
npm install
```

### 2. 启动本地开发服务

```bash
npm run dev
```

运行后控制台将输出本地 HTTPS 地址：
```text
  ➜  Local:   https://localhost:5173/
  ➜  Network: https://192.168.x.x:5173/
```

> 💡 **提示**：项目通过 `@vitejs/plugin-basic-ssl` 启用了本地自签名 HTTPS。初次访问时浏览器若提示“您的连接不是私密连接”，点击「高级」并选择「继续前往」即可正常授予摄像头权限。

### 3. 在手机上体验（局域网共享）
1. 确保手机和电脑连接在**同一个 Wi-Fi** 下。
2. 在电脑端点击右上角的 **「📱 手机」** 按钮，屏幕上将展示局域网 IP 与扫码指南。
3. 用手机浏览器打开对应的 `https://<局域网IP>:5173` 即可开始探测！

### 4. 配置 AI 识别 Key
点击右上角「📱 手机」或在初次点击「开始扫描」时弹出的设置窗口中输入您的密钥：
- **DeepSeek Key**：输入您的 DeepSeek API Key（支持 `deepseek-chat` 多模态）。
- **Gemini Key**：输入您的 Google Gemini API Key（支持 `gemini-2.5-flash`）。
- 密钥仅保存在本地设备浏览器中，绝不会上传泄露。

---

## 📦 项目构建与部署 (Build & Deploy)

### 打包生产构建产物

```bash
npm run build
```

打包后的静态资源将输出在 `dist/` 目录中。

### 本地预览构建产物

```bash
npm run preview
```

### 推荐部署平台
- **Vercel** / **Cloudflare Pages** / **Netlify**：直接连接 GitHub 仓库一键导入，构建命令选择 `npm run build`，输出目录填写 `dist` 即可自动开启动态 HTTPS 部署。
- **GitHub Pages**：由于 `vite.config.ts` 中配置了 `base: './'`，可直接将 `dist/` 推送到 `gh-pages` 分支托管。

---

## 📂 项目结构 (Project Structure)

```text
pocketmon-detector/
├── public/                  # 静态公共资源
├── scripts/                 # 辅助脚本与基准测试
│   ├── benchmark-detector.ts # 探测器精度与延迟 Benchmark 脚本
│   └── gen_pokemon.js       # 151 宝可梦数据生成器
├── src/
│   ├── assets/              # 图标与静态图片资源
│   ├── components/          # UI 业务组件
│   │   ├── CameraScanner.tsx        # 摄像头取景器与雷达扫描线
│   │   ├── LANModal.tsx             # 手机局域网连接与 API Key 设置弹窗
│   │   ├── PokedexBook.tsx          # 151 全图鉴查询与筛选浏览
│   │   ├── PokedexChassis.tsx       # 经典关都图鉴实体红壳与顶底控制栏
│   │   ├── QuickToyBar.tsx          # 快捷测试道具栏（方便免摄像头测试）
│   │   ├── ScanAnalyzingOverlay.tsx # 图像冻结与 AI 识别分析中动态遮罩
│   │   ├── ScanNotFound.tsx         # 扫描未匹配/错误兜底提示卡
│   │   └── WhosThatPokemon.tsx      # “我是谁？！”剪影悬念与终极大屏展示
│   ├── data/
│   │   └── pokemonList.ts           # 关都初代 151 宝可梦完整官方中日文数据
│   ├── services/
│   │   ├── detector.ts              # DeepSeek & Gemini 双引擎 AI 视觉接口
│   │   └── soundEffects.ts          # Web Audio 纯合成音效与 TTS 中文朗读
│   ├── types/
│   │   └── pokemon.ts               # TypeScript 核心类型定义
│   ├── App.tsx                      # 根容器与状态桥接
│   ├── index.css                    # 实体图鉴样式、CRT 扫描线与动画
│   └── main.tsx                     # React 入口
├── package.json
├── tsconfig.json
└── vite.config.ts                   # Vite 8 配置（HTTPS、Tailwind CSS v4）
```

---

## 常见问题 (FAQ)

<details>
<summary><strong>Q: 手机浏览器打不开摄像头怎么办？</strong></summary>

1. 浏览器对摄像头权限有强制安全限制，仅允许在 `localhost` 或 **HTTPS** 协议下访问摄像头。请确保通过 `https://` 开头的地址访问。
2. 首次进入网页时，系统会弹出摄像头权限请求，请务必点击「允许」。
3. 在 iOS Safari 上，如果提示权限被拒，请在系统「设置 -> Safari -> 相机」中确认为「允许」或「询问」。
</details>

<details>
<summary><strong>Q: 为什么识别后没有声音？</strong></summary>

大多数现代移动端浏览器（尤其是 iOS Safari）禁止未经用户交互直接自动播放声音。首次进入页面请先轻触任意按钮（例如点击「开始扫描」），系统即会自动解锁音频上下文与语音合成引擎。
</details>

<details>
<summary><strong>Q: 如何添加更多的宝可梦（如城都、丰缘等新世代）？</strong></summary>

在 `src/data/pokemonList.ts` 中按照现有的 `Pokemon` 接口标准扩展数组数据，并在 `src/services/detector.ts` 的模型 Prompt 中扩展识别编号范围即可。
</details>

---

## 📄 开源许可 (License)

本项目采用 [MIT License](LICENSE) 开源许可协议。

*Pokémon 以及宝可梦角色名称和设计均为 Nintendo / Creatures Inc. / GAME FREAK inc. 的注册商标。本项目仅供个人学习、技术研究与爱好者交流使用，非商业用途。*
