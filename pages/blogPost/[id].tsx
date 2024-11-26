import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  createdAt: string;
  lastModified: string;
}

const BlogPostDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Retrieve the blog post ID from the URL
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBlogPost = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<BlogPost>(`/api/blogpost/${id}`);
        setBlogPost(response.data);
      } catch (error: any) {
        console.error("Error fetching blog post:", error);
        setError(
          error.response?.data?.error || "Failed to fetch blog post details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-100 text-red-700 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!blogPost) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">No Blog Post Found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">{blogPost.title}</h1>
      <p className="text-gray-600 mb-2">
        <strong>Description:</strong> {blogPost.description}
      </p>
      <p className="text-gray-800 mb-6 whitespace-pre-wrap">
        <strong>Content:</strong>
        <br />
        {blogPost.content}
      </p>
      <p className="text-gray-500">
        <strong>Created At:</strong>{" "}
        {new Date(blogPost.createdAt).toLocaleDateString()}
      </p>
      <p className="text-gray-500">
        <strong>Last Modified:</strong>{" "}
        {new Date(blogPost.lastModified).toLocaleDateString()}
      </p>
      <div className="mt-6">
        <button
          onClick={() => router.push("/blogPost/search")} // Adjust this path as needed
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Back to Blog Posts
        </button>
      </div>
    </div>
  );
};

export default BlogPostDetails;
