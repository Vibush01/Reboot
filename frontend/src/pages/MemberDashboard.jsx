import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MemberDashboard = () => {
    const { user } = useContext(AuthContext);
    const [plans, setPlans] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/trainer/member/workout-plans', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPlans(res.data);
            } catch (err) {
                setError('Failed to fetch workout plans'+err);
            }
        };

        const fetchSchedules = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/trainer/member/schedules', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSchedules(res.data);
            } catch (err) {
                setError('Failed to fetch schedules'+err);
            }
        };

        if (user?.role === 'member') {
            fetchPlans();
            fetchSchedules();
        }
    }, [user]);

    if (user?.role !== 'member') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Members.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Member Dashboard</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                {/* Workout Plans */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">Your Workout Plans</h2>
                    {plans.length > 0 ? (
                        <ul className="space-y-4">
                            {plans.map((plan) => (
                                <li key={plan._id} className="border-b pb-4">
                                    <p className="text-gray-700"><strong>Trainer:</strong> {plan.trainer.name} ({plan.trainer.email})</p>
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
                                    <p className="text-gray-700"><strong>Updated:</strong> {new Date(plan.updatedAt).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700 text-center">No workout plans assigned yet</p>
                    )}
                </div>

                {/* Workout Schedules */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Your Workout Schedule</h2>
                    {schedules.length > 0 ? (
                        <ul className="space-y-4">
                            {schedules.map((schedule) => (
                                <li key={schedule._id} className="border-b pb-4">
                                    <p className="text-gray-700"><strong>Trainer:</strong> {schedule.trainer.name} ({schedule.trainer.email})</p>
                                    <p className="text-gray-700"><strong>Workout Plan:</strong> {schedule.workoutPlan.title}</p>
                                    <p className="text-gray-700"><strong>Description:</strong> {schedule.workoutPlan.description || 'N/A'}</p>
                                    <p className="text-gray-700"><strong>Exercises:</strong></p>
                                    <ul className="list-disc pl-5">
                                        {schedule.workoutPlan.exercises.map((exercise, index) => (
                                            <li key={index} className="text-gray-700">
                                                {exercise.name}: {exercise.sets} sets, {exercise.reps} reps, Rest: {exercise.rest || 'N/A'}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="text-gray-700"><strong>Scheduled Date and Time:</strong> {new Date(schedule.dateTime).toLocaleString()}</p>
                                    <p className="text-gray-700"><strong>Created:</strong> {new Date(schedule.createdAt).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700 text-center">No workout sessions scheduled yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;