import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusCircle, AlertTriangle, CheckCircle, ArrowRight, FileText, Lock, Activity, MessageSquarePlus, MapPin } from 'lucide-react';

interface Complaint {
  id: string;
  title: string;
  status: string;
  category: string;
  severity: string;
  priority: number;
  department: string;
  recommended_action: string;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackMode, setTrackMode] = useState(false);
  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState<Complaint | null>(null);
  const [trackError, setTrackError] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const { data } = await axios.get('/api/complaints');
        if (data.success) {
          console.log('[MeraShehar] complaints loaded:', data.data);
          setComplaints(data.data);
        }
      } catch (e) {
        console.error('Error fetching complaints:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  if (loading) return <div className="text-center mt-12 text-gray-500">Loading your civic cases...</div>;

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 font-sans bg-[#f9fafb] min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN - Main Services */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero Banner */}
          <div className="bg-[#f0f9f4] border border-[#d1e7dd] rounded-2xl p-8 flex justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold text-[#1e234c] mb-2">नमस्ते, {user?.name || 'Citizen'}!</h1>
              <p className="text-[#2980b9] font-bold text-lg">आपके शहर और समुदाय से आसानी से जुड़ें।</p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-20 md:opacity-100 md:relative w-48 md:w-64">
               <img src="/logo.png" alt="City Illustration" className="w-full h-auto object-contain" />
            </div>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/complaints/new" className="bg-[#e67e22] text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#d35400] transition shadow-sm text-center h-28">
              <MessageSquarePlus size={28} />
              <span className="font-bold text-sm">शिकायत दर्ज करें</span>
            </Link>
            
            <div className="bg-[#4CAF50] text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#43a047] transition shadow-sm text-center cursor-pointer h-28">
              <div className="bg-white/20 p-2 rounded-full"><Activity size={20} /></div>
              <span className="font-bold text-sm">कर भुगतान</span>
            </div>

            <div className="bg-[#3498db] text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#2980b9] transition shadow-sm text-center cursor-pointer h-28">
              <div className="bg-white/20 p-2 rounded-full"><Activity size={20} /></div>
              <span className="font-bold text-sm">विद्युत बिल</span>
            </div>

            <div className="bg-[#9b59b6] text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#8e44ad] transition shadow-sm text-center cursor-pointer h-28">
              <div className="bg-white/20 p-2 rounded-full"><MapPin size={20} /></div>
              <span className="font-bold text-sm leading-tight">सड़कें और बुनियादी ढांचा</span>
            </div>

            <div className="bg-[#cbe3f5] text-[#2980b9] p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#b0d4f1] transition shadow-sm text-center cursor-pointer h-28 border border-[#a2ccee]">
              <div className="bg-[#2980b9] text-white p-2 rounded-full"><Activity size={20} /></div>
              <span className="font-bold text-sm">पानी का कनेक्शन</span>
            </div>

            <div className="bg-[#d5f5e3] text-[#27ae60] p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#abebc6] transition shadow-sm text-center cursor-pointer h-28 border border-[#a9dfbf]">
              <div className="bg-[#27ae60] text-white p-2 rounded-full"><Activity size={20} /></div>
              <span className="font-bold text-sm">कचरा प्रबंधन</span>
            </div>

            <div className="bg-[#fad7a1] text-[#d35400] p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#f8c471] transition shadow-sm text-center cursor-pointer h-28 border border-[#f5b041]">
              <div className="bg-[#d35400] text-white p-2 rounded-full"><Activity size={20} /></div>
              <span className="font-bold text-sm">शिक्षा & स्वास्थ्य</span>
            </div>

            <div className="bg-[#e5e0d8] text-[#7f6c53] p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#d5cebf] transition shadow-sm text-center cursor-pointer h-28 border border-[#c4baa8]">
              <div className="bg-[#7f6c53] text-white p-2 rounded-full"><Activity size={20} /></div>
              <span className="font-bold text-sm leading-tight">जन्म & मृत्यु प्रमाण पत्र</span>
            </div>
          </div>
          
          {/* Community Initiatives */}
          <div>
            <h3 className="text-xl font-extrabold text-[#1e234c] mb-4">समुदाय पहल</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-xl h-40 relative overflow-hidden flex items-end p-4 group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1593466144595-8ebf16c4c921?auto=format&fit=crop&q=80&w=400" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition" />
                <div className="relative z-10 text-white">
                  <h4 className="font-bold">स्थानीय कार्यक्रम</h4>
                  <p className="text-xs text-gray-200">समुदाय का हिस्सा बनें</p>
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl h-40 relative overflow-hidden flex items-end p-4 group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=400" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition" />
                <div className="relative z-10 text-white">
                  <h4 className="font-bold">सुझाव</h4>
                  <p className="text-xs text-gray-200">अपने विचार साझा करें</p>
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl h-40 relative overflow-hidden flex items-end p-4 group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=400" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition" />
                <div className="relative z-10 text-white">
                  <h4 className="font-bold">स्वयंसेवक बनें</h4>
                  <p className="text-xs text-gray-200">योगदान दें</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Active Complaints Display below Services */}
          <div>
            <h3 className="text-xl font-extrabold text-[#1e234c] mb-4 mt-8 border-t pt-8">मेरी सक्रिय शिकायतें</h3>
            {complaints.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-xl shadow-sm border border-gray-100">
                 <CheckCircle className="mx-auto text-gray-300 mb-4" size={32} />
                 <p className="text-gray-500">कोई सक्रिय शिकायत नहीं</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complaints.map(c => (
                  <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                     <p className="font-bold text-sm truncate mb-1">{c.title}</p>
                     <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()} - {c.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN - Feed and Updates */}
        <div className="space-y-8">
          
          {/* Discussion Forum */}
          <div>
            <h3 className="text-xl font-extrabold text-[#1e234c] mb-4 border-b pb-2">समुदाय चर्चा मंच</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">R</div>
                  <span className="font-bold text-sm">रवि कुमार</span>
                </div>
                <p className="text-sm font-bold text-gray-800 mb-2">अरे, शहर की नई पार्क का उद्घाटन कब है?</p>
                <div className="h-24 bg-green-100 rounded-lg mb-3 flex items-center justify-center text-green-700">पार्क की तस्वीर</div>
                <div className="flex justify-between items-center text-xs text-gray-500 font-semibold">
                  <span>💬 15 replies</span>
                  <div className="flex gap-3">
                    <span>❤️ 23</span>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full cursor-pointer hover:bg-green-700">Connect</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Local Events */}
          <div>
            <h3 className="text-xl font-extrabold text-[#1e234c] mb-4 border-b pb-2">स्थानीय कार्यक्रम</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                 <div className="h-20 bg-orange-100"></div>
                 <div className="p-3">
                   <h4 className="font-bold text-sm mb-1 text-gray-900">सांस्कृतिक उत्सव</h4>
                   <p className="text-xs text-gray-500 mb-2">10 Nov 2026 📍 सेंट्रल ग्राउंड</p>
                   <button className="w-full bg-green-600 text-white text-xs font-bold py-1.5 rounded-full hover:bg-green-700">अभी जुड़ें</button>
                 </div>
               </div>
               <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                 <div className="h-20 bg-purple-100"></div>
                 <div className="p-3">
                   <h4 className="font-bold text-sm mb-1 text-gray-900">स्वच्छता अभियान</h4>
                   <p className="text-xs text-gray-500 mb-2">15 Nov 2026 📍 वार्ड 4</p>
                   <button className="w-full bg-green-600 text-white text-xs font-bold py-1.5 rounded-full hover:bg-green-700">अभी जुड़ें</button>
                 </div>
               </div>
            </div>
          </div>

          {/* Direct Contact */}
          <div>
            <h3 className="text-xl font-extrabold text-[#1e234c] mb-4 border-b pb-2">शहर से सीधे संपर्क</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#eafaf1] border border-[#a9dfbf] p-3 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-gray-900">वार्ड पार्षद</p>
                  <p className="text-xs text-gray-600 mb-1">कल्लवी प्रसाद</p>
                  <button className="bg-[#27ae60] text-white text-xs font-bold px-3 py-1 rounded-full">संपर्क करें</button>
                </div>
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              </div>
              <div className="bg-[#eafaf1] border border-[#a9dfbf] p-3 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-gray-900">नोडल अधिकारी</p>
                  <p className="text-xs text-gray-600 mb-1">पी. शर्मा</p>
                  <button className="bg-[#27ae60] text-white text-xs font-bold px-3 py-1 rounded-full">संपर्क करें</button>
                </div>
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
