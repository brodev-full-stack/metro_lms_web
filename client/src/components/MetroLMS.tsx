import React, { useState, useEffect } from 'react';
import {
  Book, Search, Brain, Github, Shield, Share2, Users, Video, Calendar,
  FileText, Code, Wifi, Bell, Settings, Plus, X, Check, Eye, EyeOff,
  Download, Upload, Bluetooth, Link2, Presentation, MessageSquare, Layout,
  TrendingUp, LogOut, ZoomIn, ZoomOut, Sun, Moon, Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

/**
 * Metro LMS - Local-First Learning Management System
 * Design Philosophy: Warm Organic Curves with Educational Warmth
 * All data persisted to localStorage for offline-first capability
 */

interface User {
  id: string;
  code: string;
  totpSecret: string;
  createdAt: string;
}

interface Book {
  id: string;
  title: string;
  pages: number;
  addedAt: string;
  highlights: string[];
  notes: string[];
}

interface ResearchItem {
  id: string;
  title: string;
  type: string;
  addedAt: string;
  highlights: string[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: string[];
  students: number;
  createdAt: string;
}

interface KanbanTask {
  id: string;
  text: string;
  createdAt: string;
}

interface KanbanBoard {
  todo: KanbanTask[];
  inProgress: KanbanTask[];
  done: KanbanTask[];
}

interface Peer {
  id: string;
  name: string;
  status: string;
  addedAt: string;
}

interface Meeting {
  id: string;
  title: string;
  time: string;
  participants: string[];
  createdAt: string;
}

interface AIMessage {
  id: string;
  query: string;
  response: string;
  timestamp: string;
}

export const MetroLMS: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showTotp, setShowTotp] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // UI state
  const [activeSection, setActiveSection] = useState('dashboard');
  const [zoom, setZoom] = useState(100);
  const [contrast, setContrast] = useState('normal');
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [research, setResearch] = useState<ResearchItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [kanbanTasks, setKanbanTasks] = useState<KanbanBoard>({
    todo: [],
    inProgress: [],
    done: []
  });
  const [peers, setPeers] = useState<Peer[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [aiHistory, setAiHistory] = useState<AIMessage[]>([]);

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
    const darkMode = localStorage.getItem('lms_dark_mode') === 'true';

    setUsers(storedUsers);
    setBooks(storedBooks);
    setResearch(storedResearch);
    setCourses(storedCourses);
    setKanbanTasks(storedKanban);
    setPeers(storedPeers);
    setMeetings(storedMeetings);
    setAiHistory(storedAiHistory);
    setIsDarkMode(darkMode);

    if (currentSession) {
      setCurrentUser(currentSession);
      setIsAuthenticated(true);
    }

    updateNotifications();
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('lms_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  // Save data to localStorage
  const saveToStorage = (key: string, data: any) => {
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
  const generateQRCode = (secret: string, email: string) => {
    const issuer = 'MetroLMS';
    const otpauth = `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
  };

  // Simple TOTP verification
  const verifyTOTP = (secret: string, token: string) => {
    return token.length === 6 && /^\d+$/.test(token);
  };

  // Handle Registration
  const handleRegister = () => {
    if (!authCode || !totpCode) return;

    if (!verifyTOTP(totpSecret, totpCode)) {
      alert('Invalid 2FA code');
      return;
    }

    const newUser: User = {
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
    setAuthCode('');
    setTotpCode('');
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
    setAuthCode('');
    setTotpCode('');
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
  const addBook = (title: string, pages: number) => {
    const newBook: Book = {
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
  const addResearch = (title: string, type: string) => {
    const newItem: ResearchItem = {
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
  const addCourse = (title: string, description: string) => {
    const newCourse: Course = {
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
  const addKanbanTask = (column: keyof KanbanBoard, task: string) => {
    const newTask: KanbanTask = {
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
  const moveTask = (taskId: string, fromColumn: keyof KanbanBoard, toColumn: keyof KanbanBoard) => {
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

  // Delete Kanban Task
  const deleteTask = (taskId: string, column: keyof KanbanBoard) => {
    const updated = {
      ...kanbanTasks,
      [column]: kanbanTasks[column].filter(t => t.id !== taskId)
    };
    setKanbanTasks(updated);
    saveToStorage('lms_kanban', updated);
    updateNotifications();
  };

  // TileButton Component
  const TileButton = ({ icon: Icon, label, onClick, color, notifications }: any) => (
    <button
      onClick={onClick}
      className="tile-button relative overflow-hidden p-0 transition-all hover:opacity-90 aspect-square flex flex-col items-center justify-center rounded-2xl"
      style={{ backgroundColor: color }}
    >
      <Icon className="w-16 h-16 mb-2" strokeWidth={1.5} />
      <div className="text-base font-medium tracking-wide">{label}</div>
      {notifications > 0 && (
        <div className="notification-badge">
          {notifications}
        </div>
      )}
    </button>
  );

  // Authentication UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4" style={{ zoom: `${zoom}%` }}>
        <Card className="card-organic w-full max-w-md p-8 border-2 border-orange-200">
          <div className="flex items-center justify-center mb-8">
            <Shield className="w-20 h-20 text-orange-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-bold text-center mb-12 text-orange-900">Metro LMS</h1>

          {!isRegistering ? (
            <div className="space-y-6">
              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">Access Code</label>
                <Input
                  type="password"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="Enter your access code"
                  className="w-full p-4 border-2 border-orange-200 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">2FA Code</label>
                <Input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full p-4 border-2 border-orange-200 focus:border-orange-500"
                />
              </div>

              <Button onClick={handleLogin} className="w-full btn-organic">
                Login
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-orange-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <Button onClick={startRegistration} variant="outline" className="w-full">
                Create New Account
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Scan this QR code with your authenticator app:</p>
                {qrCodeUrl && (
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto mb-4 border-2 border-orange-200 p-2 rounded-lg" />
                )}
              </div>

              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">Access Code</label>
                <Input
                  type="text"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="Choose an access code"
                  className="w-full p-4 border-2 border-orange-200"
                />
              </div>

              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">2FA Code</label>
                <Input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full p-4 border-2 border-orange-200"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleRegister} className="flex-1 btn-organic">
                  Register
                </Button>
                <Button onClick={() => setIsRegistering(false)} variant="outline" className="flex-1">
                  Back
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className={isDarkMode ? 'dark' : ''} style={{ zoom: `${zoom}%` }}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="bg-white dark:bg-card border-b-2 border-secondary sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">Metro LMS</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Accessibility Controls */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Accessibility Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold">Zoom Level: {zoom}%</label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setZoom(Math.max(75, zoom - 10))}
                        >
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setZoom(100)}
                        >
                          Reset
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setZoom(Math.min(150, zoom + 10))}
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold">Dark Mode</label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsDarkMode(!isDarkMode)}
                      >
                        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-2 mb-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="books">Books</TabsTrigger>
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="kanban">Tasks</TabsTrigger>
              <TabsTrigger value="p2p">P2P</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>

            {/* Dashboard Section */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <TileButton
                  icon={Book}
                  label="Books"
                  onClick={() => setActiveSection('books')}
                  color="#D97757"
                  notifications={tileNotifications.books}
                />
                <TileButton
                  icon={FileText}
                  label="Research"
                  onClick={() => setActiveSection('research')}
                  color="#C9624D"
                  notifications={tileNotifications.research}
                />
                <TileButton
                  icon={Video}
                  label="Courses"
                  onClick={() => setActiveSection('courses')}
                  color="#8B7355"
                  notifications={tileNotifications.courses}
                />
                <TileButton
                  icon={Layout}
                  label="Kanban"
                  onClick={() => setActiveSection('kanban')}
                  color="#F4D35E"
                  notifications={tileNotifications.kanban}
                />
                <TileButton
                  icon={Users}
                  label="P2P"
                  onClick={() => setActiveSection('p2p')}
                  color="#D97757"
                  notifications={tileNotifications.p2p}
                />
                <TileButton
                  icon={Calendar}
                  label="Meetings"
                  onClick={() => setActiveSection('meetings')}
                  color="#C9624D"
                  notifications={tileNotifications.meetings}
                />
                <TileButton
                  icon={Brain}
                  label="AI Chat"
                  onClick={() => setActiveSection('ai')}
                  color="#8B7355"
                  notifications={tileNotifications.ai}
                />
                <TileButton
                  icon={TrendingUp}
                  label="Statistics"
                  onClick={() => setActiveSection('stats')}
                  color="#F4D35E"
                  notifications={tileNotifications.stats}
                />
              </div>
            </TabsContent>

            {/* Books Section */}
            <TabsContent value="books" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Books</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="btn-organic">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Book
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Book</DialogTitle>
                    </DialogHeader>
                    <AddBookForm onAdd={addBook} />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.map(book => (
                  <Card key={book.id} className="card-organic p-4">
                    <h3 className="font-bold text-lg mb-2">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">{book.pages} pages</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Added: {new Date(book.addedAt).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Research Section */}
            <TabsContent value="research" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Research Items</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="btn-organic">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Research
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Research Item</DialogTitle>
                    </DialogHeader>
                    <AddResearchForm onAdd={addResearch} />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {research.map(item => (
                  <Card key={item.id} className="card-organic p-4">
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Added: {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Courses Section */}
            <TabsContent value="courses" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Courses</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="btn-organic">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Course</DialogTitle>
                    </DialogHeader>
                    <AddCourseForm onAdd={addCourse} />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                  <Card key={course.id} className="card-organic p-4">
                    <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {course.students} students
                    </p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Kanban Section */}
            <TabsContent value="kanban" className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Task Board</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['todo', 'inProgress', 'done'] as const).map(column => (
                  <div key={column} className="bg-secondary rounded-2xl p-4">
                    <h3 className="font-bold text-lg mb-4 capitalize">
                      {column === 'todo' ? 'To Do' : column === 'inProgress' ? 'In Progress' : 'Done'}
                    </h3>
                    <div className="space-y-2 mb-4">
                      {kanbanTasks[column].map(task => (
                        <Card key={task.id} className="card-organic p-3 cursor-move">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm flex-1">{task.text}</p>
                            <button
                              onClick={() => deleteTask(task.id, column)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Task</DialogTitle>
                        </DialogHeader>
                        <AddTaskForm
                          onAdd={(task) => {
                            addKanbanTask(column, task);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* P2P Section */}
            <TabsContent value="p2p" className="space-y-4">
              <h2 className="text-2xl font-bold">Peer Network</h2>
              <p className="text-muted-foreground">Connect with other learners and share knowledge</p>
            </TabsContent>

            {/* Meetings Section */}
            <TabsContent value="meetings" className="space-y-4">
              <h2 className="text-2xl font-bold">Meetings</h2>
              <p className="text-muted-foreground">Schedule and manage your learning sessions</p>
            </TabsContent>

            {/* AI Section */}
            <TabsContent value="ai" className="space-y-4">
              <h2 className="text-2xl font-bold">AI Learning Assistant</h2>
              <div className="bg-secondary rounded-2xl p-4">
                <p className="text-muted-foreground mb-4">Ask questions and get AI-powered learning assistance</p>
                <div className="space-y-2">
                  {aiHistory.map(msg => (
                    <Card key={msg.id} className="card-organic p-3">
                      <p className="text-sm font-semibold mb-1">Q: {msg.query}</p>
                      <p className="text-sm text-muted-foreground">A: {msg.response}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Statistics Section */}
            <TabsContent value="stats" className="space-y-4">
              <h2 className="text-2xl font-bold">Learning Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="card-organic p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{books.length}</p>
                  <p className="text-sm text-muted-foreground">Books</p>
                </Card>
                <Card className="card-organic p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{research.length}</p>
                  <p className="text-sm text-muted-foreground">Research Items</p>
                </Card>
                <Card className="card-organic p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{courses.length}</p>
                  <p className="text-sm text-muted-foreground">Courses</p>
                </Card>
                <Card className="card-organic p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{kanbanTasks.done.length}</p>
                  <p className="text-sm text-muted-foreground">Tasks Done</p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

// Form Components
const AddBookForm: React.FC<{ onAdd: (title: string, pages: number) => void }> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState('');

  return (
    <div className="space-y-4">
      <Input
        placeholder="Book title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Number of pages"
        value={pages}
        onChange={(e) => setPages(e.target.value)}
      />
      <Button
        onClick={() => {
          if (title && pages) {
            onAdd(title, parseInt(pages));
            setTitle('');
            setPages('');
          }
        }}
        className="w-full btn-organic"
      >
        Add Book
      </Button>
    </div>
  );
};

const AddResearchForm: React.FC<{ onAdd: (title: string, type: string) => void }> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('article');

  return (
    <div className="space-y-4">
      <Input
        placeholder="Research title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full p-2 border-2 border-secondary rounded-lg"
      >
        <option value="article">Article</option>
        <option value="paper">Paper</option>
        <option value="book">Book</option>
        <option value="video">Video</option>
      </select>
      <Button
        onClick={() => {
          if (title) {
            onAdd(title, type);
            setTitle('');
          }
        }}
        className="w-full btn-organic"
      >
        Add Research
      </Button>
    </div>
  );
};

const AddCourseForm: React.FC<{ onAdd: (title: string, description: string) => void }> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="space-y-4">
      <Input
        placeholder="Course title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        placeholder="Course description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button
        onClick={() => {
          if (title && description) {
            onAdd(title, description);
            setTitle('');
            setDescription('');
          }
        }}
        className="w-full btn-organic"
      >
        Create Course
      </Button>
    </div>
  );
};

const AddTaskForm: React.FC<{ onAdd: (task: string) => void }> = ({ onAdd }) => {
  const [task, setTask] = useState('');

  return (
    <div className="space-y-4">
      <Input
        placeholder="Task description"
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />
      <Button
        onClick={() => {
          if (task) {
            onAdd(task);
            setTask('');
          }
        }}
        className="w-full btn-organic"
      >
        Add Task
      </Button>
    </div>
  );
};
