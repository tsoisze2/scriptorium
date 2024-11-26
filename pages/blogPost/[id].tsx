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

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  score: number; // Rating score (upvotes - downvotes)
  author: { username: string } | null; // Handle null author to avoid runtime errors
}

const BlogPostDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Retrieve the blog post ID from the URL
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

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

    const fetchComments = async (page: number = 1) => {
      try {
        const response = await axios.post(`/api/comment/sortByRating`, {
          blogPostId: id,
          page,
        });
        setComments(response.data.comments);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
      } catch (error: any) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchBlogPost();
    fetchComments();
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    if (!newComment.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setCommentError("You must be logged in to comment.");
        return;
      }

      const response = await axios.post(
        "/api/comment/create",
        {
          content: newComment,
          blogPostId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments((prev) => [response.data, ...prev]); // Add the new comment to the list
      setNewComment(""); // Clear the input field
    } catch (error: any) {
      console.error("Error creating comment:", error);
      setCommentError(
        error.response?.data?.error || "Failed to create comment. Please try again."
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    // Fetch comments for the new page
    const fetchComments = async () => {
      try {
        const response = await axios.post(`/api/comment/sortByRating`, {
          blogPostId: id,
          page: newPage,
        });
        setComments(response.data.comments);
        setCurrentPage(response.data.currentPage);
      } catch (error: any) {
        console.error("Error fetching comments for page:", error);
      }
    };

    fetchComments();
  };

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

      {/* Comment Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>

        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Write a comment..."
          ></textarea>
          {commentError && <p className="text-red-500 text-sm">{commentError}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-2"
          >
            Submit Comment
          </button>
        </form>

        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="border p-4 rounded">
                <p>{comment.content}</p>
                <p className="text-gray-500 text-sm">
                  <strong>By:</strong> {comment.author?.username || "Unknown"} on{" "}
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-500 text-sm">
                  <strong>Score:</strong> {comment.score}
                </p>
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


