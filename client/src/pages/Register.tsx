import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password });
      if (data.success) {
        login(data.token, data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.error || 'Registration failed. Please check your credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <img src="/logo.png" alt="MeraShehar" className="h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold text-[#1e234c]">Create an Account</h2>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm text-center border border-red-100">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2980b9] focus:ring-[#2980b9] p-3 border bg-gray-50" required />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2980b9] focus:ring-[#2980b9] p-3 border bg-gray-50" required />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#2980b9] focus:ring-[#2980b9] p-3 border bg-gray-50" required />
        </div>
        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-[#292d61] hover:bg-[#1a1c3d] transition mt-4">
          Register
        </button>
      </form>
    </div>
  );
};
export default Register;
