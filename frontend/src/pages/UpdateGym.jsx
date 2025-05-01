import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UpdateGym = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        gymName: '',
        address: '',
        ownerName: '',
        ownerEmail: '',
        membershipPlans: [],
        photos: [],
        deletePhotos: [],
    });
    const [newMembershipPlan, setNewMembershipPlan] = useState({ duration: '', price: '' });
    const [previewImages, setPreviewImages] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchGym = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFormData({
                    gymName: res.data.gymName || '',
                    address: res.data.address || '',
                    ownerName: res.data.ownerName || '',
                    ownerEmail: res.data.ownerEmail || '',
                    membershipPlans: res.data.membershipPlans || [],
                    photos: res.data.photos || [],
                    deletePhotos: [],
                });
                setPreviewImages(res.data.photos || []);
            } catch (err) {
                setError('Failed to fetch gym details');
            }
        };

        if (user?.role === 'gym') {
            fetchGym();
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMembershipChange = (e) => {
        setNewMembershipPlan({ ...newMembershipPlan, [e.target.name]: e.target.value });
    };

    const addMembershipPlan = () => {
        if (!newMembershipPlan.duration || !newMembershipPlan.price) return;
        setFormData({
            ...formData,
            membershipPlans: [...formData.membershipPlans, newMembershipPlan],
        });
        setNewMembershipPlan({ duration: '', price: '' });
    };

    const removeMembershipPlan = (index) => {
        setFormData({
            ...formData,
            membershipPlans: formData.membershipPlans.filter((_, i) => i !== index),
        });
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, photos: files });
        setPreviewImages([...previewImages, ...files.map((file) => URL.createObjectURL(file))]);
    };

    const handleDeletePhoto = (photoUrl) => {
        setFormData({
            ...formData,
            deletePhotos: [...formData.deletePhotos, photoUrl],
            photos: formData.photos.filter((_, index) => previewImages[index] !== photoUrl),
        });
        setPreviewImages(previewImages.filter((url) => url !== photoUrl));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            if (formData.gymName) data.append('gymName', formData.gymName);
            if (formData.address) data.append('address', formData.address);
            if (formData.ownerName) data.append('ownerName', formData.ownerName);
            if (formData.ownerEmail) data.append('ownerEmail', formData.ownerEmail);
            data.append('membershipPlans', JSON.stringify(formData.membershipPlans));
            if (formData.deletePhotos.length > 0) {
                data.append('deletePhotos', JSON.stringify(formData.deletePhotos));
            }
            formData.photos.forEach((photo) => {
                data.append('photos', photo);
            });

            const res = await axios.put('http://localhost:5000/api/gym/update', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setFormData({
                ...formData,
                photos: [],
                deletePhotos: [],
            });
            setPreviewImages(res.data.gym.photos || []);
            setSuccess('Gym details updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update gym details');
        }
    };

    if (user?.role !== 'gym') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Gym Profiles.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Update Gym Details</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700">Gym Name</label>
                            <input
                                type="text"
                                name="gymName"
                                value={formData.gymName}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Owner Name</label>
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Owner Email</label>
                            <input
                                type="email"
                                name="ownerEmail"
                                value={formData.ownerEmail}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-bold mb-2">Membership Plans</h3>
                            {formData.membershipPlans.map((plan, index) => (
                                <div key={index} className="mb-2 p-4 border rounded flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-700">{plan.duration}: ${plan.price}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeMembershipPlan(index)}
                                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <label className="block text-gray-700">Duration</label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={newMembershipPlan.duration}
                                        onChange={handleMembershipChange}
                                        className="w-full p-2 border rounded"
                                        placeholder="e.g., 1 month"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-gray-700">Price ($)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={newMembershipPlan.price}
                                        onChange={handleMembershipChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={addMembershipPlan}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-6"
                                >
                                    Add Plan
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-bold mb-2">Gym Photos</h3>
                            {previewImages.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    {previewImages.map((photo, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={photo}
                                                alt={`Gym ${index}`}
                                                className="w-full h-48 object-cover rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePhoto(photo)}
                                                className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <label className="block text-gray-700">Upload New Photos (up to 5)</label>
                            <input
                                type="file"
                                name="photos"
                                onChange={handlePhotoChange}
                                className="w-full p-2 border rounded"
                                multiple
                                accept="image/*"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                            Update Gym
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateGym;