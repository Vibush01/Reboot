import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MemberDashboard = () => {
    const { user, userDetails } = useContext(AuthContext);
    const [error, setError] = useState('');

    if (user?.role !== 'member') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Members.</p>
        </div>;
    }

    const isInGym = !!userDetails?.gym;

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Member Dashboard</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                {/* Quick Links */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
                    <div className="flex flex-col space-y-4">
                        {isInGym ? (
                            <>
                                <Link to="/request-plan" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center">
                                    Request Workout & Diet Plans
                                </Link>
                                <Link to="/book-session" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center">
                                    Book a Session
                                </Link>
                            </>
                        ) : (
                            <Link to="/gyms" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center">
                                Find Gym
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;