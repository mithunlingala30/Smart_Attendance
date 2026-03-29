import React, { useState, useEffect } from 'react';
import { Camera, UserPlus, Mail, AlertCircle, CheckCircle, BookOpen, Users, LogOut, TrendingDown } from 'lucide-react';
import './App.css';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [faculty, setFaculty] = useState({ name: '', email: '' });
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState({});
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [animateIn, setAnimateIn] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState({});

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setFaculty({
      name: formData.get('name'),
      email: formData.get('email')
    });
    setIsLoggedIn(true);
  };

  // Add subject
  const addSubject = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSubject = {
      id: Date.now(),
      name: formData.get('subjectName'),
      code: formData.get('subjectCode'),
      totalSessions: 0,
      sessionDates: []
    };
    setSubjects([...subjects, newSubject]);
    setStudents({ ...students, [newSubject.id]: [] });
    e.target.reset();
  };

  // Add student
  const addStudent = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newStudent = {
      id: Date.now(),
      rollNumber: formData.get('rollNumber'),
      name: formData.get('studentName'),
      email: formData.get('studentEmail'),
      attendance: []
    };
    
    const updatedStudents = {
      ...students,
      [selectedSubject.id]: [...(students[selectedSubject.id] || []), newStudent]
    };
    setStudents(updatedStudents);
    setShowAddStudent(false);
    e.target.reset();
    
    addNotification('success', `Student ${newStudent.name} added successfully`);
  };

  // Handle attendance state change
  const handleAttendanceChange = (studentId, status) => {
    setCurrentAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };
  // Submit attendance for the whole class
  const submitAttendance = () => {
    if (!selectedSubject) return;

    const today = new Date().toISOString().split('T')[0];
    const sessionId = Date.now();
    const updatedStudents = { ...students };
    const subjectStudents = updatedStudents[selectedSubject.id] || [];

    let updatedCount = 0;
    subjectStudents.forEach(student => {
      const status = currentAttendance[student.id];
      // If status is present or absent, record it for this session
      // If NOT marked, it defaults to 'absent' for this session record
      const finalStatus = status || 'absent';
      student.attendance.push({ 
        sessionId,
        date: today, 
        status: finalStatus 
      });
      if (finalStatus === 'present') updatedCount++;
    });

    // Always increment subject session count on Submit
    const updatedSubjects = subjects.map(s => 
      s.id === selectedSubject.id 
        ? { 
            ...s, 
            totalSessions: s.totalSessions + 1,
            sessionDates: [...s.sessionDates, today] 
          }
        : s
    );
    setSubjects(updatedSubjects);
    setSelectedSubject(prev => ({ 
      ...prev, 
      totalSessions: prev.totalSessions + 1,
      sessionDates: [...prev.sessionDates, today] 
    }));

    setStudents(updatedStudents);
    setCurrentAttendance({});
    addNotification('success', `Session recorded! Attendance submitted for ${subjectStudents.length} students`);
  };

  // Send manual alert (Simulated)
  const sendManualAlert = (student, subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    const percentage = calculateAttendance(student, subject);
    
    addNotification('warning', `Simulation: Alert "sent" to ${student.name}`);
    
    console.log(`%c[SIMULATED EMAIL SYSTEM]`, 'color: #3b82f6; font-weight: bold;');
    console.log(`Recipient: ${student.email}`);
    console.log(`Subject: Important - Low Attendance in ${subject.name}`);
    console.log(`Body: Hello ${student.name}, your attendance is currently ${percentage}%. Please ensure regular attendance.`);
    console.log(`%cNote: This is a frontend simulation. No actual email was sent.`, 'color: #64748b; font-style: italic;');
  };

  // Add notification
  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type,
      message
    };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Calculate attendance percentage
  const calculateAttendance = (student, subject) => {
    if (!subject || subject.totalSessions === 0) return 0;
    const presentCount = student.attendance.filter(a => a.status === 'present').length;
    return Math.round((presentCount / subject.totalSessions) * 100);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className={`login-card ${animateIn ? 'animate-in' : ''}`}>
          <div className="login-header">
            <Camera size={48} />
            <h1>Smart Attendance</h1>
            <p>Faculty Portal</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Faculty Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter your name" 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Faculty Email</label>
              <input 
                type="email" 
                name="email" 
                placeholder="Enter your email" 
                required 
              />
            </div>
            
            <button type="submit" className="login-btn">
              Login to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <Camera size={32} />
            <div>
              <h1>Smart Attendance</h1>
              <p>Welcome, {faculty.name}</p>
            </div>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="logout-btn">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Notifications */}
      <div className="notifications">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification ${notif.type}`}>
            {notif.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{notif.message}</span>
          </div>
        ))}
      </div>

      <div className="content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>
              <BookOpen size={20} />
              Subjects
            </h3>
            
            <form onSubmit={addSubject} className="add-subject-form">
              <input 
                type="text" 
                name="subjectName" 
                placeholder="Subject Name" 
                required 
              />
              <input 
                type="text" 
                name="subjectCode" 
                placeholder="Code" 
                required 
              />
              <button type="submit">Add Subject</button>
            </form>

            <div className="subject-list">
              {subjects.map(subject => (
                <div 
                  key={subject.id}
                  className={`subject-item ${selectedSubject?.id === subject.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedSubject(subject);
                    setCurrentAttendance({});
                  }}
                >
                  <div className="subject-info">
                    <strong>{subject.name}</strong>
                    <span>{subject.code}</span>
                  </div>
                  <div className="student-count">
                    {students[subject.id]?.length || 0} students
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {!selectedSubject ? (
            <div className="empty-state">
              <BookOpen size={64} />
              <h2>Select a Subject</h2>
              <p>Choose a subject from the sidebar to manage students and attendance</p>
            </div>
          ) : (
            <>
              <div className="subject-header">
                <div>
                  <h2>{selectedSubject.name}</h2>
                  <p className="subject-code">{selectedSubject.code}</p>
                </div>
                <div className="header-actions">
                  <button 
                    onClick={submitAttendance}
                    className="submit-all-btn"
                    disabled={Object.keys(currentAttendance).length === 0}
                  >
                    <CheckCircle size={18} />
                    Submit Today's Attendance
                  </button>
                  <button 
                    onClick={() => setShowAddStudent(true)}
                    className="add-student-btn"
                  >
                    <UserPlus size={18} />
                    Add Student
                  </button>
                </div>
              </div>

              {/* Add Student Modal */}
              {showAddStudent && (
                <div className="modal-overlay" onClick={() => setShowAddStudent(false)}>
                  <div className="modal" onClick={e => e.stopPropagation()}>
                    <h3>Add New Student</h3>
                    <form onSubmit={addStudent}>
                      <div className="form-group">
                        <label>Roll Number</label>
                        <input type="text" name="rollNumber" required />
                      </div>
                      <div className="form-group">
                        <label>Student Name</label>
                        <input type="text" name="studentName" required />
                      </div>
                      <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="studentEmail" required />
                      </div>
                      <div className="modal-actions">
                        <button type="button" onClick={() => setShowAddStudent(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="primary">
                          Add Student
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Student List */}
              <div className="student-grid">
                {(students[selectedSubject.id] || []).map(student => {
                  const attendance = calculateAttendance(student, selectedSubject);
                  const isLow = attendance < 75 && selectedSubject.totalSessions > 0;
                  
                  return (
                    <div key={student.id} className={`student-card ${isLow ? 'low-attendance' : ''}`}>
                      <div className="student-header">
                        <div className="student-info">
                          <h4>{student.name}</h4>
                          <p className="roll-number">Roll: {student.rollNumber}</p>
                          <p className="email">
                            <Mail size={14} />
                            {student.email}
                          </p>
                        </div>
                        <div className={`attendance-badge ${isLow ? 'low' : 'good'}`}>
                          {isLow && <TrendingDown size={16} />}
                          {attendance}%
                        </div>
                        <button 
                          onClick={() => sendManualAlert(student, selectedSubject.id)}
                          className="alert-btn"
                          title="Send Email Alert"
                        >
                          <Mail size={16} />
                        </button>
                      </div>
                      
                      <div className="attendance-bar">
                        <div 
                          className="attendance-fill" 
                          style={{ 
                            width: `${attendance}%`,
                            backgroundColor: isLow ? '#ef4444' : '#10b981'
                          }}
                        />
                      </div>
                      
                      
                      <div className="attendance-actions">
                        <div className="status-buttons">
                          <button 
                            onClick={() => handleAttendanceChange(student.id, 'present')}
                            className={`status-btn present ${currentAttendance[student.id] === 'present' ? 'active' : ''}`}
                          >
                            Present
                          </button>
                          <button 
                            onClick={() => handleAttendanceChange(student.id, 'absent')}
                            className={`status-btn absent ${currentAttendance[student.id] === 'absent' ? 'active' : ''}`}
                          >
                            Absent
                          </button>
                        </div>
                        <span className="attendance-count">
                          {student.attendance.filter(a => a.status === 'present').length} / {selectedSubject.totalSessions} classes
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {(!students[selectedSubject.id] || students[selectedSubject.id].length === 0) && (
                  <div className="empty-students">
                    <Users size={48} />
                    <p>No students added yet</p>
                    <button onClick={() => setShowAddStudent(true)}>
                      Add First Student
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
