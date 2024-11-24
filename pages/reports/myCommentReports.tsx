import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface ReportComment {
    id: number;
    content: string;
    resolved: boolean;
    commentId: number;
}

interface PaginatedResponse {
    reports: ReportComment[];
    totalReports: number;
    totalPages: number;
    currentPage: number;
}

const MyCommentReports: React.FC = () => {
    const [reports, setReports] = useState<ReportComment[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    // Fetch reports from the API
    const fetchReports = async (page: number = 1) => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setError("You are not logged in!");
                return;
            }

            const response = await axios.post<PaginatedResponse>(
                "/api/report/comment/searchMyReports",
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
            setError(
                error.response?.data?.error || "Failed to fetch reports. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Handle delete report
    const handleDelete = async (reportId: number) => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setError("You are not logged in!");
                return;
            }

            const response = await axios.delete("/api/report/comment/delete", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: { reportCommentId: reportId }, // Pass the reportCommentId in the request body
            });

            setMessage(response.data.message);
            // Refresh the reports after deletion
            fetchReports(currentPage);
        } catch (error: any) {
            setError(
                error.response?.data?.error || "Failed to delete the report. Please try again."
            );
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // Handle page navigation
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchReports(newPage);
        }
    };

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-red-100 text-red-700 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">My Comment Reports</h2>

            {message && (
                <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                    {message}
                </div>
            )}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    {reports.length === 0 ? (
                        <p>No reports found.</p>
                    ) : (
                        <ul>
                            {reports.map((report) => (
                                <li
                                    key={report.id}
                                    className="border-b pb-4 mb-4 flex justify-between items-center"
                                >
                                    <div>
                                        <strong>Report ID:</strong> {report.id} <br />
                                        <strong>Content:</strong> {report.content} <br />
                                        <strong>Resolved:</strong> {report.resolved ? "Yes" : "No"} <br />
                                        <strong>Comment ID:</strong> {report.commentId}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(report.id)}
                                        className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
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
            )}
            <div className="mt-6 space-y-4">
                <button
                    onClick={() => router.push("/users/profile")}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    Go To My Profile
                </button>
            </div>
        </div>

    );
};

export default MyCommentReports;
