import { useState } from "react";
import axios from "../api";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await axios.post("/auth/signup", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.username);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-semibold mb-4 text-center">Sign Up</h2>
        <input
          className="border border-gray-300 px-3 py-2 rounded w-full mb-3"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="border border-gray-300 px-3 py-2 rounded w-full mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded w-full hover:bg-blue-600"
          onClick={handleSignup}
        >
          Sign Up
        </button>
        <p className="text-center text-sm mt-3">
          Already have an account? <a href="/login" className="text-blue-500">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
