import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ProgressTracker = () => {
    const { user } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        weight: '',
        muscleMass: '',
        fatPercentage: '',
        images: [],
        deleteImages: [],
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/member/progress', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLogs(res.data);
            } catch (err) {
                setError('Failed to fetch progress logs');
            }
        };
        if (user?.role === 'member') {
            fetchLogs();
        }
    }, [user]);

    const handleChange = (e) => {
        if (e.target.name === 'images') {
            setFormData({ ...formData, images: Array.from(e.target.files) });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleDeleteImage = (imageUrl) => {
        setFormData({
            ...formData,
            deleteImages: [...formData.deleteImages, imageUrl],
            images: formData.images.filter((_, index) => formData.images[index] !== imageUrl),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('weight', formData.weight);
            formDataToSend.append('muscleMass', formData.muscleMass);
            formDataToSend.append('fatPercentage', formData.fatPercentage);
            formData.images.forEach((image) => formDataToSend.append('images', image));
            if (editId && formData.deleteImages.length > 0) {
                formDataToSend.append('deleteImages', JSON.stringify(formData.deleteImages));
            }

            let res;
            if (editId) {
                res = await axios.put(`http://localhost:5000/api/member/progress/${editId}`, formDataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setLogs(logs.map((log) => (log._id === editId ? res.data.progressLog : log)));
                setSuccess('Progress log updated');
                setEditId(null);
            } else {
                res = await axios.post('http://localhost:5000/api/member/progress', formDataToSend, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setLogs([res.data.progressLog, ...logs]);
                setSuccess('Progress logged');
            }

            setFormData({ weight: '', muscleMass: '', fatPercentage: '', images: [], deleteImages: [] });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to log progress');
        }
    };

    const handleEdit = (log) => {
        setFormData({
            weight: log.weight,
            muscleMass: log.muscleMass,
            fatPercentage: log.fatPercentage,
            images: [],
            deleteImages: [],
        });
        setEditId(log._id);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/member/progress/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLogs(logs.filter((log) => log._id !== id));
            setSuccess('Progress log deleted');
        } catch (err) {
            setError('Failed to delete progress log');
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
                <h1 className="text-3xl font-bold mb-6 text-center">Progress Tracker</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Progress Logging Form */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">{editId ? 'Edit Progress Log' : 'Log Progress'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Weight (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Muscle Mass (kg)</label>
                            <input
                                type="number"
                                name="muscleMass"
                                value={formData.muscleMass}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Fat Percentage (%)</label>
                            <input
                                type="number"
                                name="fatPercentage"
                                value={formData.fatPercentage}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Images (up to 3)</label>
                            <input
                                type="file"
                                name="images"
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                multiple
                                accept="image/*"
                            />
                            {editId && logs.find((log) => log._id === editId)?.images?.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-gray-700">Existing Images:</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {logs
                                            .find((log) => log._id === editId)
                                            .images.map((image, index) => (
                                                <div key={index} className="relative">
                                                    <img src={image} alt={`Progress ${index}`} className="w-full h-24 object-cover rounded" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteImage(image)}
                                                        className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                            {editId ? 'Update' : 'Log Progress'}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditId(null);
                                    setFormData({ weight: '', muscleMass: '', fatPercentage: '', images: [], deleteImages: [] });
                                }}
                                className="w-full bg-gray-500 text-white p-2 rounded mt-2 hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                </div>

                {/* Progress Logs */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Progress Logs</h2>
                    {logs.length > 0 ? (
                        <ul className="space-y-4">
                            {logs.map((log) => (
                                <li key={log._id} className="border-b pb-4">
                                    <p className="text-gray-700"><strong>Weight:</strong> {log.weight} kg</p>
                                    <p className="text-gray-700"><strong>Muscle Mass:</strong> {log.muscleMass} kg</p>
                                    <p className="text-gray-700"><strong>Fat Percentage:</strong> {log.fatPercentage}%</p>
                                    <p className="text-gray-700"><strong>Date:</strong> {new Date(log.date).toLocaleString()}</p>
                                    {log.images.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-gray-700"><strong>Images:</strong></p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {log.images.map((image, index) => (
                                                    <img key={index} src={image} alt={`Progress ${index}`} className="w-full h-24 object-cover rounded" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-2">
                                        <button
                                            onClick={() => handleEdit(log)}
                                            className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(log._id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700 text-center">No progress logs yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;