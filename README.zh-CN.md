# MyFamilyDiary 家庭日记

一个基于 uni-app 和 Vue 3 开发的家庭日记微信小程序。

[English](./README.md)

## 功能特性

- 微信授权登录
- 家庭群组管理
- 日记发布与分享
- 评论互动
- 媒体文件上传

## 技术栈

- **前端框架**: uni-app + Vue 3 (Composition API)
- **目标平台**: 微信小程序
- **样式**: SCSS
- **后端**: Spring Boot 3.4.7 + Java 17

## 快速开始

### 环境要求

- [HBuilderX](https://www.dcloud.io/hbuilderx.html) (推荐 IDE)
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- Node.js 16+

### 开发调试

1. 克隆仓库
   ```bash
   git clone https://github.com/BrotherOrange/my-family-diary-uniapp-frontend.git
   cd my-family-diary-uniapp-frontend
   ```

2. 使用 HBuilderX 打开 `MyFamilyDiary` 文件夹

3. 运行到微信小程序模拟器
   - 菜单：运行 > 运行到小程序模拟器 > 微信开发者工具

或使用命令行：
```bash
cd MyFamilyDiary
npm install
npm run dev:mp-weixin
```

### 生产构建

```bash
npm run build:mp-weixin
```

## 项目结构

```
MyFamilyDiary/
├── api/             # API 接口模块
├── pages/           # 页面组件
├── static/          # 静态资源
├── utils/           # 工具函数
├── App.vue          # 根组件
├── main.js          # 应用入口
├── manifest.json    # 应用配置
├── pages.json       # 路由和导航配置
└── uni.scss         # 全局 SCSS 变量
```

## 开源协议

本项目基于 Apache License 2.0 开源协议 - 查看 [LICENSE](./LICENSE) 文件了解详情。
