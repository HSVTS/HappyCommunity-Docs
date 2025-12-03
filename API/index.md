# 幸福小区APP RESTful API 文档

## 📋 文档概述

**基础信息**

- **基础URL**: `http://api.happy-community.com/api/v1`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

**通用响应格式**

```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

**通用错误码**

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 🔐 认证授权

### 1. 用户登录

```http
POST /auth/login
Content-Type: application/json
```

**请求参数**

```json
{
  "phone": "13800138000",
  "password": "password123"
}
```

**响应数据**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "phone": "13800138000",
      "real_name": "张三",
      "role": "owner",
      "avatar_url": "/static/images/avatar/1.jpg"
    }
  }
}
```

### 2. 获取用户信息

```http
GET /auth/me
Authorization: Bearer {token}
```

### 3. 刷新Token

```http
POST /auth/refresh
Authorization: Bearer {token}
```

### 4. 修改密码

```http
PUT /auth/password
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "old_password": "oldPassword123",
  "new_password": "newPassword123"
}

**默认物业账号**

- 系统在首次创建数据库表时会自动创建一个默认的物业端账号：`phone=admin`，`password=admin`。
- 建议上线环境通过环境变量或迁移脚本修改默认凭据并尽快更改默认密码以保证安全。
```

---

## 👤 用户管理

### 1. 用户注册（已禁用）

系统已禁用用户自助注册接口。所有业主账号应由物业端或管理员通过受权限保护的接口创建。

如需创建业主账号，请使用 `POST /owners`（见业主管理节）由拥有 `property` 或 `admin` 角色的账号发起。

### 2. 更新用户信息

```http
PUT /users/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "real_name": "张三",
  "id_card": "110101199001011234"
}
```

### 3. 上传头像

```http
POST /users/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

---

## 🏠 业主管理

### 1. 获取业主信息

```http
GET /owners/me
Authorization: Bearer {token}
```

### 2. 更新业主信息

```http
PUT /owners/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "building": "1",
  "unit": "2",
  "room": "301",
  "area": 89.5,
  "owner_type": "owner"
}
```

权限说明：

- `building`、`unit`、`room`、`community_name`、`owner_type` 这类地址/房间相关字段 **仅允许** 具有 `property` 或 `admin` 角色的账号修改（即物业端或管理员）。
- 业主本人仅允许修改非受限字段，例如 `area`（面积）和 `move_in_date`（入住日期）。
- 如果业主尝试修改受限字段，接口会返回 HTTP 403（权限不足）。

示例：物业端修改地址信息

```http
PUT /owners/123
Authorization: Bearer {property_token}
Content-Type: application/json
```

```json
{
  "building": "2",
  "unit": "1",
  "room": "201"
}
```

示例：业主修改非受限字段

```http
PUT /owners/123
Authorization: Bearer {owner_token}
Content-Type: application/json
```

```json
{
  "area": 95.0,
  "move_in_date": "2024-05-01"
}
```

### 2.1 创建业主账号（物业/管理员）

```http
POST /owners
Authorization: Bearer {token}  // 需要 property 或 admin 角色
Content-Type: application/json
```

请求示例：

```json
{
  "phone": "13800138001",
  "password": "InitialPass123",
  "real_name": "李四",
  "id_card": "110101199001019999",
  "building": "1",
  "unit": "2",
  "room": "101"
}
```

成功响应（HTTP 200）：

```json
{
  "code": 200,
  "message": "创建业主账号成功",
  "data": {
    "user": { /* user.to_dict() */ },
    "owner": { /* owner.to_dict() */ }
  }
}
```

### 3. 业主列表（物业端）

```http
GET /owners
Authorization: Bearer {token}
Query: page=1&page_size=20&building=1&status=1
```

---

## 📢 公告管理

### 1. 获取公告列表

```http
GET /announcements
Authorization: Bearer {token}
Query: page=1&page_size=10&type=notice&priority=2
```

### 2. 获取公告详情

```http
GET /announcements/{id}
Authorization: Bearer {token}
```

### 3. 创建公告（物业端）

```http
POST /announcements
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "title": "停水通知",
  "content": "因管道维修，明天上午停水2小时...",
  "type": "notice",
  "priority": 2,
  "expire_at": "2024-01-16T12:00:00Z"
}
```

### 4. 发布/取消公告

```http
PUT /announcements/{id}/publish
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "is_published": true
}
```

---

## 💰 费用管理

### 1. 获取账单列表

```http
GET /bills
Authorization: Bearer {token}
Query: page=1&page_size=10&type=property&status=unpaid&billing_cycle=2024-01
```

### 2. 获取账单详情

```http
GET /bills/{id}
Authorization: Bearer {token}
```

### 3. 支付账单

```http
POST /bills/{id}/pay
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "payment_method": "wechat"
}
```

### 4. 创建账单（物业端）

```http
POST /bills
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "owner_id": 1,
  "type": "property",
  "title": "2024年1月物业费",
  "amount": 285.50,
  "billing_cycle": "2024-01",
  "due_date": "2024-01-31"
}
```

### 5. 缴费统计（物业端）

```http
GET /bills/statistics
Authorization: Bearer {token}
Query: start_date=2024-01-01&end_date=2024-01-31
```

---

## 🔧 报修服务

### 1. 提交报修

```http
POST /repairs
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "title": "客厅灯不亮",
  "description": "客厅的LED灯突然不亮了，需要维修",
  "repair_type": "electrical",
  "urgency": "medium",
  "location": "1栋2单元301室客厅",
  "contact_phone": "13800138000"
}
```

### 2. 获取报修列表

```http
GET /repairs
Authorization: Bearer {token}
Query: page=1&page_size=10&status=submitted&repair_type=electrical
```

### 3. 获取报修详情

```http
GET /repairs/{id}
Authorization: Bearer {token}
```

### 4. 评价报修

```http
POST /repairs/{id}/evaluate
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "rating": 5,
  "evaluation": "师傅很专业，维修速度快"
}
```

### 5. 工单管理（物业端）

#### 分配工单

```http
PUT /repairs/{id}/assign
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "assigned_to": 2,
  "estimated_completion": "2024-01-16T18:00:00Z"
}
```

#### 更新工单状态

```http
PUT /repairs/{id}/status
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "status": "processing",
  "completion_notes": "已更换LED灯管"
}
```

### 6. 报修统计（物业端）

```http
GET /repairs/statistics
Authorization: Bearer {token}
Query: start_date=2024-01-01&end_date=2024-01-31
```

---

## 🚪 门禁管理

### 1. 获取门禁记录

```http
GET /access/records
Authorization: Bearer {token}
Query: page=1&page_size=20&access_type=face&start_date=2024-01-01&end_date=2024-01-15
```

### 2. 生成开门二维码

```http
POST /access/qrcode
Authorization: Bearer {token}
```

**响应数据**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "qrcode_url": "/static/images/qrcode/abc123.jpg",
    "expire_time": "2024-01-15T13:00:00Z"
  }
}
```

### 3. 访客授权管理

#### 创建访客授权

```http
POST /access/visitors
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "visitor_name": "李四",
  "visitor_phone": "13900139000",
  "purpose": "拜访朋友",
  "access_count": 2,
  "valid_from": "2024-01-15T09:00:00Z",
  "valid_to": "2024-01-15T18:00:00Z"
}
```

#### 获取访客列表

```http
GET /access/visitors
Authorization: Bearer {token}
Query: page=1&page_size=10&status=active
```

#### 取消访客授权

```http
DELETE /access/visitors/{id}
Authorization: Bearer {token}
```

### 4. 门禁统计（物业端）

```http
GET /access/statistics
Authorization: Bearer {token}
Query: device_id=gate01&start_date=2024-01-01&end_date=2024-01-31
```

---

## 👥 社区互动

### 1. 帖子管理

#### 获取帖子列表

```http
GET /community/posts
Authorization: Bearer {token}
Query: page=1&page_size=10&type=second_hand&is_top=1
```

#### 创建帖子

```http
POST /community/posts
Authorization: Bearer {token}
Content-Type: application/json
```

**必填字段**：`type`、`title`、`content`

请求示例：

```json
{
  "type": "second_hand",
  "title": "转让二手自行车",
  "content": "九成新山地自行车，买来没怎么骑..."
}
```

#### 获取帖子详情

```http
GET /community/posts/{id}
Authorization: Bearer {token}
```

#### 更新帖子

```http
PUT /community/posts/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

#### 删除帖子

```http
DELETE /community/posts/{id}
Authorization: Bearer {token}
```

### 2. 帖子置顶（物业端）

```http
PUT /community/posts/{id}/top
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "is_top": true,
  "top_expire": "2024-01-20T23:59:59Z"
}
```

### 3. 评论管理

#### 获取评论列表

```http
GET /community/posts/{post_id}/comments
Authorization: Bearer {token}
Query: page=1&page_size=20
```

#### 发表评论

```http
POST /community/posts/{post_id}/comments
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "content": "这个自行车看起来不错",
  "parent_id": null
}
```

#### 删除评论

```http
DELETE /community/comments/{id}
Authorization: Bearer {token}
```

### 4. 点赞功能

```http
POST /community/posts/{id}/like
Authorization: Bearer {token}
```

```http
POST /community/comments/{id}/like
Authorization: Bearer {token}
```

---

## 🛠️ 设备监控（物业端）

### 1. 设备管理

#### 获取设备列表

```http
GET /devices
Authorization: Bearer {token}
Query: page=1&page_size=20&device_type=elevator&status=normal
```

#### 创建设备

```http
POST /devices
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "device_no": "ELEVATOR001",
  "device_name": "1号楼1单元电梯",
  "device_type": "elevator",
  "location": "1号楼1单元",
  "brand": "三菱",
  "model": "LEHY-III",
  "install_date": "2020-05-10",
  "responsible_person": 2
}
```

#### 更新设备信息

```http
PUT /devices/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

#### 更新设备状态

```http
PUT /devices/{id}/status
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "status": "maintenance",
  "current_value": {
    "floor": 5,
    "direction": "up",
    "weight": 450
  }
}
```

### 2. 报警管理

#### 获取报警列表

```http
GET /alerts
Authorization: Bearer {token}
Query: page=1&page_size=20&alert_level=error&status=pending
```

#### 处理报警

```http
PUT /alerts/{id}/handle
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "handled_notes": "已修复故障，设备恢复正常",
  "status": "handled"
}
```

### 3. 维护计划

```http
GET /devices/maintenance
Authorization: Bearer {token}
Query: start_date=2024-01-01&end_date=2024-12-31
```

```http
PUT /devices/{id}/maintenance
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "last_maintenance": "2024-01-15",
  "next_maintenance": "2024-04-15"
}
```

---

## 📁 文件上传

### 1. 上传文件

```http
POST /upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**

- `file`: 文件（必填）
- `module`: 模块（必填，repair/community/avatar/announcement）
- `related_id`: 关联ID（选填）

**响应数据**

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "file_id": 123,
    "file_name": "repair_20240115123045.jpg",
    "file_url": "/static/images/repair/2024/01/15/repair_20240115123045.jpg",
    "file_size": 204800,
    "upload_time": "2024-01-15T12:30:45Z"
  }
}
```

### 2. 删除文件

```http
DELETE /upload/{file_id}
Authorization: Bearer {token}
```

### 3. 获取文件列表

```http
GET /upload
Authorization: Bearer {token}
Query: module=repair&related_id=1
```

---

## 📊 数据统计（物业端）

### 1. 核心指标

```http
GET /statistics/overview
Authorization: Bearer {token}
Query: start_date=2024-01-01&end_date=2024-01-31
```

**响应数据**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "payment_rate": 92.5,
    "repair_response_time": 2.5,
    "owner_satisfaction": 4.2,
    "device_normal_rate": 98.7,
    "new_repairs_count": 45,
    "completed_repairs_count": 42
  }
}
```

### 2. 缴费统计

```http
GET /statistics/payment
Authorization: Bearer {token}
Query: year=2024&month=1
```

### 3. 报修统计

```http
GET /statistics/repair
Authorization: Bearer {token}
Query: year=2024&month=1
```

### 4. 设备运行统计

```http
GET /statistics/device
Authorization: Bearer {token}
Query: start_date=2024-01-01&end_date=2024-01-31
```

---

## ⚙️ 系统管理（管理员）

### 1. 系统配置

#### 获取配置列表

```http
GET /system/config
Authorization: Bearer {token}
Query: config_group=base
```

#### 更新配置

```http
PUT /system/config/{key}
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "config_value": "new_value"
}
```

### 2. 操作日志

```http
GET /system/logs
Authorization: Bearer {token}
Query: page=1&page_size=20&user_id=1&operation=login&start_date=2024-01-01
```

### 3. 用户管理（管理员）

#### 获取用户列表

```http
GET /system/users
Authorization: Bearer {token}
Query: page=1&page_size=20&role=owner&status=1
```

#### 禁用/启用用户

```http
PUT /system/users/{id}/status
Authorization: Bearer {token}
Content-Type: application/json
```

```json
{
  "status": 0
}
```

---

## 📝 API使用示例

### 前端调用示例（JavaScript）

```javascript
const API_BASE = 'http://api.happy-community.com/api/v1';

// 设置请求头
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// 获取公告列表
const fetchAnnouncements = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/announcements?${query}`, {
    headers: getHeaders()
  });
  return await response.json();
};

// 提交报修
const submitRepair = async (data) => {
  const response = await fetch(`${API_BASE}/repairs`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return await response.json();
};

// 上传文件
const uploadFile = async (file, module, relatedId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('module', module);
  if (relatedId) formData.append('related_id', relatedId);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  return await response.json();
};
```

### 错误处理示例

```javascript
// 统一错误处理
const handleApiError = (error) => {
  if (error.code === 401) {
    // Token过期，跳转到登录页
    localStorage.removeItem('token');
    window.location.href = '/login';
  } else if (error.code === 403) {
    // 权限不足
    alert('您没有权限执行此操作');
  } else {
    // 其他错误
    alert(error.message || '操作失败，请重试');
  }
};
```

---

## 🔄 实时通知（WebSocket）

### 连接地址

```
ws://api.happy-community.com/ws
```

### 消息类型

#### 认证消息

```json
{
  "type": "auth",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 报修状态更新

```json
{
  "type": "repair_update",
  "repair_id": 123,
  "status": "completed",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

#### 新公告通知

```json
{
  "type": "new_announcement",
  "announcement_id": 456,
  "title": "停水通知",
  "priority": 2
}
```

#### 设备报警

```json
{
  "type": "device_alert",
  "device_id": 789,
  "alert_level": "error",
  "message": "电梯运行异常"
}
```

---

这份完整的RESTful API文档涵盖了幸福小区APP的所有功能模块，包括认证授权、用户管理、费用管理、报修服务、门禁管理、社区互动、设备监控等。每个接口都提供了详细的请求方法、参数说明和响应格式，方便前后端开发人员协作。
