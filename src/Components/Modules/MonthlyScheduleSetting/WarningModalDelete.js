import React, { useState } from 'react';
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
const WarningModalDelete = ({ close, warn, dataDate, data }) => {
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    if (!warn) return null;
    const handleBackgroundClick = (e) => {
        if (e.target.id === 'myModal') {
            close();
        }
    };
    const handleDelete = (dataDate) => {
        AxiosAuthInstance.delete(`${Constant.BASE_URL}/monthly-call-delete/${dataDate}`)
            .then(() => {
                setErrorMessage("");
                data();
                close();
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status === 403) {
                        setErrorMessage(" Unable to Delete. Only present and future data allow to delete.");
                    } else if (error.response.status === 404) {
                        setErrorMessage(error.response.data.message || "No records found for this month.");
                    } else if (error.response.status === 500) {
                        setErrorMessage("Failed to delete records. Please try again later.");
                    } else if (error.response.data && error.response.data.errors) {
                        setErrors(error.response.data.errors);
                    } else {
                        setErrorMessage(error.response.data.message || "An unexpected error occurred");
                    }
                }
            });
    };


    return (
        <div id="myModal" className="modal-delete warns fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={handleBackgroundClick} aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="modal-delete-content py-10">
                <div className="flex justify-center pb-[20px]">
                    <img src="assets/images/warnings.png" alt="" style={{ height: '90px', width: '100px' }} />
                </div>
                <p className="pt-[10px] pb-[20px] inter-bold text-[20px] text-center flex justify-center">
                    Do you wish to reset the data to the previous block time in the calendar?
                </p>
                {errorMessage && (
                    <p className='pb-[10px] text-[red] text-[15px] flex  text-center justify-center'>{errorMessage}</p>
                )}
                <div className="buttons w-[100%] m-auto left-0 right-0 flex justify-center px-5 gap-5">
                    <button
                        className="inter-bold text-center bg-[#D8ADAD] w-[80px] h-[35px] rounded-md hover:bg-[#B87D7D] hover:text-white"
                        onClick={() => {
                            handleDelete(dataDate);
                        }}
                    >
                        YES
                    </button>
                    <button
                        className="inter-bold text-center bg-[#B4C6D9] w-[80px] h-[35px] rounded-md hover:text-white"
                        onClick={() => {
                            close();
                            setErrorMessage("");
                        }}
                    >
                        NO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarningModalDelete;
