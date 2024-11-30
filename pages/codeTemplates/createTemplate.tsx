import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const CreateCodeTemplate: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    explanation: "",
    language: "",
    tags: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Languages supported by the API
  const supportedLanguages = ['python', 'javascript', 'java', 'c', 'cpp', 'ruby', 'go', 'php', 'swift', 'kotlin', 'r', 'rust'];

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Get access token from localStorage
      const accessToken = localStorage.getItem("accessToken");
      
      // Make API call to create code template
      const response = await axios.post(
        "/api/codeTemplate/create", 
        formData, 
        {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      // Redirect to the newly created template's detail page
      router.push(`/codeTemplates/${response.data.id}`);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to create code template. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Code Template</h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <label className="block mb-4">
          Title
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Enter template title"
            required
          />
        </label>

        {/* Language */}
        <label className="block mb-4">
          Programming Language
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            required
          >
            <option value="">Select a language</option>
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </label>

        {/* Code */}
        <label className="block mb-4">
          Code
          <textarea
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded h-64"
            placeholder="Enter your code template"
            required
          />
        </label>

        {/* Explanation */}
        <label className="block mb-4">
          Explanation
          <textarea
            name="explanation"
            value={formData.explanation}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded h-32"
            placeholder="Provide a detailed explanation of the code template"
            required
          />
        </label>

        {/* Tags (optional) */}
        <label className="block mb-4">
          Tags (comma-separated)
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Enter tags (e.g., algorithm, sorting, beginner)"
          />
        </label>

        <button
          type="submit"
          className={`w-full py-2 px-4 text-white font-bold rounded ${loading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"}`}
          disabled={loading}
        >
          {loading ? "Creating Template..." : "Create Template"}
        </button>
      </form>

      <button
        onClick={() => router.back()}
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Back
      </button>


    </div>
  );
};

export default CreateCodeTemplate;