// import React, { useEffect, useState } from "react";
// const Preloader = () => {
//   const [visible, setVisible] = useState(true);
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setVisible(false);
//     }, 250);
//     return () => clearTimeout(timer);
//   }, []);
//   return (
//     <>
//       <div className={`${!visible ? "hidden" : ""}`}>
//         <div className="bg-white fixed top-0 h-screen w-screen z-[20]">
//           <div className="absolute left-[50%] top-[50%] transform-translate-50">
//             <img
//               src="/assets/images/Surgery-South-Logo---FROM-WEB.png"
//               alt="Loader"
//               className="w-[250px] h-[250px] loader"
//             />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Preloader;
import React from "react";
import { DNA } from 'react-loader-spinner'
const Preloader = () => {
  return (
    <>
      <div className="">
        <div className="bg-white fixed left-0 top-0 h-screen w-screen z-[20]">
          <div className="absolute left-[50%] top-[50%] transform-translate-50">
            {/* <img
              src="/assets/images/Surgery-South-Logo---FROM-WEB.png"
              alt="Loader"
              className="w-[150px] h-[150px] loader"
            /> */}
            {/* <h1 className="text-[24px] inter-bold text-[#657E98]">Data is Loading...</h1> */}
            <DNA
              visible={true}
              height="80"
              width="80"
              ariaLabel="dna-loading"
              wrapperStyle={{}}
              wrapperClass="dna-wrapper"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Preloader;
