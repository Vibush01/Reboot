// import { useState, useEffect, useContext } from 'react';
// import axios from 'axios';
// import { AuthContext } from '../context/AuthContext';

// const Scheduling = () => {
//     const { user } = useContext(AuthContext);
//     const [schedules, setSchedules] = useState([]);
//     const [members, setMembers] = useState([]);
//     const [workoutPlans, setWorkoutPlans] = useState([]);
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');
//     const [formData, setFormData] = useState({
//         memberId: '',
//         workoutPlanId: '',
//         dateTime: '',
//     });
//     const [editId, setEditId] = useState(null);

//     useEffect(() => {
//         const fetchSchedules = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 const res = await axios.get('http://localhost:5000/api/trainer/schedules', {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setSchedules(res.data);
//             } catch (err) {
//                 setError('Failed to fetch schedules');
//             }
//         };

//         const fetchMembersAndPlans = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 const trainerRes = await axios.get('http://localhost:5000/api/auth/profile', {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 const gymId = trainerRes.data.gym;
//                 const gymRes = await axios.get(`http://localhost:5000/api/gym/${gymId}`);
//                 setMembers(gymRes.data.members);

//                 const plansRes = await axios.get('http://localhost:5000/api/trainer/workout-plans', {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setWorkoutPlans(plansRes.data);
//             } catch (err) {
//                 setError('Failed to fetch members or workout plans');
//             }
//         };

//         if (user?.role === 'trainer') {
//             fetchSchedules();
//             fetchMembersAndPlans();
//         }
//     }, [user]);

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const token = localStorage.getItem('token');
//             const data = {
//                 memberId: formData.memberId,
//                 workoutPlanId: formData.workoutPlanId,
//                 dateTime: formData.dateTime,
//             };

//             if (editId) {
//                 const res = await axios.put(`http://localhost:5000/api/trainer/schedules/${editId}`, data, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setSchedules(schedules.map((schedule) => (schedule._id === editId ? res.data.workoutSchedule : schedule)));
//                 setSuccess('Workout schedule updated');
//                 setEditId(null);
//             } else {
//                 const res = await axios.post('http://localhost:5000/api/trainer/schedules', data, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//                 setSchedules([res.data.workoutSchedule, ...schedules]);
//                 setSuccess('Workout session scheduled');
//             }

//             setFormData({
//                 memberId: '',
//                 workoutPlanId: '',
//                 dateTime: '',
//             });
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to save schedule');
//         }
//     };

//     const handleEdit = (schedule) => {
//         setFormData({
//             memberId: schedule.member._id,
//             workoutPlanId: schedule.workoutPlan._id,
//             dateTime: new Date(schedule.dateTime).toISOString().slice(0, 16),
//         });
//         setEditId(schedule._id);
//     };

//     const handleDelete = async (id) => {
//         try {
//             const token = localStorage.getItem('token');
//             await axios.delete(`http://localhost:5000/api/trainer/schedules/${id}`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setSchedules(schedules.filter((schedule) => schedule._id !== id));
//             setSuccess('Workout schedule deleted');
//         } catch (err) {
//             setError('Failed to delete schedule');
//         }
//     };

//     if (user?.role !== 'trainer') {
//         return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//             <p className="text-red-500">Access denied. This page is only for Trainers.</p>
//         </div>;
//     }

//     return (
//         <div className="min-h-screen bg-gray-100 py-8">
//             <div className="container mx-auto">
//                 <h1 className="text-3xl font-bold mb-6 text-center">Workout Scheduling</h1>
//                 {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
//                 {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

//                 {/* Scheduling Form */}
//                 <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
//                     <h2 className="text-2xl font-bold mb-4">{editId ? 'Edit Schedule' : 'Schedule Workout Session'}</h2>
//                     <form onSubmit={handleSubmit}>
//                         <div className="mb-4">
//                             <label className="block text-gray-700">Member</label>
//                             <select
//                                 name="memberId"
//                                 value={formData.memberId}
//                                 onChange={handleChange}
//                                 className="w-full p-2 border rounded"
//                                 required
//                             >
//                                 <option value="">Select a member</option>
//                                 {members.map((member) => (
//                                     <option key={member._id} value={member._id}>
//                                         {member.name} ({member.email})
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div className="mb-4">
//                             <label className="block text-gray-700">Workout Plan</label>
//                             <select
//                                 name="workoutPlanId"
//                                 value={formData.workoutPlanId}
//                                 onChange={handleChange}
//                                 className="w-full p-2 border rounded"
//                                 required
//                             >
//                                 <option value="">Select a workout plan</option>
//                                 {workoutPlans.map((plan) => (
//                                     <option key={plan._id} value={plan._id}>
//                                         {plan.title} (Member: {plan.member.name})
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div className="mb-4">
//                             <label className="block text-gray-700">Date and Time</label>
//                             <input
//                                 type="datetime-local"
//                                 name="dateTime"
//                                 value={formData.dateTime}
//                                 onChange={handleChange}
//                                 className="w-full p-2 border rounded"
//                                 required
//                             />
//                         </div>
//                         <button
//                             type="submit"
//                             className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
//                         >
//                             {editId ? 'Update Schedule' : 'Schedule Session'}
//                         </button>
//                         {editId && (
//                             <button
//                                 type="button"
//                                 onClick={() => {
//                                     setEditId(null);
//                                     setFormData({
//                                         memberId: '',
//                                         workoutPlanId: '',
//                                         dateTime: '',
//                                     });
//                                 }}
//                                 className="w-full bg-gray-500 text-white p-2 rounded mt-2 hover:bg-gray-600"
//                             >
//                                 Cancel
//                             </button>
//                         )}
//                     </form>
//                 </div>

//                 {/* Schedules List */}
//                 <div className="bg-white p-6 rounded-lg shadow-lg">
//                     <h2 className="text-2xl font-bold mb-4">Workout Schedules</h2>
//                     {schedules.length > 0 ? (
//                         <ul className="space-y-4">
//                             {schedules.map((schedule) => (
//                                 <li key={schedule._id} className="border-b pb-4">
//                                     <p className="text-gray-700"><strong>Member:</strong> {schedule.member.name} ({schedule.member.email})</p>
//                                     <p className="text-gray-700"><strong>Workout Plan:</strong> {schedule.workoutPlan.title}</p>
//                                     <p className="text-gray-700"><strong>Date and Time:</strong> {new Date(schedule.dateTime).toLocaleString()}</p>
//                                     <p className="text-gray-700"><strong>Created:</strong> {new Date(schedule.createdAt).toLocaleString()}</p>
//                                     <div className="mt-2">
//                                         <button
//                                             onClick={() => handleEdit(schedule)}
//                                             className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600"
//                                         >
//                                             Edit
//                                         </button>
//                                         <button
//                                             onClick={() => handleDelete(schedule._id)}
//                                             className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//                                         >
//                                             Delete
//                                         </button>
//                                     </div>
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p className="text-gray-700 text-center">No workout schedules yet</p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Scheduling;