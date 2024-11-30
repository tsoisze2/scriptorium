import { useRouter } from "next/router";
import React, { useState } from "react";
import axios from "axios";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";

const CodeRunner: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [input, setInput] = useState<string>("");
  const [executionResult, setExecutionResult] = useState<{ stdout: string | null; stderr: string | null } | null>(null);
  const [executing, setExecuting] = useState<boolean>(false);
  const router = useRouter();


  const handleExecuteCode = async () => {
    try {
      setExecuting(true);
      setExecutionResult(null);
      const response = await axios.post(`/api/codeTemplate/executecode`, {
        code: code,
        language: language,
        stdin: input
      });
      setExecutionResult({
        stdout: response.data.output,
        stderr: response.data.error
      });
    } catch (err: any) {
      console.error("Error executing code:", err);
      setExecutionResult({
        stdout: err.response.data.output,
        stderr: err.response?.data?.error || "Failed to execute the code."
      });
    } finally {
      setExecuting(false);
    }
  };

  const getLanguageExtension = () => {
    switch (language) {
      case "javascript":
        return javascript();
      case "python":
        return python();
      case "java":
        return java();
      case "c":
      case "cpp":
        return cpp();
      default:
        return javascript();
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Run Your Code</h1>

      <div className="mb-6">
        <label className="block mb-2 text-lg font-semibold">Select Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 border rounded w-full"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Code</h2>
        <CodeMirror
          value={code}
          extensions={[getLanguageExtension()]}
          onChange={(value) => setCode(value)}
          className="border rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2 text-lg font-semibold">Input (Optional):</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          className="p-2 border rounded w-full font-mono"
        ></textarea>
      </div>

      <button
        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        onClick={handleExecuteCode}
        disabled={executing}
      >
        {executing ? "Executing..." : "Run Code"}
      </button>

      {executionResult && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Execution Result</h2>
          {executionResult.stdout && (
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Standard Output</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                <code>{executionResult.stdout}</code>
              </pre>
            </div>
          )}
          {executionResult.stderr && (
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Standard Error</h3>
              <pre className="bg-red-100 p-4 rounded overflow-auto">
                <code>{executionResult.stderr}</code>
              </pre>
            </div>
          )}
        </div>
      )}
      <div className="mt-6 space-y-4">
            <button
                onClick={() => router.push("/users/profile")}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
                Go To My Profile
            </button>
        </div>
    </div>
  );
};

export default CodeRunner;
