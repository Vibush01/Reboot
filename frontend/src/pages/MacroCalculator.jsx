import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MacroCalculator = () => {
    const { user } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        food: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/member/macros', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLogs(res.data);
            } catch (err) {
                setError('Failed to fetch macro logs');
            }
        };
        if (user?.role === 'member') {
            fetchLogs();
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
                food: formData.food,
                macros: {
                    calories: parseFloat(formData.calories),
                    protein: parseFloat(formData.protein),
                    carbs: parseFloat(formData.carbs),
                    fats: parseFloat(formData.fats),
                },
            };

            if (editId) {
                const res = await axios.put(`http://localhost:5000/api/member/macros/${editId}`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLogs(logs.map((log) => (log._id === editId ? res.data.macroLog : log)));
                setSuccess('Macro log updated');
                setEditId(null);
            } else {
                const res = await axios.post('http://localhost:5000/api/member/macros', data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLogs([res.data.macroLog, ...logs]);
                setSuccess('Macro logged');
            }

            setFormData({ food: '', calories: '', protein: '', carbs: '', fats: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to log macro');
        }
    };

    const handleEdit = (log) => {
        setFormData({
            food: log.food,
            calories: log.macros.calories,
            protein: log.macros.protein,
            carbs: log.macros.carbs,
            fats: log.macros.fats,
        });
        setEditId(log._id);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/member/macros/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLogs(logs.filter((log) => log._id !== id));
            setSuccess('Macro log deleted');
        } catch (err) {
            setError('Failed to delete macro log');
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
                <h1 className="text-3xl font-bold mb-6 text-center">Macro Calculator</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Macro Logging Form */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">{editId ? 'Edit Macro Log' : 'Log a Meal'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Food</label>
                            <input
                                type="text"
                                name="food"
                                value={formData.food}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Calories (kcal)</label>
                            <input
                                type="number"
                                name="calories"
                                value={formData.calories}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Protein (g)</label>
                            <input
                                type="number"
                                name="protein"
                                value={formData.protein}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Carbs (g)</label>
                            <input
                                type="number"
                                name="carbs"
                                value={formData.carbs}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Fats (g)</label>
                            <input
                                type="number"
                                name="fats"
                                value={formData.fats}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                            {editId ? 'Update' : 'Log Meal'}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditId(null);
                                    setFormData({ food: '', calories: '', protein: '', carbs: '', fats: '' });
                                }}
                                className="w-full bg-gray-500 text-white p-2 rounded mt-2 hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                </div>

                {/* Macro Logs */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Macro Logs</h2>
                    {logs.length > 0 ? (
                        <ul className="space-y-4">
                            {logs.map((log) => (
                                <li key={log._id} className="border-b pb-4">
                                    <p className="text-gray-700"><strong>Food:</strong> {log.food}</p>
                                    <p className="text-gray-700"><strong>Calories:</strong> {log.macros.calories} kcal</p>
                                    <p className="text-gray-700"><strong>Protein:</strong> {log.macros.protein} g</p>
                                    <p className="text-gray-700"><strong>Carbs:</strong> {log.macros.carbs} g</p>
                                    <p className="text-gray-700"><strong>Fats:</strong> {log.macros.fats} g</p>
                                    <p className="text-gray-700"><strong>Date:</strong> {new Date(log.date).toLocaleString()}</p>
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
                        <p className="text-gray-700 text-center">No macro logs yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MacroCalculator;