import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNum: "",
    inviteCode: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post("/api/user/signup", formData);
      setSuccess(response.data.message);

      // Redirect to login page after successful signup
      setTimeout(() => {
        router.push("/users/login");
      }, 2000);
    } catch (error: any) {
      console.error("Error signing up:", error);
      setError(error.response?.data?.error || "An error occurred during signup.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block font-medium">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block font-medium">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block font-medium">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block font-medium">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Phone Number (Optional) */}
        <div>
          <label htmlFor="phoneNum" className="block font-medium">
            Phone Number (Optional)
          </label>
          <input
            type="text"
            id="phoneNum"
            name="phoneNum"
            value={formData.phoneNum}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Invite Code (Optional) */}
        <div>
          <label htmlFor="inviteCode" className="block font-medium">
            Invite Code (Optional)
          </label>
          <input
            type="text"
            id="inviteCode"
            name="inviteCode"
            value={formData.inviteCode}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
