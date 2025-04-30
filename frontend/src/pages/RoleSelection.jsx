import { Link } from 'react-router-dom';

const RoleSelection = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Sign Up as...</h1>
                <div className="grid grid-cols-2 gap-4">
                    <Link to="/signup/admin" className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">Admin</Link>
                    <Link to="/signup/gym" className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">Gym</Link>
                    <Link to="/signup/trainer" className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">Trainer</Link>
                    <Link to="/signup/member" className="bg-blue-600 text-white p-4 rounded text-center hover:bg-blue-700">Member</Link>
                </div>
                <p className="mt-4 text-center">
                    Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default RoleSelection;