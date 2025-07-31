# LangManus 协议与UI展示对应关系详解

## 1. 消息流事件 → 聊天界面

### 协议事件
```json
event: message
data: {
  "message_id": "run-c00d9955-9df4-4a51-94a7-153b1879fb86",
  "delta": {
    "content": "部分回复内容",
    "reasoning_content": "内部推理过程（仅在深度思考模式下）"
  }
}
```

### UI展示位置
**文件**: `src/app/_components/MessageHistoryView.tsx:56-75`

**展示效果**:
- **普通消息**: 显示在聊天界面的消息气泡中
  - 用户消息：右对齐，主色调背景，白色文字
  - 助手消息：左对齐，白色背景
- **推理内容**: 当开启深度思考模式时，在消息下方显示"思考过程"
- **Markdown渲染**: 使用 `react-markdown` 处理格式化内容
- **链接处理**: 自动为外部链接添加 `target="_blank"` 和安全属性

## 2. 工作流事件 → 工作流进度界面

### 协议事件
```json
event: start_of_workflow
data: {
  "workflow_id": "45850b3e-590e-4782-89e1-163c2f4ee398",
  "input": [{"role": "user", "content": "搜索一下南京的人口和上海的人口，然后将它们相乘，计算结果"}]
}

event: end_of_workflow
data: {
  "workflow_id": "45850b3e-590e-4782-89e1-163c2f4ee398",
  "output": [{"role": "assistant", "content": "最终结果"}]
}
```

### UI展示位置
**文件**: `src/app/_components/WorkflowProgressView.tsx`

**展示效果**:
- **整体容器**: 928px宽 × 400px高的固定尺寸框
- **双栏布局**: 
  - 左侧：步骤导航栏
  - 右侧：详细执行内容
- **响应式设计**: 小屏幕自动调整布局

## 3. 代理事件 → 步骤导航和进度显示

### 协议事件
```json
event: start_of_agent
data: {
  "agent_name": "planner",
  "agent_id": "45850b3e-590e-4782-89e1-163c2f4ee398_planner_1"
}

event: end_of_agent
data: {
  "agent_name": "planner",
  "agent_id": "45850b3e-590e-4782-89e1-163c2f4ee398_planner_1"
}
```

### UI展示位置
**文件**: `src/app/_components/WorkflowProgressView.tsx:42-52`

**代理名称映射**:
| 协议中的agent_name | UI显示名称 | 功能说明 |
|-------------------|-----------|----------|
| `planner` | "Planning" | 规划任务步骤 |
| `researcher` | "Researching" | 信息搜索研究 |
| `browser` | "Browsing Web" | 网页浏览操作 |
| `coder` | "Coding" | 代码编写执行 |
| `file_manager` | "File Management" | 文件管理操作 |
| `supervisor` | "Thinking" | 监督和思考 |

**展示效果**:
- **步骤指示**: 左侧导航栏显示所有代理步骤
- **当前状态**: 高亮显示正在执行的代理
- **点击导航**: 点击步骤名称，右侧内容区域自动滚动到对应位置

## 4. 工具调用事件 → 专门的工具展示卡片

### 协议事件
```json
event: tool_call
data: {
  "tool_call_id": "call_abc123",
  "tool_name": "tavily_search",
  "parameters": {"query": "南京人口", "max_results": 10}
}

event: tool_call_result
data: {
  "tool_call_id": "call_abc123",
  "result": {"results": [...]}
}
```

### UI展示位置
**文件**: `src/app/_components/ToolCallView.tsx`

#### 搜索工具 (`tavily_search`)
**位置**: `ToolCallView.tsx:89-117`
**展示**: 
- 🔍 搜索图标 + "搜索: 关键词"
- 搜索结果列表：网站图标 + 标题链接 + 内容简介
- 结果数量统计

#### 网页抓取 (`crawl_tool`)
**位置**: `ToolCallView.tsx:119-134`
**展示**: 
- 🌍 地球图标 + "正在读取: URL"
- 页面标题显示（带缓存机制）
- 外部链接图标

#### Python代码执行 (`python_repl_tool`)
**位置**: `ToolCallView.tsx:142-161`
**展示**: 
- 🐍 Python图标 + "执行Python代码"
- 语法高亮的代码块（使用docco主题）
- 最大高度200px，防止页面溢出

#### Bash命令 (`bash_tool`)
**位置**: `ToolCallView.tsx:163-178`
**展示**: 
- 💻 终端图标 + "执行命令"
- 语法高亮的命令内容
- 容器尺寸限制

#### 浏览器操作 (`browser`)
**位置**: `ToolCallView.tsx:136-140`
**展示**: 
- 🌍 地球图标 + 浏览器操作描述

## 5. 用户输入控制 → 聊天输入框

### UI展示位置
**文件**: `src/app/_components/InputBox.tsx`

**功能组件**:
- **主输入框**: 自适应高度的文本域，支持多行输入
- **配置选项**: 
  - **Deep Think开关**: 控制 `deep_thinking_mode` 参数
  - **Search开关**: 控制 `search_before_planning` 参数
- **发送状态**:
  - **空闲时**: 蓝色发送按钮 + ↑ 上箭头图标
  - **响应中**: 红色取消按钮 + ⏹ 停止图标
- **键盘快捷键**: 
  - Enter: 发送消息
  - Shift+Enter: 换行
- **IME支持**: 正确处理中文输入法状态

## 6. 规划任务展示 → 规划详情面板

### UI展示位置
**文件**: `src/app/_components/PlanTaskView.tsx`

**展示效果**:
- **内容解析**: 将JSON格式的计划内容结构化显示
- **折叠功能**: 深度思考内容可以折叠/展开
- **步骤展示**: 以有序列表形式显示规划的各个步骤
- **思考过程**: 显示代理的内部推理逻辑

## 7. 系统状态指示 → 加载动画

### UI展示位置
**文件**: `src/app/_components/LoadingAnimation.tsx`

**展示时机**: 系统处理中且无消息流时
**动画效果**: 三个点的跳动动画
**显示位置**: 消息列表底部

## 8. 数据流转完整过程

### 请求流程
1. **用户操作**: 在 `InputBox` 中输入内容并发送
2. **API请求**: POST到 `/chat/stream` 端点
3. **配置参数**: 
   ```json
   {
     "messages": [...],
     "deep_thinking_mode": boolean,
     "search_before_planning": boolean,
     "debug": boolean
   }
   ```

### 响应处理流程
1. **SSE接收**: `src/core/sse/fetch-stream.ts` 解析事件流
2. **事件分发**: `src/core/store/store.ts:sendMessage()` 处理不同事件类型
3. **状态更新**: Zustand状态管理器更新应用状态
4. **UI渲染**: React组件根据状态变化重新渲染

### 事件映射表
| 协议事件 | 处理函数 | UI组件 | 展示效果 |
|---------|---------|-------|---------|
| `start_of_workflow` | `handleStartOfWorkflow` | `WorkflowProgressView` | 创建工作流界面 |
| `start_of_agent` | `handleStartOfAgent` | 工作流步骤导航 | 更新当前执行步骤 |
| `message` | `handleMessage` | `MessageView` | 增量更新消息内容 |
| `tool_call` | `handleToolCall` | `ToolCallView` | 显示工具调用界面 |
| `tool_call_result` | `handleToolCallResult` | `ToolCallView` | 更新工具执行结果 |
| `end_of_agent` | `handleEndOfAgent` | 工作流步骤导航 | 标记步骤完成 |
| `end_of_workflow` | `handleEndOfWorkflow` | `WorkflowProgressView` | 完成工作流 |

## 9. 特殊功能和交互

### 深度思考模式
- **启用条件**: `deep_thinking_mode: true`
- **协议变化**: `message` 事件包含 `reasoning_content` 字段
- **UI展示**: 消息下方显示可折叠的"思考过程"区域

### 搜索增强模式
- **启用条件**: `search_before_planning: true`  
- **功能效果**: 在规划前自动执行网络搜索
- **UI展示**: 工作流中会显示搜索步骤和结果

### 调试模式
- **启用条件**: `debug: true`
- **功能效果**: 包含额外的调试信息
- **UI展示**: 在开发工具中显示详细的事件日志

### 响应式设计特性
- **移动端适配**: 工作流界面在小屏幕上自动调整
- **触摸友好**: 按钮和交互元素符合移动端使用习惯
- **无障碍支持**: 支持屏幕阅读器和键盘导航

## 10. 技术实现细节

### 语法高亮
- **库**: `react-syntax-highlighter`
- **主题**: docco
- **支持语言**: Python, Bash
- **性能优化**: 代码块高度限制，防止页面卡顿

### 缓存机制
- **页面标题缓存**: LRU缓存存储网页标题，减少重复请求
- **配置持久化**: 用户设置保存到 localStorage
- **图标缓存**: 网站图标加载失败时的降级处理

### 状态管理
- **全局状态**: Zustand管理消息历史和系统状态
- **本地状态**: React hooks管理组件内部状态
- **事件驱动**: 所有UI更新都基于API事件触发

这种精确的事件-UI映射关系确保了用户能够实时看到AI系统的每个处理步骤，包括思考过程、工具使用和最终结果，提供了透明且交互性强的用户体验。