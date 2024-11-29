import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const EditBlogPost: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch blog post details
  useEffect(() => {
    if (!id) return;

    const fetchBlogPost = async () => {
      try {
        const response = await axios.get(`/api/blogpost/${id}`);
        const { title, description, content, tags } = response.data;

        setTitle(title);
        setDescription(description);
        setContent(content);
        setTags(tags.map((tag: { name: string }) => tag.name).join(", "));
      } catch (err: any) {
        console.error("Error fetching blog post:", err);
        setError(err.response?.data?.error || "Failed to fetch blog post.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  // Handle form submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior.
  
    setError(null);
  
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to edit this blog post.");
        return;
      }
  
      const formattedTags = tags; // Pass tags as a comma-separated string
  
      await axios.put(
        "/api/blogpost/edit",
        {
          blogPostId: id,
          title,
          description,
          content,
          tags: formattedTags,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the access token for authentication.
          },
        }
      );
  
      router.push("/blogPost/myblogs"); // Redirect to the "My Blogs" page after a successful update.
    } catch (err: any) {
      console.error("Error updating blog post:", err);
      setError(err.response?.data?.error || "Failed to update blog post.");
    }
  };
  
  
  if (loading) return <p>Loading...</p>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Edit Blog Post</h2>
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          ></textarea>
        </div>
        <div>
          <label className="block font-bold mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
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

export default EditBlogPost;
