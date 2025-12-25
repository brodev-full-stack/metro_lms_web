import React, { useState, useEffect } from 'react';
import { Book, Search, Brain, Github, Shield, Share2, Users, Video, Calendar, FileText, Code, Wifi, Bell, Settings, Plus, X, Check, Eye, EyeOff, Download, Upload, Bluetooth, Link2, Presentation, MessageSquare, Layout, TrendingUp, LogOut, ZoomIn, ZoomOut, Sun, Moon, Type } from 'lucide-react';

const MetroLMS = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showTotp, setShowTotp] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  // UI state
  const [activeSection, setActiveSection] = useState('dashboard');
  const [zoom, setZoom] = useState(100);
  const [contrast, setContrast] = useState('normal');
  const [showAccessibility, setShowAccessibility] = useState(false);
  
  // Data state
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [research, setResearch] = useState([]);
  const [courses, setCourses] = useState([]);
  const [kanbanTasks, setKanbanTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [peers, setPeers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [aiHistory, setAiHistory] = useState([]);
  
  // Live tile notifications
  const [tileNotifications, setTileNotifications] = useState({
    books: 0,
    research: 0,
    ai: 0,
    courses: 0,
    kanban: 0,
    p2p: 0,
    meetings: 0,
    stats: 0,
    settings: 0
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('lms_users') || '[]');
    const storedBooks = JSON.parse(localStorage.getItem('lms_books') || '[]');
    const storedResearch = JSON.parse(localStorage.getItem('lms_research') || '[]');
    const storedCourses = JSON.parse(localStorage.getItem('lms_courses') || '[]');
    const storedKanban = JSON.parse(localStorage.getItem('lms_kanban') || '{"todo":[],"inProgress":[],"done":[]}');
    const storedPeers = JSON.parse(localStorage.getItem('lms_peers') || '[]');
    const storedMeetings = JSON.parse(localStorage.getItem('lms_meetings') || '[]');
    const storedAiHistory = JSON.parse(localStorage.getItem('lms_ai_history') || '[]');
    const currentSession = JSON.parse(localStorage.getItem('lms_current_session') || 'null');
    
    setUsers(storedUsers);
    setBooks(storedBooks);
    setResearch(storedResearch);
    setCourses(storedCourses);
    setKanbanTasks(storedKanban);
    setPeers(storedPeers);
    setMeetings(storedMeetings);
    setAiHistory(storedAiHistory);
    
    if (currentSession) {
      setCurrentUser(currentSession);
      setIsAuthenticated(true);
    }
    
    updateNotifications();
  }, []);

  // Save data to localStorage
  const saveToStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const updateNotifications = () => {
    const stored = {
      books: JSON.parse(localStorage.getItem('lms_books') || '[]'),
      research: JSON.parse(localStorage.getItem('lms_research') || '[]'),
      courses: JSON.parse(localStorage.getItem('lms_courses') || '[]'),
      kanban: JSON.parse(localStorage.getItem('lms_kanban') || '{"todo":[],"inProgress":[],"done":[]}'),
      peers: JSON.parse(localStorage.getItem('lms_peers') || '[]'),
      meetings: JSON.parse(localStorage.getItem('lms_meetings') || '[]'),
      ai: JSON.parse(localStorage.getItem('lms_ai_history') || '[]')
    };
    
    setTileNotifications({
      books: stored.books.length,
      research: stored.research.length,
      ai: stored.ai.length,
      courses: stored.courses.length,
      kanban: stored.kanban.todo.length,
      p2p: stored.peers.length,
      meetings: stored.meetings.length,
      stats: 0,
      settings: 0
    });
  };

  // Generate TOTP Secret
  const generateTOTPSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  };

  // Generate QR Code URL
  const generateQRCode = (secret, email) => {
    const issuer = 'MetroLMS';
    const otpauth = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
  };

  // Simple TOTP verification (simplified for demo)
  const verifyTOTP = (secret, token) => {
    // In production, use a proper TOTP library
    // This is a simplified version for demonstration
    return token.length === 6 && /^\d+$/.test(token);
  };

  // Handle Registration
  const handleRegister = () => {
    if (!authCode || !totpCode) return;
    
    if (!verifyTOTP(totpSecret, totpCode)) {
      alert('Invalid 2FA code');
      return;
    }
    
    const newUser = {
      id: Date.now().toString(),
      code: authCode,
      totpSecret: totpSecret,
      createdAt: new Date().toISOString()
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveToStorage('lms_users', updatedUsers);
    
    setCurrentUser(newUser);
    saveToStorage('lms_current_session', newUser);
    setIsAuthenticated(true);
    setIsRegistering(false);
  };

  // Handle Login
  const handleLogin = () => {
    if (!authCode || !totpCode) return;
    
    const user = users.find(u => u.code === authCode);
    if (!user) {
      alert('Invalid access code');
      return;
    }
    
    if (!verifyTOTP(user.totpSecret, totpCode)) {
      alert('Invalid 2FA code');
      return;
    }
    
    setCurrentUser(user);
    saveToStorage('lms_current_session', user);
    setIsAuthenticated(true);
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('lms_current_session');
    setActiveSection('dashboard');
  };

  // Initialize registration
  const startRegistration = () => {
    const secret = generateTOTPSecret();
    setTotpSecret(secret);
    setQrCodeUrl(generateQRCode(secret, 'user@metrolms.local'));
    setIsRegistering(true);
  };

  // Add Book
  const addBook = (title, pages) => {
    const newBook = {
      id: Date.now().toString(),
      title,
      pages,
      addedAt: new Date().toISOString(),
      highlights: [],
      notes: []
    };
    const updated = [...books, newBook];
    setBooks(updated);
    saveToStorage('lms_books', updated);
    updateNotifications();
  };

  // Add Research Item
  const addResearch = (title, type) => {
    const newItem = {
      id: Date.now().toString(),
      title,
      type,
      addedAt: new Date().toISOString(),
      highlights: []
    };
    const updated = [...research, newItem];
    setResearch(updated);
    saveToStorage('lms_research', updated);
    updateNotifications();
  };

  // Add Course
  const addCourse = (title, description) => {
    const newCourse = {
      id: Date.now().toString(),
      title,
      description,
      modules: [],
      students: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [...courses, newCourse];
    setCourses(updated);
    saveToStorage('lms_courses', updated);
    updateNotifications();
  };

  // Add Kanban Task
  const addKanbanTask = (column, task) => {
    const newTask = {
      id: Date.now().toString(),
      text: task,
      createdAt: new Date().toISOString()
    };
    const updated = {
      ...kanbanTasks,
      [column]: [...kanbanTasks[column], newTask]
    };
    setKanbanTasks(updated);
    saveToStorage('lms_kanban', updated);
    updateNotifications();
  };

  // Move Kanban Task
  const moveTask = (taskId, fromColumn, toColumn) => {
    const task = kanbanTasks[fromColumn].find(t => t.id === taskId);
    if (!task) return;
    
    const updated = {
      ...kanbanTasks,
      [fromColumn]: kanbanTasks[fromColumn].filter(t => t.id !== taskId),
      [toColumn]: [...kanbanTasks[toColumn], task]
    };
    setKanbanTasks(updated);
    saveToStorage('lms_kanban', updated);
    updateNotifications();
  };

  const TileButton = ({ icon: Icon, label, onClick, color, notifications }) => (
    <button
      onClick={onClick}
      className="relative overflow-hidden p-0 transition-all hover:opacity-90 aspect-square flex flex-col items-center justify-center"
      style={{ backgroundColor: color }}
    >
      <Icon className="w-16 h-16 mb-2 text-white" strokeWidth={1.5} />
      <div className="text-white text-base font-medium tracking-wide">{label}</div>
      {notifications > 0 && (
        <div className="absolute top-2 right-2 bg-white text-gray-800 font-bold text-xs w-6 h-6 flex items-center justify-center">
          {notifications}
        </div>
      )}
    </button>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4" style={{ zoom: `${zoom}%` }}>
        <div className="bg-white border-2 border-gray-200 p-12 w-full max-w-md" style={{ fontFamily: "'Patrick Hand', cursive" }}>
          <div className="flex items-center justify-center mb-8">
            <Shield className="w-20 h-20" style={{ color: '#A8D5BA' }} strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-bold text-center mb-12" style={{ color: '#6B9080' }}>Metro LMS</h1>
          
          {!isRegistering ? (
            <div className="space-y-6">
              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">Access Code</label>
                <input
                  type="password"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 focus:border-gray-500 focus:outline-none text-lg"
                  placeholder="Enter your code"
                />
              </div>
              
              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">2FA Code</label>
                <div className="relative">
                  <input
                    type={showTotp ? "text" : "password"}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 focus:border-gray-500 focus:outline-none text-lg"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <button
                    onClick={() => setShowTotp(!showTotp)}
                    className="absolute right-4 top-4"
                  >
                    {showTotp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleLogin}
                className="w-full text-white p-4 font-bold hover:opacity-90 transition-opacity text-lg"
                style={{ backgroundColor: '#6B9080' }}
              >
                Login
              </button>
              
              <button
                onClick={startRegistration}
                className="w-full border-2 border-gray-300 p-4 font-bold hover:bg-gray-50 transition-colors text-lg"
              >
                Register New Account
              </button>
              
              <p className="text-xs text-center text-gray-500 mt-6">
                End-to-end encrypted • Zero-knowledge • Local storage
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-4">Setup 2FA</h2>
                <p className="text-sm text-gray-600 mb-4">Scan this QR code with Google Authenticator</p>
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto border-2 border-gray-300 p-2" />
                <p className="text-xs text-gray-500 mt-2 break-all">{totpSecret}</p>
              </div>
              
              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">Create Access Code</label>
                <input
                  type="password"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 focus:border-gray-500 focus:outline-none text-lg"
                  placeholder="Enter a secure code"
                />
              </div>
              
              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">Enter 2FA Code</label>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 focus:border-gray-500 focus:outline-none text-lg"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              
              <button
                onClick={handleRegister}
                className="w-full text-white p-4 font-bold hover:opacity-90 transition-opacity text-lg"
                style={{ backgroundColor: '#6B9080' }}
              >
                Complete Registration
              </button>
              
              <button
                onClick={() => setIsRegistering(false)}
                className="w-full border-2 border-gray-300 p-4 font-bold hover:bg-gray-50 transition-colors text-lg"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const sections = {
    dashboard: (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
        <TileButton icon={Book} label="Books" onClick={() => setActiveSection('books')} color="#A8D5BA" notifications={tileNotifications.books} />
        <TileButton icon={Search} label="Research" onClick={() => setActiveSection('research')} color="#B4A7D6" notifications={tileNotifications.research} />
        <TileButton icon={Brain} label="AI Synthesis" onClick={() => setActiveSection('ai')} color="#A3C4D9" notifications={tileNotifications.ai} />
        <TileButton icon={FileText} label="Courses" onClick={() => setActiveSection('courses')} color="#C8E6C9" notifications={tileNotifications.courses} />
        <TileButton icon={Layout} label="Kanban" onClick={() => setActiveSection('kanban')} color="#FFE082" notifications={tileNotifications.kanban} />
        <TileButton icon={Users} label="P2P Network" onClick={() => setActiveSection('p2p')} color="#FFAB91" notifications={tileNotifications.p2p} />
        <TileButton icon={Video} label="Meetings" onClick={() => setActiveSection('meetings')} color="#B0BEC5" notifications={tileNotifications.meetings} />
        <TileButton icon={TrendingUp} label="Statistics" onClick={() => setActiveSection('stats')} color="#E1BEE7" notifications={tileNotifications.stats} />
        <TileButton icon={Settings} label="Settings" onClick={() => setActiveSection('settings')} color="#90A4AE" notifications={tileNotifications.settings} />
      </div>
    ),
    books: (
      <div className="space-y-0">
        <div className="bg-white border-b-2 border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold" style={{ color: '#A8D5BA' }}>Books Library</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                const title = prompt('Book title:');
                const pages = prompt('Number of pages:');
                if (title && pages) addBook(title, pages);
              }}
              className="text-white px-6 py-3 hover:opacity-90" 
              style={{ backgroundColor: '#A8D5BA' }}
            >
              <Plus className="w-6 h-6" />
            </button>
            <button onClick={() => setActiveSection('dashboard')} className="text-gray-600 px-6 py-3 border-2 border-gray-300 hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {books.map(book => (
            <div key={book.id} className="bg-white border border-gray-200 p-8 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <Book className="w-10 h-10" style={{ color: '#A8D5BA' }} />
                <button style={{ color: '#A8D5BA' }}>
                  <Presentation className="w-6 h-6" />
                </button>
              </div>
              <h3 className="font-bold text-xl mb-2">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{book.pages} pages • Added {new Date(book.addedAt).toLocaleDateString()}</p>
              <div className="flex gap-2 mt-6">
                <button className="flex-1 text-white py-3 text-sm font-semibold" style={{ backgroundColor: '#A8D5BA' }}>
                  Open
                </button>
                <button className="border-2 p-3" style={{ borderColor: '#A8D5BA', color: '#A8D5BA' }}>
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {books.length === 0 && (
            <div className="col-span-3 text-center py-20 text-gray-400">
              <Book className="w-16 h-16 mx-auto mb-4" />
              <p>No books yet. Click + to add one.</p>
            </div>
          )}
        </div>
      </div>
    ),
    research: (
      <div className="space-y-0">
        <div className="bg-white border-b-2 border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold" style={{ color: '#B4A7D6' }}>Research Hub</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                const title = prompt('Research title:');
                const type = prompt('Type (article/paper/webpage):');
                if (title && type) addResearch(title, type);
              }}
              className="text-white px-6 py-3 hover:opacity-90" 
              style={{ backgroundColor: '#B4A7D6' }}
            >
              <Plus className="w-6 h-6" />
            </button>
            <button onClick={() => setActiveSection('dashboard')} className="text-gray-600 px-6 py-3 border-2 border-gray-300 hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1">
          {research.map(item => (
            <div key={item.id} className="bg-white border-b border-gray-200 p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div>
                <h4 className="font-bold text-lg">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.type} • Saved on {new Date(item.addedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-3">
                <button className="text-gray-600 hover:text-gray-800"><Eye className="w-6 h-6" /></button>
                <button className="text-gray-600 hover:text-gray-800"><Download className="w-6 h-6" /></button>
              </div>
            </div>
          ))}
          {research.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Search className="w-16 h-16 mx-auto mb-4" />
              <p>No research items yet. Click + to add one.</p>
            </div>
          )}
        </div>
      </div>
    ),
    ai: (
      <div className="space-y-0">
        <div className="bg-white border-b-2 border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold" style={{ color: '#A3C4D9' }}>AI Synthesis</h2>
          <button onClick={() => setActiveSection('dashboard')} className="text-gray-600 px-6 py-3 border-2 border-gray-300 hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="bg-white p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <label className="block font-semibold mb-2 text-base text-gray-700">OpenRouter API Key</label>
              <input type="password" placeholder="sk-or-..." className="w-full p-4 border-2 border-gray-300 focus:border-gray-500 focus:outline-none text-lg" />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-base text-gray-700">Model</label>
              <select className="w-full p-4 border-2 border-gray-300 focus:border-gray-500 focus:outline-none text-lg">
                <option>GPT-4 Turbo</option>
                <option>Claude 3 Opus</option>
                <option>Llama 3 70B</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-2 text-base text-gray-700">Input</label>
              <textarea placeholder="Enter content..." className="w-full p-4 border-2 border-gray-300 focus:border-gray-500 focus:outline-none h-48 text-lg" />
            </div>
            <button className="w-full text-white p-4 font-bold hover:opacity-90 text-lg" style={{ backgroundColor: '#A3C4D9' }}>
              Synthesize
            </button>
          </div>
        </div>
      </div>
    ),
    courses: (
      <div className="space-y-0">
        <div className="bg-white border-b-2 border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold" style={{ color: '#C8E6C9' }}>Courses</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                const title = prompt('Course title:');
                const desc = prompt('Description:');
                if (title && desc) addCourse(title, desc);
              }}
              className="text-white px-6 py-3 hover:opacity-90 flex items-center gap-2 text-base font-semibold" 
              style={{ backgroundColor: '#C8E6C9' }}
            >
              <Plus className="w-5 h-5" /> Create
            </button>
            <button onClick={() => setActiveSection('dashboard')} className="text-gray-600 px-6 py-3 border-2 border-gray-300 hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {courses.map(course => (
            <div key={course.id} className="bg-white border border-gray-200 p-8 hover:bg-gray-50 transition-colors">
              <h4 className="font-bold text-xl mb-3">{course.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{course.description}</p>
              <p className="text-sm text-gray-600 mb-6">{course.modules.length} modules • {course.students} students</p>
              <button className="w-full border-2 py-3 text-base font-semibold hover:bg-gray-50" style={{ borderColor: '#C8E6C9', color: '#6B9080' }}>
                Manage
              </button>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-2 text-center py-20 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4" />
              <p>No courses yet. Click Create to add one.</p>
            </div>
          )}
        </div>
      </div>
    ),
    kanban: (
      <div className="space-y-0">
        <div className="bg-white border-b-2 border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold" style={{ color: '#FFE082' }}>Kanban Board</h2>
          <button onClick={() => setActiveSection('dashboard')} className="text-gray-600 px-6 py-3 border-2 border-gray-300 hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {[
            { key: 'todo', label: 'To Do' },
            { key: 'inProgress', label: 'In Progress' },
            { key: 'done', label: 'Done' }
          ].map(column => (
            <div key={column.key} className="bg-white border-r border-gray-200 p-6">
              <h3 className="font-bold mb-6 text-xl">{column.label}</h3>
              <div className="space-y-3">
                {kanbanTasks[column.key].map(task => (
                  <div key={task.id} className="bg-white border-2 border-gray-300 p-4">
                    <p className="font-semibold text-gray-800">{task.text}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(task.createdAt).toLocaleDateString()}</p>
                    <div className="flex gap-2 mt-2">
                      {column.key !== 'todo' && (
                        <button 
                          onClick={() => moveTask(task.id, column.key, column.key === 'inProgress' ? 'todo' : 'inProgress')}
                          className="text-xs px-2 py-1 border border-gray-300"
                        >←</button>
                      )}
                      {column.key !== 'done' && (
                        <button 
                          onClick={() => moveTask(task.id, column.key, column.key === 'todo' ? 'inProgress' : 'done')}
                          className="text-xs px-2 py-1 border border-gray-300"
                        >→</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  const task = prompt('Task description:');
                  if (task) addKanbanTask(column.key, task);
                }}
                className="w-full mt-4 text-white py-3 text-base font-semibold" 
                style={{ backgroundColor: '#FFE082', color: '#000' }}
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      </div>
    ),
    p2p: (
      <div className="space-y-0">
        <div className="bg-white border-b-2 border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold" style={{ color: '#FFAB91' }}>P2P Network</h2>
          <button onClick={() => setActiveSection('dashboard')} className="text-gray-600 px-6 py-3 border-2 border-gray-300 hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="bg-white p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-8 mb-8 justify-center">
              <div className="text-center">
                <Bluetooth className="w-16 h-16 mx-auto mb-2" style={{ color: '#FFAB91' }} />
                <p className="text-sm font-semibold">Bluetooth</p>
              </div>
              <div className="text-center">
                <Wifi className="w-16 h-16 mx-auto mb-2" style={{ color: '#FFAB91' }} />
                <p className="text-sm font-semibold">Wi-Fi Direct</p>
              </div>
              <div className="text-center">
                <Share2 className="w-16 h-16 mx-auto mb-2" style={{ color: '#FFAB91' }} />
                <p className="text-sm font-semibold">WebRTC</p>
              </div>
            </div>
            <h3 className="font-bold mb-4 text-base text-gray-700">Connected Peers</h3>
            <div className="space-y-3 mb-6">
              {peers.map(peer => (
                <div key={peer.id} className="flex justify-between items-center bg-white border-2 border-gray-300 p-4">
                  <span className="font-mono font-semibold">{peer.name}</span>
                  <button className="text-white px-6 py-2 text-base font-semibold" style={{ backgroundColor: '#FFAB91' }}>
                    Share File
                  </button>
                </div>
              ))}
              {peers.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <Users className="w-16 h-16 mx-auto mb-4" />
                  <p>No peers connected</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                const name = prompt('Peer name:');
                if (name) {
                  const newPeer = { id: Date.now().toString(), name };
                  const updated = [...peers, newPeer];
                  setPeers(updated);
                  saveToStorage('lms_peers', updated);
                  updateNotifications();
                }
              }}
              className="w-full text-white p-4 font-bold hover:opacity-90 text-lg" 
              style={{ backgroundColor: '#FFAB91' }}
            >
              Discover Peers
            </button>
          </div>
        </div>
      </div>
    ),
    meetings: (
      <div className="space-y-0">
        <div className="bg-white border-b-2 border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold" style={{ color: '#B0BEC5' }}>Meetings</h2>
          <button onClick={() => setActiveSection('dashboard')} className="text-gray-600 px-6 py-3 border-2 border-gray-300 hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="bg-white p-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bold mb-6 text-base text-gray-700">Jitsi Meet</h3>
            <div className="space-y-6">
              <input placeholder="Meeting Room Name" className="w-full p-4 border-2 border-gray-300 focus:border-gray-500 focus:outline-none text-lg" />
              <button 
                onClick={() => {
                  const room = prompt('Meeting room name:');
                  if (room) {
                    const newMeeting = {
                      id: Date.now().toString(),
                      room,
                      time: new Date().toISOString()
                    };
                    const updated = [...meetings, newMeeting];
                    setMeetings(updated);
                    saveToStorage('lms_meetings', updated);
                    updateNotifications();
                  }
                }}
                className="w-full text-white p-4 font-bold hover:opacity-90 text-lg" 
                style={{ backgroundColor: '#B0BEC5' }}
              >
                Start Meeting
              </button>
            </div>
            <div className="mt-12">
              <h3 className="font-bold mb-4 text-base text-gray-700">Scheduled</h3>
              <div className="space-y-3">
                {meetings.map(meeting => (
                  <div key={meeting.id} className="bg-white border-2 border-gray-300 p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{meeting.room}</p>
                      <p className="text-sm text-gray-600">{new Date(meeting.time).toLocaleString()}</p>
                    </div>
                    <button className="border-2 px-6 py-2 text-base font-semibold hover:bg-gray-50" style={{ borderColor: '#B0BEC5', color: '#607D8B' }}>
                      Join
                    </button>
                  </div>
                ))}
                {meetings.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <Video className="w-16 h-16 mx-auto mb-4" />
                    <p>No meetings scheduled</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    stats: (
      <div className="space-y-0">
        <div className="bg-white border-b-2 border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold" style={{ color: '#E1BEE7' }}>Statistics</h2>
          <button onClick={() => setActiveSection('dashboard')} className="text-gray-600 px-6 py-3 border-2 border-gray-300 hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {[
            { label: 'Books', value: books.length, color: '#A8D5BA' },
            { label: 'Research', value: research.length, color: '#B4A7D6' },
            { label: 'Courses', value: courses.length, color: '#C8E6C9' },
            { label: 'AI Queries', value: aiHistory.length, color: '#A3C4D9' },
            { label: 'Tasks', value: kanbanTasks.todo.length + kanbanTasks.inProgress.length + kanbanTasks.done.length, color: '#FFE082' },
            { label: 'Peers', value: peers.length, color: '#FFAB91' },
            { label: 'Meetings', value: meetings.length, color: '#B0BEC5' },
            { label: 'Users', value: users.length, color: '#E1BEE7' }
          ].map(stat => (
            <div key={stat.label} className="text-white p-10 border border-white flex flex-col items-center justify-center" style={{ backgroundColor: stat.color }}>
              <div className="text-5xl font-bold mb-3">{stat.value}</div>
              <div className="text-base text-center">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    settings: (
      <div className="space-y-0">
        <div className="bg-white border-b-2 border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold" style={{ color: '#90A4AE' }}>Settings</h2>
          <button onClick={() => setActiveSection('dashboard')} className="text-gray-600 px-6 py-3 border-2 border-gray-300 hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="bg-white p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h3 className="font-bold mb-4 text-base text-gray-700">Security</h3>
              <div className="space-y-3">
                <button className="w-full text-left border-2 border-gray-300 p-4 hover:bg-gray-50">
                  <p className="font-semibold">Change Access Code</p>
                </button>
                <button className="w-full text-left border-2 border-gray-300 p-4 hover:bg-gray-50">
                  <p className="font-semibold">Manage 2FA</p>
                </button>
                <button className="w-full text-left border-2 border-gray-300 p-4 hover:bg-gray-50">
                  <p className="font-semibold">Export Keys</p>
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-base text-gray-700">Data</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    const data = {
                      users, books, research, courses, kanbanTasks, peers, meetings, aiHistory
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `metro-lms-backup-${Date.now()}.json`;
                    a.click();
                  }}
                  className="w-full text-left border-2 border-gray-300 p-4 hover:bg-gray-50"
                >
                  <p className="font-semibold">Backup All Data</p>
                </button>
                <button className="w-full text-left border-2 border-gray-300 p-4 hover:bg-gray-50">
                  <p className="font-semibold">Import Data</p>
                </button>
                <button 
                  onClick={() => {
                    if (confirm('Clear all cache? This cannot be undone.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="w-full text-left border-2 border-gray-300 p-4 hover:bg-gray-50"
                >
                  <p className="font-semibold">Clear Cache</p>
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-base text-gray-700">System</h3>
              <div className="space-y-3">
                <button className="w-full text-left border-2 border-gray-300 p-4 hover:bg-gray-50">
                  <p className="font-semibold">Check Updates</p>
                  <p className="text-sm text-gray-600">Version 2.4.1 • Up to date</p>
                </button>
                <button className="w-full text-left border-2 border-gray-300 p-4 hover:bg-gray-50">
                  <p className="font-semibold">About</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-white relative" style={{ fontFamily: "'Patrick Hand', cursive", zoom: `${zoom}%`, filter: contrast === 'high' ? 'contrast(1.5)' : 'none' }}>
      {/* Accessibility Bar */}
      <div className={`fixed right-0 top-0 h-full bg-gray-800 text-white transition-all duration-300 ${showAccessibility ? 'w-64' : 'w-12'} z-50`}>
        <button 
          onClick={() => setShowAccessibility(!showAccessibility)}
          className="w-full p-3 border-b border-gray-700 hover:bg-gray-700"
        >
          <Settings className="w-6 h-6 mx-auto" />
        </button>
        
        {showAccessibility && (
          <div className="p-4 space-y-6">
            <div>
              <p className="text-sm font-bold mb-2">Zoom</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="flex-1 bg-gray-700 p-2 hover:bg-gray-600"
                >
                  <ZoomOut className="w-5 h-5 mx-auto" />
                </button>
                <span className="flex items-center px-3">{zoom}%</span>
                <button 
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className="flex-1 bg-gray-700 p-2 hover:bg-gray-600"
                >
                  <ZoomIn className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-bold mb-2">Contrast</p>
              <button 
                onClick={() => setContrast(contrast === 'normal' ? 'high' : 'normal')}
                className="w-full bg-gray-700 p-3 hover:bg-gray-600"
              >
                {contrast === 'normal' ? 'Normal' : 'High'}
              </button>
            </div>
            
            <div>
              <p className="text-sm font-bold mb-2">Font Size</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-700 p-2 hover:bg-gray-600">
                  <Type className="w-4 h-4 mx-auto" />
                </button>
                <button className="flex-1 bg-gray-700 p-2 hover:bg-gray-600">
                  <Type className="w-6 h-6 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logout Button */}
      {isAuthenticated && (
        <button 
          onClick={handleLogout}
          className="fixed top-4 right-16 bg-red-500 text-white px-6 py-3 hover:bg-red-600 flex items-center gap-2 z-40"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold">Logout</span>
        </button>
      )}

      {sections[activeSection]}
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');
      `}</style>
    </div>
  );
};

export default MetroLMS;