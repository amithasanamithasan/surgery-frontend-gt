import React, { useEffect, useState } from "react";
import { ReactTyped } from "react-typed";
function Mainpreloader() {
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);
    return (
        <>
            <div className={`${!visible ? "hidden" : ""}`}>
                <div className="bg-white fixed top-0 h-screen w-screen z-[20]">
                    <div className="absolute left-[50%] top-[50%] transform-translate-50">
                        <div className="w-[900px] flex items-center">
                            <div className="bg-white h-[120px] w-[120px] rounded-[10px] drop-shadow-2xl flex justify-center items-center me-5">
                                <img
                                    src="assets/images/Surgery-South-Logo---FROM-WEB.png"
                                    alt="Loader"
                                    className="w-[50px] h-[50px]"
                                />
                            </div>
                            <ReactTyped
                                strings={["Surgery South, P.C."]}
                                typeSpeed={30}
                                backSpeed={50}
                                className="inter-bold text-[75px] text-[#657E98]"
                                loop
                            ></ReactTyped>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Mainpreloader