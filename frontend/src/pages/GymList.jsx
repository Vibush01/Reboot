import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const GymList = () => {
    const { user } = useContext(AuthContext);
    const [gyms, setGyms] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGyms = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/gym');
                setGyms(res.data);
            } catch (err) {
                setError('Failed to fetch gyms');
            }
        };
        fetchGyms();
    }, []);

    if (user?.role !== 'member' && user?.role !== 'trainer') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Members and Trainers.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Available Gyms</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gyms.map((gym) => (
                        <div key={gym._id} className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-2">{gym.gymName}</h2>
                            <p className="text-gray-700 mb-4">{gym.address}</p>
                            <Link
                                to={`/gym/${gym._id}`}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GymList;