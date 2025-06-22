import { useState } from "react";
import axios from "../api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await axios.post("/auth/login", { username, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("username", res.data.user.username);
    navigate("/");
  };

  return (
    <div>
      <h2>Login</h2>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
