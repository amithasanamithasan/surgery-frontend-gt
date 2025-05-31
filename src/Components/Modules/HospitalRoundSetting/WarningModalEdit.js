import React from 'react';
const WarningModalEdit = ({warn, closeWarn, clear, hide}) => {
    if(!warn) return null;
    const handleBackgroundClick = (e) => {
        if (e.target.id === 'myModal') {
            closeWarn();
        }
    };
    return (
        <div id="myModal" className="modal-delete fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={handleBackgroundClick} aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="modal-delete-content py-10">
                <div className="flex justify-center">
                    <img src="assets/images/warnings.png" alt="" style={{ height: '90px', width: '100px' }} />
                </div>
                <p className="pt-[18px] pb-1 inter-bold text-[20px] text-center flex justify-center">
                    Someone is already editing this Data!
                </p>
                <p className="pb-[32px] text-[15px] flex  text-center justify-center">
                    You can't Modify this Entry. Please try again later!
                </p>
                <div className="buttons w-[100%] m-auto left-0 right-0 flex justify-center px-5 gap-5"> 
                    <button
                        className="inter-bold text-center bg-[#D8ADAD] w-[205px] h-[35px] rounded-md hover:bg-[#B87D7D] hover:text-white"
                        onClick={() => {
                            closeWarn();
                            clear();
                            hide();
                        }}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarningModalEdit;
