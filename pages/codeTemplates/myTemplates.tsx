import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios" // Use your configured Axios instance
import { useRouter } from "next/router";
import { User } from "@prisma/client";

interface Tag {
    id: number;
    name: string;
}

interface Template {
    id: number;
    title: string;
    code: string;
    explanation: string;
    language: string;
    createdAt: string;
    lastModified: string;
    tags: Tag[];
    author: User;
}

interface ApiResponse {
    templates: Template[];
    totalTemplates: number;
    totalPages: number;
    currentPage: number;
}

const MyTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [totalTemplates, setTotalTemplates] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [searchParams, setSearchParams] = useState({
        title: "",
        tags: "",
        content: "",
        language: "",
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        fetchTemplates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const fetchTemplates = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get access token from localStorage
            const accessToken = localStorage.getItem("accessToken");
      
            // Use the api instance, which already includes the base URL '/api' and token handling
            const response = await axios.post(
                "/api/codeTemplate/searchMyTemplates", 
                {...searchParams, page: currentPage}, 
                {
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              });
            setTemplates(response.data.templates);
            setTotalTemplates(response.data.totalTemplates);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
        } catch (error: any) {
            console.error("Error fetching templates:", error);
            setError(error.response?.data?.error || "Failed to fetch templates.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
    };

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchTemplates();
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">My Code Templates</h2>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="Search by title"
                        value={searchParams.title}
                        onChange={handleSearchChange}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        name="tags"
                        placeholder="Search by tags (comma-separated)"
                        value={searchParams.tags}
                        onChange={handleSearchChange}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        name="content"
                        placeholder="Search by content"
                        value={searchParams.content}
                        onChange={handleSearchChange}
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        name="language"
                        placeholder="Search by language"
                        value={searchParams.language}
                        onChange={handleSearchChange}
                        className="p-2 border rounded"
                    />
                </div>
                <button
                    type="submit"
                    className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    Search
                </button>
            </form>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Templates List */}
            {loading ? (
                <p>Loading templates...</p>
            ) : (
                <div>
                    {templates.length > 0 ? (
                        <ul className="space-y-4">
                            {templates.map((template) => (
                                <li key={template.id} className="p-4 border rounded">
                                    <div
                                        onClick={() => router.push(`/codeTemplates/${template.id}`)}
                                        className="cursor-pointer"
                                    >
                                        <h3 className="font-bold text-lg">{template.title}</h3>
                                    </div>
                                    <p>{template.explanation}</p>
                                    <p className="text-gray-600">
                                        Language: {template.language} | Last Modified:{" "}
                                        {new Date(template.lastModified).toLocaleString()}
                                    </p>
                                    <div className="mt-2">
                                        <strong>Tags:</strong>{" "}
                                        {template.tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="inline-block bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded mr-2"
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No templates found.</p>
                    )}
                </div>
            )}

            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-gray-300 text-gray-800 py-2 px-4 rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-gray-300 text-gray-800 py-2 px-4 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
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

export default MyTemplates;