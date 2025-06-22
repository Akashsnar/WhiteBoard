import React from 'react'

const SignupSignin = () => {

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    //const socket = window.io("http://localhost:3000");
    // socket.emit("register-user", { username });
    console.log(`Registered user: ${username}`);
  }

  // const socket = window.io("http://localhost:3000");
  // socket.on("connect", () => {
  //   console.log("Connected to the server");
  // });

  // socket.on("disconnect", () => {
  //   console.log("Disconnected from the server");
  // });

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to the Drawing App</h1>
      <div className="bg-white p-8 rounded shadow-md w-96">
        <form className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" id="username" name="username" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700" onClick={handleSubmit}>Sign Up / Sign In</button>
        </form>
      </div>
    </div>
  )
}

export default SignupSignin;