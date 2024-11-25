import React, { useEffect, useState } from "react";

interface BlogPost {
  id: number;
  title: string;
  tags: string[];
  description: string;
}

const BlogPostsPage: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Simulating fetching data from an API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      // Replace this with a real API call
      const data: BlogPost[] = [
        { id: 1, title: "First Blogpost", tags: ["React", "JavaScript"], description: "This is the first blogpost." },
        { id: 2, title: "Second Blogpost", tags: ["TypeScript", "Web Development"], description: "Learning TypeScript is fun!" },
        { id: 3, title: "Third Blogpost", tags: ["CSS", "Design"], description: "Styling your apps beautifully." },
      ];
      setBlogPosts(data);
    };

    fetchBlogPosts();
  }, []);

  // Edit blog post
  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
  };

  const handleSave = () => {
    if (editingPost) {
      setBlogPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === editingPost.id ? editingPost : post))
      );
      setEditingPost(null);
    }
  };

  const handleDelete = (postId: number) => {
    setBlogPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingPost) {
      const { name, value } = e.target;
      setEditingPost({ ...editingPost, [name]: value });
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>My Blog Posts</h1>

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
          {editingPost && editingPost.id === post.id ? (
            <>
              <input
                type="text"
                name="title"
                value={editingPost.title}
                onChange={handleChange}
                style={{
                  width: "100%",
                  marginBottom: "10px",
                  padding: "10px",
                  fontSize: "16px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <input
                type="text"
                name="tags"
                value={editingPost.tags.join(", ")}
                onChange={(e) =>
                  setEditingPost({
                    ...editingPost,
                    tags: e.target.value.split(",").map((tag) => tag.trim()),
                  })
                }
                style={{
                  width: "100%",
                  marginBottom: "10px",
                  padding: "10px",
                  fontSize: "16px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              <textarea
                name="description"
                value={editingPost.description}
                onChange={handleChange}
                rows={4}
                style={{
                  width: "100%",
                  marginBottom: "10px",
                  padding: "10px",
                  fontSize: "16px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  resize: "none",
                }}
              />
              <button
                onClick={handleSave}
                style={{
                  padding: "10px 15px",
                  fontSize: "16px",
                  color: "#fff",
                  backgroundColor: "#28a745",
                  border: "none",
                  borderRadius: "4px",
                  marginRight: "10px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditingPost(null)}
                style={{
                  padding: "10px 15px",
                  fontSize: "16px",
                  color: "#fff",
                  backgroundColor: "#dc3545",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <h2 style={{ marginBottom: "10px", fontSize: "20px", color: "#333" }}>{post.title}</h2>
              <p style={{ marginBottom: "10px", fontSize: "14px", color: "#777" }}>
                Tags: {post.tags.map((tag, index) => (
                  <span key={index} style={{ marginRight: "5px", color: "#007BFF" }}>
                    #{tag}
                  </span>
                ))}
              </p>
              <p style={{ marginBottom: "10px", fontSize: "16px", color: "#555" }}>{post.description}</p>
              <button
                onClick={() => handleEdit(post)}
                style={{
                  padding: "10px 15px",
                  fontSize: "16px",
                  color: "#fff",
                  backgroundColor: "#007BFF",
                  border: "none",
                  borderRadius: "4px",
                  marginRight: "10px",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                style={{
                  padding: "10px 15px",
                  fontSize: "16px",
                  color: "#fff",
                  backgroundColor: "#dc3545",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default BlogPostsPage;
