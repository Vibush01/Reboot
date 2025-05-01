import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ViewBookings = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/trainer/bookings', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBookings(res.data);
            } catch (err) {
                setError('Failed to fetch bookings');
            }
        };

        if (user?.role === 'trainer') {
            fetchBookings();
        }
    }, [user]);

    if (user?.role !== 'trainer') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Trainers.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">View Bookings</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                {/* Bookings List */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Your Bookings</h2>
                    {bookings.length > 0 ? (
                        <ul className="space-y-4">
                            {bookings.map((booking) => (
                                <li key={booking._id} className="border-b pb-4">
                                    <p className="text-gray-700"><strong>Member:</strong> {booking.bookedBy.name} ({booking.bookedBy.email})</p>
                                    <p className="text-gray-700"><strong>Start Time:</strong> {new Date(booking.startTime).toLocaleString()}</p>
                                    <p className="text-gray-700"><strong>End Time:</strong> {new Date(booking.endTime).toLocaleString()}</p>
                                    <p className="text-gray-700"><strong>Status:</strong> {booking.status}</p>
                                    <p className="text-gray-700"><strong>Created:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700 text-center">No bookings yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewBookings;