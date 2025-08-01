import uuid
import json
# 整体上是有多个 step，在 UI 上渲染为卡片左侧的一个标题，对应一个 agentic
# 在 start_of_agent 和 end_of_agent 中间包裹的地方就是。

# 整体上是有多种 step：
# planner: 会渲染成一个 list，展示步骤
# researcher： 可以渲染 markdown 或者 tool_call 组件（根据 tool_name 不同，展示效果不同）
# coder： 可以渲染 markdown 或者 tool_call 组件（根据 tool_name 不同，展示效果不同）
# reporter： 在最下面渲染一个总结的文本，一定在最后

# agent_id 每一个都不一样
# mesasge_id 每一个 llm start/end 中都不一样

# 下面的例子是，planning，然后 researcher，最后总结一下。

mock_data = [
  {
    "agent": "planner",
    "steps": [
      {
        "title": "Create a Python sandbox to work in",
        "description": "Desc1",
      },
      {
        "title": "Search for and download World Bank data on gross savings as % of GDP",
        "description": "Desc2",
      },
      {
        "title": "Process the data to identify countries meeting the criteria",
        "description": "Desc3",
      },
      {
        "title": "Format the final answer as requested",
        "description": "Desc4",
      },
    ],
  },
  {
    "agent": "researcher",
    "content": "# 可以渲染 markdown\n **11111**"
  },
  {
    "agent": "reporter",
    "content": "总结一下"
  }
]



def generate_message_data(agent_item: dict):
  result_list = []
  message_id = str(uuid.uuid4())
  if agent_item["agent"] == "planner":
    result_list.append(
        {
          "event": "message",
          "data": {
            "message_id": message_id,
            "delta": {
              "content": json.dumps({"steps": agent_item["steps"]}, ensure_ascii=False),
            },
          }
        }
      )
      
  else:
    result_list.append(
      {
        "event": "message",
        "data": {
          "message_id": message_id,
          "delta": {
            "content": agent_item["content"],
          },
        },
      }
    )
  return result_list


def make_text(result_list: list):
  text = ""
  for item in result_list:
    text += f"event: {item['event']}\n"
    text += f"data: {json.dumps(item['data'], ensure_ascii=False)}\n"
    text += "\n"
  return text


def make_agent_data(agent_item: dict):
  result_list = []
  agent_id = str(uuid.uuid4())
  result_list.append(
    {
      "event": "start_of_agent",
      "data": {
        "agent_name": agent_item["agent"],
        "agent_id": agent_id,
      },
    }
  )
  result_list.append(
    {
      "event": "start_of_llm",
      "data": {
        "agent_name": agent_item["agent"],
      },
    }
  )
  # 拼 message
  result_list.extend(generate_message_data(agent_item))
  result_list.append(
    {
      "event": "end_of_llm",
      "data": {
        "agent_name": agent_item["agent"],
      },
    }
  )
  result_list.append(
    {
      "event": "end_of_agent",
      "data": {
        "agent_name": agent_item["agent"],
        "agent_id": agent_id,
      },
    }
  )
  return result_list

def generate_mock_text():
  result_list = []
  user_input = "你好"
  workflow_id = str(uuid.uuid4())
  result_list.append(
    {
      "event": "start_of_workflow",
      "data": {
        "workflow_id": workflow_id,
        "input": [
          {
            "role": "user",
            "content": user_input,
          }
        ]
      },
    }
  )
  for agent_item in mock_data:
    result_list.extend(make_agent_data(agent_item))
    
  result_list.append(
    {
      "event": "end_of_workflow",
      "data": {
        "workflow_id": workflow_id,
      },
    }
  )
  return make_text(result_list)


if __name__ == "__main__":
  import os
  text = generate_mock_text()
  # 当前路径上面的
  current_dir = os.path.dirname(os.path.abspath(__file__))
  target_file = os.path.join(current_dir,"..", "src/core/api/mock.txt")
  with open(target_file, "w") as f:
    f.write(text)
  print(text)
  print(f"\n\nMock text has been generated and saved to {target_file}")