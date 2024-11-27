import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { User } from "@prisma/client";

interface Reply {
  id: number;
  content: string;
  createdAt: string;
  author: User;
}

interface CommentDetails {
  id: number;
  content: string;
  createdAt: string;
  author: User;
  replies: Reply[];
}

interface PaginatedRepliesResponse {
  replies: Reply[];
  totalPages: number;
  currentPage: number;
}

interface UserProfile {
  username: string;
  id: number;
}

const CommentDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Get the comment ID from the URL
  const [commentDetails, setCommentDetails] = useState<CommentDetails | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [newReply, setNewReply] = useState<string>(""); // New state for reply input
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const response = await axios.get<UserProfile>("/api/user/getProfile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setProfile(response.data);
        }
      } catch (error: any) {}
    };

    const fetchCommentDetails = async () => {
      try {
        const response = await axios.get<CommentDetails>(`/api/comment/${id}`);
        setCommentDetails(response.data);
      } catch (error: any) {
        console.error("Error fetching comment details:", error);
        setError(
          error.response?.data?.error || "Failed to fetch comment details."
        );
      }
    };

    const fetchReplies = async (page: number) => {
      try {
        const response = await axios.post<PaginatedRepliesResponse>(
          `/api/reply/getPaginatedReplies`,
          { commentId: id, page }
        );
        setReplies(response.data.replies);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
      } catch (error: any) {
        console.error("Error fetching replies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchCommentDetails();
    fetchReplies(currentPage);
  }, [id, currentPage]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!newReply.trim()) {
      setError("Reply content cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to reply.");
        return;
      }

      const response = await axios.post(
        "/api/reply/create",
        {
          content: newReply,
          commentId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReplies((prevReplies) => [response.data, ...prevReplies]); // Add new reply to the list
      setNewReply(""); // Clear input field
      setMessage("Reply posted successfully.");
    } catch (error: any) {
      console.error("Error creating reply:", error);
      setError(
        error.response?.data?.error || "Failed to post reply. Please try again."
      );
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You must be logged in to delete replies.");
        return;
      }

      const response = await axios.delete("/api/reply/delete", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { replyId },
      });

      setMessage(response.data.message || "Reply deleted successfully.");
      setReplies((prevReplies) =>
        prevReplies.filter((reply) => reply.id !== replyId)
      );
    } catch (error: any) {
      console.error("Error deleting reply:", error);
      setError(
        error.response?.data?.error || "Failed to delete reply. Please try again."
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  

  if (!commentDetails) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">No Comment Found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Comment Details</h1>
      <div className="mb-6">
        <p className="text-lg">
          <strong>Content:</strong> {commentDetails.content}
        </p>
        <p className="text-sm text-gray-500">
          <strong>By:</strong> {commentDetails.author?.username || "Unknown"} on{" "}
          {new Date(commentDetails.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Reply Box */}
      <div className="mt-8 mb-6">
        <h2 className="text-xl font-bold mb-4">Post a Reply</h2>
        <form onSubmit={handleReplySubmit}>
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Write a reply..."
          ></textarea>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-2"
          >
            Submit Reply
          </button>
        </form>
      </div>

      {/* Replies Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Replies</h2>
        {message && <div className="text-green-500 mb-4">{message}</div>}
        {replies.length === 0 ? (
          <p>No replies yet.</p>
        ) : (
          <ul className="space-y-4">
            {replies.map((reply) => (
              <li
                key={reply.id}
                className="border p-4 rounded flex justify-between items-center"
              >
                <div>
                  <p>{reply.content}</p>
                  <p className="text-gray-500 text-sm">
                    <strong>By:</strong> {reply.author?.username || "Unknown"} on{" "}
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {profile && profile.id === reply.author.id && (
                  <button
                    onClick={() => handleDeleteReply(reply.id)}
                    className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between mt-4">
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
          onClick={() => router.back()}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Back 
        </button>
      </div>
    </div>
  );
};

export default CommentDetailsPage;
