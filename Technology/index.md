# 技术实现介绍
在本章中，我们将向你介绍“幸福小区”的后端全实现细节，以便您进行二次开发。

## 🛠 技术栈

### 后端框架
- **Flask** - 轻量级Web框架
- **Flask-SQLAlchemy** - ORM数据库操作
- **Flask-JWT-Extended** - JWT身份认证
- **Flask-CORS** - 跨域请求支持

### 数据库
- **MySQL** - 主数据库
- **Redis** - 缓存和会话存储（可选）

### 其他依赖
- **bcrypt** - 密码加密
- **PyMySQL** - MySQL驱动
- **Pillow** - 图像处理（可选）
- **python-dotenv** - 环境变量管理

## 📁 项目结构

```
幸福小区APP-Backend/
├── app/
│   ├── __init__.py              # 应用工厂
│   ├── models/                  # 数据模型
│   │   ├── __init__.py
│   │   ├── user.py              # 用户模型
│   │   ├── announcement.py      # 公告模型
│   │   ├── bill.py              # 账单模型
│   │   ├── repair.py            # 报修模型
│   │   ├── access.py            # 门禁模型
│   │   ├── community.py         # 社区模型
│   │   ├── device.py            # 设备模型
│   │   ├── file.py              # 文件模型
│   │   └── system.py            # 系统模型
│   ├── routes/                  # 路由模块
│   │   ├── __init__.py
│   │   ├── auth.py              # 认证路由
│   │   ├── users.py             # 用户路由
│   │   ├── owners.py            # 业主路由
│   │   ├── announcements.py     # 公告路由
│   │   ├── bills.py             # 账单路由
│   │   ├── repairs.py           # 报修路由
│   │   ├── access.py            # 门禁路由
│   │   ├── community.py         # 社区路由
│   │   ├── devices.py           # 设备路由
│   │   ├── upload.py            # 文件上传
│   │   ├── statistics.py        # 数据统计
│   │   ├── payment.py           # 支付网关
│   │   └── system.py            # 系统管理
│   └── utils/                   # 工具函数
│       └── __init__.py
├── config.py                    # 配置文件
├── requirements.txt             # 依赖列表
├── run.py                       # 启动脚本
├── wsgi.py                      # WSGI入口
└── README.md                    # 项目说明
```