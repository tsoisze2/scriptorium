import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";

interface Tag {
  id: number;
  name: string;
}

interface CodeTemplate {
  id: number;
  title: string;
  code: string;
  explanation: string;
  language: string;
  createdAt: string;
  lastModified: string;
  authorId: number;
  tags: Tag[];
}

const TemplateDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [template, setTemplate] = useState<CodeTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [executionResult, setExecutionResult] = useState<{ stdout: string | null; stderr: string | null } | null>(null);
  const [executing, setExecuting] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return; // Wait for the id to be available from the router

    const fetchTemplateDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/codeTemplate/${id}`);
        setTemplate(response.data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching template details:", err);
        setError(
          err.response?.data?.error || "Failed to fetch template details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateDetails();
  }, [id]);

  const handleExecuteCode = async () => {
    if (!template) return;

    try {
      setExecuting(true);
      setExecutionResult(null);
      const response = await axios.post(`/api/codeTemplate/executecode`, {
        code: template.code,
        language: template.language,
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

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        <p>Fetching template details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-100 text-red-700 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">No Template Found</h2>
        <p>The template you're looking for does not exist.</p>
      </div>
    );
  }

  const getLanguageExtension = () => {
    switch (template.language) {
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
      <h1 className="text-3xl font-bold mb-4">{template.title}</h1>

      <div className="mb-6">
        <p className="text-gray-600">
          <strong>Language:</strong> {template.language}
        </p>
        <p className="text-gray-600">
          <strong>Created At:</strong>{" "}
          {new Date(template.createdAt).toLocaleDateString()}
        </p>
        <p className="text-gray-600">
          <strong>Last Modified:</strong>{" "}
          {new Date(template.lastModified).toLocaleDateString()}
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Explanation</h2>
        <p className="text-gray-700">{template.explanation}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Code</h2>
        <CodeMirror
          value={template.code}
          extensions={[getLanguageExtension()]}
          className="border rounded"
        />
      </div>

      <div className="mb-6">
        <button
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 mr-4"
          onClick={handleExecuteCode}
          disabled={executing}
        >
          {executing ? "Executing..." : "Run Code"}
        </button>
      </div>

      {executionResult && (
        <div className="mb-6">
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

      <button
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        onClick={() => router.push("/codeTemplates/myTemplates")}
      >
        Back to Templates
      </button>
    </div>
  );
};

export default TemplateDetails;
