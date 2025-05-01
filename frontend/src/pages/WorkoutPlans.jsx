import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const WorkoutPlans = () => {
    const { user } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);
    const [dietPlans, setDietPlans] = useState([]);
    const [requests, setRequests] = useState([]);
    const [members, setMembers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('workout');
    const [workoutForm, setWorkoutForm] = useState({
        memberId: '',
        title: '',
        description: '',
        exercises: [{ name: '', sets: '', reps: '', rest: '' }],
    });
    const [dietForm, setDietForm] = useState({
        memberId: '',
        title: '',
        description: '',
        meals: [{ name: '', calories: '', protein: '', carbs: '', fats: '', time: '' }],
    });
    const [editWorkoutId, setEditWorkoutId] = useState(null);
    const [editDietId, setEditDietId] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const token = localStorage.getItem('token');
                const workoutRes = await axios.get('http://localhost:5000/api/trainer/workout-plans', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPlans(workoutRes.data);

                const dietRes = await axios.get('http://localhost:5000/api/trainer/diet-plans', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDietPlans(dietRes.data);
            } catch (err) {
                setError('Failed to fetch plans');
            }
        };

        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/trainer/plan-requests', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRequests(res.data);
            } catch (err) {
                setError('Failed to fetch plan requests');
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
            fetchRequests();
            fetchMembers();
        }
    }, [user]);

    const handleWorkoutChange = (e, index) => {
        if (e.target.name.startsWith('exercise')) {
            const exercises = [...workoutForm.exercises];
            const field = e.target.name.split('.')[1];
            exercises[index][field] = e.target.value;
            setWorkoutForm({ ...workoutForm, exercises });
        } else {
            setWorkoutForm({ ...workoutForm, [e.target.name]: e.target.value });
        }
    };

    const handleDietChange = (e, index) => {
        if (e.target.name.startsWith('meal')) {
            const meals = [...dietForm.meals];
            const field = e.target.name.split('.')[1];
            meals[index][field] = e.target.value;
            setDietForm({ ...dietForm, meals });
        } else {
            setDietForm({ ...dietForm, [e.target.name]: e.target.value });
        }
    };

    const addExercise = () => {
        setWorkoutForm({
            ...workoutForm,
            exercises: [...workoutForm.exercises, { name: '', sets: '', reps: '', rest: '' }],
        });
    };

    const removeExercise = (index) => {
        setWorkoutForm({
            ...workoutForm,
            exercises: workoutForm.exercises.filter((_, i) => i !== index),
        });
    };

    const addMeal = () => {
        setDietForm({
            ...dietForm,
            meals: [...dietForm.meals, { name: '', calories: '', protein: '', carbs: '', fats: '', time: '' }],
        });
    };

    const removeMeal = (index) => {
        setDietForm({
            ...dietForm,
            meals: dietForm.meals.filter((_, i) => i !== index),
        });
    };

    const handleWorkoutSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = {
                memberId: workoutForm.memberId,
                title: workoutForm.title,
                description: workoutForm.description,
                exercises: workoutForm.exercises,
            };

            if (editWorkoutId) {
                const res = await axios.put(`http://localhost:5000/api/trainer/workout-plans/${editWorkoutId}`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPlans(plans.map((plan) => (plan._id === editWorkoutId ? res.data.workoutPlan : plan)));
                setSuccess('Workout plan updated');
                setEditWorkoutId(null);
            } else {
                const res = await axios.post('http://localhost:5000/api/trainer/workout-plans', data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPlans([res.data.workoutPlan, ...plans]);
                setSuccess('Workout plan created');
            }

            setWorkoutForm({
                memberId: '',
                title: '',
                description: '',
                exercises: [{ name: '', sets: '', reps: '', rest: '' }],
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save workout plan');
        }
    };

    const handleDietSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = {
                memberId: dietForm.memberId,
                title: dietForm.title,
                description: dietForm.description,
                meals: dietForm.meals,
            };

            if (editDietId) {
                const res = await axios.put(`http://localhost:5000/api/trainer/diet-plans/${editDietId}`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDietPlans(dietPlans.map((plan) => (plan._id === editDietId ? res.data.dietPlan : plan)));
                setSuccess('Diet plan updated');
                setEditDietId(null);
            } else {
                const res = await axios.post('http://localhost:5000/api/trainer/diet-plans', data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDietPlans([res.data.dietPlan, ...dietPlans]);
                setSuccess('Diet plan created');
            }

            setDietForm({
                memberId: '',
                title: '',
                description: '',
                meals: [{ name: '', calories: '', protein: '', carbs: '', fats: '', time: '' }],
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save diet plan');
        }
    };

    const handleWorkoutEdit = (plan) => {
        setWorkoutForm({
            memberId: plan.member._id,
            title: plan.title,
            description: plan.description,
            exercises: plan.exercises,
        });
        setEditWorkoutId(plan._id);
        setActiveTab('workout');
    };

    const handleDietEdit = (plan) => {
        setDietForm({
            memberId: plan.member._id,
            title: plan.title,
            description: plan.description,
            meals: plan.meals,
        });
        setEditDietId(plan._id);
        setActiveTab('diet');
    };

    const handleWorkoutDelete = async (id) => {
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

    const handleDietDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/trainer/diet-plans/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDietPlans(dietPlans.filter((plan) => plan._id !== id));
            setSuccess('Diet plan deleted');
        } catch (err) {
            setError('Failed to delete diet plan');
        }
    };

    const handleRequestAction = async (requestId, action) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/trainer/plan-requests/${requestId}/action`, { action }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(requests.map((req) => (req._id === requestId ? res.data.planRequest : req)));
            setSuccess(`Request ${action}d`);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${action} request`);
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
                <h1 className="text-3xl font-bold mb-6 text-center">Workout & Diet Plans</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Plan Requests */}
                <div className="bg-gray-100 p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">Plan Requests</h2>
                    {requests.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2">Member</th>
                                        <th className="p-2">Gym</th>
                                        <th className="p-2">Request Type</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Requested On</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((request) => (
                                        <tr key={request._id} className="border-t">
                                            <td className="p-2">{request.member.name} ({request.member.email})</td>
                                            <td className="p-2">{request.gym.gymName}</td>
                                            <td className="p-2">{request.requestType.charAt(0).toUpperCase() + request.requestType.slice(1)} Plan</td>
                                            <td className="p-2">{request.status}</td>
                                            <td className="p-2">{new Date(request.createdAt).toLocaleString()}</td>
                                            <td className="p-2">
                                                {request.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleRequestAction(request._id, 'approve')}
                                                            className="bg-green-600 text-white px-4 py-2 rounded mr-2 hover:bg-green-700"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequestAction(request._id, 'deny')}
                                                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                                        >
                                                            Deny
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No plan requests yet</p>
                    )}
                </div>

                {/* Tabs for Workout and Diet Plans */}
                <div className="mb-4">
                    <button
                        onClick={() => setActiveTab('workout')}
                        className={`px-4 py-2 mr-2 rounded ${activeTab === 'workout' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Workout Plans
                    </button>
                    <button
                        onClick={() => setActiveTab('diet')}
                        className={`px-4 py-2 rounded ${activeTab === 'diet' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Diet Plans
                    </button>
                </div>

                {/* Workout Plan Form */}
                {activeTab === 'workout' && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                        <h2 className="text-2xl font-bold mb-4">{editWorkoutId ? 'Edit Workout Plan' : 'Create Workout Plan'}</h2>
                        <form onSubmit={handleWorkoutSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700">Member</label>
                                <select
                                    name="memberId"
                                    value={workoutForm.memberId}
                                    onChange={handleWorkoutChange}
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
                                    value={workoutForm.title}
                                    onChange={handleWorkoutChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={workoutForm.description}
                                    onChange={handleWorkoutChange}
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                />
                            </div>
                            <div className="mb-4">
                                <h3 className="text-lg font-bold mb-2">Exercises</h3>
                                {workoutForm.exercises.map((exercise, index) => (
                                    <div key={index} className="mb-2 p-4 border rounded">
                                        <div className="mb-2">
                                            <label className="block text-gray-700">Exercise Name</label>
                                            <input
                                                type="text"
                                                name={`exercise.name.${index}`}
                                                value={exercise.name}
                                                onChange={(e) => handleWorkoutChange(e, index)}
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
                                                onChange={(e) => handleWorkoutChange(e, index)}
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
                                                onChange={(e) => handleWorkoutChange(e, index)}
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
                                                onChange={(e) => handleWorkoutChange(e, index)}
                                                className="w-full p-2 border rounded"
                                            />
                                        </div>
                                        {workoutForm.exercises.length > 1 && (
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
                                {editWorkoutId ? 'Update Plan' : 'Create Plan'}
                            </button>
                            {editWorkoutId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditWorkoutId(null);
                                        setWorkoutForm({
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
                )}

                {/* Diet Plan Form */}
                {activeTab === 'diet' && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                        <h2 className="text-2xl font-bold mb-4">{editDietId ? 'Edit Diet Plan' : 'Create Diet Plan'}</h2>
                        <form onSubmit={handleDietSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700">Member</label>
                                <select
                                    name="memberId"
                                    value={dietForm.memberId}
                                    onChange={handleDietChange}
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
                                    value={dietForm.title}
                                    onChange={handleDietChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={dietForm.description}
                                    onChange={handleDietChange}
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                />
                            </div>
                            <div className="mb-4">
                                <h3 className="text-lg font-bold mb-2">Meals</h3>
                                {dietForm.meals.map((meal, index) => (
                                    <div key={index} className="mb-2 p-4 border rounded">
                                        <div className="mb-2">
                                            <label className="block text-gray-700">Meal Name</label>
                                            <input
                                                type="text"
                                                name={`meal.name.${index}`}
                                                value={meal.name}
                                                onChange={(e) => handleDietChange(e, index)}
                                                className="w-full p-2 border rounded"
                                                required
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-gray-700">Calories (kcal)</label>
                                            <input
                                                type="number"
                                                name={`meal.calories.${index}`}
                                                value={meal.calories}
                                                onChange={(e) => handleDietChange(e, index)}
                                                className="w-full p-2 border rounded"
                                                required
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-gray-700">Protein (g)</label>
                                            <input
                                                type="number"
                                                name={`meal.protein.${index}`}
                                                value={meal.protein}
                                                onChange={(e) => handleDietChange(e, index)}
                                                className="w-full p-2 border rounded"
                                                required
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-gray-700">Carbs (g)</label>
                                            <input
                                                type="number"
                                                name={`meal.carbs.${index}`}
                                                value={meal.carbs}
                                                onChange={(e) => handleDietChange(e, index)}
                                                className="w-full p-2 border rounded"
                                                required
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-gray-700">Fats (g)</label>
                                            <input
                                                type="number"
                                                name={`meal.fats.${index}`}
                                                value={meal.fats}
                                                onChange={(e) => handleDietChange(e, index)}
                                                className="w-full p-2 border rounded"
                                                required
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <label className="block text-gray-700">Time (e.g., 8:00 AM)</label>
                                            <input
                                                type="text"
                                                name={`meal.time.${index}`}
                                                value={meal.time}
                                                onChange={(e) => handleDietChange(e, index)}
                                                className="w-full p-2 border rounded"
                                            />
                                        </div>
                                        {dietForm.meals.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMeal(index)}
                                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                            >
                                                Remove Meal
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addMeal}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
                                >
                                    Add Meal
                                </button>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                            >
                                {editDietId ? 'Update Plan' : 'Create Plan'}
                            </button>
                            {editDietId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditDietId(null);
                                        setDietForm({
                                            memberId: '',
                                            title: '',
                                            description: '',
                                            meals: [{ name: '', calories: '', protein: '', carbs: '', fats: '', time: '' }],
                                        });
                                    }}
                                    className="w-full bg-gray-500 text-white p-2 rounded mt-2 hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>
                )}

                {/* Workout Plans List */}
                {activeTab === 'workout' && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
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
                                                onClick={() => handleWorkoutEdit(plan)}
                                                className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleWorkoutDelete(plan._id)}
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
                )}

                {/* Diet Plans List */}
                {activeTab === 'diet' && (
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Diet Plans</h2>
                        {dietPlans.length > 0 ? (
                            <ul className="space-y-4">
                                {dietPlans.map((plan) => (
                                    <li key={plan._id} className="border-b pb-4">
                                        <p className="text-gray-700"><strong>Member:</strong> {plan.member.name} ({plan.member.email})</p>
                                        <p className="text-gray-700"><strong>Title:</strong> {plan.title}</p>
                                        <p className="text-gray-700"><strong>Description:</strong> {plan.description || 'N/A'}</p>
                                        <p className="text-gray-700"><strong>Meals:</strong></p>
                                        <ul className="list-disc pl-5">
                                            {plan.meals.map((meal, index) => (
                                                <li key={index} className="text-gray-700">
                                                    {meal.name}: {meal.calories} kcal, Protein: {meal.protein}g, Carbs: {meal.carbs}g, Fats: {meal.fats}g, Time: {meal.time || 'N/A'}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-gray-700"><strong>Created:</strong> {new Date(plan.createdAt).toLocaleString()}</p>
                                        <div className="mt-2">
                                            <button
                                                onClick={() => handleDietEdit(plan)}
                                                className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDietDelete(plan._id)}
                                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-700 text-center">No diet plans yet</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutPlans;