import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await axios.get('/api/admin/complaints');
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch cases', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await axios.patch(`/api/admin/complaints/${id}/status`, { status });
      fetchComplaints();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleDepartmentChange = async (id: string, department: string) => {
    try {
      await axios.patch(`/api/admin/complaints/${id}/assign`, { department });
      fetchComplaints();
    } catch (e) {
      alert('Failed to assign department');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" />;
  }

  if (loading) return <div className="text-center mt-12 text-gray-500">Loading master records...</div>;

  return (
    <div className="min-h-screen bg-[#f1f2f6] pb-12">
      {/* Admin Hero Banner */}
      <div className="bg-[#1e234c] border-b border-[#1a1e42]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white">
            <h1 className="text-3xl md:text-4xl font-serif leading-tight mb-2">
              MeraShehar Admin Portal
            </h1>
            <p className="text-[#a4a9d6]">Manage and dispatch civic cases to municipal departments.</p>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4">
            <div className="bg-[#292d61] p-4 rounded-xl border border-[#373c7b] min-w-[120px]">
              <div className="text-xs text-[#a4a9d6] uppercase font-bold">Total Cases</div>
              <div className="text-2xl font-bold text-white">{complaints.length}</div>
            </div>
            <div className="bg-[#292d61] p-4 rounded-xl border border-[#373c7b] min-w-[120px]">
              <div className="text-xs text-red-400 uppercase font-bold">Critical</div>
              <div className="text-2xl font-bold text-white">{complaints.filter(c => c.severity === 'CRITICAL').length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <h2 className="text-2xl font-serif text-[#1e234c] mb-6">Master Complaint Registry</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f8f9fa]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Issue Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">AI Classification</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Department Assignment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {complaints.map(c => (
                  <tr key={c.id} className="hover:bg-blue-50/50 transition">
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-[#1e234c] mb-1">{c.title}</div>
                      <div className="text-sm text-gray-500 truncate w-64 mb-2">{c.description}</div>
                      <div className="text-xs font-medium text-gray-400 bg-gray-100 inline-block px-2 py-1 rounded">
                        {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-gray-900"><span className="text-gray-500">Cat:</span> {c.category || 'N/A'}</div>
                        <div className={`text-sm font-bold ${c.severity === 'CRITICAL' ? 'text-red-600' : 'text-yellow-600'}`}>Sev: {c.severity || 'N/A'}</div>
                        <div className="text-sm text-gray-500"><span className="text-gray-500">Pri:</span> {c.priority || 'N/A'}/10</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        className={`block w-full pl-3 pr-8 py-2 text-sm font-semibold border-gray-200 focus:outline-none focus:ring-[#292d61] focus:border-[#292d61] rounded-lg shadow-sm ${
                          c.status === 'REPORTED' ? 'bg-blue-50 text-blue-700' :
                          c.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-green-50 text-green-700'
                        }`}
                      >
                        <option value="REPORTED">REPORTED</option>
                        <option value="UNDER_REVIEW">UNDER REVIEW</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        value={c.department || ''}
                        onChange={(e) => handleDepartmentChange(c.id, e.target.value)}
                        className="block w-full pl-3 pr-8 py-2 text-sm font-medium border-gray-200 focus:outline-none focus:ring-[#292d61] focus:border-[#292d61] rounded-lg shadow-sm bg-white"
                      >
                        <option value="" disabled>Unassigned</option>
                        <option value="Public Works">Public Works</option>
                        <option value="Sanitation">Sanitation</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Water & Power">Water & Power</option>
                        <option value="Police/Safety">Police/Safety</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
