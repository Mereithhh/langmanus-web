import { nanoid } from "nanoid";

import { type ChatEvent, type StartOfWorkflowEvent } from "../api";

import { type WorkflowStep } from "./steps";
import { type ThinkingTask, type ToolCallTask } from "./tasks";
import { type Workflow } from "./workflow";

export class WorkflowEngine {
  private _workflow: Workflow | undefined;

  get workflow() {
    if (!this._workflow) {
      throw new Error("Workflow not started");
    }
    return this._workflow;
  }

  start(startEvent: StartOfWorkflowEvent) {
    const workflow: Workflow = {
      id: startEvent.data.workflow_id,
      name: startEvent.data.input[0]!.content,
      steps: [],
    };
    this._workflow = workflow;
    return workflow;
  }

  mergeToolCallInput(toolCallTask: ToolCallTask, deltaInput: Record<string, any>) {
    // 确保 input 对象存在
    if (!toolCallTask.payload.input) {
      toolCallTask.payload.input = {};
    }

    const input = toolCallTask.payload.input as Record<string, any>;

    for (const key in deltaInput) {
      // 使用 hasOwnProperty 检查，避免原型链上的属性
      if (!deltaInput.hasOwnProperty(key)) {
        continue;
      }

      const deltaValue = deltaInput[key];

      // 跳过 undefined 和 null，但保留空字符串（如果需要累加的话）
      if (deltaValue === undefined || deltaValue === null) {
        continue;
      }

      const existingValue = input[key];

      if (existingValue !== undefined && existingValue !== null) {
        // 已存在值，尝试合并
        if (typeof existingValue === 'string' && typeof deltaValue === 'string') {
          input[key] = existingValue + deltaValue;
        } else if (typeof existingValue === 'number' && typeof deltaValue === 'number') {
          input[key] = existingValue + deltaValue;
        } else if (Array.isArray(existingValue) && Array.isArray(deltaValue)) {
          input[key] = [...existingValue, ...deltaValue];
        } else {
          // 类型不匹配或不支持合并的类型，直接替换
          input[key] = deltaValue;
        }
      } else {
        // 不存在值，直接设置
        input[key] = deltaValue;
      }
    }
  }

  async *run(stream: AsyncIterable<ChatEvent>) {
    if (!this.workflow) {
      throw new Error("Workflow not started");
    }
    let currentStep: WorkflowStep | null = null;
    let currentThinkingTask: ThinkingTask | null = null;
    let pendingToolCallTasks: ToolCallTask[] = [];
    let toolCallTask: ToolCallTask | undefined = undefined;

    for await (const event of stream) {
      switch (event.type) {
        case "start_of_agent":
          currentStep = {
            id: event.data.agent_id,
            agentId: event.data.agent_id,
            agentName: event.data.agent_name,
            displayName: event.data.display_name,
            type: "agentic",
            tasks: [],
          };
          this.workflow.steps.push(currentStep);
          yield this.workflow;
          break;
        case "end_of_agent":
          currentStep = null;
          break;
        case "start_of_llm":
          currentThinkingTask = {
            id: nanoid(),
            type: "thinking",
            state: "pending",
            payload: {
              text: "",
            },
          };
          currentStep!.tasks.push(currentThinkingTask);
          yield this.workflow;
          break;
        case "end_of_llm":
          if (currentThinkingTask) {
            currentThinkingTask.state = "success";
            currentThinkingTask = null;
          }
          yield this.workflow;
          break;
        case "message":
          if (event.data.delta.content) {
            if (currentThinkingTask!.payload.text === undefined) {
              currentThinkingTask!.payload.text = "";
            }
            currentThinkingTask!.payload.text += event.data.delta.content;
          } else if (event.data.delta.reasoning_content) {
            if (currentThinkingTask!.payload.reason === undefined) {
              currentThinkingTask!.payload.reason = "";
            }
            currentThinkingTask!.payload.reason +=
              event.data.delta.reasoning_content;
          }
          yield this.workflow;
          break;
        case "tool_call":
          toolCallTask = pendingToolCallTasks.find(
            (task) => task.id === event.data.tool_call_id,
          );
          // 如果没有的话，创建一个
          if (!toolCallTask) {
            toolCallTask = {
              id: event.data.tool_call_id,
              type: "tool_call",
              state: "pending",
              payload: {
                toolName: event.data.tool_name,
                input: event.data.tool_input ?? {},
              },
            };
            pendingToolCallTasks.push(toolCallTask);
            currentStep!.tasks.push(toolCallTask);
          }


          // 走到这里一定有 task 了，所以直接改就行了。
          if (event.data.delta_input) {
            this.mergeToolCallInput(toolCallTask, event.data.delta_input);
          } else if (event.data.tool_input) {
            // 覆盖。
            toolCallTask.payload.input = event.data.tool_input;
          }



          yield this.workflow;
          break;
        case "tool_call_result":
          toolCallTask = pendingToolCallTasks.find(
            (task) => task.id === event.data.tool_call_id,
          );
          if (toolCallTask) {
            toolCallTask.state = "success";
            toolCallTask.payload.output = event.data.tool_result;
            pendingToolCallTasks = pendingToolCallTasks.filter(
              (task) => task.id !== event.data.tool_call_id,
            );
          }
          yield this.workflow;
          break;
        case "end_of_workflow":
          this.workflow.finalState = { messages: event.data.messages };
          return;
        default:
          break;
      }
    }
  }
}
