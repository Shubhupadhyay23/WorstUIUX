import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewComplaint from './pages/NewComplaint';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

import { Search, Mic, Globe } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  return (
    <header className="bg-white border-b border-gray-200 text-gray-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 flex items-center justify-between h-20">
        <Link to="/" className="flex flex-shrink-0 items-center">
          <img src="/logo.png" alt="MeraShehar Logo" className="h-16 w-auto object-contain" />
        </Link>
        
        <div className="hidden lg:flex flex-1 max-w-lg mx-6">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input type="text" placeholder="खोजें..." className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:ring-orange-500 focus:border-orange-500 text-sm bg-gray-50" />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Mic className="h-5 w-5 text-orange-500 cursor-pointer" />
            </div>
          </div>
        </div>

        <nav className="hidden xl:flex gap-6 items-center text-sm font-bold text-gray-700">
          <Link to="/" className="text-orange-600 border-b-2 border-orange-600 pb-1">शुरुआत करें</Link>
          <Link to="/dashboard" className="hover:text-orange-600 transition">शिकायतें</Link>
          <span className="hover:text-orange-600 cursor-pointer transition">कर और शुल्क</span>
          <span className="hover:text-orange-600 cursor-pointer transition">यूटिलिटीज़</span>
          <span className="hover:text-orange-600 cursor-pointer transition">समुदाय</span>
          <span className="hover:text-orange-600 cursor-pointer transition">सेवाएं</span>
          <span className="hover:text-orange-600 cursor-pointer transition">पहल</span>
          <span className="hover:text-orange-600 cursor-pointer transition">संपर्क करें</span>
        </nav>

        <div className="flex gap-4 items-center ml-6">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-100 transition">
            <Globe className="h-4 w-4 text-orange-500" />
            <div id="google_translate_element" className="overflow-hidden h-[24px]"></div>
          </div>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-gray-600 hover:text-orange-600 font-bold">Login</Link>
              <Link to="/register" className="bg-[#d35400] text-white px-4 py-2 rounded-full shadow text-sm font-semibold hover:bg-orange-700">Register</Link>
            </>
          ) : (
            <div className="flex items-center gap-3 bg-[#fdf2e9] border border-orange-200 px-3 py-1.5 rounded-full cursor-pointer hover:bg-orange-100 transition">
              <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-gray-800 text-sm hidden sm:block">मेरी प्रोफ़ाइल</span>
              <button onClick={logout} className="text-xs text-red-600 font-bold hover:underline ml-2">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={
      <div className="bg-[#f1f2f6] min-h-[80vh] -mx-4 -mt-4 p-8 flex flex-col items-center justify-center">
        <div className="text-center max-w-2xl bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
          <img src="/logo.png" alt="MeraShehar" className="h-32 mx-auto mb-8 object-contain" />
          <h2 className="text-4xl font-extrabold text-[#1e234c] tracking-tight mb-4">
            Welcome to MeraShehar Portal
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            Report civic problems, track statuses, and let our AI automate the routing to the correct department.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="bg-[#d35400] text-white px-8 py-3 font-semibold rounded-full shadow hover:bg-[#a04000] transition">
              Get Started Now
            </Link>
            <Link to="/login" className="bg-white text-[#292d61] border-2 border-[#292d61] px-8 py-3 font-semibold rounded-full hover:bg-gray-50 transition">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    } />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    <Route path="/complaints/new" element={<PrivateRoute><NewComplaint /></PrivateRoute>} />
    <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
  </Routes>
);

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Header />
          <main className="p-4 max-w-7xl mx-auto">
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};
export default App;
