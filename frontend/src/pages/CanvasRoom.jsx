import { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from 'react-router-dom';

const socket = io("http://localhost:3000");

const CanvasBoard = () => {
  const { id: canvasId } = useParams();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [username, setUsername] = useState("");
  const [userColor, setUserColor] = useState("#000000");
  const [currentStroke, setCurrentStroke] = useState([]);
  const [allStrokes, setAllStrokes] = useState([]);
  const allStrokesRef = useRef([]);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [strokeSize, setStrokeSize] = useState(3);


  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 3;
    context.strokeStyle = userColor;
    contextRef.current = context;
    socket.emit("request-initial-data", { canvasId });

    socket.on("initial-data", (strokes) => {
      //console.log(strokes, 40);

      if (!strokes) return;
      //console.log(strokes, 42);

      for (const stroke of strokes) {
        drawStroke(stroke);
        setAllStrokes((prev) => [...prev, stroke]);
      }
    });

    //console.log(canvasId, 46);

    socket.on("draw", ({ canvasId, stroke }) => {
      console.log(canvasId, 49);

      drawStroke(stroke);
      setAllStrokes((prev) => [...prev, stroke]);
    });
  }, []);

  useEffect(() => {
    allStrokesRef.current = allStrokes;
  }, [allStrokes]);

  const handleDashboard = () => {
    window.location.href = "/";
  };

  const drawStroke = (stroke) => {
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    const points = stroke.points;
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  };

  const startDrawing = ({ nativeEvent }) => {
    //if (!username.trim()) return alert("Please enter a username first.");
    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing(true);
    const point = { x: offsetX, y: offsetY };
    setCurrentStroke([point]);

    // 💡 Start a new path
    // const ctx = contextRef.current;
    // ctx.beginPath();
    // ctx.moveTo(offsetX, offsetY);
    // ctx.strokeStyle = userColor;
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : userColor;
    ctx.lineWidth = strokeSize;

  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const newPoint = { x: offsetX, y: offsetY };
    setCurrentStroke((prev) => [...prev, newPoint]);

    const ctx = contextRef.current;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const finishDrawing = () => {
    if (!isDrawing || currentStroke.length < 2) return;
    setIsDrawing(false);
    contextRef.current.closePath();

    const stroke = {
      points: currentStroke,
      username: localStorage.getItem("username"),
      color: (tool === "eraser") ? "#ffffff" : userColor,
      lineWidth: strokeSize,
    };

    setAllStrokes((prev) => [...prev, stroke]);
    socket.emit("draw", { canvasId, stroke });
    setCurrentStroke([]);
  };

  // const finishDrawing = () => {
  //   if (!isDrawing || currentStroke.length < 2) return;
  //   // if (isDrawing && currentStroke.length > 0) {
  //     setIsDrawing(false);
  //     contextRef.current.closePath();
  //     const stroke = {
  //       points: currentStroke,
  //       username,
  //       color: userColor,
  //       tool,
  //     };
  //     // const updatedStrokes = [...prev, stroke];
  //     setAllStrokes((prev) => [...prev, stroke]);
  //     socket.emit("draw", {stroke}); // Optional sync
  //   // }
  //   // setIsDrawing(false);
  //   setCurrentStroke([]);
  // };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left);
    const mouseY = (e.clientY - rect.top);

    for (let stroke of allStrokesRef.current) {
      for (let point of stroke.points) {
        const dx = point.x - mouseX;
        const dy = point.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 10) {
          setHoveredUser(stroke.username);
          setHoverPos({ x: e.clientX, y: e.clientY });
          return;
        }
      }
    }

    setHoveredUser(null);
  };

  const undoLastStroke = () => {
    const updated = allStrokes.slice(0, -1);
    setAllStrokes(updated);
    redrawCanvas(updated);
  };

  const redrawCanvas = (allStrokes) => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of allStrokes) {
      ctx.beginPath();
      if (stroke.points.length > 0) {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.tool === "eraser" ? 20 : 3;
        ctx.stroke();
      }
    }
  };


  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setAllStrokes([]);
  };

  const StrokeSize = (size) => {
    setStrokeSize(size);
  }

const [theme, setTheme] = useState(() => {
  return localStorage.getItem("theme") || "light";
});

useEffect(() => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}, [theme]);

const toggleTheme = () => {
  setTheme((prev) => (prev === "light" ? "dark" : "light"));
};

const isToolActive = (t) => tool === t;


//   return (
//     <div className="relative" onMouseMove={handleMouseMove}>
//       <canvas
//         ref={canvasRef}
//         onMouseDown={startDrawing}
//         onMouseMove={draw}
//         onMouseUp={finishDrawing}
//         className="border border-gray-400 bg-white"
//       />
//       <div className="absolute top-2 left-2 z-20 bg-white p-2 rounded shadow">
//         <input
//           placeholder="Your name"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           className="border px-2 py-1 rounded mr-2"
//         />
//         <input
//           type="color"
//           value={userColor}
//           onChange={(e) => setUserColor(e.target.value)}
//         />
//       </div>
//       <div className="absolute top-2 right-2 z-20 bg-white p-2 rounded shadow">
//         <button
//           className="bg-blue-500 text-white py-2 px-4 rounded w-full hover:bg-blue-600"
//           onClick={handleDashboard}
//         >
//           DashBoard
//         </button>
//       </div>

//       <div className="flex gap-2">
//         <button onClick={() => setTool("pen")} className="px-2 py-1 border rounded">Pen</button>
//         <button onClick={() => setTool("eraser")} className="px-2 py-1 border rounded">Eraser</button>
//         <button onClick={undoLastStroke} className="px-2 py-1 border rounded">Undo</button>
//         <button onClick={clearCanvas} className="px-2 py-1 border rounded">Clear</button>
//         <input onChange={(e) => StrokeSize(e.target.value)} type="range" id="vol" name="vol" min="0" max="50"></input>
//       </div>


//       {hoveredUser && (
//         <div
//           className="absolute bg-black text-white px-2 py-1 text-sm rounded pointer-events-none"
//           style={{ top: hoverPos.y + 10, left: hoverPos.x + 10 }}
//         >
//           {hoveredUser}
//         </div>
//       )}
//     </div>
//   );
// };




return (
  <div className="relative w-screen h-screen overflow-hidden" onMouseMove={handleMouseMove}>
    {/* Canvas */}
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={finishDrawing}
      className="absolute inset-0 z-0 bg-white"
    />

    {/* Top-left: Username & Color Picker */}
    <div className="absolute top-4 left-4 z-20 bg-white p-3 rounded shadow flex items-center gap-2">
      <input
        placeholder="Your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border px-2 py-1 rounded w-32"
      />
      <input
        type="color"
        value={userColor}
        onChange={(e) => setUserColor(e.target.value)}
        className="w-10 h-10 p-0 border rounded"
      />
    </div>

    {/* Top-right: Dashboard Button */}
    <div className="absolute top-4 right-4 z-20">
      <button
        className="bg-blue-600 text-white py-2 px-4 rounded shadow hover:bg-blue-700 transition"
        onClick={handleDashboard}
      >
        Dashboard
      </button>
    </div>

    {/* Bottom Toolbar - Sticky */}
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t p-4 shadow-inner flex items-center justify-center gap-4">
      <button onClick={() => setTool("pen")} 
          className={`px-3 py-1 border rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
      isToolActive("pen")
        ? "bg-blue-500 text-white"
        : "bg-gray-100 dark:bg-gray-600 text-black dark:text-white"
    }`}
  >

      Pen
      </button>
      <button onClick={() => setTool("eraser")}
       className={`px-3 py-1 border rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition ${
      isToolActive("eraser")
        ? "bg-blue-500 text-white"
        : "bg-gray-100 dark:bg-gray-600 text-black dark:text-white"
    }`}
  >
        Eraser
      </button>
      <button onClick={undoLastStroke} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-600 text-black dark:text-white border rounded hover:bg-yellow-200 dark:hover:bg-yellow-700">
    Undo
  </button>

  <button onClick={clearCanvas} className="px-3 py-1 bg-red-100 dark:bg-red-600 text-black dark:text-white border rounded hover:bg-red-200 dark:hover:bg-red-700">
    Clear
  </button>
      <div className="flex items-center gap-2">
        <label htmlFor="vol" className="text-sm text-gray-700 dark:text-gray-200">Size</label>
        <input
          onChange={(e) => StrokeSize(parseInt(e.target.value))}
          value={strokeSize}
          type="range"
          id="vol"
          name="vol"
          min="1"
          max="50"
          className="cursor-pointer"
        />
      </div>
      <button
    onClick={toggleTheme}
    className="ml-4 px-3 py-1 bg-gray-300 dark:bg-gray-700 text-black dark:text-white border rounded hover:bg-gray-400 dark:hover:bg-gray-600"
  >
    {theme === "light" ? "🌙 Dark" : "☀️ Light"}
  </button>
    </div>

    {/* Hovered user tooltip */}
    {hoveredUser && (
      <div
        className="absolute bg-black text-white px-2 py-1 text-sm rounded pointer-events-none"
        style={{ top: hoverPos.y + 10, left: hoverPos.x + 10 }}
      >
        {hoveredUser}
      </div>
    )}
  </div>
);
}
export default CanvasBoard;