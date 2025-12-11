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

`building`、`unit`、`room`、`community_name`、`owner_type` 这类地址/房间相关字段 **仅允许** 具有 `property` 角色的账号修改（即物业端）。

- `200`: 成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
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
```

说明：该接口通过请求中携带的 JWT token 确认当前登录账号（仅允许本人修改自己的密码）。
- 请勿在请求体中传入 `user_id` 或尝试以 `user_id` 指定目标账号；如果需要物业或管理员修改其他账号的密码，请使用系统管理接口：`PUT /system/users/{id}/password`。
- 若前端使用浏览器上传 FormData 或其它情况，请确保请求头与请求体格式正确（本接口为 JSON）。

**默认物业账号**

- 系统在首次创建数据库表时会自动创建一个默认的物业端账号：`phone=admin`，`password=admin`。
- 建议上线环境通过环境变量或迁移脚本修改默认凭据并尽快更改默认密码以保证安全。

> 注意：项目已移除 `admin` 角色，所有原属于 `admin` 的权限已并入 `property` 角色。
> 默认账号 `phone=admin` 的角色现在为 `property`（请在上线后尽快修改默认凭据）。

**示例业主账号（用于测试）**

系统初始化时自动创建 3 个示例业主账号，便于测试 API 功能：

| 手机号 | 密码 | 姓名 | 房间信息 |
|--------|------|------|----------|
| 13800138001 | password123 | 张三 | 1栋1单元101室 |
| 13800138002 | password123 | 李四 | 1栋2单元201室 |
| 13800138003 | password123 | 王五 | 2栋1单元301室 |

你可以使用这些账号登录后测试业主相关的 API 接口。

## ⚙️ 系统管理（物业）

说明：系统管理接口主要由具有 `property` 角色的账号使用（项目已移除 `admin` 角色，原有管理员权限已合并至 `property`）。下面补充更详细的字段说明、请求参数、响应示例和常见校验规则。

### 1. 系统配置（配置项管理）

#### 获取配置列表

```http
GET /system/config
Authorization: Bearer {token}
Query: config_group=base&page=1&page_size=20
```

可选查询参数：
- `config_group`：按分组过滤（例如 `base`, `payment` 等）。
- `key`：按配置键精确查找。
- `page`、`page_size`：分页参数。

响应示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "key": "site_name",
        "group": "base",
        "value": "幸福小区",
        "type": "string",
        "description": "站点名称",
        "updated_at": "2024-01-15T12:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20
  }
}
```

类型说明（`SystemConfig.type`）：
- `boolean`：值应为 `true`/`false` 或 `"true"`/`"false"`，保存时会转换为布尔值。
- `number`：数值类型（整数或浮点）。请求时请保证是合法的数字字符串或 JSON 数字类型。
- `json`：复杂对象，请传入合法 JSON 字符串或 JSON 对象（后端会做 JSON 解析校验）。
- `string` / `text`：普通字符串，`text` 可用于较长文本。

#### 更新配置

```http
PUT /system/config/{key}
Authorization: Bearer {token}
Content-Type: application/json
```

请求体：

```json
{
  "config_value": "new_value"
}
```

校验规则：
- 后端会根据 `key` 对应的 `type` 做类型校验，校验失败返回 `400`。
- 对于 `json` 类型，确保传入可解析的 JSON；对于 `number`，确保字符串或 JSON 为数字格式；对于 `boolean`，支持 `true/false` 或字符串形式。

示例（更新开关类配置）：

```http
PUT /system/config/feature_new_ui
```

请求体：

```json
{
  "config_value": true
}
```

响应示例（成功）：

```json
{
  "code": 200,
  "message": "配置已更新",
  "data": null
}
```

错误响应（类型不匹配示例）：

```json
{
  "code": 400,
  "message": "config_value 类型错误，期望 number",
  "data": null
}
```

注意事项：更新配置的操作会记录到操作日志（OperationLog），便于审计与回滚。

### 2. 操作日志（审计）

#### 获取操作日志

```http
GET /system/logs
Authorization: Bearer {token}
Query: page=1&page_size=20&user_id=1&operation=login&start_date=2024-01-01&end_date=2024-01-31
```

可选查询参数：
- `user_id`：按用户 ID 过滤。
- `username` / `operation`：按用户名或操作关键词模糊搜索（例如 `update_config`、`delete_owner`）。
- `start_date` / `end_date`：ISO8601 日期或日期时间（支持 `YYYY-MM-DD` 或 `YYYY-MM-DDTHH:MM:SSZ`）；后端会做解析与校验。
- `status`：操作状态，`0`/`1` 等（取决于实现，表示失败/成功）。
- `page`、`page_size`：分页参数。

示例响应：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 123,
        "user_id": 1,
        "username": "property01",
        "operation": "update_config",
        "method": "PUT",
        "url": "/system/config/site_name",
        "params": {"config_value":"新名称"},
        "ip": "10.0.0.1",
        "user_agent": "curl/7.68.0",
        "execution_time": 45,
        "status": 1,
        "error_message": null,
        "created_at": "2024-01-15T12:01:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20
  }
}
```

性能与保留策略建议：
- `operation_logs` 可能会快速增长，建议为 `created_at`、`user_id` 和 `operation` 添加索引，并设置定期归档/清理策略（例如 90 天归档）。

### 3. 用户管理

#### 获取用户列表

```http
GET /system/users
Authorization: Bearer {token}
Query: page=1&page_size=20&role=owner&status=1
```

可选过滤：`role`、`status`、`phone`、`real_name`。

示例响应见上文“用户管理”示例。

#### 启用/禁用用户

```http
PUT /system/users/{id}/status
Authorization: Bearer {token}
Content-Type: application/json
```

请求示例：

```json
{
  "status": 0
}
```

行为说明：
- 该接口仅允许 `property` 角色调用（或其它被授予等效权限的账号）。
- 操作将同时记录到 `OperationLog`（用于审计）。

响应示例（成功）：

```json
{
  "code": 200,
  "message": "用户状态已更新",
  "data": null
}
```

#### 修改 `property` 账号密码（由物业操作）

```http
PUT /system/users/{id}/password
Authorization: Bearer {token}
Content-Type: application/json
```

请求示例：

```json
{
  "old_password": "当前密码123",
  "new_password": "NewPass456"
}
```

校验与行为说明：
- 该接口仅允许具有 `property` 角色的账号调用（用于物业人员替换/恢复其他物业账号的密码）。
- 被修改目标用户的 `role` 必须是 `property`，否则返回 `400`。
- 接口仅校验并比对 `old_password`（目标账号当前密码），若匹配则替换为 `new_password` 并返回成功；若不匹配返回 `400` 或 `403`（根据实现）。
- 操作使用事务，成功或失败均写入 `OperationLog`（记录操作人、目标用户、IP、时间及结果）。

示例成功响应：

```json
{
  "code": 200,
  "message": "密码已更新",
  "data": null
}
```

示例错误响应（旧密码错误）：

```json
{
  "code": 400,
  "message": "旧密码不正确",
  "data": null
}
```

---

操作日志与配置更新等关键动作会记录到审计表，请在生产环境中为该表添加索引并制定归档策略以防止数据膨胀。

如果你需要，我可以：
- 为 `operation_logs` 写推荐的数据库索引与迁移脚本（Alembic 迁移），
- 草拟单元测试覆盖 `update_config`、日志查询和 `property` 密码修改接口的关键场景。
```

---

## 👤 用户管理

### 1. 用户注册（已禁用）

系统已禁用用户自助注册接口。所有业主账号应由物业端通过受权限保护的接口创建。

如需创建业主账号，请使用 `POST /owners`（见业主管理节）由拥有 `property` 角色的账号发起。

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

说明：头像上传支持两种使用方式

- 推荐方式（两步）：先调用 `POST /upload` 上传文件（`module=avatar`），成功后使用返回的 `file_url` 或 `file_id` 调用 `PUT /users/avatar` 或 `POST /users/avatar`（JSON 包含 `avatar_url`）来更新用户头像。
- 便捷方式（一步）：直接将文件以 `multipart/form-data` POST 到 `POST /users/avatar`（字段名 `file`），后端会保存文件并自动更新当前用户的 `avatar_url`。

注意：使用浏览器的 `fetch` 或 XHR 上传 `FormData` 时，不要手动设置 `Content-Type` 头，浏览器会自动设置包含 boundary 的 `Content-Type`。手动设置为 `application/json` 会导致服务器报 415 错误。

示例：直接在 `users/avatar` 上传（一步）

```http
POST /users/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

前端 JS（fetch + FormData）示例：

```javascript
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  // 注意：不要手动设置 Content-Type，浏览器 会自动设置
  const res = await fetch(`${API_BASE}/users/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  return await res.json();
}
```

示例：先上传到 `/upload`（两步），再更新头像

```javascript
const uploadFileThenSetAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('module', 'avatar');

  // 上传文件
  const uploadRes = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData
  });
  const uploadJson = await uploadRes.json();
  if (uploadJson.code !== 200) throw new Error(uploadJson.message);

  // 假设后端返回 file_url 在 uploadJson.data.file_url
  const avatarUrl = uploadJson.data.file_url;

  // 更新用户头像（调用 JSON 接口）
  const updateRes = await fetch(`${API_BASE}/users/avatar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ avatar_url: avatarUrl })
  });
  return await updateRes.json();
}
```

常见错误与排查：
- 错误：415 Unsupported Media Type — 原因：前端使用 `Content-Type: application/json` 上传文件或手动设置了 Content-Type。解决：使用 `FormData` 并让浏览器自动设置 Content-Type（不要手动设置）。
- 错误：400 文件名为空 / 不支持的文件类型 — 请检查 `file` 字段是否存在以及文件后缀是否在允许范围（png/jpg/jpeg/gif）。


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

- `building`、`unit`、`room`、`community_name`、`owner_type` 这类地址/房间相关字段 **仅允许** 具有 `property` 角色的账号修改（即物业端）。
- 业主本人仅允许修改非受限字段，例如 `area`（面积）和 `move_in_date`（入住日期）。
- **业主本人可修改自己的 `real_name`（真实姓名）**：系统通过请求中的 JWT token 判断是否为本人。向 `PUT /owners/{id}` 发送 JSON 包含 `"real_name": "新的姓名"` 即可。物业端可修改任意业主的 `real_name`。
- 如果业主尝试修改受限字段，接口会返回 HTTP 403（权限不足）。

示例：业主本人修改自己的真实姓名

```http
PUT /owners/5
Authorization: Bearer {owner_token}
Content-Type: application/json
```

```json
{
  "real_name": "张三"
}
```

示例：物业端修改地址信息与姓名

```http
PUT /owners/5
Authorization: Bearer {property_token}
Content-Type: application/json
```

```json
{
  "building": "2",
  "unit": "1",
  "room": "201",
  "real_name": "李四"
}
```

示例：业主修改非受限字段

```http
PUT /owners/5
Authorization: Bearer {owner_token}
Content-Type: application/json
```

```json
{
  "area": 95.0,
  "move_in_date": "2024-05-01"
}
```

### 2.2 删除业主账号（物业端）

```http
DELETE /owners/{id}
Authorization: Bearer {token}
```

说明：
- 该接口仅允许具有 `property` 角色的账号调用。
- 删除操作为软删除：将 `Owner.status` 以及关联 `User.status` 设为 `0`（禁用）。
- 删除后业主将无法登录或使用系统功能，但历史记录（报修、账单、评论等）会被保留以便审计。

成功响应示例：

```json
{
  "code": 200,
  "message": "业主账号已删除（已禁用）",
  "data": null
}
```


### 2.1 创建业主账号（物业/管理员）

```http
POST /owners
Authorization: Bearer {token}  // 需要 property 角色
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

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "user_id": 10,
        "real_name": "张三",
        "community_name": "幸福小区",
        "building": "1",
        "unit": "1",
        "room": "101",
        "area": 85.5,
        "owner_type": "owner",
        "move_in_date": null,
        "status": 1
      },
      {
        "id": 2,
        "user_id": 11,
        "real_name": "李四",
        "community_name": "幸福小区",
        "building": "1",
        "unit": "2",
        "room": "201",
        "area": 95.0,
        "owner_type": "owner",
        "move_in_date": null,
        "status": 1
      }
    ],
    "total": 2,
    "page": 1,
    "page_size": 20,
    "pages": 1
  }
}
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

### 4. 公告发布说明与删除

说明：项目已将“发布/取消公告”的单独接口移除，创建公告时将被直接发布（`is_published=1`，并设置 `published_at`）。如果需要临时保存草稿，请在后端添加相应字段或使用不同的管理流程。

#### 删除公告（物业端）

```http
DELETE /announcements/{id}
Authorization: Bearer {token}
```

说明：该接口仅允许 `property` 角色调用。删除为物理删除，删除后公告将从系统中移除。

成功响应示例：

```json
{
  "code": 200,
  "message": "公告已删除",
  "data": null
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

### 2. 生成开门二维码令牌

```http
POST /access/qrcode
Authorization: Bearer {token}
```

**说明**

该接口仅允许业主调用。后端生成一个临时令牌（有效期 10 分钟），前端需要使用该令牌生成二维码图片。

**响应数据**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "a1b2c3d4e5f6g7h8...",
    "expire_time": "2024-01-15T13:00:00Z"
  }
}
```

**前端使用示例**（生成二维码）

前端可以使用任何二维码库（例如 `qrcode.js`）来生成二维码：

```javascript
// 使用 qrcode.js 库
import QRCode from 'qrcode';

const generateQRCode = async () => {
  try {
    // 1. 调用后端接口获取令牌
    const res = await fetch(`${API_BASE}/access/qrcode`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const json = await res.json();
    
    if (json.code !== 200) throw new Error(json.message);
    
    const token = json.data.token;
    
    // 2. 使用令牌生成二维码（后端令牌格式：随机 hex 字符串，前端可直接使用或添加业务前缀）
    const canvas = document.getElementById('qrcode-canvas');
    await QRCode.toCanvas(canvas, token, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    console.log('二维码生成成功，有效期至:', json.data.expire_time);
  } catch (error) {
    console.error('生成二维码失败:', error);
  }
};
```

**npm 安装依赖**

```bash
npm install qrcode
```

或者使用 HTML 中的 CDN：

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode.js/1.5.3/qrcode.min.js"></script>
```

**CDN 方式示例**

```javascript
const generateQRCode = async () => {
  try {
    const res = await fetch(`${API_BASE}/access/qrcode`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const json = await res.json();
    
    if (json.code !== 200) throw new Error(json.message);
    
    const token = json.data.token;
    
    // 使用 QRCode 库生成二维码
    const qrcode = new QRCode('qrcode-container', {
      text: token,
      width: 200,
      height: 200,
      colorDark: '#000000',
      colorLight: '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.H
    });
  } catch (error) {
    console.error('生成二维码失败:', error);
  }
};
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

**响应示例**

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 5,
    "owner_id": 1,
    "visitor_name": "李四",
    "visitor_phone": "13900139000",
    "purpose": "拜访朋友",
    "access_count": 2,
    "used_count": 0,
    "valid_from": "2024-01-15T09:00:00Z",
    "valid_to": "2024-01-15T18:00:00Z",
    "qrcode_data": "VISITOR:1:a1b2c3d4e5...",
    "status": "active",
    "created_at": "2024-01-15T08:00:00Z"
  }
}
```

#### 获取访客列表

```http
GET /access/visitors
Authorization: Bearer {token}
Query: page=1&page_size=10&status=active
```

#### 获取访客授权令牌（用于生成二维码）

```http
POST /access/visitors/{visitor_id}/token
Authorization: Bearer {token}
```

**说明**

该接口允许业主为自己的访客授权生成临时令牌（有效期 10 分钟），物业可以为任何访客授权生成令牌。前端使用该令牌生成二维码供访客出入时扫描。

**权限检查**

- 业主只能为自己名下的访客授权生成令牌；
- 物业可以为任何访客授权生成令牌；
- 访客授权必须处于 `active` 状态且在有效期内，未达到使用次数限制。

**响应数据**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "a1b2c3d4e5f6g7h8...",
    "expire_time": "2024-01-15T13:00:00Z",
    "visitor_info": {
      "visitor_name": "李四",
      "visitor_phone": "13900139000",
      "purpose": "拜访朋友"
    }
  }
}
```

**错误示例**

如果访客授权已过期或已达使用限制：

```json
{
  "code": 400,
  "message": "访客授权已过期",
  "data": null
}
```

**前端使用示例**（生成访客二维码）

```javascript
const generateVisitorQRCode = async (visitorId) => {
  try {
    // 1. 调用后端接口获取访客授权令牌
    const res = await fetch(`${API_BASE}/access/visitors/${visitorId}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const json = await res.json();
    
    if (json.code !== 200) throw new Error(json.message);
    
    const { token, visitor_info } = json.data;
    
    // 2. 使用令牌生成二维码
    const canvas = document.getElementById('visitor-qrcode-canvas');
    await QRCode.toCanvas(canvas, token, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 200
    });
    
    // 3. 显示访客信息
    document.getElementById('visitor-name').textContent = visitor_info.visitor_name;
    document.getElementById('visitor-phone').textContent = visitor_info.visitor_phone;
    document.getElementById('visitor-purpose').textContent = visitor_info.purpose;
    
    console.log('访客二维码生成成功');
  } catch (error) {
    console.error('生成访客二维码失败:', error);
  }
};
```

#### 取消访客授权

```http
DELETE /access/visitors/{id}
Authorization: Bearer {token}
```

说明：业主可以取消自己的访客授权，物业可以取消任何访客授权。

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

#### 修改 `property` 账号密码（由物业操作）

```http
PUT /system/users/{id}/password
Authorization: Bearer {token}
Content-Type: application/json
```

请求示例：

```json
{
  "old_password": "当前密码123",
  "new_password": "NewPass456"
}
```

说明：
- 该接口仅允许拥有 `property` 角色的账号调用（即物业端）。
- `id` 是目标用户的用户ID，且目标用户 **必须** 是 `property` 角色，否则接口会返回 400。
- 接口只验证提供的 `old_password`（目标账号的当前密码），验证通过后更新为 `new_password`。

成功响应示例：

```json
{
  "code": 200,
  "message": "密码已更新",
  "data": null
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
