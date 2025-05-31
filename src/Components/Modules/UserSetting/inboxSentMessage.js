import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import Preloader from "../../Partials/preLoader";

const InboxSentMessage = () => {
  const { id } = useParams();
  const [message, setMessage] = useState(null);
  const [recipientNames, setRecipientNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await AxiosAuthInstance.get(
          `${Constant.BASE_URL}/sentbox/${id}`
        );
        setMessage(response.data.message);
        setRecipientNames(response.data.recipient_names);
      } catch (error) {
        console.error("Error fetching message:", error);
        setError("Failed to fetch message.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  if (loading) {
    return <Preloader />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div className="h-screen bg-[#748BA2] content-center">
        <div className="relative w-[1300px] h-auto bg-white flex flex-wrap mx-auto rounded-xl">
          <div className="send-msg absolute bg-[#B4C6D9] left-0 right-0 m-auto w-[85%] top-[-35px] py-5 text-center rounded-xl">
            <h1 className="inter-medium 2xl:text-[24px] xl:text-[20px] truncate px-10">
              {message.subject}
            </h1>
          </div>
          <div className="w-[85%] mx-auto pt-[5%]">
            <div className="justify-between flex px-10 pt-1">
              <div className="sender-info text-2xl inter-bold text-[22px]">
                <div className="sender">
                  <span className="widther">From: </span> {message.sender.name}
                </div>
                <div className="receiver flex">
                  <span className="widther">To: </span>{" "}
                  <p className="w-[600px]">{recipientNames.join(", ")}</p>
                </div>
              </div>
              <div className="sending-time">
                <span className="inter-bold text-[18px] text-[#CCCCCC] mx-1">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
                <span className="inter-bold text-[18px] text-[#000000] mx-1 ps-5">
                  {new Date(message.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="bg-[#F9F9F9] h-[250px] 2xl:h-[400px] p-2 mt-10 mb-20 p-0 overflow-y-scroll">
              <p className="inter-regular text-[20px] p-[40px]">
                {message.message}
              </p>
            </div>
          </div>
          <div className="msg-submit absolute bottom-[-15px] left-0 right-0 m-auto w-[40%] flex justify-between">
            <Link to={{ pathname: `/send-message`, state: { fromTab: 'sent' } }}>
              <div className="send-msg bg-[#B4C6D9] flex h-[35px] items-center justify-center rounded-md border-2 inter-medium text-[18px] w-[225px] hover:bg-[#657E98] hover:text-white cursor-pointer">
                Sent
              </div>
            </Link>
            <Link to={{ pathname: "/messages", state: { fromTab: 'sent' } }}>
              <div className="send-msg bg-[#D8ADAD] flex h-[35px] items-center justify-center rounded-md border-2 inter-medium text-[18px] w-[225px] hover:bg-[#B87D7D] hover:text-white cursor-pointer">
                Return To Messages
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default InboxSentMessage;
