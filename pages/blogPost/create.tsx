import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const CreateBlogPost: React.FC = () => {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!title.trim() || !description.trim() || !content.trim()) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to create a blog post.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "/api/blogpost/create",
        { title, description, content, tags },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Blog post created successfully!");
      setTitle("");
      setDescription("");
      setContent("");
      setTags("");

      // Redirect to the blog post search page
      router.push(`/blogPost/${response.data.id}`);
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      setError(error.response?.data?.error || "Failed to create blog post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Create a Blog Post</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {message && <div className="text-green-500 mb-4">{message}</div>}

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter the blog post title"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Description:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter a brief description"
            required
          ></textarea>
        </div>

        {/* Content */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Write the main content here"
            required
            rows={15} // Sets the height to 10 rows initially
          ></textarea>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Tags:</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter tags separated by commas (e.g., react, nextjs)"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 text-white font-bold rounded ${
            loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Creating Blog Post..." : "Create Blog Post"}
        </button>
      </form>

      <div className="mt-6">
        <button
          onClick={() => router.push("/blogPost/search")}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Back to Blog Posts
        </button>
      </div>
    </div>
  );
};

export default CreateBlogPost;