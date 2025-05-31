import React, { useState } from "react";
import axios from "axios";
import Constant from "../../Constant";
import { Link, useNavigate } from "react-router-dom";

const Auth = () => {
  const [loginInput, setLoginInput] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState([]);
  const [isLodding, setIsLodding] = useState(false);
  const navigate = useNavigate();

  const handleLoginInput = (e) => {
    setLoginInput({ ...loginInput, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setIsLodding(true);
    console.log("Submitting login form with data:", loginInput);
    axios
      .post(`${Constant.BASE_URL}/login`, loginInput)
      .then((res) => {
        console.log("Login successful:", res.data);
        localStorage.setItem("id", res.data.id);
        localStorage.setItem("email", res.data.email);
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("user_status", res.data.user_status);
        localStorage.setItem("token", res.data.token);
        setIsLodding(false);
        // navigate('/dashboard', { replace: true });
        window.location.href = "/dashboard";
      })
      .catch((error) => {
        console.error("Login failed:", error);
        setIsLodding(false);
        if (error.response && error.response.status === 422) {
          setErrors(error.response.data.errors);
        } else {
          setErrors([
            { global: "An unexpected error occurred. Please try again later." },
          ]);
        }
      });
  };

  return (
    <div className="h-[100vh] relative bg-[#B4C6D9] content-center">
      <div className="bg-white absolute rounded-[10px] justify-item-center items-center h-[635px] w-[690px] py-20 shadow-lg shadow-black-500/40 top-1/2 left-1/2 transform-translate-50">
        <div className="bg-white rounded-[10px] logo drop-shadow-lg shadow-black-500/40 xl:h-[190px] xl:w-[190px] lg:h-40 lg:w-40 md:h-[130px] md:w-[120px] left-0 right-0 m-auto absolute xl:top-[-95px] lg:top-[-80px] md:top-[-65px] flex items-center justify-center">
          <img
            className="xl:h-[125px] xl:w-[125px] md:h-[130px] md:w-[120px] rounded-lg"
            src="assets/images/Surgery-South-Logo---FROM-WEB.png"
            alt=""
          />
        </div>
        <div className="login-item lg:pt-[65px] lg:pb-[10px] md:pt-[20px] md:pb-[20px] xl:px-40 md:px-28">
          <p className="text-center inter-semibold tracking-wider md:text-[20px] xl:text-[30px]">
            Surgery South, P.C.
          </p>
        </div>

        <form onSubmit={handleLoginSubmit}>
          <div className="px-28">
            <div className="full-width xl:my-[10%] lg:my-[10%] md:my-[5%] relative">
              <img
                className="fa-user h-[25px] w-[20px]"
                src="assets/images/Group 280.svg"
                alt=""
              />
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                onChange={handleLoginInput}
                value={loginInput.username}
              />
              <p className="text-[red] mt-4 ms-2 absolute">
                <small>
                  {" "}
                  {errors.username !== undefined
                    ? errors.username[0]
                    : null}{" "}
                </small>
              </p>
            </div>
            <div className="full-width xl:my-[10%] lg:my-[10%] md:my-[5%] relative">
              <img
                className="fa-key h-[25px] w-[20px]"
                src="assets/images/Group 283.svg"
                alt=""
              />
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                onChange={handleLoginInput}
                value={loginInput.password}
              />
              <p className="text-[red] mt-4 ms-2">
                <small>
                  {" "}
                  {errors.password !== undefined
                    ? errors.password[0]
                    : null}{" "}
                </small>
              </p>
            </div>
          </div>
          <div className="login-btn text-center 2xl:w-[165px] 2xl:h-[50px] flex justify-center items-center m-auto 2xl:pt-[56px] 2xl:pb-[20px] md:pt-[40px] md:pb-[0]">
            <div className="login-btn flex justify-center pt-8">
              <button
                type="submit"
                className="w-[165px] h-[50px] bg-[#B4C6D9] rounded-[10px] inter-medium text-[20px] hover:bg-[#657E98] hover:text-white"
                disabled={isLodding}
              >
                {isLodding ? "Loading..." : "Login"}
              </button>
            </div>
          </div>
        </form>
        {/* Forgot Password Link */}
        {/* <div className="text-right mt-5 pt-5 px-5">
          <Link to="/forget-password" className="text-blue-500 hover:underline">
            Forgot Password?
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default Auth;
