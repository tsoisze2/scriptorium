import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface UserProfile {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNum?: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showOptions2, setShowOptions2] = useState(false);
  const router = useRouter();

  const handleToggleOptions = () => {
    setShowOptions((prev) => !prev);
  };

  const handleToggleOptions2 = () => {
    setShowOptions2((prev) => !prev);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.push("/login"); // Redirect to login if not authenticated
          return;
        }

        const response = await axios.get<UserProfile>("/api/user/getProfile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data);
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setError(
          error.response?.data?.error || "Failed to fetch profile information"
        );
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return;
      }

      // Call the logout API
      await axios.post(
        "/api/user/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear tokens and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/users/login");
    } catch (error) {
      console.error("Error logging out:", error);
      setError("Failed to log out. Please try again.");
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

  if (!profile) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        <p>Fetching your profile information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>

      {/* Display avatar */}
      {profile.avatarUrl ? (
        <div className="flex justify-center mb-4">
          <img
            src={profile.avatarUrl}
            alt={`${profile.username}'s avatar`}
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
      ) : (
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 text-sm">No Avatar</span>
          </div>
        </div>
      )}

      {/* Display user details */}
      <ul className="list-none">
        <li>
          <strong>Username:</strong> {profile.username}
        </li>
        <li>
          <strong>First Name:</strong> {profile.firstName}
        </li>
        <li>
          <strong>Last Name:</strong> {profile.lastName}
        </li>
        <li>
          <strong>Email:</strong> {profile.email}
        </li>
        {profile.phoneNum && (
          <li>
            <strong>Phone Number:</strong> {profile.phoneNum}
          </li>
        )}
        <li>
          <strong>Role:</strong> {profile.role}
        </li>
        <li>
          <strong>Member Since:</strong>{" "}
          {new Date(profile.createdAt).toLocaleDateString()}
        </li>
      </ul>

      {/* External Links Section */}
      <div className="mt-6 space-y-4">
        {/* Edit Profile */}
        <button
          onClick={() => router.push("/users/editProfile")}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Edit My Profile
        </button>

        {/* My Blog Posts */}
        <button
          onClick={() => router.push("/dkwhat")}
          className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700"
        >
          My Blog Posts
        </button>

        {/* My Code Templates */}
        <button
          onClick={() => router.push("/codeTemplates/myTemplates")}
          className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700"
        >
          My Code Templates
        </button>

        {/* My Ratings */}
        <button
          onClick={handleToggleOptions}
          className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700"
        >
          My Ratings
        </button>

        {/* Conditional rendering for options */}
        {showOptions && (
          <div className="mt-6 space-y-4">
            <button
              onClick={() => router.push("/ratings/myBlogPostRatings")}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              My Blog Post Ratings
            </button>
            <button
              onClick={() => router.push("/ratings/myCommentRatings")}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              My Comment Ratings
            </button>
          </div>
        )}

        {/* My Reports */}
        <button
          onClick={handleToggleOptions2}
          className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700"
        >
          My Reports
        </button>

        {/* Conditional rendering for options */}
        {showOptions2 && (
          <div className="mt-6 space-y-4">
            <button
              onClick={() => router.push("/reports/myBlogPostReports")}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              My Blog Post Reports
            </button>
            <button
              onClick={() => router.push("/reports/myCommentReports")}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              My Comment Reports
            </button>
            <button
              onClick={() => router.push("/reports/myReplyReports")}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              My Reply Reports
            </button>
          </div>
        )}

        {/* Conditional Admin Options */}
        {profile.role === "ADMIN" && (
          <div className="mt-6">
            <button
              onClick={() => router.push("/adminOptions")}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
            >
              Admin Options
            </button>
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 w-full"
          >
            Log Out
          </button>
        </div>
      </div>


    </div>
  );
};

export default Profile;
