import React from 'react';

const DeleteModal = ({ show, onClose, onDelete }) => {
    if (!show) return null;

    return (
        <div id="myModal" className="modal-delete">
            <div className="modal-delete-content py-10">
                <div className="flex justify-center">
                    <img src="assets/images/Group 148.png" alt="" style={{ height: '70px', width: '70px' }} />
                </div>
                <p className="pt-[38px] pb-1 inter-bold text-[22px] flex justify-center">
                    Are you sure you want to delete?
                </p>
                <p className="pb-[42px] text-[18px] flex justify-center">
                    This will archived the record.
                </p>
                <div className="buttons w-[100%] m-auto left-0 right-0 flex justify-between px-5 gap-5">
                    <button
                        className="inter-bold text-center bg-[#B4C6D9] w-[205px] h-[35px] rounded-md hover:bg-[#657E98] hover:text-white"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="inter-bold text-center bg-[#D8ADAD] w-[205px] h-[35px] rounded-md hover:bg-[#B87D7D] hover:text-white"
                        onClick={onDelete}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
