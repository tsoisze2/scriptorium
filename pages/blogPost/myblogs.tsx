import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  tags: { id: number; name: string }[];
}

interface PaginatedResponse {
  blogPosts: BlogPost[];
  totalBlogPosts: number;
  totalPages: number;
  currentPage: number;
}

const MyBlogs: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch blog posts
  const fetchBlogPosts = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You are not logged in!");
        return;
      }

      const response = await axios.post<PaginatedResponse>(
        "/api/blogpost/myblog",
        { page },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBlogPosts(response.data.blogPosts);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to fetch blog posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">My Blog Posts</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : blogPosts.length === 0 ? (
        <p>No blog posts found.</p>
      ) : (
        <ul className="space-y-4">
          {blogPosts.map((post) => (
            <li key={post.id} className="border p-4 rounded">
              <h3 className="font-bold">{post.title}</h3>
              <p>{post.description}</p>
              <p>
                <strong>Tags:</strong>{" "}
                {post.tags.map((tag) => tag.name).join(", ") || "None"}
              </p>
              <div className="flex space-x-4 mt-4">
                {/* View Post Button */}
                <button
                  onClick={() => router.push(`/blogPost/${post.id}`)}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  View Post
                </button>
                {/* Edit Post Button */}
                <button
                  onClick={() => router.push(`/blogPost/edit/${post.id}`)}
                  className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
                >
                  Edit Post
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => fetchBlogPosts(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-500 text-white py-2 px-4 rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => fetchBlogPosts(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-gray-500 text-white py-2 px-4 rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBlogs;



