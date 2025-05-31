import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Constant from '../../../Constant';
import { AxiosAuthInstance } from '../../../AxiosInterceptors';
import Preloader from '../../Partials/preLoader';

const ReplyMessage = () => {
    const { id, senderId } = useParams();
    const navigate = useNavigate();
    const [originalSubject, setOriginalSubject] = useState('');
    const [originalSender, setOriginalSender] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOriginalMessage = async () => {
            try {
                const response = await AxiosAuthInstance.get(`${Constant.BASE_URL}/message-reply/${id}/${senderId}`);
                const replyMessages = response.data.replyMessages;

                if (replyMessages.length > 0) {
                    const originalMessage = replyMessages[0];
                    setOriginalSubject(originalMessage.subject);
                    setOriginalSender(originalMessage.sender.name);
                }
            } catch (error) {
                console.error('Error fetching original message:', error);
                setError('Failed to fetch original message.');
            }
        };

        fetchOriginalMessage();
    }, [id, senderId]);

    const handleReply = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await AxiosAuthInstance.post(`${Constant.BASE_URL}/message/reply/${id}/${senderId}`, { message });
            navigate('/messages');
        } catch (error) {
            console.error('Error sending reply:', error);
            setError('Failed to send reply.');
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return <Preloader />
    }
    return (
        <div className="h-screen bg-[#748BA2] content-center">
            <form onSubmit={handleReply}>
                <div className="relative w-[1200px] 2xl:w-[1400px] h-auto bg-white flex flex-wrap mx-auto rounded-xl">
                    <div className="send-msg absolute bg-[#B4C6D9] left-0 right-0 m-auto w-[80%] top-[-35px] py-5 text-center rounded-xl">
                        <h1 className="inter-medium text-[24px]">Reply to Message</h1>
                    </div>
                    <div className="w-[1200px] 2xl:w-[1400px] mx-auto py-[2%] px-40">
                        <div className="full-widths msg pt-10 inter-bold">
                            <input
                                type="text"
                                name="subject"
                                id="subject"
                                value={`Subject: ${originalSubject}`}
                                readOnly
                                className="form-input"
                            />
                        </div>
                        <div className="full-widths msg pb-10 inter-bold">
                            <input
                                type="text"
                                name="sender"
                                id="sender"
                                value={`To: ${originalSender}`}
                                readOnly
                                className="form-input"
                            />
                        </div>
                        <div className="full-widths msg pb-10">
                            <textarea
                                className="formx"
                                name="message"
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your reply here..."
                            ></textarea>
                        </div>
                    </div>
                    <div className="msg-submit absolute bottom-[-20px] left-0 right-0 m-auto w-[40%] flex justify-between">
                        <button
                            type="submit"
                            className="send-msg bg-[#B4C6D9] py-2 px-28 mx-2 w-64 text-center rounded-md border-2 inter-medium text-[18px] hover:bg-[#657E98] hover:text-white flex justify-center items-center cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? 'Replying...' : 'Reply'}
                        </button>
                        <div
                            className="send-msg bg-[#D8ADAD] py-2 px-28 mx-2 w-64 text-center rounded-md border-2 inter-medium text-[18px] hover:bg-[#B87D7D] hover:text-white flex justify-center items-center cursor-pointer"
                            onClick={() => navigate('/messages')}
                        >
                            Cancel
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ReplyMessage;
