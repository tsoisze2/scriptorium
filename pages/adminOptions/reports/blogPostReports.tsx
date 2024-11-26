// pages\adminOptions\reports\blogPostReports.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface ReportBlogPost {
  id: number;
  content: string;
  resolved: boolean;
  blogPost: {
    id: number;
    title: string;
  };
}

interface PaginatedResponse {
  reports: ReportBlogPost[];
  totalReports: number;
  totalPages: number;
  currentPage: number;
}

const BlogPostReports: React.FC = () => {
  const router = useRouter();
  const [reports, setReports] = useState<ReportBlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch reports
  const fetchReports = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/users/login");
        return;
      }

      const response = await axios.post<PaginatedResponse>(
        "/api/report/blogPost/getReports",
        { page },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReports(response.data.reports);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      setError("Failed to fetch reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resolve a report
  const handleResolve = async (reportId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/users/login");
        return;
      }

      await axios.put(
        "/api/report/blogPost/resolve",
        { reportBlogPostId: reportId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Report resolved successfully.");
      fetchReports(currentPage); // Refresh the list
    } catch (error: any) {
      console.error("Error resolving report:", error);
      setError("Failed to resolve the report. Please try again.");
    }
  };

  // Hide a blog post
  const handleHideBlogPost = async (blogPostId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/users/login");
        return;
      }

      await axios.put(
        "/api/blogpost/hide",
        { blogPostId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("BlogPost hidden successfully.");
      fetchReports(currentPage); // Refresh the list
    } catch (error: any) {
      console.error("Error hiding blog post:", error);
      setError("Failed to hide the blog post. Please try again.");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchReports(newPage);
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Unresolved Blog Post Reports</h2>
      {message && <div className="text-green-500 mb-4">{message}</div>}
      {reports.length === 0 ? (
        <p>No unresolved reports found.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li
              key={report.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>Report ID:</strong> {report.id}
                </p>
                <p>
                  <strong>Content:</strong> {report.content}
                </p>
                <p>
                  <strong>Blog Post:</strong> {report.blogPost.title} (ID:{" "}
                  {report.blogPost.id})
                </p>
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => router.push(`/adminOptions/reports/blogPost/${report.blogPost.id}`)}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  View BlogPost
                </button>
                <button
                  onClick={() => handleHideBlogPost(report.blogPost.id)}
                  className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700"
                >
                  Hide BlogPost
                </button>
                <button
                  onClick={() => handleResolve(report.id)}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Resolve
                </button>
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
  );
};

export default BlogPostReports;
