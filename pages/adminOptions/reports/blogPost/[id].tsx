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
  visibleToPublic: boolean;
}

const BlogPostDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blog post details
  const fetchBlogPost = async () => {
    if (!id) return; // Ensure ID exists before fetching

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<BlogPost>(`/api/blogpost/${id}`);
      setBlogPost(response.data);
    } catch (error: any) {
      console.error("Error fetching blog post:", error);
      setError(
        error.response?.data?.error || "Failed to fetch the blog post details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPost();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-100 text-red-700 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!blogPost) {
    return <p>No blog post found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">{blogPost.title}</h1>
      <p className="text-lg font-semibold mb-4">{blogPost.description}</p>
      <div className="prose mb-6">{blogPost.content}</div>

      {/* Additional Metadata */}
      <p className="text-gray-500">
        <strong>Created At:</strong>{" "}
        {new Date(blogPost.createdAt).toLocaleDateString()}
      </p>
      <p className="text-gray-500">
        <strong>Last Modified:</strong>{" "}
        {new Date(blogPost.lastModified).toLocaleDateString()}
      </p>
      <p className="text-gray-500">
        <strong>Visibility:</strong>{" "}
        {blogPost.visibleToPublic ? "Public" : "Hidden"}
      </p>

      {/* Back Button */}
      <button
        onClick={() => router.push("/adminOptions/reports/blogPostReports")}
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Back to Reports
      </button>
    </div>
  );
};

export default BlogPostDetails;