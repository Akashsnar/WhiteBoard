import { useState, useEffect } from "react";
import axios from "../api";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "./ConfirmModel"

const Dashboard = () => {
  const [canvases, setCanvases] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modelText, setmodelText] = useState("")
  const [func, setfunc] = useState()
  
  

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/canvas").then((res) => setCanvases(res.data));
  }, []);

  const createCanvas = async () => {
    if (!title.trim()) {
      setError("Please enter a title for the canvas.");
      return;
    }

    try {
      const res = await axios.post("/canvas/create", { title });
      navigate(`/canvas/${res.data._id}`);
    } catch (err) {
      setError("Failed to create canvas. Try again.");
    }
  };

  const deltefunc = async (id) => {
    try {
      console.log("called delete");
      const res = await axios.delete(`canvas/delete/${id}`);
      setCanvases((prev) => prev.filter((canvas) => canvas._id !== id));
    } catch (error) {
      setError("Item Not deleted");
    }

  }

  const deleteFuncDialog = (id) => {
    setShowModal(true);
    setmodelText("Delete");
    setfunc(() => () => deltefunc(id));
  }

  const LogOutFuncDialog = () => {
    setShowModal(true);
    setmodelText("Log Out");
    setfunc(() => confirmLogout);
  }

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, <span className="text-blue-600">{localStorage.getItem("username")}</span>
          </h2>
          <button
            onClick={() => {
              LogOutFuncDialog();
            }}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
          >
            Log Out
          </button>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 mb-10">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Create a New Canvas</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              placeholder="Canvas title"
              className={`flex-1 px-4 py-2 border ${error ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              onClick={createCanvas}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
            >
              Create
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Global Canvases</h3>
          {(canvases.length == 0) ? (
            <p className="text-gray-500">{canvases.length } No canvases yet. Be the first to create one!</p>
          ) : (
             <ul className="space-y-3">
              {canvases.map((c) => (
                <li key={c._id}>
                  <button
                    onClick={() => navigate(`/canvas/${c._id}`)}
                    className="w-full text-left bg-gray-100 hover:bg-gray-200 p-3 rounded-md transition shadow-sm"
                  >
                    <span className="font-medium text-gray-800">{c.title}</span>{" "}
                    <span className="text-sm text-gray-500">
                      by {c.createdBy?.username || "Unknown"}
                    </span>
                  </button>
                  {
                    <button
                      onClick={() => {
                        deleteFuncDialog(c._id)
                      }}
                      className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
                    >Delete</button>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmModal
        show={showModal}
        text={modelText}
        onConfirm={async () => {
          await func?.();
          setShowModal(false);
        }}
        onCancel={() => setShowModal(false)}
      />

    </div>
  );
};

export default Dashboard;
