import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface Report {
  id: number;
  content: string;
  resolved: boolean;
  author: { username: string };
  reply: { id: number; content: string } | null;
}

interface PaginatedResponse {
  reports: Report[];
  totalReports: number;
  totalPages: number;
  currentPage: number;
}

const ReplyReports: React.FC = () => {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchReports = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You are not logged in!");
        return;
      }

      const response = await axios.post<PaginatedResponse>(
        "/api/report/reply/getReports",
        { page },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReports(response.data.reports);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to fetch reports.");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("You are not logged in!");
        return;
      }

      const response = await axios.put(
        "/api/report/reply/resolve",
        { reportReplyId: reportId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Report resolved successfully.");
      fetchReports(currentPage);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to resolve report.");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Reply Reports</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {message && <div className="text-green-500 mb-4">{message}</div>}

      {loading ? (
        <p>Loading...</p>
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
                  <strong>Report Content:</strong> {report.content}
                </p>
                <p>
                  <strong>Reply:</strong>{" "}
                  {report.reply
                    ? `${report.reply.content} (ID: ${report.reply.id})`
                    : "No associated reply"}
                </p>
                <p>
                  <strong>Reported By:</strong> {report.author.username}
                </p>
                <p>
                  <strong>Resolved:</strong> {report.resolved ? "Yes" : "No"}
                </p>
              </div>
              {!report.resolved && (
                <button
                  onClick={() => handleResolve(report.id)}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Resolve
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between mt-4">
          <button
            onClick={() => fetchReports(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => fetchReports(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
      <div className="mt-6 space-y-4">
        <button
          onClick={() => router.push("/adminOptions")}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Go To Admin Options
        </button>
      </div>
    </div>
  );
};

export default ReplyReports;
