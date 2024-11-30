import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useRouter } from "next/router";

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

const NavBar: React.FC = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Handle navigation
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Handle logout
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const response = await axios.get<UserProfile>("/api/user/getProfile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data);
      } catch (error: any) {
      }
    };

    fetchProfile();
  }, [router]);

  return (
    <nav className="bg-blue-600 text-white p-4 space-x-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div
          className="text-xl font-bold cursor-pointer"
          onClick={() => handleNavigation("/")}
        >
          Scriptorium
        </div>

        {/* Links */}
        <ul className="flex justify-between p-5 space-x-5">
          <li
            className="cursor-pointer hover:text-gray-300"
            onClick={() => handleNavigation("/")}
          >
            Home
          </li>
          <li>   ----   </li>
          <li
            className="cursor-pointer hover:text-gray-300"
            onClick={() => handleNavigation("/blogPost/search")}
          >
            Blog Posts
          </li>
          <li>   ----   </li>
          <li
            className="cursor-pointer hover:text-gray-300"
            onClick={() => handleNavigation("/codeTemplates/searchTemplates")}
          >
            Code Templates
          </li>
          <li>   ----   </li>
          <li
            className="cursor-pointer hover:text-gray-300"
            onClick={() => handleNavigation("/codeTemplates/runCode")}
          >
            Run Code Online
          </li>

          { profile && (
            <li>   ----   </li>
          )}

          { profile && (
            <li
              className="cursor-pointer hover:text-gray-300"
              onClick={() => handleNavigation("/codeTemplates/createTemplate")}
            >
              Create Code Template
            </li>
          )}
        </ul>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-blue-700 py-2 px-4 rounded hover:bg-blue-800"
          >
            User
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-black text-white rounded shadow-lg">

              {profile && (
                <button
                onClick={() => handleNavigation("/users/profile")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  My profile
                </button>
              )}
              {profile && (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  Logout
                </button>
              )}
              {!profile && (
                <button
                  onClick={() => {router.push('/users/login')}}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                >
                  User Login/Signup
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;