import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/contact/submit', formData);
            setSuccess(res.data.message);
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit contact form');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Hero Section */}
            <div className="bg-blue-600 text-white py-16 text-center">
                <div className="container mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to BeFit</h1>
                    <p className="text-lg md:text-xl mb-6">Your ultimate fitness companion to connect with gyms, trainers, and achieve your fitness goals!</p>
                    <a href="#contact" className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-200">
                        Get Started
                    </a>
                </div>
            </div>

            {/* About Section */}
            <div className="py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8 text-center">About BeFit</h2>
                    <div className="flex flex-col md:flex-row items-center md:space-x-8">
                        <div className="md:w-1/2 mb-6 md:mb-0">
                            <img
                                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
                                alt="Gym"
                                className="w-full h-64 object-cover rounded-lg shadow-lg"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/1350x900?text=Gym+Image'; }}
                            />
                        </div>
                        <div className="md:w-1/2">
                            <p className="text-gray-700 text-lg mb-4">
                                BeFit is a comprehensive fitness platform designed to help you achieve your health and fitness goals. Whether you're looking to join a gym, find a personal trainer, track your progress, or connect with a fitness community, BeFit has you covered.
                            </p>
                            <p className="text-gray-700 text-lg">
                                Our platform allows members to request workout and diet plans, book sessions with trainers, and monitor their fitness journey. Gyms and trainers can manage their schedules, create plans, and communicate with members seamlessly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-gray-200 py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8 text-center">Why Choose BeFit?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <h3 className="text-xl font-semibold mb-4">Connect with Gyms</h3>
                            <p className="text-gray-700">Find and join gyms near you, view their facilities, and send join requests with ease.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <h3 className="text-xl font-semibold mb-4">Personalized Plans</h3>
                            <p className="text-gray-700">Request workout and diet plans tailored to your goals from certified trainers.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <h3 className="text-xl font-semibold mb-4">Track Your Progress</h3>
                            <p className="text-gray-700">Monitor your fitness journey with tools like macro calculators and progress trackers.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form Section */}
            <div id="contact" className="py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8 text-center">Contact Us</h2>
                    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
                        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                        {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    rows="5"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-blue-600 text-white py-6 text-center">
                <div className="container mx-auto">
                    <p>© 2025 BeFit. All rights reserved.</p>
                    <p className="mt-2">
                        <a href="#contact" className="hover:underline">Contact Us</a> | <Link to="/login" className="hover:underline">Login</Link> | <Link to="/signup" className="hover:underline">Signup</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;