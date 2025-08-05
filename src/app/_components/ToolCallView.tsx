import {
  GlobalOutlined,
  PythonOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { LRUCache } from "lru-cache";
import { useMemo } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { CodeToolCallView } from "./CodeView";
// eslint-disable-next-line import/order
import { type ToolCallTask } from "~/core/workflow";
import { Markdown } from "./Markdown";

export function ToolCallView({ task }: { task: ToolCallTask }) {
  if (task.payload.toolName === "google_search") {
    return <GoogleSearchToolCallView task={task as ToolCallTask<any>} />;
  } else if (task.payload.toolName === "scrape") {
    return <CrawlToolCallView task={task as ToolCallTask<any>} />;
  } else if (task.payload.toolName === "browser") {
    return <BrowserToolCallView task={task as ToolCallTask<any>} />;
  } else if (task.payload.toolName === "python_repl_tool") {
    return <PythonReplToolCallView task={task as ToolCallTask<any>} />;
  } else if (task.payload.toolName === "code") {
    return <CodeToolCallView task={task as ToolCallTask<any>} />;
  } else if (task.payload.toolName === "bash_tool") {
    return <BashToolCallView task={task as ToolCallTask<any>} />;
  } else if (task.payload.toolName === "show_text") {
    return <Markdown
      className="pl-6 opacity-70"
      style={{
        fontSize: "smaller",
      }}
    >
      {(task.payload.input as any).text}
    </Markdown>
  }
  return <div>{task.payload.toolName}</div>;
}

function BrowserToolCallView({
  task,
}: {
  task: ToolCallTask<{ instruction: string }>;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <div>
          <GlobalOutlined className="h-4 w-4 text-sm" />
        </div>
        <div>
          <span className="text-sm">{task.payload.input.instruction}</span>
        </div>
      </div>
    </div>
  );
}

const pageCache = new LRUCache<string, string>({ max: 100 });
function CrawlToolCallView({ task }: { task: ToolCallTask<{ result?: string, url: string, title?: string}> }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <div>
          <GlobalOutlined className="h-4 w-4 text-sm" />
        </div>
        <div>
          <span>Reading</span>{" "}
          <a
            className="text-sm font-bold"
            href={task.payload.input.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            &quot;{task.payload.input?.title ?? task.payload.input.url}&quot;
          </a>
        </div>
      </div>
    </div>
  );
}


interface GoogleResult {
  credits: number;
  organic: {
    link: string;
    title: string;
    snippet: string;
    position: number;
  }[];
  relatedSearches: {
    query: string
  }[];
  searchParameters: {
    engine: string;
    gl: string;
    hl: string;
    q: string;
    type: string;
  }
}

function GoogleSearchToolCallView({
  task,
}: {
  task: ToolCallTask<{ q: string , result?: string}>;
}) {
  const results = useMemo(() => {
    try {
      const result: GoogleResult = JSON.parse(task.payload.output ?? task.payload.input?.result ?? "") ?? {};
      
      return result?.organic;
    } catch (error) {
      return [];
    }
  }, [task.payload.output, task.payload.input?.result]);
  return (
    <div>
      <div className="flex items-center gap-2">
        <div>
          <SearchOutlined className="h-4 w-4 text-sm" />
        </div>
        <div>
          Searching for{" "}
          <span className="font-bold">
            &quot;{task.payload.input.q}&quot;
          </span>
        </div>
      </div>
      {results.length> 0 && (
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-2">
            <div>
              <UnorderedListOutlined className="h-4 w-4 text-sm" />
            </div>
            <div>
              <span className="text-sm text-gray-500">
                {results.length} results found
              </span>
            </div>
          </div>
          <ul className="flex flex-col gap-2 text-sm">
            {results.map((result, index: number) => (
              <li key={result.link + "_" + index} className="list-item list-inside pl-6">
                <a
                  className="flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={result.link}
                >
                  <img
                    className="h-4 w-4 rounded-full bg-slate-100 shadow"
                    src={new URL(result.link).origin + "/favicon.ico"}
                    alt={result.title}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://perishablepress.com/wp/wp-content/images/2021/favicon-standard.png";
                    }}
                  />
                  {result.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PythonReplToolCallView({
  task,
}: {
  task: ToolCallTask<{ code: string }>;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <div>
          <PythonOutlined className="h-4 w-4 text-sm" />
        </div>
        <div>
          <span>Writing and executing Python Code</span>
        </div>
      </div>
      {task.payload.input.code && (
        <div className="min-w[640px] mx-4 mt-2 max-h-[420px] max-w-[640px] overflow-auto rounded-lg border bg-gray-50 p-2">
          <SyntaxHighlighter language="python" style={docco}>
            {task.payload.input.code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}

function BashToolCallView({ task }: { task: ToolCallTask<{ cmd: string }> }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <div>
          <PythonOutlined className="h-4 w-4 text-sm" />
        </div>
        <div>
          <span>
            Executing <a className="font-medium">Bash Command</a>
          </span>
        </div>
      </div>
      {task.payload.input.cmd && (
        <div
          className="min-w[640px] mx-4 mt-2 max-h-[420px] max-w-[640px] overflow-auto rounded-lg border bg-gray-50 p-2"
          style={{ fontSize: "smaller" }}
        >
          <SyntaxHighlighter language="bash" style={docco}>
            {task.payload.input.cmd}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
