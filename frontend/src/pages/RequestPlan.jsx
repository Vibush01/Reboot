import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const RequestPlan = () => {
    const { user } = useContext(AuthContext);
    const [trainers, setTrainers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [plans, setPlans] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState('');
    const [requestType, setRequestType] = useState('workout');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const token = localStorage.getItem('token');
                const memberRes = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const gymId = memberRes.data.gym;
                const gymRes = await axios.get(`http://localhost:5000/api/gym/${gymId}`);
                setTrainers(gymRes.data.trainers);
            } catch (err) {
                setError('Failed to fetch trainers');
            }
        };

        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/trainer/member/plan-requests', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRequests(res.data);
            } catch (err) {
                setError('Failed to fetch plan requests');
            }
        };

        const fetchPlans = async () => {
            try {
                const token = localStorage.getItem('token');
                const workoutPlansRes = await axios.get('http://localhost:5000/api/trainer/member/workout-plans', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const dietPlansRes = await axios.get('http://localhost:5000/api/trainer/member/diet-plans', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const combinedPlans = [
                    ...workoutPlansRes.data.map((plan) => ({
                        type: 'Workout Plan',
                        title: plan.title,
                        description: plan.exercises.map((ex) => `${ex.name}: ${ex.sets} sets, ${ex.reps} reps, Rest: ${ex.rest || 'N/A'}`).join('; '),
                        trainer: plan.trainer,
                        gym: plan.gym,
                        receivedOn: plan.createdAt,
                    })),
                    ...dietPlansRes.data.map((plan) => ({
                        type: 'Diet Plan',
                        title: plan.title,
                        description: plan.meals.map((meal) => `${meal.name}: ${meal.calories} kcal, Protein: ${meal.protein}g, Carbs: ${meal.carbs}g, Fats: ${meal.fats}g, Time: ${meal.time || 'N/A'}`).join('; '),
                        trainer: plan.trainer,
                        gym: plan.gym,
                        receivedOn: plan.createdAt,
                    })),
                ].sort((a, b) => new Date(b.receivedOn) - new Date(a.receivedOn));

                setPlans(combinedPlans);
            } catch (err) {
                setError('Failed to fetch plans');
            }
        };

        if (user?.role === 'member') {
            fetchTrainers();
            fetchRequests();
            fetchPlans();
        }
    }, [user]);

    const handleRequest = async () => {
        if (!selectedTrainer) {
            setError('Please select a trainer');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/trainer/plan-requests', {
                trainerId: selectedTrainer,
                requestType,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests([res.data.planRequest, ...requests]);
            setSuccess('Request sent successfully');
            setSelectedTrainer('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send request');
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
                <h1 className="text-3xl font-bold mb-6 text-center">Request Workout & Diet Plan</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Request a Plan */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">Request a Plan</h2>
                    <div className="mb-4">
                        <label className="block text-gray-700">Select Trainer</label>
                        <select
                            value={selectedTrainer}
                            onChange={(e) => setSelectedTrainer(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select a trainer</option>
                            {trainers.map((trainer) => (
                                <option key={trainer._id} value={trainer._id}>
                                    {trainer.name} ({trainer.email})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Request Type</label>
                        <select
                            value={requestType}
                            onChange={(e) => setRequestType(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="workout">Workout Plan</option>
                            <option value="diet">Diet Plan</option>
                        </select>
                    </div>
                    <button
                        onClick={handleRequest}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Send Request
                    </button>
                </div>

                {/* Your Plan Requests */}
                <div className="bg-gray-100 p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">Your Plan Requests</h2>
                    {requests.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2">Trainer</th>
                                        <th className="p-2">Gym</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Requested On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((request) => (
                                        <tr key={request._id} className="border-t">
                                            <td className="p-2">{request.trainer.name} ({request.trainer.email})</td>
                                            <td className="p-2">{request.gym.gymName}</td>
                                            <td className="p-2">{request.status}</td>
                                            <td className="p-2">{new Date(request.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No plan requests yet</p>
                    )}
                </div>

                {/* Your Plans */}
                <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Your Plans</h2>
                    {plans.length > 0 ? (
                        <ul className="space-y-4">
                            {plans.map((plan, index) => (
                                <li key={index} className="border-b pb-4">
                                    <p className="text-gray-700"><strong>Trainer:</strong> {plan.trainer.name} ({plan.trainer.email})</p>
                                    <p className="text-gray-700"><strong>Gym:</strong> {plan.gym.gymName}</p>
                                    <p className="text-gray-700"><strong>{plan.type}:</strong> {plan.title}</p>
                                    <p className="text-gray-700"><strong>Details:</strong> {plan.description}</p>
                                    <p className="text-gray-700"><strong>Received On:</strong> {new Date(plan.receivedOn).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700 text-center">No plans received yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestPlan;