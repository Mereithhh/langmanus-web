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


py_code_1 = '''def determinant(matrix):
    """计算方阵的行列式"""
    n = len(matrix)
    
    # 检查是否为方阵
    if not all(len(row) == n for row in matrix):
        raise ValueError("矩阵必须是方阵")
    
    # 1x1 矩阵
    if n == 1:
        return matrix[0][0]
    
    # 2x2 矩阵
    if n == 2:
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
    
    # 使用递归计算更大矩阵的行列式（按第一行展开）
    det = 0
    for j in range(n):
        # 创建 (n-1)x(n-1) 子矩阵
        submatrix = [[matrix[i][k] for k in range(n) if k != j] 
                     for i in range(1, n)]
        # 计算代数余子式
        det += ((-1) ** j) * matrix[0][j] * determinant(submatrix)
    
    return det
'''

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
    "display_name": "自定义名称",
    "content": "# 可以渲染 markdown\n **11111**"
  },
  {
    "agent": "researcher",
    "contents": [
      {
      "type": "tool_call",
      "tool_name": "code",
      "payload": {
        "title": "run code 1",
        "code": py_code_1,
        "result": "执行结果，执行结果，执行结果",
        "stdout": "result_111",
        "stderr": "",
      },
      "streaming_mode": True,
      },
      {
        "type": "tool_call",
        "tool_name": "show_text",
        "payload": {
          "text": "这个结果很好，让我来继续运行下面的代码",
        }
      },
      {
      "type": "tool_call",
      "tool_name": "code",
      "payload": {
        "title": "run code 2",
        "code": "print(hello_world)",
        "stdout": "",
        "stderr": "expression is not defined",
      }
      },
      {
        "type": "tool_call",
        "tool_name": "show_text",
        "payload": {
          "text": "很好，接下来让我搜索一下",
        }
      },
      {
      "type": "tool_call",
      "tool_name": "google_search",
        "payload": {
          "query": "What is the capital of France?",
          "result": json.dumps([
            {
              "title": "title 1",
              "url": "https://www.google.com",
            },
            {
              "title": "title 2",
              "url": "https://www.google.com/1",
            },
            ],ensure_ascii=False)
        }
      },
      {
        "type": "tool_call",
        "tool_name": "show_text",
        "payload": {
          "text": "搜索完毕，看一下具体的页面内容,搜索完毕，看一下具体的页面内容,搜索完毕，看一下具体的页面内容,搜索完毕，看一下具体的页面内容,搜索完毕，看一下具体的页面内容,搜索完毕，看一下具体的页面内容,搜索完毕，看一下具体的页面内容,搜索完毕，看一下具体的页面内容,搜索完毕，看一下具体的页面内容",
        },
        "streaming_mode": True,
      },
      {
        "type": "tool_call",
        "tool_name": "scrape",
        "payload": {
          "url": "https://www.google.com",
          "title": "crawl_title"
        }
      }
    ]
  },
  {
    "agent": "reporter",
    "content": "总结一下"
  }
]

# 一共有 5 种可以展示 UI 的 tool，分别是：
# 1. browser
# 2. python_repl_tool
# 3. bash_tool
# 4. scrape
# 5. google_search
def make_tool_call(tool_name: str, payload: dict, streaming_mode: bool = False):
  result = []
  tool_id = str(uuid.uuid4())
  if (not streaming_mode):
    result.append({
      "event": "tool_call", 
      "data" :{
        "tool_call_id": tool_id,
        "tool_name": tool_name,
        "tool_input": payload,
      }
    })
  else:
    chunk_size = 20
    for key, value in payload.items():
      if (isinstance(value, str)):
        for i in range(0, len(value), chunk_size):
          result.append({
            "event": "tool_call", 
            "data" :{
              "tool_call_id": tool_id,
              "tool_name": tool_name,
              "delta_input": {
                key: value[i:i+chunk_size]
              },
            }
          })
  return result

def make_message(message_id: str, content: str):
  return {
        "event": "message",
        "data": {
          "message_id": message_id,
          "delta": {
            "content": content,
          },
        },
      }
  
def make_contents(contents: list):
  result_list = []
  for content in contents:
    if "type" in content and  content.get("type",None) == "tool_call":

      result_list.extend(make_tool_call(content["tool_name"], content["payload"], content.get("streaming_mode", False)))
    else:
      result_list.append(make_message(str(uuid.uuid4()), content))
  return result_list
  

def make_llm_data(agent_item: dict):
  result_list = []
  message_id = str(uuid.uuid4())
  if agent_item["agent"] == "planner":
    result_list.append(
        make_message(message_id,json.dumps({"steps": agent_item["steps"]}, ensure_ascii=False))
      )
  elif agent_item.get("contents", None):
    result_list.extend(make_contents(agent_item["contents"]))
    
  else:
    result_list.extend(make_contents([
      agent_item["content"]
    ]))
  return result_list



def make_agent_data(agent_item: dict):
  result_list = []
  agent_id = str(uuid.uuid4())
  result_list.append(
    {
      "event": "start_of_agent",
      "data": {
        "agent_name": agent_item["agent"],
        "display_name": agent_item.get("display_name", None),
        "agent_id": agent_id,
      },
    }
  )
  result_list.append(
    {
      "event": "start_of_llm",
      "data": {
        "agent_name": agent_item["agent"],
        "display_name": agent_item.get("display_name", None),
      },
    }
  )
  # 拼 message/tool_call
  result_list.extend(make_llm_data(agent_item))
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

def make_sse_text(result_list: list):
  text = ""
  for item in result_list:
    text += f"event: {item['event']}\n"
    text += f"data: {json.dumps(item['data'], ensure_ascii=False)}\n"
    text += "\n"
  return text


def make_mock_data(mock_data):
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
  return make_sse_text(result_list)


if __name__ == "__main__":
  import os
  # 读取本地的 temp.json
  # with open("./scripts/temp.json", "r") as f:
  #   mock_data = json.load(f)
  text = make_mock_data(mock_data)
  # 当前路径上面的
  current_dir = os.path.dirname(os.path.abspath(__file__))
  target_file = os.path.join(current_dir,"..", "src/core/api/mock.txt")
  with open(target_file, "w") as f:
    f.write(text)
  print(text)
  print(f"\n\nMock text has been generated and saved to {target_file}")