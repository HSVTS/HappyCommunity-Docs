# 数据库结构说明

## 📋 文档概述

**数据库信息**

- **数据库名**: `happy_community`
- **字符集**: `utf8mb4`
- **排序规则**: `utf8mb4_unicode_ci`
- **存储引擎**: `InnoDB`
- **版本**: MySQL 5.7+

---

## 🗃️ 数据表详细说明

### 1. 用户表（users）

**表说明**: 存储系统所有用户的基础信息，包括业主、物业人员和管理员

| 字段名        | 类型                               | 约束                          | 默认值                                           | 说明             |
| ---------- | -------------------------------- | --------------------------- | --------------------------------------------- | -------------- |
| id         | INT                              | PRIMARY KEY, AUTO_INCREMENT |                                               | 用户ID，主键        |
| phone      | VARCHAR(11)                      | NOT NULL, UNIQUE            |                                               | 手机号（登录账号），唯一   |
| password   | VARCHAR(255)                     | NOT NULL                    |                                               | 密码（bcrypt加密存储） |
| role       | ENUM('owner','property','admin') | NOT NULL                    | 'owner'                                       | 用户角色：业主/物业/管理员 |
| avatar_url | VARCHAR(500)                     |                             | NULL                                          | 头像文件路径         |
| real_name  | VARCHAR(20)                      |                             | NULL                                          | 真实姓名           |
| id_card    | VARCHAR(18)                      |                             | NULL                                          | 身份证号码          |
| status     | TINYINT                          | NOT NULL                    | 1                                             | 账号状态：1正常 0禁用   |
| last_login | DATETIME                         |                             | NULL                                          | 最后登录时间         |
| created_at | DATETIME                         |                             | CURRENT_TIMESTAMP                             | 注册时间           |
| updated_at | DATETIME                         |                             | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 最后更新时间         |

**索引**:

- `PRIMARY KEY` (id)
- `UNIQUE KEY` (phone)
- `idx_phone` (phone)
- `idx_role` (role)
- `idx_status` (status)

**关联关系**:

- 一对一到 `owners` 表 (users.id = owners.user_id)
- 一对一到 `property_staff` 表 (users.id = property_staff.user_id)

---

### 2. 业主信息表（owners）

**表说明**: 存储业主的详细住房信息和身份信息

| 字段名            | 类型                     | 约束                               | 默认值                                           | 说明         |
| -------------- | ---------------------- | -------------------------------- | --------------------------------------------- | ---------- |
| id             | INT                    | PRIMARY KEY, AUTO_INCREMENT      |                                               | 业主ID，主键    |
| user_id        | INT                    | FOREIGN KEY (users.id), NOT NULL |                                               | 关联用户ID     |
| community_name | VARCHAR(50)            | NOT NULL                         | '幸福小区'                                        | 所属小区名称     |
| building       | VARCHAR(10)            | NOT NULL                         |                                               | 楼栋号        |
| unit           | VARCHAR(10)            |                                  | NULL                                          | 单元号        |
| room           | VARCHAR(10)            | NOT NULL                         |                                               | 房间号        |
| area           | DECIMAL(8,2)           |                                  | NULL                                          | 房屋面积（㎡）    |
| owner_type     | ENUM('owner','tenant') | NOT NULL                         | 'owner'                                       | 业主类型：业主/租客 |
| move_in_date   | DATE                   |                                  | NULL                                          | 入住日期       |
| status         | TINYINT                | NOT NULL                         | 1                                             | 状态：1正常 0搬离 |
| created_at     | DATETIME               |                                  | CURRENT_TIMESTAMP                             | 创建时间       |
| updated_at     | DATETIME               |                                  | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间       |

**索引**:

- `PRIMARY KEY` (id)
- `UNIQUE KEY uk_building_room` (building, unit, room)
- `idx_user_id` (user_id)
- `idx_building` (building)
- `idx_status` (status)

**关联关系**:

- 多对一到 `users` 表 (user_id → users.id)
- 一对多到 `bills` 表
- 一对多到 `repairs` 表
- 一对多到 `access_records` 表
- 一对多到 `community_posts` 表

---

### 3. 物业人员表（property_staff）

**表说明**: 存储物业工作人员的工作信息和技能信息

| 字段名             | 类型          | 约束                               | 默认值                                           | 说明            |
| --------------- | ----------- | -------------------------------- | --------------------------------------------- | ------------- |
| id              | INT         | PRIMARY KEY, AUTO_INCREMENT      |                                               | 物业人员ID        |
| user_id         | INT         | FOREIGN KEY (users.id), NOT NULL |                                               | 关联用户ID        |
| staff_no        | VARCHAR(20) | NOT NULL, UNIQUE                 |                                               | 工号，唯一         |
| department      | VARCHAR(50) | NOT NULL                         |                                               | 所属部门          |
| position        | VARCHAR(50) | NOT NULL                         |                                               | 职位            |
| work_phone      | VARCHAR(20) |                                  | NULL                                          | 工作电话          |
| is_repair_staff | TINYINT     | NOT NULL                         | 0                                             | 是否为维修人员：1是 0否 |
| skills          | JSON        |                                  | NULL                                          | 维修技能标签数组      |
| status          | TINYINT     | NOT NULL                         | 1                                             | 状态：1在职 0离职    |
| hire_date       | DATE        |                                  | NULL                                          | 入职日期          |
| created_at      | DATETIME    |                                  | CURRENT_TIMESTAMP                             | 创建时间          |
| updated_at      | DATETIME    |                                  | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间          |

**索引**:

- `PRIMARY KEY` (id)
- `UNIQUE KEY` (staff_no)
- `idx_user_id` (user_id)
- `idx_department` (department)
- `idx_is_repair_staff` (is_repair_staff)

**关联关系**:

- 多对一到 `users` 表 (user_id → users.id)
- 一对多到 `repairs` 表 (assigned_to)
- 一对多到 `device_monitoring` 表 (responsible_person)

---

### 4. 公告表（announcements）

**表说明**: 存储小区公告和通知信息

| 字段名          | 类型                                                  | 约束                               | 默认值                                           | 说明              |
| ------------ | --------------------------------------------------- | -------------------------------- | --------------------------------------------- | --------------- |
| id           | INT                                                 | PRIMARY KEY, AUTO_INCREMENT      |                                               | 公告ID            |
| title        | VARCHAR(100)                                        | NOT NULL                         |                                               | 公告标题            |
| content      | TEXT                                                | NOT NULL                         |                                               | 公告内容            |
| type         | ENUM('notice','maintenance','activity','emergency') | NOT NULL                         | 'notice'                                      | 公告类型            |
| priority     | TINYINT                                             | NOT NULL                         | 1                                             | 优先级：1普通 2重要 3紧急 |
| publisher_id | INT                                                 | FOREIGN KEY (users.id), NOT NULL |                                               | 发布人ID           |
| is_published | TINYINT                                             | NOT NULL                         | 0                                             | 是否发布：1是 0否      |
| published_at | DATETIME                                            |                                  | NULL                                          | 发布时间            |
| expire_at    | DATETIME                                            |                                  | NULL                                          | 过期时间            |
| created_at   | DATETIME                                            |                                  | CURRENT_TIMESTAMP                             | 创建时间            |
| updated_at   | DATETIME                                            |                                  | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间            |

**索引**:

- `PRIMARY KEY` (id)
- `idx_type` (type)
- `idx_priority` (priority)
- `idx_published` (is_published, published_at)
- `idx_expire` (expire_at)

**关联关系**:

- 多对一到 `users` 表 (publisher_id → users.id)

---

### 5. 账单表（bills）

**表说明**: 存储业主的各类缴费账单和支付记录

| 字段名              | 类型                                                             | 约束                                | 默认值                                           | 说明             |
| ---------------- | -------------------------------------------------------------- | --------------------------------- | --------------------------------------------- | -------------- |
| id               | INT                                                            | PRIMARY KEY, AUTO_INCREMENT       |                                               | 账单ID           |
| owner_id         | INT                                                            | FOREIGN KEY (owners.id), NOT NULL |                                               | 业主ID           |
| bill_no          | VARCHAR(50)                                                    | NOT NULL, UNIQUE                  |                                               | 账单编号，唯一        |
| type             | ENUM('property','water','electricity','gas','parking','other') | NOT NULL                          |                                               | 账单类型           |
| title            | VARCHAR(100)                                                   | NOT NULL                          |                                               | 账单标题           |
| amount           | DECIMAL(10,2)                                                  | NOT NULL                          |                                               | 应缴金额           |
| billing_cycle    | VARCHAR(10)                                                    | NOT NULL                          |                                               | 账期（格式：YYYY-MM） |
| due_date         | DATE                                                           | NOT NULL                          |                                               | 缴费截止日期         |
| actual_payment   | DECIMAL(10,2)                                                  |                                   | NULL                                          | 实付金额           |
| status           | ENUM('unpaid','paid','overdue','cancelled')                    | NOT NULL                          | 'unpaid'                                      | 支付状态           |
| paid_at          | DATETIME                                                       |                                   | NULL                                          | 支付时间           |
| payment_method   | VARCHAR(20)                                                    |                                   | NULL                                          | 支付方式           |
| payment_trade_no | VARCHAR(100)                                                   |                                   | NULL                                          | 支付平台交易号        |
| created_at       | DATETIME                                                       |                                   | CURRENT_TIMESTAMP                             | 创建时间           |
| updated_at       | DATETIME                                                       |                                   | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间           |

**索引**:

- `PRIMARY KEY` (id)
- `UNIQUE KEY` (bill_no)
- `idx_owner_id` (owner_id)
- `idx_bill_no` (bill_no)
- `idx_type` (type)
- `idx_billing_cycle` (billing_cycle)
- `idx_status` (status)
- `idx_due_date` (due_date)

**关联关系**:

- 多对一到 `owners` 表 (owner_id → owners.id)

---

### 6. 报修表（repairs）

**表说明**: 存储业主报修工单的全流程信息

| 字段名                  | 类型                                                                           | 约束                                | 默认值                                           | 说明        |
| -------------------- | ---------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------- | --------- |
| id                   | INT                                                                          | PRIMARY KEY, AUTO_INCREMENT       |                                               | 报修ID      |
| repair_no            | VARCHAR(50)                                                                  | NOT NULL, UNIQUE                  |                                               | 报修单号，唯一   |
| owner_id             | INT                                                                          | FOREIGN KEY (owners.id), NOT NULL |                                               | 报修人ID     |
| title                | VARCHAR(100)                                                                 | NOT NULL                          |                                               | 报修标题      |
| description          | TEXT                                                                         | NOT NULL                          |                                               | 报修详细描述    |
| repair_type          | ENUM('electrical','plumbing','elevator','door_window','other')               | NOT NULL                          | 'other'                                       | 报修类型      |
| urgency              | ENUM('low','medium','high','emergency')                                      | NOT NULL                          | 'medium'                                      | 紧急程度      |
| location             | VARCHAR(200)                                                                 | NOT NULL                          |                                               | 报修具体位置    |
| contact_phone        | VARCHAR(20)                                                                  | NOT NULL                          |                                               | 联系电话      |
| status               | ENUM('submitted','assigned','processing','completed','cancelled','rejected') | NOT NULL                          | 'submitted'                                   | 工单状态      |
| assigned_to          | INT                                                                          | FOREIGN KEY (property_staff.id)   | NULL                                          | 指派的维修人员ID |
| assigned_at          | DATETIME                                                                     |                                   | NULL                                          | 指派时间      |
| estimated_completion | DATETIME                                                                     |                                   | NULL                                          | 预计完成时间    |
| actual_completion    | DATETIME                                                                     |                                   | NULL                                          | 实际完成时间    |
| completion_notes     | TEXT                                                                         |                                   | NULL                                          | 维修完成说明    |
| evaluation           | TEXT                                                                         |                                   | NULL                                          | 业主评价内容    |
| rating               | TINYINT                                                                      |                                   | NULL                                          | 评分（1-5星）  |
| evaluated_at         | DATETIME                                                                     |                                   | NULL                                          | 评价时间      |
| created_at           | DATETIME                                                                     |                                   | CURRENT_TIMESTAMP                             | 创建时间      |
| updated_at           | DATETIME                                                                     |                                   | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间      |

**索引**:

- `PRIMARY KEY` (id)
- `UNIQUE KEY` (repair_no)
- `idx_repair_no` (repair_no)
- `idx_owner_id` (owner_id)
- `idx_repair_type` (repair_type)
- `idx_urgency` (urgency)
- `idx_status` (status)
- `idx_assigned_to` (assigned_to)
- `idx_created_at` (created_at)

**关联关系**:

- 多对一到 `owners` 表 (owner_id → owners.id)
- 多对一到 `property_staff` 表 (assigned_to → property_staff.id)

---

### 7. 门禁记录表（access_records）

**表说明**: 存储所有门禁通行记录

| 字段名             | 类型                                                         | 约束                                | 默认值               | 说明     |
| --------------- | ---------------------------------------------------------- | --------------------------------- | ----------------- | ------ |
| id              | INT                                                        | PRIMARY KEY, AUTO_INCREMENT       |                   | 记录ID   |
| owner_id        | INT                                                        | FOREIGN KEY (owners.id), NOT NULL |                   | 业主ID   |
| device_id       | VARCHAR(50)                                                | NOT NULL                          |                   | 门禁设备ID |
| device_location | VARCHAR(100)                                               | NOT NULL                          |                   | 设备安装位置 |
| access_type     | ENUM('face','qrcode','card','password','visitor','remote') | NOT NULL                          |                   | 通行方式   |
| visitor_name    | VARCHAR(50)                                                |                                   | NULL              | 访客姓名   |
| visitor_phone   | VARCHAR(20)                                                |                                   | NULL              | 访客电话   |
| access_time     | DATETIME                                                   | NOT NULL                          |                   | 通行时间   |
| result          | ENUM('success','fail')                                     | NOT NULL                          | 'success'         | 通行结果   |
| fail_reason     | VARCHAR(100)                                               |                                   | NULL              | 失败原因   |
| created_at      | DATETIME                                                   |                                   | CURRENT_TIMESTAMP | 创建时间   |

**索引**:

- `PRIMARY KEY` (id)
- `idx_owner_id` (owner_id)
- `idx_access_type` (access_type)
- `idx_access_time` (access_time)
- `idx_result` (result)
- `idx_device` (device_id)

**关联关系**:

- 多对一到 `owners` 表 (owner_id → owners.id)

---

### 8. 访客授权表（visitor_authorizations）

**表说明**: 存储访客临时授权信息

| 字段名           | 类型                                          | 约束                                | 默认值                                           | 说明        |
| ------------- | ------------------------------------------- | --------------------------------- | --------------------------------------------- | --------- |
| id            | INT                                         | PRIMARY KEY, AUTO_INCREMENT       |                                               | 授权ID      |
| owner_id      | INT                                         | FOREIGN KEY (owners.id), NOT NULL |                                               | 创建授权的业主ID |
| visitor_name  | VARCHAR(50)                                 | NOT NULL                          |                                               | 访客姓名      |
| visitor_phone | VARCHAR(20)                                 | NOT NULL                          |                                               | 访客电话      |
| purpose       | VARCHAR(200)                                | NOT NULL                          |                                               | 访问事由      |
| access_count  | INT                                         | NOT NULL                          | 1                                             | 允许通行次数    |
| used_count    | INT                                         | NOT NULL                          | 0                                             | 已使用次数     |
| valid_from    | DATETIME                                    | NOT NULL                          |                                               | 有效期开始时间   |
| valid_to      | DATETIME                                    | NOT NULL                          |                                               | 有效期结束时间   |
| qrcode_data   | TEXT                                        | NOT NULL                          |                                               | 二维码数据（加密） |
| status        | ENUM('active','used','expired','cancelled') | NOT NULL                          | 'active'                                      | 授权状态      |
| created_at    | DATETIME                                    |                                   | CURRENT_TIMESTAMP                             | 创建时间      |
| updated_at    | DATETIME                                    |                                   | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间      |

**索引**:

- `PRIMARY KEY` (id)
- `idx_owner_id` (owner_id)
- `idx_visitor_phone` (visitor_phone)
- `idx_validity` (valid_from, valid_to)
- `idx_status` (status)

**关联关系**:

- 多对一到 `owners` 表 (owner_id → owners.id)

---

### 9. 社区帖子表（community_posts）

**表说明**: 存储社区互动交流的帖子信息

| 字段名           | 类型                                                                             | 约束                                | 默认值                                           | 说明         |
| ------------- | ------------------------------------------------------------------------------ | --------------------------------- | --------------------------------------------- | ---------- |
| id            | INT                                                                            | PRIMARY KEY, AUTO_INCREMENT       |                                               | 帖子ID       |
| owner_id      | INT                                                                            | FOREIGN KEY (owners.id), NOT NULL |                                               | 发布人ID      |
| type          | ENUM('second_hand','rent','vote','lost_found','complaint','discussion','help') | NOT NULL                          |                                               | 帖子类型       |
| title         | VARCHAR(100)                                                                   | NOT NULL                          |                                               | 帖子标题       |
| content       | TEXT                                                                           | NOT NULL                          |                                               | 帖子内容       |
| contact_phone | VARCHAR(20)                                                                    |                                   | NULL                                          | 联系电话       |
| price         | DECIMAL(10,2)                                                                  |                                   | NULL                                          | 价格（二手/出租类） |
| location      | VARCHAR(200)                                                                   |                                   | NULL                                          | 位置信息       |
| view_count    | INT                                                                            | NOT NULL                          | 0                                             | 浏览数        |
| like_count    | INT                                                                            | NOT NULL                          | 0                                             | 点赞数        |
| comment_count | INT                                                                            | NOT NULL                          | 0                                             | 评论数        |
| status        | ENUM('published','draft','deleted','banned')                                   | NOT NULL                          | 'published'                                   | 帖子状态       |
| is_top        | TINYINT                                                                        | NOT NULL                          | 0                                             | 是否置顶：1是 0否 |
| top_expire    | DATETIME                                                                       |                                   | NULL                                          | 置顶过期时间     |
| created_at    | DATETIME                                                                       |                                   | CURRENT_TIMESTAMP                             | 创建时间       |
| updated_at    | DATETIME                                                                       |                                   | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间       |

**索引**:

- `PRIMARY KEY` (id)
- `idx_owner_id` (owner_id)
- `idx_type` (type)
- `idx_status` (status)
- `idx_is_top` (is_top)
- `idx_created_at` (created_at)
- `idx_view_count` (view_count)

**关联关系**:

- 多对一到 `owners` 表 (owner_id → owners.id)
- 一对多到 `post_comments` 表

---

### 10. 帖子评论表（post_comments）

**表说明**: 存储帖子的评论信息，支持多级回复

| 字段名        | 类型       | 约束                                         | 默认值                                           | 说明          |
| ---------- | -------- | ------------------------------------------ | --------------------------------------------- | ----------- |
| id         | INT      | PRIMARY KEY, AUTO_INCREMENT                |                                               | 评论ID        |
| post_id    | INT      | FOREIGN KEY (community_posts.id), NOT NULL |                                               | 帖子ID        |
| owner_id   | INT      | FOREIGN KEY (owners.id), NOT NULL          |                                               | 评论人ID       |
| parent_id  | INT      | FOREIGN KEY (post_comments.id)             | NULL                                          | 父评论ID（支持回复） |
| content    | TEXT     | NOT NULL                                   |                                               | 评论内容        |
| like_count | INT      | NOT NULL                                   | 0                                             | 点赞数         |
| status     | TINYINT  | NOT NULL                                   | 1                                             | 状态：1正常 0删除  |
| created_at | DATETIME |                                            | CURRENT_TIMESTAMP                             | 创建时间        |
| updated_at | DATETIME |                                            | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间        |

**索引**:

- `PRIMARY KEY` (id)
- `idx_post_id` (post_id)
- `idx_owner_id` (owner_id)
- `idx_parent_id` (parent_id)
- `idx_created_at` (created_at)

**关联关系**:

- 多对一到 `community_posts` 表 (post_id → community_posts.id)
- 多对一到 `owners` 表 (owner_id → owners.id)
- 自关联到 `post_comments` 表 (parent_id → post_comments.id)

---

### 11. 设备监控表（device_monitoring）

**表说明**: 存储小区公共设备的监控信息和维护计划

| 字段名                | 类型                                                                         | 约束                              | 默认值                                           | 说明      |
| ------------------ | -------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------- | ------- |
| id                 | INT                                                                        | PRIMARY KEY, AUTO_INCREMENT     |                                               | 设备ID    |
| device_no          | VARCHAR(50)                                                                | NOT NULL, UNIQUE                |                                               | 设备编号，唯一 |
| device_name        | VARCHAR(100)                                                               | NOT NULL                        |                                               | 设备名称    |
| device_type        | ENUM('elevator','water_pump','power_system','fire_system','camera','gate') | NOT NULL                        |                                               | 设备类型    |
| location           | VARCHAR(200)                                                               | NOT NULL                        |                                               | 设备安装位置  |
| brand              | VARCHAR(50)                                                                |                                 | NULL                                          | 设备品牌    |
| model              | VARCHAR(50)                                                                |                                 | NULL                                          | 设备型号    |
| install_date       | DATE                                                                       |                                 | NULL                                          | 安装日期    |
| last_maintenance   | DATE                                                                       |                                 | NULL                                          | 上次维护日期  |
| next_maintenance   | DATE                                                                       |                                 | NULL                                          | 下次维护日期  |
| status             | ENUM('normal','warning','fault','maintenance','offline')                   | NOT NULL                        | 'normal'                                      | 设备状态    |
| current_value      | JSON                                                                       |                                 | NULL                                          | 当前监测数据  |
| threshold          | JSON                                                                       |                                 | NULL                                          | 报警阈值设置  |
| responsible_person | INT                                                                        | FOREIGN KEY (property_staff.id) | NULL                                          | 负责人ID   |
| created_at         | DATETIME                                                                   |                                 | CURRENT_TIMESTAMP                             | 创建时间    |
| updated_at         | DATETIME                                                                   |                                 | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间    |

**索引**:

- `PRIMARY KEY` (id)
- `UNIQUE KEY` (device_no)
- `idx_device_no` (device_no)
- `idx_device_type` (device_type)
- `idx_status` (status)
- `idx_next_maintenance` (next_maintenance)

**关联关系**:

- 多对一到 `property_staff` 表 (responsible_person → property_staff.id)
- 一对多到 `device_alerts` 表

---

### 12. 设备报警记录表（device_alerts）

**表说明**: 存储设备报警记录和处理信息

| 字段名             | 类型                                        | 约束                                           | 默认值                                           | 说明       |
| --------------- | ----------------------------------------- | -------------------------------------------- | --------------------------------------------- | -------- |
| id              | INT                                       | PRIMARY KEY, AUTO_INCREMENT                  |                                               | 报警ID     |
| device_id       | INT                                       | FOREIGN KEY (device_monitoring.id), NOT NULL |                                               | 设备ID     |
| alert_type      | VARCHAR(50)                               | NOT NULL                                     |                                               | 报警类型     |
| alert_level     | ENUM('info','warning','error','critical') | NOT NULL                                     | 'warning'                                     | 报警级别     |
| alert_message   | TEXT                                      | NOT NULL                                     |                                               | 报警信息     |
| current_value   | JSON                                      |                                              | NULL                                          | 报警时的设备数据 |
| threshold_value | JSON                                      |                                              | NULL                                          | 触发报警的阈值  |
| handled_by      | INT                                       | FOREIGN KEY (property_staff.id)              | NULL                                          | 处理人ID    |
| handled_at      | DATETIME                                  |                                              | NULL                                          | 处理时间     |
| handled_notes   | TEXT                                      |                                              | NULL                                          | 处理说明     |
| status          | ENUM('pending','handled','ignored')       | NOT NULL                                     | 'pending'                                     | 处理状态     |
| created_at      | DATETIME                                  |                                              | CURRENT_TIMESTAMP                             | 创建时间     |
| updated_at      | DATETIME                                  |                                              | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间     |

**索引**:

- `PRIMARY KEY` (id)
- `idx_device_id` (device_id)
- `idx_alert_level` (alert_level)
- `idx_status` (status)
- `idx_created_at` (created_at)

**关联关系**:

- 多对一到 `device_monitoring` 表 (device_id → device_monitoring.id)
- 多对一到 `property_staff` 表 (handled_by → property_staff.id)

---

### 13. 文件存储表（file_storage）

**表说明**: 集中管理所有上传的文件信息

| 字段名           | 类型           | 约束                          | 默认值               | 说明         |
| ------------- | ------------ | --------------------------- | ----------------- | ---------- |
| id            | INT          | PRIMARY KEY, AUTO_INCREMENT |                   | 文件ID       |
| file_name     | VARCHAR(255) | NOT NULL                    |                   | 存储的文件名     |
| original_name | VARCHAR(255) | NOT NULL                    |                   | 原始文件名      |
| file_path     | VARCHAR(500) | NOT NULL                    |                   | 文件存储路径     |
| file_size     | INT          | NOT NULL                    |                   | 文件大小（字节）   |
| file_type     | VARCHAR(50)  | NOT NULL                    |                   | 文件类型       |
| mime_type     | VARCHAR(100) | NOT NULL                    |                   | MIME类型     |
| module        | VARCHAR(50)  | NOT NULL                    |                   | 所属模块       |
| related_id    | INT          |                             | NULL              | 关联记录ID     |
| owner_id      | INT          | NOT NULL                    |                   | 上传用户ID     |
| upload_time   | DATETIME     |                             | CURRENT_TIMESTAMP | 上传时间       |
| status        | TINYINT      |                             | 1                 | 状态：1正常 0删除 |

**索引**:

- `PRIMARY KEY` (id)
- `idx_module_related` (module, related_id)
- `idx_owner` (owner_id)
- `idx_upload_time` (upload_time)

**关联关系**:

- 多对一到 `users` 表 (owner_id → users.id)

---

### 14. 系统配置表（system_config）

**表说明**: 存储系统配置参数，支持动态配置

| 字段名          | 类型                                              | 约束                          | 默认值                                           | 说明           |
| ------------ | ----------------------------------------------- | --------------------------- | --------------------------------------------- | ------------ |
| id           | INT                                             | PRIMARY KEY, AUTO_INCREMENT |                                               | 配置ID         |
| config_key   | VARCHAR(100)                                    | NOT NULL, UNIQUE            |                                               | 配置键名，唯一      |
| config_value | TEXT                                            | NOT NULL                    |                                               | 配置值          |
| config_name  | VARCHAR(100)                                    | NOT NULL                    |                                               | 配置名称         |
| config_group | VARCHAR(50)                                     | NOT NULL                    |                                               | 配置分组         |
| config_type  | ENUM('string','number','boolean','json','text') | NOT NULL                    | 'string'                                      | 配置值类型        |
| is_system    | TINYINT                                         | NOT NULL                    | 0                                             | 是否系统配置：1是 0否 |
| remark       | VARCHAR(500)                                    |                             | NULL                                          | 配置说明         |
| created_at   | DATETIME                                        |                             | CURRENT_TIMESTAMP                             | 创建时间         |
| updated_at   | DATETIME                                        |                             | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间         |

**索引**:

- `PRIMARY KEY` (id)
- `UNIQUE KEY` (config_key)
- `idx_config_key` (config_key)
- `idx_config_group` (config_group)

---

### 15. 操作日志表（operation_logs）

**表说明**: 记录用户操作日志，用于审计和排查问题

| 字段名            | 类型           | 约束                          | 默认值               | 说明           |
| -------------- | ------------ | --------------------------- | ----------------- | ------------ |
| id             | INT          | PRIMARY KEY, AUTO_INCREMENT |                   | 日志ID         |
| user_id        | INT          | NOT NULL                    |                   | 操作用户ID       |
| username       | VARCHAR(50)  | NOT NULL                    |                   | 用户名          |
| operation      | VARCHAR(100) | NOT NULL                    |                   | 操作内容         |
| method         | VARCHAR(10)  | NOT NULL                    |                   | HTTP请求方法     |
| url            | VARCHAR(500) | NOT NULL                    |                   | 请求URL        |
| params         | TEXT         |                             | NULL              | 请求参数         |
| ip             | VARCHAR(50)  | NOT NULL                    |                   | 客户端IP地址      |
| user_agent     | TEXT         |                             | NULL              | 用户代理信息       |
| execution_time | INT          |                             | NULL              | 执行时间（毫秒）     |
| status         | TINYINT      | NOT NULL                    | 1                 | 操作状态：1成功 0失败 |
| error_message  | TEXT         |                             | NULL              | 错误信息         |
| created_at     | DATETIME     |                             | CURRENT_TIMESTAMP | 创建时间         |

**索引**:

- `PRIMARY KEY` (id)
- `idx_user_id` (user_id)
- `idx_operation` (operation)
- `idx_created_at` (created_at)
- `idx_status` (status)

---

## 🔗 数据库关系图

```
users
  │
  ├── owners (1:1)
  │     ├── bills (1:N)
  │     ├── repairs (1:N)
  │     ├── access_records (1:N)
  │     ├── visitor_authorizations (1:N)
  │     └── community_posts (1:N)
  │
  ├── property_staff (1:1)
  │     ├── repairs (1:N, assigned_to)
  │     ├── device_monitoring (1:N, responsible_person)
  │     └── device_alerts (1:N, handled_by)
  │
  └── file_storage (1:N, owner_id)

community_posts
  └── post_comments (1:N)

device_monitoring
  └── device_alerts (1:N)

announcements
  └── users (N:1, publisher_id)
```

## 💡 设计特点说明

### 1. 数据完整性

- 所有外键关系都设置了约束，确保数据一致性
- 使用ENUM类型限制特定字段的取值范围
- 设置NOT NULL约束确保关键字段不为空

### 2. 性能优化

- 为所有常用查询字段创建了合适的索引
- 使用合适的数据类型减少存储空间
- 合理设置字段长度避免空间浪费

### 3. 扩展性设计

- 使用JSON字段存储动态数据结构
- 模块化设计，各业务表相对独立
- 预留扩展字段，支持未来功能扩展

### 4. 安全考虑

- 密码字段使用加密存储
- 敏感信息（身份证、手机号）单独存储
- 操作日志记录所有关键操作

### 5. 维护便利

- 统一的created_at/updated_at时间戳
- 清晰的表注释和字段注释
- 合理的状态字段设计，支持软删除

---

这份数据库结构说明文档详细描述了每个表的结构、约束、索引和关联关系，为开发、维护和数据库优化提供了完整的参考依据。
