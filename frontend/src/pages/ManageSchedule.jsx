import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ManageSchedule = () => {
    const { user } = useContext(AuthContext);
    const [schedules, setSchedules] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        startTime: '',
        endTime: '',
    });

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/trainer/trainer-schedules', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSchedules(res.data);
            } catch (err) {
                setError('Failed to fetch schedules');
            }
        };

        if (user?.role === 'trainer') {
            fetchSchedules();
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = {
                startTime: formData.startTime,
                endTime: formData.endTime,
            };

            const res = await axios.post('http://localhost:5000/api/trainer/trainer-schedules', data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSchedules([res.data.trainerSchedule, ...schedules]);
            setSuccess('Schedule slot posted');
            setFormData({
                startTime: '',
                endTime: '',
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post schedule slot');
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/trainer/trainer-schedules/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSchedules(schedules.filter((schedule) => schedule._id !== id));
            setSuccess('Schedule slot deleted');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete schedule slot');
        }
    };

    if (user?.role !== 'trainer') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Trainers.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Manage Schedule</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Post Schedule Slot Form */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">Post Free Schedule Slot</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Start Time</label>
                            <input
                                type="datetime-local"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">End Time</label>
                            <input
                                type="datetime-local"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                            Post Slot
                        </button>
                    </form>
                </div>

                {/* Schedule Slots List */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Your Schedule Slots</h2>
                    {schedules.length > 0 ? (
                        <ul className="space-y-4">
                            {schedules.map((schedule) => (
                                <li key={schedule._id} className="border-b pb-4">
                                    <p className="text-gray-700"><strong>Start Time:</strong> {new Date(schedule.startTime).toLocaleString()}</p>
                                    <p className="text-gray-700"><strong>End Time:</strong> {new Date(schedule.endTime).toLocaleString()}</p>
                                    <p className="text-gray-700"><strong>Status:</strong> {schedule.status}</p>
                                    {schedule.bookedBy && (
                                        <p className="text-gray-700"><strong>Booked By:</strong> {schedule.bookedBy.name} ({schedule.bookedBy.email})</p>
                                    )}
                                    <p className="text-gray-700"><strong>Created:</strong> {new Date(schedule.createdAt).toLocaleString()}</p>
                                    {schedule.status === 'available' && (
                                        <div className="mt-2">
                                            <button
                                                onClick={() => handleDelete(schedule._id)}
                                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700 text-center">No schedule slots posted yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageSchedule;