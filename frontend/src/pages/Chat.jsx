import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Chat = () => {
    const { user, userDetails } = useContext(AuthContext);
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [receivers, setReceivers] = useState([]);
    const [selectedReceiver, setSelectedReceiver] = useState(null);
    const [error, setError] = useState('');
    const socketRef = useRef(null);

    useEffect(() => {
        // Determine the gym ID based on user role
        let gymId;
        if (user.role === 'gym') {
            gymId = user.id; // Gym Profiles use their own ID as the gym ID
        } else {
            if (!userDetails || !userDetails.gym) {
                setError('You must be in a gym to chat');
                return;
            }
            gymId = userDetails.gym;
        }

        // Initialize Socket.IO
        socketRef.current = io('http://localhost:5000');
        socketRef.current.on('connect', () => {
            socketRef.current.emit('joinGym', gymId);
        });

        socketRef.current.on('message', (newMessage) => {
            setMessages((prev) => [...prev, newMessage]);
        });

        // Fetch gym members and trainers based on role restrictions
        const fetchReceivers = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/gym/${gymId}`);
                const gym = res.data;
                const receiversList = [];

                if (user.role === 'gym') {
                    // Gym Profiles can only chat with Trainers
                    gym.trainers.forEach((trainer) => receiversList.push({ _id: trainer._id, name: trainer.name, role: 'trainer' }));
                } else if (user.role === 'trainer') {
                    // Trainers can chat with Members and the Gym Profile
                    receiversList.push({ _id: gym._id, name: gym.gymName, role: 'gym' });
                    gym.members.forEach((member) => receiversList.push({ _id: member._id, name: member.name, role: 'member' }));
                } else if (user.role === 'member') {
                    // Members can only chat with Trainers
                    gym.trainers.forEach((trainer) => receiversList.push({ _id: trainer._id, name: trainer.name, role: 'trainer' }));
                }

                setReceivers(receiversList);
            } catch (err) {
                setError('Failed to fetch receivers');
            }
        };

        fetchReceivers();

        return () => {
            socketRef.current.disconnect();
        };
    }, [user, userDetails]);

    const fetchMessages = async (receiverId) => {
        try {
            const gymId = user.role === 'gym' ? user.id : userDetails.gym;
            const res = await axios.get(`http://localhost:5000/api/chat/messages/${gymId}/${receiverId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setMessages(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch messages');
        }
    };

    const handleReceiverSelect = (receiver) => {
        setSelectedReceiver(receiver);
        fetchMessages(receiver._id);
    };

    const handleSendMessage = () => {
        if (!message.trim() || !selectedReceiver) return;

        const senderModel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        const receiverModel = selectedReceiver.role.charAt(0).toUpperCase() + selectedReceiver.role.slice(1);
        const gymId = user.role === 'gym' ? user.id : userDetails.gym;

        const messageData = {
            senderId: user.id,
            senderModel,
            receiverId: selectedReceiver._id,
            receiverModel,
            gymId,
            message,
        };

        socketRef.current.emit('sendMessage', messageData);
        setMessage('');
    };

    if (!user) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">You must be logged in to access chat</p>
        </div>;
    }

    if ((user.role !== 'gym' && (!userDetails || !userDetails.gym)) || error) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">{error || 'You must be in a gym to access chat'}</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto flex">
                {/* Receivers List */}
                <div className="w-1/4 bg-white p-4 rounded-lg shadow-lg mr-4">
                    <h2 className="text-2xl font-bold mb-4">Chat With</h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {receivers.length > 0 ? (
                        <ul className="space-y-2">
                            {receivers.map((receiver) => (
                                <li
                                    key={receiver._id}
                                    onClick={() => handleReceiverSelect(receiver)}
                                    className={`p-2 rounded cursor-pointer ${selectedReceiver?._id === receiver._id ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    {receiver.name} ({receiver.role})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700">No users to chat with</p>
                    )}
                </div>

                {/* Chat Messages */}
                <div className="w-3/4 bg-white p-4 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Chat</h2>
                    {selectedReceiver ? (
                        <>
                            <div className="h-96 overflow-y-auto mb-4 p-4 border rounded">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`mb-2 ${msg.sender.toString() === user.id ? 'text-right' : 'text-left'}`}
                                    >
                                        <p className={`inline-block p-2 rounded ${msg.sender.toString() === user.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                            {msg.message}
                                        </p>
                                        <p className="text-gray-500 text-sm">{new Date(msg.timestamp).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="flex-1 p-2 border rounded-l"
                                    placeholder="Type a message..."
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-blue-600 text-white p-2 rounded-r hover:bg-blue-700"
                                >
                                    Send
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-700 text-center">Select a user to start chatting</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;