import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { AxiosAuthInstance } from "../../AxiosInterceptors";
const MasterNav = ({ edit, add, warn, editPage }) => {
  const handleLogout = () => {
    AxiosAuthInstance.post("logout").then((r) => {
      localStorage.removeItem("id");
      localStorage.removeItem("email");
      localStorage.removeItem("username");
      localStorage.removeItem("name");
      localStorage.removeItem("role");
      localStorage.removeItem("user_status");
      localStorage.removeItem("token");
      window.location.href = "/";
    });
  };
  const navigate = useNavigate();
  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };
  console.log("Modal Show"+editPage);
  return (
    <>
      {add === true || edit === true || editPage === "true" ? (
        <>
          <nav className="w-[1200px] 2xl:w-[1400px] flex flex-wrap items-center justify-between mx-auto"
          onClick={warn}
          >
            <div
              className="svgx flex justify-item-start px-2 py-2 rounded bg-white text-[#657E98] hover:bg-[#657E98] hover:transition hover:duration-300"
            >
              <svg
                id="Group_63"
                data-name="Group 63"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width="26.19"
                height="23.833"
                viewBox="0 0 26.19 23.833"
              >
                <defs>
                  <clipPath id="clip-path">
                    <rect
                      id="Rectangle_59"
                      data-name="Rectangle 59"
                      width="26.19"
                      height="23.833"
                      transform="translate(0 0)"
                      fill="#657e98"
                    />
                  </clipPath>
                </defs>
                <g
                  id="Group_61"
                  data-name="Group 61"
                  transform="translate(0 0)"
                  clipPath="url(#clip-path)"
                >
                  <path
                    id="Path_10"
                    data-name="Path 10"
                    d="M25.926,12.63,21,7.657V1.577a.327.327,0,0,0-.327-.327H18.309a.327.327,0,0,0-.327.327V4.608L13.59.177a.613.613,0,0,0-.869,0L.267,12.63A.912.912,0,0,0,1.2,14.141h0l2.6-.885v9.822a.75.75,0,0,0,.75.75h4.9a.75.75,0,0,0,.75-.75V15.621h5.927v7.457a.75.75,0,0,0,.75.75h4.9a.75.75,0,0,0,.75-.75V13.292l2.43.829a.912.912,0,0,0,.981-1.491"
                    transform="translate(0 0.005)"
                    fill="#657e98"
                  />
                </g>
              </svg>
            </div>
            <div
              className="flex justify-item-center items-center mx-auto overflow-hidden"
            >
              <span className="self-center text-[20px] inter-light whitespace-nowrap dark:text-black ms-24">
                Surgery South, P.C.
              </span>
            </div>
            <button
              className="bg-white h-[37px] w-[37px] flex items-center justify-center mt-0 rounded hover:bg-[#D8ADAD] group relative me-4"
            >
              <img
                src="assets/images/back.png"
                alt="Original Image"
                className="block"
              />
              <img
                src="assets/images/back-hover.png"
                alt="Hover Image"
                className="absolute hover-img"
              />
            </button>
            <button
              className="bg-white h-[37px] w-[37px] flex items-center justify-center mt-0 rounded hover:bg-[#D8ADAD] group relative"
            >
              <img
                src="assets/images/logout icon.svg"
                alt="Original Image"
                className="block"
              />
              <img
                src="assets/images/logout state 2.svg"
                alt="Hover Image"
                className="absolute hover-img"
              />
            </button>
          </nav>

        </>
      ) : (
        <>
          <nav className="w-[1200px] 2xl:w-[1400px] flex flex-wrap items-center justify-between mx-auto">
            <Link
              to="/dashboard"
              className="svgx flex justify-item-start px-2 py-2 rounded bg-white text-[#657E98] hover:bg-[#657E98] hover:transition hover:duration-300"
            >
              <svg
                id="Group_63"
                data-name="Group 63"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                width="26.19"
                height="23.833"
                viewBox="0 0 26.19 23.833"
              >
                <defs>
                  <clipPath id="clip-path">
                    <rect
                      id="Rectangle_59"
                      data-name="Rectangle 59"
                      width="26.19"
                      height="23.833"
                      transform="translate(0 0)"
                      fill="#657e98"
                    />
                  </clipPath>
                </defs>
                <g
                  id="Group_61"
                  data-name="Group 61"
                  transform="translate(0 0)"
                  clipPath="url(#clip-path)"
                >
                  <path
                    id="Path_10"
                    data-name="Path 10"
                    d="M25.926,12.63,21,7.657V1.577a.327.327,0,0,0-.327-.327H18.309a.327.327,0,0,0-.327.327V4.608L13.59.177a.613.613,0,0,0-.869,0L.267,12.63A.912.912,0,0,0,1.2,14.141h0l2.6-.885v9.822a.75.75,0,0,0,.75.75h4.9a.75.75,0,0,0,.75-.75V15.621h5.927v7.457a.75.75,0,0,0,.75.75h4.9a.75.75,0,0,0,.75-.75V13.292l2.43.829a.912.912,0,0,0,.981-1.491"
                    transform="translate(0 0.005)"
                    fill="#657e98"
                  />
                </g>
              </svg>
            </Link>
            <Link
              to="/"
              className="flex justify-item-center items-center mx-auto overflow-hidden"
            >
              <span className="self-center text-[20px] inter-light whitespace-nowrap dark:text-black ms-24">
                Surgery South, P.C.
              </span>
            </Link>
            <button
              className="bg-white h-[37px] w-[37px] flex items-center justify-center mt-0 rounded hover:bg-[#D8ADAD] group relative me-4"
              onClick={handleBack}
            >
              <img
                src="assets/images/back.png"
                alt="Original Image"
                className="block"
              />
              <img
                src="assets/images/back-hover.png"
                alt="Hover Image"
                className="absolute hover-img"
              />
            </button>
            <button
              onClick={handleLogout}
              className="bg-white h-[37px] w-[37px] flex items-center justify-center mt-0 rounded hover:bg-[#D8ADAD] group relative"
            >
              <img
                src="assets/images/logout icon.svg"
                alt="Original Image"
                className="block"
              />
              <img
                src="assets/images/logout state 2.svg"
                alt="Hover Image"
                className="absolute hover-img"
              />
            </button>
          </nav>
        </>
      )}
    </>
  );
};

export default MasterNav;
