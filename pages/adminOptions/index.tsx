import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface UserProfile {
    username: string;
    role: string;
}

const AdminOptions: React.FC = () => {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [showOptionsReports, setShowOptionsReports] = useState(false);
    const handleToggleOptionsReports = () => {
        setShowOptionsReports((prev) => !prev);
    };

    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) {
                    router.push("/users/login");
                    return;
                }

                const response = await axios.get<UserProfile>("/api/user/getProfile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Check if the user role is ADMIN
                if (response.data.role === "ADMIN") {
                    setIsAdmin(true);
                } else {
                    router.push("/users/profile"); // Redirect non-admins to profile
                }


            } catch (error) {
                console.error("Error verifying admin status:", error);
                router.push("/users/login");
            }
        };

        verifyAdmin();
    }, [router]);

    if (!isAdmin) {
        return <p>Loading...</p>;
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Admin Options</h2>
            <div className="space-y-4">
                {/* Unresolved Reports */}
                <button
                    onClick={handleToggleOptionsReports}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                    Unresolved Reports
                </button>

                {/* Conditional rendering for options */}
                {showOptionsReports && (
                    <div className="mt-6 space-y-4">
                        <button
                            onClick={() => router.push("/adminOptions/reports/blogPostReports")}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                        >
                            Blog Post Reports
                        </button>
                        <button
                            onClick={() => router.push("/adminOptions/reports/commentReports")}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                        >
                            Comment Reports
                        </button>
                        <button
                            onClick={() => router.push("/adminOptions/reports/replyReports")}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                        >
                            Reply Reports
                        </button>
                    </div>
                )}

                {/* Placeholder for other admin options */}
                <button
                    onClick={() => alert("Feature under construction!")}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                    Manage Users (Coming Soon)
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

export default AdminOptions;
