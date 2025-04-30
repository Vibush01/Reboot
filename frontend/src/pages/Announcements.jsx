import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

const Announcements = () => {
    const { user, userDetails } = useContext(AuthContext);
    const [announcements, setAnnouncements] = useState([]);
    const [error, setError] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user || !userDetails || !userDetails.gym) {
            setError('You must be in a gym to view announcements');
            return;
        }

        // Initialize Socket.IO
        const socketInstance = io('http://localhost:5000');
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            socketInstance.emit('joinGym', userDetails.gym);
        });

        socketInstance.on('announcement', (announcement) => {
            setAnnouncements((prev) => [announcement, ...prev]);
        });

        socketInstance.on('announcementUpdate', (updatedAnnouncement) => {
            setAnnouncements((prev) =>
                prev.map((ann) => (ann._id === updatedAnnouncement._id ? updatedAnnouncement : ann))
            );
        });

        socketInstance.on('announcementDelete', (announcementId) => {
            setAnnouncements((prev) => prev.filter((ann) => ann._id !== announcementId));
        });

        // Fetch announcements
        const fetchAnnouncements = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/chat/announcements', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAnnouncements(res.data);
            } catch (err) {
                setError('Failed to fetch announcements');
            }
        };

        fetchAnnouncements();

        return () => {
            socketInstance.disconnect();
        };
    }, [user, userDetails]);

    if (user?.role !== 'member') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Members.</p>
        </div>;
    }

    if (!userDetails?.gym) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Announcements</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    {announcements.length > 0 ? (
                        <ul className="space-y-4">
                            {announcements.map((announcement) => (
                                <li key={announcement._id} className="border-b pb-4">
                                    <p className="text-gray-700">
                                        <strong>{announcement.senderModel} ({announcement.sender.name}):</strong> {announcement.message}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        {new Date(announcement.timestamp).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700 text-center">No announcements yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Announcements;