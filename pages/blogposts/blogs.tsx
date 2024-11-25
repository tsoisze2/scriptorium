import React, { useEffect, useState } from "react";

interface BlogPost {
  id: number;
  title: string;
  tags: string[];
  description: string;
  comments: string[];
  rating: number | null; // Rating ranges from 1 to 5
}

const BlogPostsPage: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [newRating, setNewRating] = useState<{ [key: number]: number | null }>({});

  // Simulating fetching data from an API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      // Replace this with a real API call
      const data: BlogPost[] = [
        {
          id: 1,
          title: "First Blogpost",
          tags: ["React", "JavaScript"],
          description: "This is the first blogpost.",
          comments: [],
          rating: null,
        },
        {
          id: 2,
          title: "Second Blogpost",
          tags: ["TypeScript", "Web Development"],
          description: "Learning TypeScript is fun!",
          comments: [],
          rating: null,
        },
        {
          id: 3,
          title: "Third Blogpost",
          tags: ["CSS", "Design"],
          description: "Styling your apps beautifully.",
          comments: [],
          rating: null,
        },
      ];
      setBlogPosts(data);
    };

    fetchBlogPosts();
  }, []);

  const handleAddComment = (postId: number) => {
    setBlogPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment[postId]] }
          : post
      )
    );
    setNewComment({ ...newComment, [postId]: "" });
  };

  const handleRating = (postId: number, rating: number) => {
    setBlogPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === postId ? { ...post, rating } : post))
    );
    setNewRating({ ...newRating, [postId]: rating });
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>All Blog Posts</h1>
      <div>
        {blogPosts.map((post) => (
          <div
            key={post.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "15px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2 style={{ marginBottom: "10px", fontSize: "20px", color: "#333" }}>{post.title}</h2>
            <p style={{ marginBottom: "10px", fontSize: "14px", color: "#777" }}>
              Tags: {post.tags.map((tag, index) => (
                <span key={index} style={{ marginRight: "5px", color: "#007BFF" }}>
                  #{tag}
                </span>
              ))}
            </p>
            <p style={{ marginBottom: "10px", fontSize: "16px", color: "#555" }}>{post.description}</p>

            {/* Rating Section */}
            <div style={{ marginBottom: "15px" }}>
              <strong>Rating: </strong>
              {post.rating ? `${post.rating}/5` : "No rating yet"}
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(post.id, star)}
                    style={{
                      padding: "5px 10px",
                      margin: "0 5px",
                      backgroundColor: post.rating === star ? "#007BFF" : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <strong>Comments:</strong>
              {post.comments.length > 0 ? (
                <ul style={{ paddingLeft: "20px", margin: "10px 0" }}>
                  {post.comments.map((comment, index) => (
                    <li key={index} style={{ marginBottom: "5px" }}>
                      {comment}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#777" }}>No comments yet.</p>
              )}
              <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                <input
                  type="text"
                  value={newComment[post.id] || ""}
                  onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                  placeholder="Write a comment..."
                  style={{
                    flex: "1",
                    padding: "10px",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    marginRight: "10px",
                  }}
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  style={{
                    padding: "10px 15px",
                    fontSize: "14px",
                    color: "#fff",
                    backgroundColor: "#28a745",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPostsPage;
