# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MyFamilyDiary** is a WeChat Mini Program built with uni-app and Vue 3. The app provides family diary features including user authentication, family management, posts, and comments.

## Tech Stack

- **Frontend**: uni-app + Vue 3
- **Target Platform**: WeChat Mini Program (primary)
- **Backend**: Spring Boot 3.4.7 + Java 17 (located at `D:\my-family-diary\my-family-diary-backend\`)

## Development Commands

This project uses HBuilderX as the primary IDE:

- **Run Mini Program**: Run > Run to Mini Program Simulator > WeChat DevTools
- **Run H5 for debugging**: Run > Run to Browser
- **Build for release**: Release > Mini Program - WeChat

CLI alternative:
```bash
npm run dev:mp-weixin    # Development
npm run build:mp-weixin  # Production build
```

## Project Structure

```
MyFamilyDiary/
├── pages/           # Page components (organized by feature)
├── static/          # Static assets (images, fonts)
├── App.vue          # Root component (onLaunch/onShow/onHide lifecycle)
├── main.js          # App entry point
├── manifest.json    # App config (appid, permissions, platform settings)
├── pages.json       # Route config and navigation bar settings
└── uni.scss         # Global SCSS variables
```

## Backend Integration

### Architecture
The backend follows Clean Architecture with DDD:
- **API Layer**: REST controllers, DTOs
- **Domain Layer**: Business entities, repository interfaces
- **Infrastructure Layer**: MyBatis Plus DAOs, repository implementations

### How to Work with Backend
1. Check backend code at `D:\my-family-diary\my-family-diary-backend\` for available APIs
2. API base path: `/family/diary/api/v1`
3. Authentication: JWT token in `Authorization: Bearer <token>` header
4. Request tracing: Include `x-trace-id` header for log correlation

### Key Backend Modules
- `api/src/main/java/.../controller/` - REST endpoints
- `api/src/main/java/.../dto/` - Request/Response objects
- `domain/src/main/java/.../entity/` - Business models

## uni-app Development

### Documentation-First Principle

**Always consult uni-app official documentation before starting any feature development** to ensure the most appropriate uni-app implementation approach:

1. **Search docs first**: Use MCP tool to search official documentation
   ```
   mcp__uni-doc__search-docs-by-Uniapp-official
   ```
2. **Prefer uni-app built-in capabilities**: Use uni-app's components, APIs, and lifecycle hooks instead of native Web or third-party alternatives
3. **Check cross-platform compatibility**: Pay attention to API platform support when reading docs
4. **Follow best practices**: Example code in documentation represents recommended patterns

### Code Style

- **Vue 3 Composition API**: Use `<script setup>` syntax
- **Styling**: Use `<style lang="scss" scoped>`
- **Lifecycle hooks**: Import from `@dcloudio/uni-app` (e.g., `onLoad`, `onShow`)
- **Reactivity**: Use `ref()` / `reactive()` / `computed()`

### Conditional Compilation
Use platform-specific code blocks:
```js
// #ifdef MP-WEIXIN
// WeChat Mini Program only
// #endif
```

### Units
- Use `rpx` for responsive sizing (750rpx = screen width)
- Use `px` for fixed sizes

### Global SCSS Variables
Available without import (defined in `uni.scss`):
- Colors: `$uni-color-primary`, `$uni-color-success`, `$uni-color-warning`, `$uni-color-error`
- Text: `$uni-text-color`, `$uni-font-size-base`
- Spacing: `$uni-spacing-row-base`, `$uni-spacing-col-base`

## WeChat Mini Program Config

- **AppID**: wxe9cbbdc12d01a55d (in manifest.json)
- **DevTools**: URL check disabled (`urlCheck: false`)
