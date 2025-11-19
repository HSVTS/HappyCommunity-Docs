# 快速开始

跟随以下步骤，开始部署“幸福小区”后端。

## ⚙️ 安装与运行

### 环境要求
- Python 3.8+
- MySQL 5.7+
- Redis（可选）

### 1. 克隆项目
```bash
git clone https://github.com/HSVTS/HappyCommunity-Backend.git
cd HappyCommunity-Backend
```

### 2. 创建虚拟环境
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. 安装依赖
```bash
pip install -r requirements.txt
```

### 4. 数据库配置
如果你有需要，您可以按照以下SQL语句来创建MySQL数据库
```sql
CREATE DATABASE happy_community CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
创建好数据库并配置连接后，第一次运行后端会自动访问MySQL数据库并建表

### 5. 环境配置
复制环境配置文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接等信息：
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=happy_community

# JWT配置
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# 文件上传配置
UPLOAD_FOLDER=uploads

# Redis配置（可选）
REDIS_URL=redis://localhost:6379/0
```

### 6. 启动服务
```bash
python run.py
```

**注意，默认使用 `python run.py` 运行是通过 Flask 的开发模式运行，如果你的后端是在Linux下运行，请使用生产级WSGI运行（本项目使用Waitress）**

```bash
waitress-serve --listen=0.0.0.0:5000 wsgi:app
```

服务启动后，访问：http://127.0.0.1:5000