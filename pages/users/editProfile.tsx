import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";

// Define the structure of the form data
interface FormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNum?: string;
  password?: string;
  avatarUrl?: string;
}

// Define the structure of the API response
interface ApiResponse {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNum?: string;
  avatarUrl?: string;
}

const EditProfile: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNum: "",
    password: "",
    avatarUrl: "",
  });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setMessage(null); // Clear previous messages
    setLoading(true);

    try {
      const response = await api.put<ApiResponse>("/user/editProfile", {
        ...formData,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNum: "",
        password: "",
        avatarUrl: "",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

      {message && (
        <div
          className={`mb-4 p-2 rounded ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* First Name */}
        <label className="block mb-2">
          First Name
          <input
            type="text"
            name="firstName"
            value={formData.firstName || ""}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Enter your first name"
          />
        </label>

        {/* Last Name */}
        <label className="block mb-2">
          Last Name
          <input
            type="text"
            name="lastName"
            value={formData.lastName || ""}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Enter your last name"
          />
        </label>

        {/* Email */}
        <label className="block mb-2">
          Email
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Enter your email"
          />
        </label>

        {/* Phone Number */}
        <label className="block mb-2">
          Phone Number
          <input
            type="tel"
            name="phoneNum"
            value={formData.phoneNum || ""}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Enter your phone number"
          />
        </label>

        {/* Password */}
        <label className="block mb-2">
          Password
          <input
            type="password"
            name="password"
            value={formData.password || ""}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Enter a new password"
          />
        </label>

        {/* Avatar URL */}
        <label className="block mb-4">
          Avatar URL
          <input
            type="url"
            name="avatarUrl"
            value={formData.avatarUrl || ""}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="Enter avatar URL"
          />
        </label>

        <button
          type="submit"
          className={`w-full py-2 px-4 font-bold text-white rounded ${loading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
            }`}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>

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

export default EditProfile;
