import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import Preloader from "../../Partials/preLoader";

const SendMessage = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [selectedPhysician, setSelectedPhysician] = useState([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [sendToPhysicians, setSendToPhysicians] = useState(false);
  const [sendToStaff, setSendToStaff] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [staff, setStaff] = useState([]);
  const [physicians, setPhysicians] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const staffRes = await AxiosAuthInstance.get(
          `${Constant.BASE_URL}/users/staff?status=active`
        );
        const physiciansRes = await AxiosAuthInstance.get(
          `${Constant.BASE_URL}/users/physicians?status=active`
        );
        const allUsersRes = await AxiosAuthInstance.get(
          `${Constant.BASE_URL}/users/all-active`
        );

        setStaff(staffRes.data.staff);
        setPhysicians(physiciansRes.data.physicians);
        setAllUsers(allUsersRes.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubjectChange = (e) => setSubject(e.target.value);
  const handleMessageChange = (e) => setMessage(e.target.value);

  const handleSendToAllChange = () => {
    setSendToAll(!sendToAll);
    setSendToPhysicians(false);
    setSendToStaff(false);
    setSelectedPhysician([]);
    setSelectedStaff([]);
  };

  const handleSendToPhysiciansChange = () => {
    setSendToPhysicians(!sendToPhysicians);
    if (sendToPhysicians) {
      setSendToAll(false);
    }
  };

  const handleSendToStaffChange = () => {
    setSendToStaff(!sendToStaff);
    if (sendToStaff) {
      setSendToAll(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    let recipients = [];
    if (sendToAll) {
      recipients = allUsers.map((user) => String(user.id));
    } else {
      if (sendToStaff) {
        recipients = [
          ...recipients,
          ...staff.map((staffMember) => String(staffMember.id)),
        ];
      }
      if (sendToPhysicians) {
        recipients = [
          ...recipients,
          ...physicians.map((physician) => String(physician.id)),
        ];
      }
    }
    if (!sendToAll && !sendToStaff && !sendToPhysicians) {
      recipients = [
        ...selectedStaff.map((staffMember) => String(staffMember)),
        ...selectedPhysician.map((physician) => String(physician)),
      ];
    }

    const formData = {
      subject,
      message,
      recipients,
    };

    try {
      const res = await AxiosAuthInstance.post(
        `${Constant.BASE_URL}/send-message`,
        formData
      );
      console.log("Message sent successfully:", res.data);
      // Handle success,
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: "An unexpected error occurred" });
      }
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
      navigate("/messages");
    }
  };

  return (
    <>

      {loading && <Preloader />}

      <div className="h-screen bg-[#748BA2] content-center">
        <form onSubmit={handleSubmit}>
          <div className="relative w-[1400px] bg-white flex flex-wrap mx-auto rounded-xl">
            <div className="send-msg absolute bg-[#B4C6D9] left-0 right-0 m-auto w-[80%] top-[-35px] py-5 text-center rounded-xl">
              <h1 className="inter-medium text-[24px]">Send New Message</h1>
            </div>
            <div className="w-[1400px] mx-auto px-40">
              <div className="full-widths msg pt-10">
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  placeholder="Subject"
                  value={subject}
                  onChange={handleSubjectChange}
                />
              </div>
              <div className="sending-to">
                <div className="list1 flex py-2">
                  <h1 className="inter-bold w-[200px] text-[22px]">To Staff:</h1>
                  <div className="w-[840px] flex flex-wrap gap-x-4">
                    {staff.map((staffMember, index) => (
                      <div className="Staff" key={index}>
                        <input
                          type="checkbox"
                          className="hidden"
                          name={`staff-${index}`}
                          id={`staff-${index}`}
                          value={staffMember.id}
                          checked={selectedStaff.includes(staffMember.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedStaff((prevSelected) => {
                              if (checked) {
                                return [...prevSelected, staffMember.id];
                              } else {
                                return prevSelected.filter(
                                  (id) => id !== staffMember.id
                                );
                              }
                            });
                          }}
                        />

                        <label
                          htmlFor={`staff-${index}`}
                          className="flex items-center h-10 px-2 cursor-pointer"
                        >
                          <span className="checkbox-inner flex items-center justify-center w-4 h-4 text-transparent border-2 border-gray-300 rounded-full me-2"></span>
                          {staffMember.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="list2 flex py-2">
                  <h1 className="inter-bold w-[200px] text-[22px]">
                    To Physicians:
                  </h1>
                  <div className="w-[840px] flex flex-wrap gap-x-4">
                    {physicians.map((physician, index) => (
                      <div className="Physician" key={index}>
                        <input
                          className="hidden"
                          type="checkbox"
                          name={`physician-${index}`}
                          id={`physician-${index}`}
                          value={physician.id}
                          checked={selectedPhysician.includes(physician.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setSelectedPhysician((prevSelected) => {
                              if (checked) {
                                return [...prevSelected, physician.id];
                              } else {
                                return prevSelected.filter(
                                  (id) => id !== physician.id
                                );
                              }
                            });
                          }}
                        />
                        <label
                          htmlFor={`physician-${index}`}
                          className="flex items-center h-10 px-2 cursor-pointer"
                        >
                          <span className="checkbox-inner flex items-center justify-center w-4 h-4 text-transparent border-2 border-gray-300 rounded-full me-2"></span>
                          {physician.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="list3 flex gap-16 py-2">
                <div className="Staff flex justify-items-center items-center gap-2 text-[20px]">
                  <input
                    className="mark"
                    type="checkbox"
                    name="sendToAll"
                    id="cb1"
                    checked={sendToAll}
                    onChange={handleSendToAllChange}
                  />
                  <label htmlFor="cb1"></label>
                  <strong className="ps-4">Send </strong>To <strong>All </strong>
                </div>
                <div className="Physician flex justify-items-center items-center gap-2 text-[20px]">
                  <input
                    className="mark"
                    type="checkbox"
                    name="sendToPhysicians"
                    id="cb2"
                    checked={sendToPhysicians}
                    onChange={handleSendToPhysiciansChange}
                  />
                  <label htmlFor="cb2"></label>
                  <strong className="ps-4">Send </strong>To{" "}
                  <strong>Physicians </strong>
                </div>
                <div className="Staff flex justify-items-center items-center gap-2 text-[20px]">
                  <input
                    className="mark"
                    type="checkbox"
                    name="sendToStaff"
                    id="cb3"
                    checked={sendToStaff}
                    onChange={handleSendToStaffChange}
                  />
                  <label htmlFor="cb3"></label>
                  <strong className="ps-4">Send </strong>To{" "}
                  <strong>Staff </strong>
                </div>
              </div>
              <div className="full-widths msg pb-10">
                <textarea
                  className="formx"
                  name="message"
                  id="message"
                  placeholder="Message"
                  value={message}
                  onChange={handleMessageChange}
                ></textarea>
              </div>
            </div>

            <div className="msg-submit absolute bottom-[-20px] left-0 right-0 m-auto w-[40%] flex justify-between">
              <button
                type="submit"
                className="send-msg bg-[#B4C6D9] py-2 px-28 mx-2 w-64 text-center rounded-md border-2 inter-medium text-[18px] hover:bg-[#657E98] hover:text-white flex justify-center items-center cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send"}
              </button>
              <div
                className="send-msg bg-[#D8ADAD] py-2 px-28 mx-2 w-64 text-center rounded-md border-2 inter-medium text-[18px] hover:bg-[#B87D7D] hover:text-white flex justify-center items-center cursor-pointer"
                onClick={() => {
                  setSubject("");
                  setMessage("");
                  setSelectedStaff([]);
                  setSelectedPhysician([]);

                  setSendToAll(false);
                  setSendToPhysicians(false);
                  setSendToStaff(false);
                  navigate("/messages");
                }}
              >
                Cancel
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default SendMessage;
