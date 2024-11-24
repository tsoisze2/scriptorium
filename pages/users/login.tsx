import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null); // Clear any previous error messages
    setLoading(true);

    try {
      const response = await axios.post("/api/user/login", formData);
      const { accessToken, refreshToken } = response.data;

      // Save tokens to localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Redirect to the Edit Profile page
      router.push("/users/profile");
    } catch (error: any) {
      setError(error.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Username */}
        <label className="block mb-4">
          Username
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Enter your username"
            required
          />
        </label>

        {/* Password */}
        <label className="block mb-4">
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Enter your password"
            required
          />
        </label>

        <button
          type="submit"
          className={`w-full py-2 px-4 text-white font-bold rounded ${loading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
            }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6">
        <a
          href="/users/signup"
          target="_self"
          rel="noopener noreferrer"
          className="block"
        >
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Do not have an account yet? Sign up now
          </button>
        </a>
      </div>

    </div>
  );
};

export default Login;
