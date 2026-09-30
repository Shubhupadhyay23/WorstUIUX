import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mic, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const NewComplaint = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
  const navigate = useNavigate();

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        setLocationText(`Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`);
      },
    });
    return position === null ? null : <Marker position={position}></Marker>;
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice typing is not supported in your browser.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/complaints', {
        title,
        description,
        location_text: locationText,
        latitude: position?.lat,
        longitude: position?.lng
      });
      if (data.success) {
        setSubmittedId(data.complaintId);
        if (data.aiResult) setAiResult(data.aiResult);
      }
    } catch (err: any) {
      alert('Error submitting complaint: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      {!submittedId ? (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Report a Civic Issue</h2>
          <p className="text-gray-500 mb-6">Describe the problem. Our AI will automatically categorize it and alert the proper department.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Issue Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Massive pothole on Main St" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border" required minLength={5} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <button 
                  type="button" 
                  onClick={startListening}
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${isListening ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                >
                  <Mic size={14} /> {isListening ? 'Listening...' : 'Voice Type'}
                </button>
              </div>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="Describe the issue in detail or use Voice Typing..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border" required minLength={10} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location (Pin on Map or Type)</label>
              <div className="h-48 w-full mb-3 rounded-lg overflow-hidden border border-gray-300 shadow-inner z-0">
                <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                  <LocationMarker />
                </MapContainer>
              </div>
              <div className="flex relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <MapPin size={18} />
                </span>
                <input type="text" value={locationText} onChange={e => setLocationText(e.target.value)} placeholder="e.g. Near City College North Gate" className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              {loading ? <><Loader2 className="animate-spin mr-2" /> Submitting...</> : 'Submit Report'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted Successfully!</h2>
          <p className="text-gray-700 mb-4 text-lg">Thanks for submitting your report.</p>
          <p className="text-gray-600 mb-6">Your complaint has been received by MeraShehar AI and is now being processed.</p>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 inline-block mb-6">
            <span className="block text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Complaint ID</span>
            <span className="text-lg font-mono text-gray-900">{submittedId?.split('-')[0].toUpperCase() + '-' + submittedId?.split('-')[1].toUpperCase().substring(0, 5)}</span>
          </div>

          <div className="text-left bg-white border border-gray-200 p-6 rounded-lg shadow-sm mb-8 mx-auto max-w-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-wide">Status: REPORTED</p>
            
            {aiResult ? (
              <div className="border-t border-gray-100 pt-4 mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">AI Analysis:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Priority:</span> <span className="font-medium text-gray-900">{aiResult.priority > 7 ? 'HIGH' : aiResult.priority > 4 ? 'NORMAL' : 'LOW'}</span></div>
                  <div><span className="text-gray-500">Severity:</span> <span className="font-medium text-gray-900">{aiResult.severity}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">Category:</span> <span className="font-medium text-gray-900">{aiResult.category}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">Department:</span> <span className="font-medium text-gray-900">{aiResult.department}</span></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic mt-4 border-t border-gray-100 pt-4">AI analysis in progress... You can return to your dashboard to track its status.</p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium">View My Complaints</button>
            <button onClick={() => { setSubmittedId(null); setAiResult(null); setTitle(''); setDescription(''); setLocationText(''); }} className="bg-indigo-50 text-indigo-700 px-6 py-3 rounded-lg hover:bg-indigo-100 transition font-medium">Report Another Issue</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewComplaint;
