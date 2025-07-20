// // import { useState } from 'react'
// import './App.css'
// import Canvas from './Canvas'
// import SignupSignin from './SignupSignin'

// function App() {

//   return <div>
//     <SignupSignin />
//     <Canvas />
//   </div>


// }

// export default App




import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CanvasRoom from "./pages/CanvasRoom";
import {ProtectedRoute} from "./middlware/protected"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
            </ProtectedRoute>
          } />
            <Route path="/canvas/:id" element={<CanvasRoom />} />
          </Routes>
    </BrowserRouter>
  );
}

export default App;
