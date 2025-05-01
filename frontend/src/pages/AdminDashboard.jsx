import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [gyms, setGyms] = useState([]);
    const [selectedGym, setSelectedGym] = useState(null);
    const [contactMessages, setContactMessages] = useState([]);
    const [gymReviews, setGymReviews] = useState([]);
    const [analytics, setAnalytics] = useState({
        pageViews: [],
        userDistribution: [],
        events: [],
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGyms = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/admin/gyms', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGyms(res.data);
            } catch (err) {
                setError('Failed to fetch gyms');
            }
        };

        const fetchContactMessages = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/contact/messages', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setContactMessages(res.data);
            } catch (err) {
                setError('Failed to fetch contact messages');
            }
        };

        const fetchGymReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/review/reviews', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGymReviews(res.data);
            } catch (err) {
                setError('Failed to fetch gym reviews');
            }
        };

        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/admin/analytics', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAnalytics(res.data);
            } catch (err) {
                setError('Failed to fetch analytics data');
            }
        };

        if (user?.role === 'admin') {
            fetchGyms();
            fetchContactMessages();
            fetchGymReviews();
            fetchAnalytics();
        }
    }, [user]);

    const handleViewGym = (gym) => {
        setSelectedGym(gym);
    };

    const handleDeleteGym = async (gymId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/gyms/${gymId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGyms(gyms.filter((gym) => gym._id !== gymId));
            setSelectedGym(null);
        } catch (err) {
            setError('Failed to delete gym');
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/contact/messages/${messageId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setContactMessages(contactMessages.filter((msg) => msg._id !== messageId));
        } catch (err) {
            setError('Failed to delete contact message');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/review/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGymReviews(gymReviews.filter((review) => review._id !== reviewId));
        } catch (err) {
            setError('Failed to delete review');
        }
    };

    if (user?.role !== 'admin') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Admins.</p>
        </div>;
    }

    // Prepare chart data with fallback for empty data
    const pageViewsData = {
        labels: analytics.pageViews.length > 0 ? analytics.pageViews.map((pv) => pv._id) : ['No Data'],
        datasets: [
            {
                label: 'Page Views',
                data: analytics.pageViews.length > 0 ? analytics.pageViews.map((pv) => pv.count) : [0],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const userDistributionData = {
        labels: analytics.userDistribution.length > 0 ? analytics.userDistribution.map((ud) => ud._id) : ['No Data'],
        datasets: [
            {
                label: 'User Distribution',
                data: analytics.userDistribution.length > 0 ? analytics.userDistribution.map((ud) => ud.count) : [1],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                {/* Gyms List */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">Gyms</h2>
                    {gyms.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2">Gym Name</th>
                                        <th className="p-2">Address</th>
                                        <th className="p-2">Owner Name</th>
                                        <th className="p-2">Owner Email</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gyms.map((gym) => (
                                        <tr key={gym._id} className="border-t">
                                            <td className="p-2">{gym.gymName}</td>
                                            <td className="p-2">{gym.address}</td>
                                            <td className="p-2">{gym.ownerName}</td>
                                            <td className="p-2">{gym.ownerEmail}</td>
                                            <td className="p-2">{gym.email}</td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => handleViewGym(gym)}
                                                    className="bg-green-600 text-white px-4 py-2 rounded mr-2 hover:bg-green-700"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGym(gym._id)}
                                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No gyms found</p>
                    )}
                </div>

                {/* Gym Details (Members and Trainers) */}
                {selectedGym && (
                    <div className="bg-gray-100 p-6 rounded-lg shadow-lg mb-8 flex space-x-4">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-4">Users in {selectedGym.gymName}</h2>
                            <h3 className="text-lg font-semibold mb-2">Members</h3>
                            {selectedGym.members.length > 0 ? (
                                <ul className="list-disc pl-5 mb-4">
                                    {selectedGym.members.map((member) => (
                                        <li key={member._id} className="text-gray-700">
                                            {member.name} ({member.email}) - Membership: {member.membership?.duration || 'N/A'} (End: {member.membership?.endDate ? new Date(member.membership.endDate).toLocaleDateString() : 'N/A'})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-700">No members</p>
                            )}
                            <h3 className="text-lg font-semibold mb-2">Trainers</h3>
                            {selectedGym.trainers.length > 0 ? (
                                <ul className="list-disc pl-5">
                                    {selectedGym.trainers.map((trainer) => (
                                        <li key={trainer._id} className="text-gray-700">
                                            {trainer.name} ({trainer.email})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-700">No trainers</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Contact Messages */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">Contact Messages</h2>
                    {contactMessages.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Phone</th>
                                        <th className="p-2">Subject</th>
                                        <th className="p-2">Message</th>
                                        <th className="p-2">Received On</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contactMessages.map((message) => (
                                        <tr key={message._id} className="border-t">
                                            <td className="p-2">{message.name}</td>
                                            <td className="p-2">{message.email}</td>
                                            <td className="p-2">{message.phone}</td>
                                            <td className="p-2">{message.subject}</td>
                                            <td className="p-2">{message.message}</td>
                                            <td className="p-2">{new Date(message.createdAt).toLocaleString()}</td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => handleDeleteMessage(message._id)}
                                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No contact messages</p>
                    )}
                </div>

                {/* Gym Reviews */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">Gym Reviews</h2>
                    {gymReviews.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2">Gym</th>
                                        <th className="p-2">Rating</th>
                                        <th className="p-2">Comment</th>
                                        <th className="p-2">Created On</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gymReviews.map((review) => (
                                        <tr key={review._id} className="border-t">
                                            <td className="p-2">{review.gym.gymName}</td>
                                            <td className="p-2">{review.rating} stars</td>
                                            <td className="p-2">{review.comment}</td>
                                            <td className="p-2">{new Date(review.createdAt).toLocaleString()}</td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => handleDeleteReview(review._id)}
                                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No gym reviews</p>
                    )}
                </div>

                {/* Analytics Overview (Charts) */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">Analytics Overview</h2>
                    <div className="flex flex-col md:flex-row md:space-x-4">
                        <div className="flex-1 mb-4 md:mb-0">
                            <h3 className="text-lg font-semibold mb-2">Page Views</h3>
                            <div className="h-64">
                                <Bar
                                    data={pageViewsData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'top' },
                                            title: { display: true, text: 'Page Views' },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    stepSize: 1,
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">User Distribution</h3>
                            <div className="h-64">
                                <Pie
                                    data={userDistributionData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'top' },
                                            title: { display: true, text: 'User Distribution' },
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Events */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Analytics - All Events</h2>
                    {analytics.events.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2">Event</th>
                                        <th className="p-2">Page</th>
                                        <th className="p-2">User</th>
                                        <th className="p-2">Role</th>
                                        <th className="p-2">Details</th>
                                        <th className="p-2">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.events.map((event) => (
                                        <tr key={event._id} className="border-t">
                                            <td className="p-2">{event.event}</td>
                                            <td className="p-2">{event.page || 'N/A'}</td>
                                            <td className="p-2">{event.user?.name} ({event.user?.email})</td>
                                            <td className="p-2">{event.userModel}</td>
                                            <td className="p-2">{event.details}</td>
                                            <td className="p-2">{new Date(event.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No events recorded</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;