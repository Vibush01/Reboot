import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, userDetails, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-2xl font-bold">BeFit</Link>
                <div>
                    {user ? (
                        <>
                            {(user.role === 'gym' || user.role === 'trainer') && (
                                <Link to="/gym-dashboard" className="text-white mr-4">Dashboard</Link>
                            )}
                            {(user.role === 'member' || user.role === 'trainer') && (
                                userDetails?.gym ? (
                                    <Link to={`/gym/${userDetails.gym}`} className="text-white mr-4">My Gym</Link>
                                ) : (
                                    <Link to="/gyms" className="text-white mr-4">Find Gym</Link>
                                )
                            )}
                            <Link to="/profile" className="text-white mr-4">Profile</Link>
                            <button onClick={handleLogout} className="text-white">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/signup" className="text-white mr-4">Signup</Link>
                            <Link to="/login" className="text-white">Login</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;