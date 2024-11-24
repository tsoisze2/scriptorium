import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";

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
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          <code>{template.code}</code>
        </pre>
      </div>

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
