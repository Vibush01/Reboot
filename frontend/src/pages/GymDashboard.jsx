import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const GymDashboard = () => {
    const { user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/gym/requests', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRequests(res.data);
            } catch (err) {
                setError('Failed to fetch join requests');
            }
        };
        if (user?.role === 'gym' || user?.role === 'trainer') {
            fetchRequests();
        }
    }, [user]);

    const handleAccept = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/gym/requests/${requestId}/accept`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Request accepted');
            setRequests(requests.filter((req) => req._id !== requestId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to accept request');
        }
    };

    const handleDeny = async (requestId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/gym/requests/${requestId}/deny`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Request denied');
            setRequests(requests.filter((req) => req._id !== requestId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to deny request');
        }
    };

    if (user?.role !== 'gym' && user?.role !== 'trainer') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Gym Profiles and Trainers.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    {user.role === 'gym' ? 'Gym Dashboard - Join Requests' : 'Trainer Dashboard - Member Join Requests'}
                </h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    {requests.length > 0 ? (
                        <ul className="space-y-4">
                            {requests.map((request) => (
                                <li key={request._id} className="border-b pb-4">
                                    <p className="text-gray-700">
                                        <strong>{request.userModel}:</strong> {request.user.name} ({request.user.email})
                                    </p>
                                    {request.userModel === 'Member' && (
                                        <p className="text-gray-700">
                                            <strong>Membership Duration:</strong> {request.membershipDuration}
                                        </p>
                                    )}
                                    <p className="text-gray-700">
                                        <strong>Requested on:</strong> {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="mt-2">
                                        <button
                                            onClick={() => handleAccept(request._id)}
                                            className="bg-green-600 text-white px-4 py-2 rounded mr-2 hover:bg-green-700"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleDeny(request._id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                        >
                                            Deny
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700 text-center">No pending join requests</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GymDashboard;