import { PythonOutlined, DownOutlined, UpOutlined, PlayCircleOutlined, ExclamationCircleOutlined, CheckOutlined } from "@ant-design/icons";
import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { cn } from "~/core/utils";
import { type ToolCallTask } from "~/core/workflow";

export function CodeToolCallView({
  task,
}: {
  task: ToolCallTask<{ code: string, title: string, stdout?: string, stderr?: string, result?: string; }>;
}) {
  const [showStdout, setShowStdout] = useState(false);
  const [showStderr, setShowStderr] = useState(false);

  const hasStdout = Boolean(task.payload.input?.stdout?.trim());
  const hasStderr = Boolean(task.payload.input?.stderr?.trim());
  const hasResult = Boolean(task.payload.input?.result?.trim());

  return (
    <div>
      <div className="flex items-center gap-2">
        <div>
          <PythonOutlined className="h-4 w-4 text-sm" />
        </div>
        <div>
          <span>{task.payload.input.title}</span>
        </div>
      </div>
      
      {task.payload.input.code && (
        <div className="min-w[640px] mx-4 mt-2 max-h-[420px] max-w-[640px] overflow-auto rounded-lg border bg-gray-50 p-2">
          <SyntaxHighlighter language="python" style={docco}>
            {task.payload.input.code}
          </SyntaxHighlighter>
        </div>
      )}

      {hasResult && (
        <div className="mt-2 mb-4">
          <CheckOutlined  className="h-3 w-3 mr-2" />
          <span className="inline-block mb-2">Code Result</span>
          <div className={'block mx-4 '}>
            <div className="max-h-[300px] max-w-[640px] overflow-auto rounded-lg border bg-gray-50 p-3">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {task.payload.input.result}
              </pre>
            </div>
          </div>
        </div>
      )}

      {hasStdout && (
        <div className="mx-4 mt-2">
          <button
            className="mb-1 flex h-8 items-center gap-2 rounded-2xl border bg-button px-4 text-sm text-button hover:bg-button-hover hover:text-button-hover"
            onClick={() => setShowStdout(!showStdout)}
          >
            <PlayCircleOutlined className="h-4 w-4" />
            <span>Output</span>
            {showStdout ? (
              <UpOutlined className="text-xs" />
            ) : (
              <DownOutlined className="text-xs" />
            )}
          </button>
          <div className={cn(showStdout ? "block" : "hidden")}>
            <div className="max-h-[300px] max-w-[640px] overflow-auto rounded-lg border bg-gray-50 p-3">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {task.payload.input.stdout}
              </pre>
            </div>
          </div>
        </div>
      )}

      {hasStderr && (
        <div className="mx-4 mt-2">
          <button
            className="mb-1 flex h-8 items-center gap-2 rounded-2xl border bg-button px-4 text-sm text-button hover:bg-button-hover hover:text-button-hover"
            onClick={() => setShowStderr(!showStderr)}
          >
            <ExclamationCircleOutlined className="h-4 w-4" />
            <span>Error Output</span>
            {showStderr ? (
              <UpOutlined className="text-xs" />
            ) : (
              <DownOutlined className="text-xs" />
            )}
          </button>
          <div className={cn(showStderr ? "block" : "hidden")}>
            <div className="max-h-[300px] max-w-[640px] overflow-auto rounded-lg border border-red-200 bg-red-50 p-3">
              <pre className="text-sm text-red-700 whitespace-pre-wrap font-mono">
                {task.payload.input.stderr}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}