import { useState, useEffect } from "react";
import axios from "../api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [canvases, setCanvases] = useState([]);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/canvas").then((res) => setCanvases(res.data));
  }, []);

  const createCanvas = async () => {
    const res = await axios.post("/canvas/create", { title });
    navigate(`/canvas/${res.data._id}`);
  };


  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login"; 
  };

  return (
    <div>
      <h2>Welcome, {localStorage.getItem("username")}</h2>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Canvas title" />
      <button onClick={createCanvas}>Create Canvas</button>
      <button
          className="bg-blue-500 text-white py-2 px-4 rounded w-full hover:bg-blue-600"
          onClick={handleLogOut}
        >
        Log Out
        </button>

      <h3>Global Canvases</h3>
      <ul>
        {canvases.map((c) => (
          <li key={c._id}>
            <button onClick={() => navigate(`/canvas/${c._id}`)}>
              {c.title} by {c.createdBy?.username}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
