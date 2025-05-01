import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, userDetails, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Determine if the user can access the Chat page
    const canAccessChat = () => {
        if (!user) return false;
        if (user.role === 'gym') return true; // Gym Profiles can always access Chat
        return (user.role === 'member' || user.role === 'trainer') && userDetails?.gym; // Members and Trainers need to be in a gym
    };

    // Determine if the user can access gym-dependent features (Request Plan, Book a Session)
    const canAccessGymFeatures = () => {
        return user?.role === 'member' && userDetails?.gym;
    };

    return (
        <nav className="bg-blue-600 p-4">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-white text-2xl font-bold">BeFit</Link>

                {/* Hamburger Menu for Mobile */}
                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                        </svg>
                    </button>
                </div>

                {/* Links (Desktop) */}
                <div className="hidden md:flex items-center space-x-4">
                    {user ? (
                        <>
                            {(user.role === 'gym' || user.role === 'trainer') && (
                                <Link to="/gym-dashboard" className="text-white hover:underline">Dashboard</Link>
                            )}
                            {(user.role === 'member' || user.role === 'trainer') && (
                                userDetails?.gym ? (
                                    <Link to={`/gym/${userDetails.gym}`} className="text-white hover:underline">My Gym</Link>
                                ) : (
                                    <Link to="/gyms" className="text-white hover:underline">Find a Gym</Link>
                                )
                            )}
                            {canAccessChat() && (
                                <Link to="/chat" className="text-white hover:underline">Chat</Link>
                            )}
                            {user.role === 'member' && userDetails?.gym && (
                                <Link to="/announcements" className="text-white hover:underline">Announcements</Link>
                            )}
                            {user.role === 'member' && (
                                <>
                                    <Link to="/member-dashboard" className="text-white hover:underline">Dashboard</Link>
                                    {canAccessGymFeatures() && (
                                        <>
                                            <Link to="/request-plan" className="text-white hover:underline">Request Plan</Link>
                                            <Link to="/book-session" className="text-white hover:underline">Book a Session</Link>
                                        </>
                                    )}
                                    <Link to="/macro-calculator" className="text-white hover:underline">Macro Calculator</Link>
                                    <Link to="/progress-tracker" className="text-white hover:underline">Progress Tracker</Link>
                                </>
                            )}
                            {user.role === 'trainer' && userDetails?.gym && (
                                <>
                                    <Link to="/workout-plans" className="text-white hover:underline">Workout Plans</Link>
                                    <Link to="/manage-schedule" className="text-white hover:underline">Manage Schedule</Link>
                                    <Link to="/view-bookings" className="text-white hover:underline">View Bookings</Link>
                                    {/* <Link to="/scheduling" className="text-white hover:underline">Scheduling</Link> */}
                                </>
                            )}
                            {user.role === 'gym' && (
                                <Link to="/update-gym" className="text-white hover:underline">Update Gym</Link>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/admin-dashboard" className="text-white hover:underline">Dashboard</Link>
                            )}
                            <Link to="/profile" className="text-white hover:underline">Profile</Link>
                            <button onClick={handleLogout} className="text-white hover:underline">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/signup" className="text-white hover:underline">Signup</Link>
                            <Link to="/login" className="text-white hover:underline">Login</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden mt-4">
                    <div className="flex flex-col space-y-2">
                        {user ? (
                            <>
                                {(user.role === 'gym' || user.role === 'trainer') && (
                                    <Link to="/gym-dashboard" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                )}
                                {(user.role === 'member' || user.role === 'trainer') && (
                                    userDetails?.gym ? (
                                        <Link to={`/gym/${userDetails.gym}`} className="text-white hover:underline" onClick={() => setIsOpen(false)}>My Gym</Link>
                                    ) : (
                                        <Link to="/gyms" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Find a Gym</Link>
                                    )
                                )}
                                {canAccessChat() && (
                                    <Link to="/chat" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Chat</Link>
                                )}
                                {user.role === 'member' && userDetails?.gym && (
                                    <Link to="/announcements" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Announcements</Link>
                                )}
                                {user.role === 'member' && (
                                    <>
                                        <Link to="/member-dashboard" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                        {canAccessGymFeatures() && (
                                            <>
                                                <Link to="/request-plan" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Request Plan</Link>
                                                <Link to="/book-session" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Book a Session</Link>
                                            </>
                                        )}
                                        <Link to="/macro-calculator" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Macro Calculator</Link>
                                        <Link to="/progress-tracker" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Progress Tracker</Link>
                                    </>
                                )}
                                {user.role === 'trainer' && userDetails?.gym && (
                                    <>
                                        <Link to="/workout-plans" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Workout Plans</Link>
                                        <Link to="/manage-schedule" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Manage Schedule</Link>
                                        <Link to="/view-bookings" className="text-white hover:underline" onClick={() => setIsOpen(false)}>View Bookings</Link>
                                        {/* <Link to="/scheduling" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Scheduling</Link> */}
                                    </>
                                )}
                                {user.role === 'gym' && (
                                    <Link to="/update-gym" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Update Gym</Link>
                                )}
                                {user.role === 'admin' && (
                                    <Link to="/admin-dashboard" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Dashboard</Link>
                                )}
                                <Link to="/profile" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Profile</Link>
                                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-white hover:underline text-left">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/signup" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Signup</Link>
                                <Link to="/login" className="text-white hover:underline" onClick={() => setIsOpen(false)}>Login</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;