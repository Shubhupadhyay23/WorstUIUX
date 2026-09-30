const fs = require('fs');
const path = require('path');

const serverDir = path.join('/Users/shubhamupadhyay/build to ship', 'server');
const clientDir = path.join('/Users/shubhamupadhyay/build to ship', 'client');

// Update Dashboard.tsx
const dashboardPath = path.join(clientDir, 'src', 'pages', 'Dashboard.tsx');
let dContent = fs.readFileSync(dashboardPath, 'utf8');

if (!dContent.includes('const [notifications')) {
    dContent = dContent.replace(
        `const [complaints, setComplaints] = useState<Complaint[]>([]);`,
        `const [complaints, setComplaints] = useState<Complaint[]>([]);\n  const [notifications, setNotifications] = useState<any[]>([]);`
    );
    
    dContent = dContent.replace(
        `        const { data } = await axios.get('/api/complaints');
        if (data.success) {
          setComplaints(data.data);
        }`,
        `        const { data } = await axios.get('/api/complaints');
        if (data.success) setComplaints(data.data);
        const { data: notifData } = await axios.get('/api/complaints/notifications');
        if (notifData.success) setNotifications(notifData.data);`
    );
    
    const notificationUI = `
      {notifications.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Notifications</h3>
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="p-4 bg-blue-50 border border-blue-100 rounded-lg shadow-sm flex items-start gap-3">
                <AlertTriangle className="text-blue-500 mt-1" size={20} />
                <div>
                  <h4 className="font-bold text-gray-800">{n.title}</h4>
                  <p className="text-sm text-gray-600">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    `;
    
    dContent = dContent.replace(
        `<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">`,
        notificationUI + `\n          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">`
    );
    fs.writeFileSync(dashboardPath, dContent);
}

// Update complaints.controller.ts
const complaintsControllerPath = path.join(serverDir, 'src', 'controllers', 'complaints.controller.ts');
let ccContent = fs.readFileSync(complaintsControllerPath, 'utf8');

if (!ccContent.includes('export const getNotifications')) {
    ccContent += `
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [req.user!.userId]);
    res.json({ success: true, data: result.rows });
  } catch (e: any) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
`;
    fs.writeFileSync(complaintsControllerPath, ccContent);
}

// Update complaints.ts
const complaintsRoutePath = path.join(serverDir, 'src', 'routes', 'complaints.ts');
let crContent = fs.readFileSync(complaintsRoutePath, 'utf8');

if (!crContent.includes('getNotifications')) {
    crContent = crContent.replace(
        `import { createComplaint, getMyComplaints, deleteComplaint, editComplaint } from '../controllers/complaints.controller';`,
        `import { createComplaint, getMyComplaints, deleteComplaint, editComplaint, getNotifications } from '../controllers/complaints.controller';`
    );
    crContent = crContent.replace(
        `router.get('/', getMyComplaints);`,
        `router.get('/', getMyComplaints);\nrouter.get('/notifications', getNotifications);`
    );
    fs.writeFileSync(complaintsRoutePath, crContent);
}

console.log("Frontend patched.");
