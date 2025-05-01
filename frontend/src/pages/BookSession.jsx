import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const BookSession = () => {
    const { user } = useContext(AuthContext);
    const [availableSchedules, setAvailableSchedules] = useState([]);
    const [bookedSessions, setBookedSessions] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchAvailableSchedules = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/trainer/member/available-schedules', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAvailableSchedules(res.data);
            } catch (err) {
                setError('Failed to fetch available schedules');
            }
        };

        const fetchBookedSessions = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/trainer/member/booked-sessions', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBookedSessions(res.data);
            } catch (err) {
                setError('Failed to fetch booked sessions');
            }
        };

        if (user?.role === 'member') {
            fetchAvailableSchedules();
            fetchBookedSessions();
        }
    }, [user]);

    const handleBookSession = async (scheduleId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/trainer/book-session/${scheduleId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAvailableSchedules(availableSchedules.filter((schedule) => schedule._id !== scheduleId));
            setBookedSessions([res.data.schedule, ...bookedSessions]);
            setSuccess('Session booked successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book session');
        }
    };

    if (user?.role !== 'member') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Members.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Book a Session</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Available Schedules */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">Available Schedules</h2>
                    {availableSchedules.length > 0 ? (
                        <ul className="space-y-4">
                            {availableSchedules.map((schedule) => (
                                <li key={schedule._id} className="border-b pb-4">
                                    <p className="text-gray-700"><strong>Trainer:</strong> {schedule.trainer.name} ({schedule.trainer.email})</p>
                                    <p className="text-gray-700"><strong>Start Time:</strong> {new Date(schedule.startTime).toLocaleString()}</p>
                                    <p className="text-gray-700"><strong>End Time:</strong> {new Date(schedule.endTime).toLocaleString()}</p>
                                    <p className="text-gray-700"><strong>Status:</strong> {schedule.status}</p>
                                    <div className="mt-2">
                                        <button
                                            onClick={() => handleBookSession(schedule._id)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                        >
                                            Book Session
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700 text-center">No available schedules at the moment</p>
                    )}
                </div>

                {/* Booked Sessions */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Your Booked Sessions</h2>
                    {bookedSessions.length > 0 ? (
                        <ul className="space-y-4">
                            {bookedSessions.map((session) => (
                                <li key={session._id} className="border-b pb-4">
                                    <p className="text-gray-700"><strong>Trainer:</strong> {session.trainer.name} ({session.trainer.email})</p>
                                    <p className="text-gray-700"><strong>Start Time:</strong> {new Date(session.startTime).toLocaleString()}</p>
                                    <p className="text-gray-700"><strong>End Time:</strong> {new Date(session.endTime).toLocaleString()}</p>
                                    <p className="text-gray-700"><strong>Status:</strong> {session.status}</p>
                                    <p className="text-gray-700"><strong>Created:</strong> {new Date(session.createdAt).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700 text-center">No booked sessions yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookSession;