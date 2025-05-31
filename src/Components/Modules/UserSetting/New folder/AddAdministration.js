import React from 'react';


const AddAdministration = () => {
  return (
    <div className="h-[75px] bg-[#B4C6D9] content-center sticky top-0 z-10">
      <nav className="w-[1400px] flex flex-wrap items-center justify-between mx-auto">
        <a
          href="index.html"
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
        </a>
        <a
          href="/"
          className="flex justify-item-center items-center mx-auto overflow-hidden"
        >
          <span className="self-center text-[20px] inter-light whitespace-nowrap dark:text-black">
            Surgery South, P.C.
          </span>
        </a>
      </nav>
    </div>
  );
};

export default AddAdministration;
