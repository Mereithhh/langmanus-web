import { create } from "zustand";

import { type ChatEvent, chatStream } from "../api";
import { chatStream as mockChatStream } from "../api/mock";
import {
  type WorkflowMessage,
  type Message,
  type TextMessage,
} from "../messaging";
import { clone } from "../utils";
import { WorkflowEngine } from "../workflow";

export type ModelSettings = {
  reasoningModel: string;
  reasoningApiKey: string;
  reasoningBaseUrl: string;
  basicModel: string;
  basicApiKey: string;
  basicBaseUrl: string;
  vlModel: string;
  vlApiKey: string;
  vlBaseUrl: string;
};

const defaultModelSettings: ModelSettings = {
  reasoningModel: "qwq-plus",
  reasoningApiKey: "",
  reasoningBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  basicModel: "qwen-max-latest",
  basicApiKey: "",
  basicBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  vlModel: "qwen2.5-vl-72b-instruct",
  vlApiKey: "",
  vlBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
};

// Load model settings from localStorage
const loadModelSettings = (): ModelSettings => {
  if (typeof window === "undefined") return defaultModelSettings;

  try {
    const savedSettings = localStorage.getItem("langmanus.config.modelSettings");
    if (savedSettings) {
      return { ...defaultModelSettings, ...JSON.parse(savedSettings) };
    }
  } catch (e) {
    console.error("Failed to load model settings from localStorage", e);
  }

  return defaultModelSettings;
};

export const useStore = create<{
  messages: Message[];
  responding: boolean;
  state: {
    messages: { role: string; content: string }[];
  };
  modelSettings: ModelSettings;
  setModelSettings: (settings: Partial<ModelSettings>) => void;
}>(() => ({
  messages: [],
  responding: false,
  state: {
    messages: [],
  },
  modelSettings: loadModelSettings(),
  setModelSettings: (settings) =>
    useStore.setState((state) => {
      const newSettings = { ...state.modelSettings, ...settings };
      if (typeof window !== "undefined") {
        localStorage.setItem("langmanus.config.modelSettings", JSON.stringify(newSettings));
      }
      return { modelSettings: newSettings };
    }),
}));

export function addMessage(message: Message) {
  useStore.setState((state) => ({ messages: [...state.messages, message] }));
  return message;
}

export function updateMessage(message: Partial<Message> & { id: string }) {
  useStore.setState((state) => {
    const index = state.messages.findIndex((m) => m.id === message.id);
    if (index === -1) {
      return state;
    }
    const newMessage = clone({
      ...state.messages[index],
      ...message,
    } as Message);
    return {
      messages: [
        ...state.messages.slice(0, index),
        newMessage,
        ...state.messages.slice(index + 1),
      ],
    };
  });
}

export async function sendMessage(
  message: Message,
  params: {
    deepThinkingMode: boolean;
    searchBeforePlanning: boolean;
  },
  options: { abortSignal?: AbortSignal } = {},
) {
  addMessage(message);
  let stream: AsyncIterable<ChatEvent>;
  if (window.location.search.includes("mock")) {
    stream = mockChatStream(message);
  } else {
    stream = chatStream(message, useStore.getState().state, params, options);
  }
  setResponding(true);

  let textMessage: TextMessage | null = null;
  try {
    for await (const event of stream) {
      switch (event.type) {
        case "start_of_agent":
          textMessage = {
            id: event.data.agent_id,
            role: "assistant",
            type: "text",
            content: "",
          };
          addMessage(textMessage);
          break;
        case "message":
          if (textMessage) {
            textMessage.content += event.data.delta.content;
            updateMessage({
              id: textMessage.id,
              content: textMessage.content,
            });
          }
          break;
        case "end_of_agent":
          textMessage = null;
          break;
        case "start_of_workflow":
          const workflowEngine = new WorkflowEngine();
          const workflow = workflowEngine.start(event);
          const workflowMessage: WorkflowMessage = {
            id: event.data.workflow_id,
            role: "assistant",
            type: "workflow",
            content: { workflow: workflow },
          };
          addMessage(workflowMessage);
          for await (const updatedWorkflow of workflowEngine.run(stream)) {
            updateMessage({
              id: workflowMessage.id,
              content: { workflow: updatedWorkflow },
            });
          }
          _setState({
            messages: workflow.finalState?.messages ?? [],
          });
          break;
        default:
          break;
      }
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      return;
    }
    throw e;
  } finally {
    setResponding(false);
  }
  return message;
}

export function clearMessages() {
  useStore.setState({ messages: [] });
}

export function setResponding(responding: boolean) {
  useStore.setState({ responding });
}

export function _setState(state: {
  messages: { role: string; content: string }[];
}) {
  useStore.setState({ state });
}
