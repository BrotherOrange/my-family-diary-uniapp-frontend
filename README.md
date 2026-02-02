# MyFamilyDiary

A WeChat Mini Program for family diary sharing, built with uni-app and Vue 3.

[中文文档](./README.zh-CN.md)

## Features

- User authentication via WeChat
- Family group management
- Diary posts and sharing
- Comments and interactions
- Media upload support

## Tech Stack

- **Framework**: uni-app + Vue 3 (Composition API)
- **Target Platform**: WeChat Mini Program
- **Styling**: SCSS
- **Backend**: Spring Boot 3.4.7 + Java 17

## Getting Started

### Prerequisites

- [HBuilderX](https://www.dcloud.io/hbuilderx.html) (Recommended IDE)
- [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- Node.js 16+

### Development

1. Clone the repository
   ```bash
   git clone https://github.com/BrotherOrange/my-family-diary-uniapp-frontend.git
   cd my-family-diary-uniapp-frontend
   ```

2. Open `MyFamilyDiary` folder in HBuilderX

3. Run to WeChat Mini Program Simulator
   - Menu: Run > Run to Mini Program Simulator > WeChat DevTools

Or use CLI:
```bash
cd MyFamilyDiary
npm install
npm run dev:mp-weixin
```

### Build for Production

```bash
npm run build:mp-weixin
```

## Project Structure

```
MyFamilyDiary/
├── api/             # API modules
├── pages/           # Page components
├── static/          # Static assets
├── utils/           # Utility functions
├── App.vue          # Root component
├── main.js          # App entry point
├── manifest.json    # App configuration
├── pages.json       # Routes and navigation
└── uni.scss         # Global SCSS variables
```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.
