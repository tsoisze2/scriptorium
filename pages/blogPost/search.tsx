import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface BlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  score: number;
  tags: { id: number; name: string }[];
  author: { id: number; username: string };
}

interface UserProfile {
  id: number;
  username: string;
  role: string;
}

interface PaginatedResponse {
  blogPosts: BlogPost[];
  totalBlogPosts: number;
  totalPages: number;
  currentPage: number;
}

const BlogPostSearch: React.FC = () => {
  const router = useRouter();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [codeTemplateId, setCodeTemplateId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch the logged-in user's profile
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get<UserProfile>("/api/user/getProfile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserProfile(response.data);
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      setError("Failed to fetch user profile. Please log in again.");
    }
  };

  // Fetch blog posts from the API
  const fetchBlogPosts = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<PaginatedResponse>(
        "/api/blogpost/search",
        { title, content, tags, codeTemplateId, page }
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

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBlogPosts(1); // Reset to the first page for a new search
  };

  // Handle page navigation
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchBlogPosts(newPage);
    }
  };

  // Navigate to blog post details
  const handleViewPost = (id: number) => {
    router.push(`/blogPost/${id}`);
  };

  // Delete a blog post
  const handleDelete = async (postId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You are not logged in!");
        return;
      }

      await axios.delete("/api/blogpost/delete", {
        headers: { Authorization: `Bearer ${token}` },
        data: { blogPostId: postId },
      });

      fetchBlogPosts(currentPage); // Refresh the posts after deletion
    } catch (error: any) {
      console.error("Error deleting blog post:", error);
      setError(
        error.response?.data?.error || "Failed to delete blog post. Please try again."
      );
    }
  };

  // Navigate to create blog post page
  const handleCreatePost = () => {
    router.push("/blogPost/createblog");
  };

  useEffect(() => {
    fetchUserProfile();
    fetchBlogPosts();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Search Blog Posts</h2>

      {userProfile && (
        <div className="mb-4">
          <p>Welcome, {userProfile.username}!</p>
          {userProfile.role === "ADMIN" && <p>You have admin privileges.</p>}
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6 space-y-4">
        <div>
          <label htmlFor="title" className="block font-bold mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Search by title"
          />
        </div>
        <div>
          <label htmlFor="content" className="block font-bold mb-1">
            Content
          </label>
          <input
            type="text"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Search by content"
          />
        </div>
        <div>
          <label htmlFor="tags" className="block font-bold mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., beginner, JavaScript"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {/* Error Message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Blog Posts List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {blogPosts.length === 0 ? (
            <p>No blog posts found.</p>
          ) : (
            <ul className="space-y-4">
              {blogPosts.map((post) => (
                <li
                  key={post.id}
                  className="border p-4 rounded flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-lg">{post.title}</h3>
                    <p>{post.description}</p>
                    <p>
                      <strong>Author:</strong>{" "}
                      {post.author.username || "Unknown"}
                    </p>
                    <p>
                      <strong>Tags:</strong>{" "}
                      {post.tags.map((tag) => tag.name).join(", ") || "None"}
                    </p>
                    <p>
                      <strong>Score:</strong> {post.score}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => handleViewPost(post.id)}
                      className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 mr-2"
                    >
                      View Post
                    </button>
                    {userProfile?.username === post.author.username && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Blog Post Button */}
      <div className="mt-6">
        <button
          onClick={handleCreatePost}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
        >
          Create New Blog Post
        </button>
      </div>
    </div>
  );
};

export default BlogPostSearch;


