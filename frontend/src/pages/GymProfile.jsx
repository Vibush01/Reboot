import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const GymProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, userDetails } = useContext(AuthContext);
    const [gym, setGym] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [membershipDuration, setMembershipDuration] = useState('1 month');

    useEffect(() => {
        const fetchGym = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/gym/${id}`);
                setGym(res.data);
            } catch (err) {
                setError('Failed to fetch gym details');
            }
        };

        fetchGym();
    }, [id]);

    const handleJoinRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            const body = user?.role === 'member' ? { membershipDuration } : {};
            await axios.post(`http://localhost:5000/api/gym/join/${id}`, body, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Join request sent successfully');
            setTimeout(() => navigate('/gyms'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send join request');
        }
    };

    if (!gym) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p>{error || 'Loading...'}</p>
        </div>;
    }

    const canJoin = (user?.role === 'member' || user?.role === 'trainer') && !userDetails?.gym;
    const isMemberOrTrainer = (user?.role === 'member' || user?.role === 'trainer') && userDetails?.gym === id;

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">{gym.gymName}</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    {isMemberOrTrainer && (
                        <p className="text-green-600 mb-4 text-center">
                            You are already a {user.role === 'member' ? 'member' : 'trainer'} of this gym.
                        </p>
                    )}
                    <p className="text-gray-700 mb-2"><strong>Address:</strong> {gym.address}</p>
                    <p className="text-gray-700 mb-2"><strong>Owner:</strong> {gym.ownerName} ({gym.ownerEmail})</p>
                    
                    <div className="mb-4">
                        <h2 className="text-xl font-bold mb-2">Photos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {gym.photos.length > 0 ? (
                                gym.photos.map((photo, index) => (
                                    <img key={index} src={photo} alt={`Gym ${index}`} className="w-full h-48 object-cover rounded" />
                                ))
                            ) : (
                                <p>No photos available</p>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-bold mb-2">Membership Plans</h2>
                        {gym.membershipPlans.length > 0 ? (
                            <ul className="list-disc pl-5">
                                {gym.membershipPlans.map((plan, index) => (
                                    <li key={index} className="text-gray-700">
                                        {plan.duration}: ${plan.price}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No membership plans available</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-bold mb-2">Members</h2>
                        {gym.members.length > 0 ? (
                            <ul className="list-disc pl-5">
                                {gym.members.map((member) => (
                                    <li key={member._id} className="text-gray-700">
                                        {member.name} ({member.email})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No members yet</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-bold mb-2">Trainers</h2>
                        {gym.trainers.length > 0 ? (
                            <ul className="list-disc pl-5">
                                {gym.trainers.map((trainer) => (
                                    <li key={trainer._id} className="text-gray-700">
                                        {trainer.name} ({trainer.email})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No trainers yet</p>
                        )}
                    </div>

                    {canJoin && (
                        <div className="mt-6">
                            {user.role === 'member' && (
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2">Membership Duration</label>
                                    <select
                                        value={membershipDuration}
                                        onChange={(e) => setMembershipDuration(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="1 week">1 Week</option>
                                        <option value="1 month">1 Month</option>
                                        <option value="3 months">3 Months</option>
                                        <option value="6 months">6 Months</option>
                                        <option value="1 year">1 Year</option>
                                    </select>
                                </div>
                            )}
                            <button
                                onClick={handleJoinRequest}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Send Join Request
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GymProfile;