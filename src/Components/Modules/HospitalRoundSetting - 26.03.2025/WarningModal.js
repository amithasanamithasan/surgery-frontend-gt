import React from 'react';
const WarningModal = ({warn, closeWarn, saveData,updateData, upORadd,clear,hide, updateLock}) => {
    if(!warn) return null;
    const handleBackgroundClick = (e) => {
        if (e.target.id === 'myModal') {
            closeWarn();
        }
    };
    console.log(upORadd)
    return (
        <div id="myModal" className="modal-delete fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={handleBackgroundClick} aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="modal-delete-content py-10">
                <div className="flex justify-center">
                    <img src="assets/images/warnings.png" alt="" style={{ height: '90px', width: '100px' }} />
                </div>
                <p className="pt-[18px] pb-1 inter-bold text-[22px] text-center flex justify-center">
                    Do you wish to save your work?
                </p>
                <p className="pb-[32px] text-[15px] flex  text-center justify-center">
                    Remember that No will discard any unsaved changes!
                </p>
                <div className="buttons w-[100%] m-auto left-0 right-0 flex justify-between px-5 gap-5">
                    <button
                        className="inter-bold text-center bg-[#B4C6D9] w-[205px] h-[35px] rounded-md hover:bg-[#657E98] hover:text-white"
                        onClick={()=>{
                            upORadd === "true" && updateLock();
                            closeWarn();
                            clear();
                            hide();
                        }}
                    >
                        No
                    </button> 
                    <button
                        className="inter-bold text-center bg-[#D8ADAD] w-[205px] h-[35px] rounded-md hover:bg-[#B87D7D] hover:text-white"
                        onClick={() => {
                            upORadd === "false" ? saveData() : updateData();
                            closeWarn();
                        }}
                    >
                        Yes, Sure!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarningModal;
