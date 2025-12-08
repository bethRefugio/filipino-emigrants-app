import React, { useState, useEffect } from 'react';
import { Menu, TrendingUp, Users, Globe, VenusAndMars, GraduationCap, BriefcaseBusiness, Plane, Earth, MapPinHouse, LogOut, UserRoundCog, UserCircle, LineChart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useUserRole from './isPrivileged'

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const [user, setUser] = useState(null);
    const { isPrivileged } = useUserRole();

    useEffect(() => {
       const stored = localStorage.getItem('user');
       if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const navigate = useNavigate();
    const location = useLocation();

    // Helper to check if route is active
    const isActive = (route) => location.pathname === route;

    // Map role -> button classes (background + text)
    const roleClass = (role) => {
      if (!role) return 'bg-blue-100 text-blue-800';
      const r = String(role).toLowerCase();
      if (r === 'admin' || r.includes('admin')) return 'bg-green-100 text-green-800';
      if (r.includes('government') || r.includes('official')) return 'bg-yellow-100 text-yellow-800';
      return 'bg-blue-100 text-blue-800';
    };

    // Optional: display-friendly role label
    const roleLabel = (role) => {
      if (!role) return 'User';
      const r = String(role).toLowerCase();
      if (r === 'admin' || r.includes('admin')) return 'Admin';
      if (r.includes('government') || r.includes('official')) return 'Government Official';
      return role;
    };

    return (
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
            <div className="p-4 border-b flex items-center justify-between">
                {sidebarOpen && (
                    <div className="flex items-center gap-3">
                        <UserCircle size={36} className="text-blue-500" />
                        <div>
                            <span className="text-base font-bold text-gray-800 block">
                                {user ? `${user.first_name} ${user.last_name}` : 'User'}
                            </span>
                            <span className="text-xs text-gray-500 block">
                                {user ? `@${user.username}` : ''}
                            </span>

                            {/* Role badge button placed below the username */}
                            {user && user.role && (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${roleClass(user.role)} border border-transparent`}
                                  title={`Role: ${user.role}`}
                                  aria-label={`Role: ${user.role}`}
                                >
                                  {roleLabel(user.role)}
                                </button>
                              </div>
                            )}
                        </div>
                    </div>
                )}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded" aria-label="toggle sidebar">
                    <Menu size={20} />
                </button>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
                <div
                    className={`flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer ${isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                    onClick={() => navigate('/dashboard')}
                >
                    <TrendingUp size={20} />
                    {sidebarOpen && <span className="font-medium">Dashboard</span>}
                </div>

                {/* Forecasting Section - only for privileged users */}
                {isPrivileged(user?.role) && (
                  <div
                      className={`flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer ${isActive('/forecasting') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                      onClick={() => navigate('/forecasting')}
                  >
                      <LineChart size={20} />
                      {sidebarOpen && <span className="font-medium">Forecasting</span>}
                  </div>
                )}

                {/* Divider */}
                {sidebarOpen && <div className="border-t my-3"></div>}

                <div
                    className={`flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer ${isActive('/civil-status') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                    onClick={() => navigate('/civil-status')}
                >
                    <Users size={20} />
                    {sidebarOpen && <span>Civil Status</span>}
                </div>
                <div
                    className={`flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer ${isActive('/age') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                    onClick={() => navigate('/age')}
                >
                    <UserRoundCog size={20} />
                    {sidebarOpen && <span>Age</span>}
                </div>
                <div
                    className={`flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer ${isActive('/sex') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                    onClick={() => navigate('/sex')}
                >
                    <VenusAndMars size={20} />
                    {sidebarOpen && <span>Sex</span>}
                </div>
                <div
                    className={`flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer ${isActive('/education') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                    onClick={() => navigate('/education')}
                >
                    <GraduationCap size={20} />
                    {sidebarOpen && <span>Education</span>}
                </div>
                <div
                    className={`flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer ${isActive('/occupation') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                    onClick={() => navigate('/occupation')}
                >
                    <BriefcaseBusiness size={20} />
                    {sidebarOpen && <span>Occupation</span>}
                </div>
                <div
                    className={`flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer ${isActive('/major-destination') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                    onClick={() => navigate('/major-destination')}
                >
                    <Plane size={20} />
                    {sidebarOpen && <span>Major Country Destination</span>}
                </div>
                <div
                    className={`flex items-center gap-3 p-3 mb-2 rounded-lg cursor-pointer ${isActive('/origin') ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
                    onClick={() => navigate('/origin')}
                >
                    <MapPinHouse size={20} />
                    {sidebarOpen && <span>Place of Origin</span>}
                </div>
            </nav>

            {sidebarOpen && (
                <div className="p-4 border-t m-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-semibold items-center">Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}