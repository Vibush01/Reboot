import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const GymReview = () => {
    const { user, userDetails } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        rating: '',
        comment: '',
    });
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/review/my-gym-reviews', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReviews(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch reviews');
            }
        };

        if (user?.role === 'member' && userDetails?.gym) {
            fetchReviews();
        }
    }, [user, userDetails]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/review/submit', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReviews([res.data.review, ...reviews]);
            setSuccess('Review submitted successfully');
            setFormData({ rating: '', comment: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        }
    };

    if (user?.role !== 'member') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Members.</p>
        </div>;
    }

    if (!userDetails?.gym) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">You must be in a gym to submit a review.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6 text-center">Review Your Gym</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Review Form */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8 max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-4">Submit a Review</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Rating (1-5)</label>
                            <input
                                type="number"
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                min="1"
                                max="5"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Comment</label>
                            <textarea
                                name="comment"
                                value={formData.comment}
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
                            Submit Review
                        </button>
                    </form>
                </div>

                {/* Existing Reviews */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold mb-4">Gym Reviews</h2>
                    {reviews.length > 0 ? (
                        <ul className="space-y-4">
                            {reviews.map((review) => (
                                <li key={review._id} className="border-b pb-4">
                                    <p className="text-gray-700"><strong>Member:</strong> {review.member.name} ({review.member.email})</p>
                                    <p className="text-gray-700"><strong>Rating:</strong> {review.rating} stars</p>
                                    <p className="text-gray-700"><strong>Comment:</strong> {review.comment}</p>
                                    <p className="text-gray-700"><strong>Created:</strong> {new Date(review.createdAt).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700 text-center">No reviews yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GymReview;