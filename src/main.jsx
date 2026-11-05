/**
 * 浏览器端启动入口。
 *
 * 负责挂载 React 根节点、安装诊断日志捕获，并在生产环境注册
 * Service Worker。BASE_URL 来自 Vite 配置，GitHub Pages 项目部署
 * 在仓库子路径下，因此注册地址和 scope 都必须使用 BASE_URL。
 * 不要在这里初始化或重置玩家存档；存档生命周期由 save.js 管理。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { installConsoleWarningCapture } from '@/lib/logger'

installConsoleWarningCapture()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    }).catch((error) => {
      console.error('Service worker registration failed:', error)
    })
  })
}
