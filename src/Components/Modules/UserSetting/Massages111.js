import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Constant from "../../../Constant";
import { AxiosAuthInstance } from "../../../AxiosInterceptors";
import MasterNav from "../../Layouts/MasterNav";
import Preloader from "../../Partials/preLoader";

const Messages = () => {
  const [messages, setMessages] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("inbox");
  const [unreadCount, setUnreadCount] = useState(0);

  const location = useLocation();
  const fromTab = location.state?.fromTab || "inbox";

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await AxiosAuthInstance.get(`${Constant.BASE_URL}/messages`);
        setMessages({
          received: response.data.received,
          sent: response.data.sent.map((message) => ({
            ...message,
            is_read: true,
          })),
        });
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Failed to fetch messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    setActiveTab(fromTab);
  }, [fromTab]);

  const markMessageAsRead = async (messageId) => {
    try {
      await AxiosAuthInstance.get(`${Constant.BASE_URL}/message/${messageId}`);
      const updatedMessages = messages.received.map((message) => {
        if (message.id === messageId) {
          return { ...message, is_read: true };
        }
        return message;
      });
      setMessages({ ...messages, received: updatedMessages });
      const unreadMessages = updatedMessages.filter((message) => !message.is_read).length;
      setUnreadCount(unreadMessages);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  //if (loading) return <div>Loading...</div>;

  if (error) return <div>{error}</div>;

  const renderReceivedMessages = (messagesList) =>
    messagesList.map((message) => (
      <div key={message.id} className="message-list left-0 right-0 m-auto mb-[16px]">
        <Link
          to={{
            pathname: `/recivedbox/${message.id}`,
            state: { fromTab: activeTab },
          }}
          onClick={() => markMessageAsRead(message.id)}
        >
          <div
            className={`h-[95px] w-[1325px] ${message.is_read ? "read" : "unread"} rounded-[10px] flex justify-between px-5 items-center`}
          >
            <h1 className="text-left inter-bold text-[18px] w-[250px] pt-1">
              {message.sender.name}
              <span className="text-[15px] text-[#CCCCCC]">
                ({message.recipients.length} Others)
              </span>
            </h1>
            <p className="me-auto inter-bold text-[18px] pt-2 truncate w-[800px]">
              {message.subject}
            </p>
            <div className="icon pt-1 px-2 inter-bold">
              {new Date(message.created_at).toLocaleDateString()}
            </div>
          </div>
        </Link>
      </div>
    ));

  const renderSendMessages = (messagesList) =>
    messagesList.map((message) => (
      <div key={message.id} className="message-list left-0 right-0 m-auto mb-[16px]">
        <Link to={{ pathname: `/sentbox/${message.id}`, state: { fromTab: activeTab } }}>
          <div
            className="h-[95px] w-[1325px] read rounded-[10px] flex justify-between px-5 items-center"
          >
            <h1 className="text-left inter-bold text-[18px] w-[250px] pt-1">
              {message.sender.name}
              <span className="text-[15px] text-[#CCCCCC]">
                ({message.recipients.length} Others)
              </span>
            </h1>
            <p className="me-auto inter-bold text-[18px] pt-2 truncate w-[800px]">
              {message.subject}
            </p>
            <div className="icon pt-1 px-2 inter-bold">
              {new Date(message.created_at).toLocaleDateString()}
            </div>
          </div>
        </Link>
      </div>
    ));

  return (
    <>
      <div className="h-[75px] bg-[#B4C6D9] content-center sticky top-0 z-10">
        <MasterNav />
      </div>

      {loading && <Preloader />}

      <div className="w-[1165px] mx-auto py-3">
        <div className="administration mt-[35px] mb-5 bg-[#B4C6D9] px-5 py-5 rounded-xl text-center flex">
          <p className="mx-auto inter-medium text-[24px] ps-56">Messages</p>
          <button
            className="w-[220px] ms-end border-2 px-2 rounded-md border-none bg-white h-[40px] hover:bg-[#657E98] hover:text-white"
            id="popupUser"
          >
            <Link to="/send-message" className="inter-medium text-[18px]">
              Send New Message
            </Link>
          </button>
        </div>
      </div>
      <div className="w-[1400px] mx-auto py-3 relative pt-10">
        <div className="absolute flex w-[1165px] justify-between top-[15px] left-0 right-0 m-auto">
          <div
            className={`inbox ${activeTab === "inbox" ? "msg-active" : ""} bg-[#CCCCCC] w-[550px] border-2 rounded-lg py-3 text-center inter-bold text-[20px] cursor-pointer`}
            onClick={() => setActiveTab("inbox")}
          >
            Inbox <span className="inter-regular">({unreadCount} Unread)</span>
          </div>
          <div
            className={`to ${activeTab === "sent" ? "msg-active" : ""} bg-[#CCCCCC] w-[550px] border-2 rounded-lg py-3 text-center inter-bold text-[20px] cursor-pointer`}
            onClick={() => setActiveTab("sent")}
          >
            Sent
          </div>
        </div>
        <div className="bg-white w-[1400px] px-10 rounded-md pt-16 pb-10">
          {activeTab === "inbox"
            ? renderReceivedMessages(messages.received)
            : renderSendMessages(messages.sent)}
        </div>
      </div>
    </>
  );
};

export default Messages;
