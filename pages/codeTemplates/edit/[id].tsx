import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const EditCodeTemplate: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [title, setTitle] = useState("");
  const [explanation, setExplanation] = useState("");
  const [code, setCode] = useState("");
  const [tags, setTags] = useState<string>("");
  const [language, setLanguage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch template details
  useEffect(() => {
    if (!id) return;

    const fetchTemplate = async () => {
        try {
            const response = await axios.get(`/api/codeTemplate/${id}`);
            const { title, code, explanation, language, tags } = response.data;

            setTitle(title);
            setExplanation(explanation);
            setCode(code);
            setLanguage(language);
            setTags(
                Array.isArray(tags) ? tags.map((tag: { name: string }) => tag.name).join(", ") : ""
            );
        } catch (err: any) {
            console.error("Error fetching template:", err);
            setError(err.response?.data?.error || "Failed to fetch template.");
        } finally {
            setLoading(false);
        }
    };

    fetchTemplate();
  }, [id]);

  // Handle form submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior.
  
    setError(null);
  
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to edit this template.");
        return;
      }
  
      const formattedTags = tags; // Pass tags as a comma-separated string
  
      await axios.put(
        "/api/codeTemplate/edit",
        {
          codeTemplateId: id,
          title,
          code,
          explanation,
          language,
          tags: formattedTags,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the access token for authentication.
          },
        }
      );
  
      router.push("/codeTemplates/myTemplates"); // Redirect to the "My Blogs" page after a successful update.
    } catch (err: any) {
      console.error("Error updating template:", err);
      setError(err.response?.data?.error || "Failed to update template.");
    }
  };
  
  
  if (loading) return <p>Loading...</p>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Edit Template</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block font-bold mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Description</label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full p-2 border rounded"
            required
          ></textarea>
        </div>
        <div>
          <label className="block font-bold mb-1">Content</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 border rounded h-40"
            required
          ></textarea>
        </div>
        <div>
          <label className="block font-bold mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default EditCodeTemplate;
