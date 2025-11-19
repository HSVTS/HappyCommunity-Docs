import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "HappyCommunity Backend Docs",
  description: "“幸福小区”后端文档",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '技术实现介绍', link: '/Technology/' },
      { text: 'API文档', link: '/API/' },
      { text: '常见问题', link: '/FAQ' }
    ],

    sidebar: {
      "/API/": [
        {
          text: "API文档",
          items: [
            { text: "完整的API文档", link: "/API/" },
            { text: "支付网关API文档", link: "/API/Payment" },
          ],
        },
      ],
      "/Technology/": [
        {
          text: "技术介绍",
          items: [
            { text: "首页", link: "/Technology/" },
            { text: "支付网关技术实现", link:"/Technology/Payment" },
            { text: "数据库结构说明", link:"/Technology/Database" }
        ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/HSVTS/HappyCommunity-Backend' }
    ],

    search: {
      provider: "local",
    },

    footer: {
      message: 'A project of Heshan Vocational Technical School',
      copyright: 'Copyright © 2025 Heshan Vocational Technical School'
    },
  }
})
