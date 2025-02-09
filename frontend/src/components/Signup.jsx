import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.webp";
import axios from "axios";
import toast from "react-hot-toast";
import { BACKEND_URL } from "../utils/utils.js";

function Signup() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${BACKEND_URL}/user/signup`,
        {
          firstName,
          lastName,
          email,
          password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Signup successful: ", response.data);
      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.errors || "Signup failed!!!");
      }
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-black to-blue-950 ">
        <div className=" text-white  mx-10  p-2">
          <header className="flex items-center justify-between p-2">
            <div className='flex items-center space-x-2'>
              <img src={ logo } alt="logo" className='w-10 h-10 rounded-full' />
              <h1 className='text-2xl text-orange-500 font-bold '>edTech Planet</h1>
            </div>
            <div className='spacex-4 flex gap-4'>
              <Link to={"/login"} className='border-transparent text-white py-2 px-4 border border-white rounded'>
                Login
              </Link>
              <Link to={"/courses"} className='border-transparent text-white py-2 px-4 border border-white rounded'>
                Join now
              </Link>
            </div>
          </header>

          {/* Signup Form */}
          <div className="h-screen container mx-auto flex  items-center justify-center text-white">
            <div className="bg-gray-900 p-8  rounded-lg shadow-lg w-[500px] mt-20">
              <h2 className="text-2xl font-bold mb-4 text-center ">
                Welcome to <span className="text-orange-500">edTech Planet</span>
              </h2>
              <p className="text-center text-gray-400 mb-6">
                Just Signup To Join Us!
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="firstname" className="text-gray-400 mb-2">First name: </label>
                  <input 
                    type="text"
                    id="firstname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your firstname"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="lastname" className="text-gray-400 mb-2">Last name: </label>
                  <input 
                    type="text"
                    id="lastname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your lastname"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="text-gray-400 mb-2">Email: </label>
                  <div className="relative">
                    <input 
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="edtech@planet.com"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="password" className=" text-gray-400 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="********"
                      required
                    />
                    <span className="absolute right-3 top-3 text-gray-500 cursor-pointer">
                      👁️
                    </span>
                  </div>
                </div>
                {errorMessage && (
                  <div className="mb-4 text-red-500 text-center">
                    {errorMessage}
                  </div>
                )}
                <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-blue-600 text-white py-3 px-6 rounded-md transition"
                  >
                  Signup
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Signup