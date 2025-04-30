import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleSelection from './pages/RoleSelection';
import AdminSignup from './pages/AdminSignup';
import GymSignup from './pages/GymSignup';
import TrainerSignup from './pages/TrainerSignup';
import MemberSignup from './pages/MemberSignup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import GymList from './pages/GymList';
import GymProfile from './pages/GymProfile';
import GymDashboard from './pages/GymDashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    {/* Homepage redirects based on user role */}
                    <Route path="/" element={<HomeRedirect />} />
                    <Route path="/signup" element={<RoleSelection />} />
                    <Route path="/signup/admin" element={<AdminSignup />} />
                    <Route path="/signup/gym" element={<GymSignup />} />
                    <Route path="/signup/trainer" element={<TrainerSignup />} />
                    <Route path="/signup/member" element={<MemberSignup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/gyms" element={<GymList />} />
                    <Route path="/gym/:id" element={<GymProfile />} />
                    <Route path="/gym-dashboard" element={
                        <ProtectedRoute>
                            <GymDashboard />
                        </ProtectedRoute>
                    } />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

// Component to redirect based on user role
function HomeRedirect() {
    const { user } = useContext(AuthContext);
    
    if (!user) {
        return <Navigate to="/login" />;
    }

    switch (user.role) {
        case 'member':
        case 'trainer':
            return <Navigate to="/gyms" />;
        case 'gym':
            return <Navigate to="/gym-dashboard" />;
        case 'admin':
            return <Navigate to="/profile" />;
        default:
            return <Navigate to="/login" />;
    }
}

export default App;