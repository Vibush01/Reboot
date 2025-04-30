import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const WorkoutPlans = () => {
    const { user } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);
    const [members, setMembers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        memberId: '',
        title: '',
        description: '',
        exercises: [{ name: '', sets: '', reps: '', rest: '' }],
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/trainer/workout-plans', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPlans(res.data);
            } catch (err) {
                setError('Failed to fetch workout plans');
            }
        };

        const fetchMembers = async () => {
            try {
                const token = localStorage.getItem('token');
                const trainerRes = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const gymId = trainerRes.data.gym;
                const gymRes = await axios.get(`http://localhost:5000/api/gym/${gymId}`);
                setMembers(gymRes.data.members);
            } catch (err) {
                setError('Failed to fetch members');
            }
        };

        if (user?.role === 'trainer') {
            fetchPlans();
            fetchMembers();
        }
    }, [user]);

    const handleChange = (e, index) => {
        if (e.target.name.startsWith('exercise')) {
            const exercises = [...formData.exercises];
            const field = e.target.name.split('.')[1];
            exercises[index][field] = e.target.value;
            setFormData({ ...formData, exercises });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const addExercise = () => {
        setFormData({
            ...formData,
            exercises: [...formData.exercises, { name: '', sets: '', reps: '', rest: '' }],
        });
    };

    const removeExercise = (index) => {
        setFormData({
            ...formData,
            exercises: formData.exercises.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = {
                memberId: formData.memberId,
                title: formData.title,
                description: formData.description,
                exercises: formData.exercises,
            };

            if (editId) {
                const res = await axios.put(`http://localhost:5000/api/trainer/workout-plans/${editId}`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPlans(plans.map((plan) => (plan._id === editId ? res.data.workoutPlan : plan)));
                setSuccess('Workout plan updated');
                setEditId(null);
            } else {
                const res = await axios.post('http://localhost:5000/api/trainer/workout-plans', data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPlans([res.data.workoutPlan, ...plans]);
                setSuccess('Workout plan created');
            }

            setFormData({
                memberId: '',
                title: '',
                description: '',
                exercises: [{ name: '', sets: '', reps: '', rest: '' }],
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save workout plan');
        }
    };

    const handleEdit = (plan) => {
        setFormData({
            memberId: plan.member._id,
            title: plan.title,
            description: plan.description,
            exercises: plan.exercises,
        });
        setEditId(plan._id);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/trainer/workout-plans/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPlans(plans.filter((plan) => plan._id !== id));
            setSuccess('Workout plan deleted');
        } catch (err) {
            setError('Failed to delete workout plan');
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
                <h1 className="text-3xl font-bold mb-6 text-center">Workout Plans</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Workout Plan Form */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">{editId ? 'Edit Workout Plan' : 'Create Workout Plan'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Member</label>
                            <select
                                name="memberId"
                                value={formData.memberId}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Select a member</option>
                                {members.map((member) => (
                                    <option key={member._id} value={member._id}>
                                        {member.name} ({member.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                            />
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-bold mb-2">Exercises</h3>
                            {formData.exercises.map((exercise, index) => (
                                <div key={index} className="mb-2 p-4 border rounded">
                                    <div className="mb-2">
                                        <label className="block text-gray-700">Exercise Name</label>
                                        <input
                                            type="text"
                                            name={`exercise.name.${index}`}
                                            value={exercise.name}
                                            onChange={(e) => handleChange(e, index)}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block text-gray-700">Sets</label>
                                        <input
                                            type="number"
                                            name={`exercise.sets.${index}`}
                                            value={exercise.sets}
                                            onChange={(e) => handleChange(e, index)}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block text-gray-700">Reps</label>
                                        <input
                                            type="number"
                                            name={`exercise.reps.${index}`}
                                            value={exercise.reps}
                                            onChange={(e) => handleChange(e, index)}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="block text-gray-700">Rest (e.g., 30 seconds)</label>
                                        <input
                                            type="text"
                                            name={`exercise.rest.${index}`}
                                            value={exercise.rest}
                                            onChange={(e) => handleChange(e, index)}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    {formData.exercises.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeExercise(index)}
                                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                        >
                                            Remove Exercise
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addExercise}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
                            >
                                Add Exercise
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                            {editId ? 'Update Plan' : 'Create Plan'}
                        </button>
                        {editId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditId(null);
                                    setFormData({
                                        memberId: '',
                                        title: '',
                                        description: '',
                                        exercises: [{ name: '', sets: '', reps: '', rest: '' }],
                                    });
                                }}
                                className="w-full bg-gray-500 text-white p-2 rounded mt-2 hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                </div>

                {/* Workout Plans List */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Workout Plans</h2>
                    {plans.length > 0 ? (
                        <ul className="space-y-4">
                            {plans.map((plan) => (
                                <li key={plan._id} className="border-b pb-4">
                                    <p className="text-gray-700"><strong>Member:</strong> {plan.member.name} ({plan.member.email})</p>
                                    <p className="text-gray-700"><strong>Title:</strong> {plan.title}</p>
                                    <p className="text-gray-700"><strong>Description:</strong> {plan.description || 'N/A'}</p>
                                    <p className="text-gray-700"><strong>Exercises:</strong></p>
                                    <ul className="list-disc pl-5">
                                        {plan.exercises.map((exercise, index) => (
                                            <li key={index} className="text-gray-700">
                                                {exercise.name}: {exercise.sets} sets, {exercise.reps} reps, Rest: {exercise.rest || 'N/A'}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-gray-700"><strong>Created:</strong> {new Date(plan.createdAt).toLocaleString()}</p>
                                    <div className="mt-2">
                                        <button
                                            onClick={() => handleEdit(plan)}
                                            className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan._id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700 text-center">No workout plans yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkoutPlans;