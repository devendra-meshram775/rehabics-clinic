import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Activity, Calendar, Clock, User, Phone, Mail, MapPin, Award, 
  CheckCircle, ChevronRight, Menu, X, Shield, Star, FileText, 
  Settings, LogIn, UserPlus, LogOut, Heart, ArrowRight, Filter, 
  Search, Plus, Edit, Trash2, AlertCircle, MessageSquare, Send, 
  Briefcase, Check, Users, ChevronDown, Bell, Eye, Lock, RefreshCw
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut 
} from 'firebase/auth';
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, collection, 
  onSnapshot, addDoc, query 
} from 'firebase/firestore';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "demo-api-key",
  authDomain: "rehabics-demo.firebaseapp.com",
  projectId: "rehabics-demo",
  storageBucket: "rehabics-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'rehabics-clinic-app';

// Initial Mock Seed Data for Default Clinic Setup
const INITIAL_SERVICES = [
  { id: 'serv-1', name: 'Physiotherapy', duration: '45 mins', price: '$80', icon: 'Activity', desc: 'Personalized treatment programs designed to improve movement, reduce discomfort and restore body function.', approach: 'Targeted joint mobilization, neuromuscular re-education, and tailored therapeutic exercises.', benefits: ['Discomfort relief', 'Increased mobility', 'Enhanced functional independence'], status: 'Active' },
  { id: 'serv-2', name: 'Sports Rehabilitation', duration: '60 mins', price: '$110', icon: 'Award', desc: 'High-performance recovery programs for athletes and active individuals returning to peak competition.', approach: 'Biomechanics analysis, sport-specific load training, and plyometrics recovery.', benefits: ['Accelerated return-to-sport', 'Injury prevention protocols', 'Power and agility restoration'], status: 'Active' },
  { id: 'serv-3', name: 'Orthopedic Rehabilitation', duration: '50 mins', price: '$95', icon: 'Heart', desc: 'Structured rehabilitation following joint replacements, fractures, ligament tears, and chronic conditions.', approach: 'Controlled joint loading, scar tissue release, and targeted muscle activation.', benefits: ['Accelerated tissue recovery', 'Swelling reduction', 'Restored joint mechanics'], status: 'Active' },
  { id: 'serv-4', name: 'Post-Surgery Recovery', duration: '45 mins', price: '$90', icon: 'CheckCircle', desc: 'Progressive phase-based recovery plans designed in alignment with surgical protocol requirements.', approach: 'Gentle passive range-of-motion gradually advancing to functional strengthening.', benefits: ['Reduced surgical stiffness', 'Minimised scar tissue formation', 'Safe recovery timeline'], status: 'Active' },
  { id: 'serv-5', name: 'Neuro Rehabilitation', duration: '60 mins', price: '$120', icon: 'Shield', desc: 'Specialized therapy focused on improving mobility, balance, and independence for neurological conditions.', approach: 'Proprioceptive training, gait re-training, and motor skill re-learning.', benefits: ['Improved balance and coordination', 'Neuroplasticity stimulation', 'Fall risk mitigation'], status: 'Active' },
  { id: 'serv-6', name: 'Spine & Pain Management', duration: '45 mins', price: '$85', icon: 'Activity', desc: 'Comprehensive spine care addressing chronic back discomfort, sciatica, neck stiffness, and postural alignment.', approach: 'Spinal decompression techniques, core stabilization, and ergonomic correction.', benefits: ['Long-term pain relief', 'Postural alignment', 'Core stability reinforcement'], status: 'Active' },
];

const INITIAL_THERAPISTS = [
  { id: 'doc-1', name: 'Dr. Sarah Jenkins', title: 'Lead Physiotherapist', qualification: 'DPT, OCS, CMPT', spec: 'Orthopedic & Post-Surgery', exp: '12+ Years', rating: 4.9, bio: 'Specializes in complex joint rehabilitation and sports injury recovery with evidence-based biomechanical approaches.', workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], workHours: '08:00 AM - 05:00 PM', image: 'https://images.unsplash.com/photo-1594824813566-818231288210?auto=format&fit=crop&q=80&w=400', status: 'Active' },
  { id: 'doc-2', name: 'Dr. Marcus Vance', title: 'Sports Rehab Specialist', qualification: 'DPT, SCS, CSCS', spec: 'Sports Injury & Athletic Performance', exp: '9+ Years', rating: 4.95, bio: 'Former Olympic team physical therapist dedicated to getting athletes back to peak athletic output quickly and safely.', workDays: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat'], workHours: '09:00 AM - 06:00 PM', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400', status: 'Active' },
  { id: 'doc-3', name: 'Dr. Elena Rostova', title: 'Neuro Physio Specialist', qualification: 'Ph.D., PT, NCS', spec: 'Neurological & Gait Rehabilitation', exp: '14+ Years', rating: 4.88, bio: 'Passionate clinician restoring movement quality and confidence in neuro-rehabilitation and balance recovery.', workDays: ['Tue', 'Wed', 'Fri', 'Sat'], workHours: '08:30 AM - 04:30 PM', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400', status: 'Active' },
  { id: 'doc-4', name: 'Dr. David Chen', title: 'Spine & Manual Therapist', qualification: 'DPT, FAAOMPT', spec: 'Spine Care & Chronic Pain', exp: '10+ Years', rating: 4.92, bio: 'Expert in manual spinal manipulation, dry needling, and corrective spinal stabilization exercise.', workDays: ['Mon', 'Tue', 'Thu', 'Fri'], workHours: '09:00 AM - 05:30 PM', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400', status: 'Active' }
];

const INITIAL_FAQS = [
  { q: "What should I bring to my initial physiotherapy consultation?", a: "Please bring comfortable, athletic attire that allows full movement, any relevant doctor referrals, MRI or X-ray reports, insurance details, and a list of current medications." },
  { q: "How long is a typical therapy session at Rehabics?", a: "Initial comprehensive evaluations typically take 60 minutes. Subsequent treatment sessions run between 45 to 60 minutes depending on your tailored program." },
  { q: "Do I need a doctor's referral to book an appointment?", a: "In most regions, direct access allows you to book directly with our licensed physical therapists without a prior referral. Some insurance plans may require one for reimbursement." },
  { q: "How does the real-time slot booking system work?", a: "Our booking system connects directly to therapist live schedules. Time slots already reserved by patients are immediately hidden to eliminate double bookings." },
  { q: "Can I reschedule or cancel my appointment online?", a: "Yes, registered patients can manage, reschedule, or cancel their upcoming appointments directly through their Patient Dashboard up to 12 hours before the appointment time." }
];

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('home'); // home, services, doctors, book, contact, login, signup, patient-dash, admin-dash
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState(null);
  const [selectedTherapistDetail, setSelectedTherapistDetail] = useState(null);

  // App Master Data (Synced with Firebase Firestore or fallback LocalStorage)
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [therapists, setTherapists] = useState(INITIAL_THERAPISTS);
  const [appointments, setAppointments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // Auth User State
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('guest'); // guest, patient, admin
  const [patientProfile, setPatientProfile] = useState({
    fullName: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 234-5678',
    dob: '1992-06-15',
    gender: 'Male'
  });

  // Booking Flow State
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    serviceId: '',
    therapistId: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '',
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    reason: '',
    message: ''
  });
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Admin Dashboard Filters & Tab State
  const [adminTab, setAdminTab] = useState('appointments'); // appointments, leads, therapists, services
  const [apptSearch, setApptSearch] = useState('');
  const [apptFilterStatus, setApptFilterStatus] = useState('All');

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', service: 'General Inquiry', message: '' });

  // Show Toast Alert
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn("Auth initialization notice:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      if (currUser) {
        setUser(currUser);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Load local storage fallback initially
    const savedAppts = localStorage.getItem('rehabics_appts');
    if (savedAppts) setAppointments(JSON.parse(savedAppts));
    
    const savedLeads = localStorage.getItem('rehabics_leads');
    if (savedLeads) setLeads(JSON.parse(savedLeads));

    if (!user) return;

    // Listen to Public Appointments
    const apptsRef = collection(db, 'artifacts', appId, 'public', 'data', 'appointments');
    const unsubAppts = onSnapshot(apptsRef, (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAppointments(list);
        localStorage.setItem('rehabics_appts', JSON.stringify(list));
      }
    }, (err) => console.log("Appointments snapshot active locally"));

    // Listen to Leads
    const leadsRef = collection(db, 'artifacts', appId, 'public', 'data', 'leads');
    const unsubLeads = onSnapshot(leadsRef, (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeads(list);
        localStorage.setItem('rehabics_leads', JSON.stringify(list));
      }
    }, (err) => console.log("Leads snapshot active locally"));

    return () => {
      unsubAppts();
      unsubLeads();
    };
  }, [user]);

  // Sync state changes to local storage as fallback
  useEffect(() => {
    localStorage.setItem('rehabics_appts', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('rehabics_leads', JSON.stringify(leads));
  }, [leads]);

  // Dynamically calculate available timeslots for selected doctor and date
  const availableTimeSlots = useMemo(() => {
    if (!bookingData.therapistId || !bookingData.date) return [];
    
    const defaultDaySlots = [
      '08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM', 
      '11:30 AM', '01:30 PM', '02:15 PM', '03:00 PM', '03:45 PM', '04:30 PM'
    ];

    // Find existing booked slots for this therapist and date
    const bookedForDay = appointments
      .filter(a => a.therapistId === bookingData.therapistId && a.date === bookingData.date && a.status !== 'Cancelled')
      .map(a => a.timeSlot);

    return defaultDaySlots.map(slot => ({
      time: slot,
      isAvailable: !bookedForDay.includes(slot)
    }));
  }, [bookingData.therapistId, bookingData.date, appointments]);

  // Step navigation helper for booking
  const handleSelectService = (servId) => {
    setBookingData(prev => ({ ...prev, serviceId: servId }));
    setBookingStep(2);
    setActiveTab('book');
  };

  const handleSelectTherapist = (docId) => {
    setBookingData(prev => ({ ...prev, therapistId: docId }));
    setBookingStep(3);
    setActiveTab('book');
  };

  // Submit Final Appointment
  const handleConfirmAppointment = async (e) => {
    e.preventDefault();
    if (!bookingData.timeSlot) {
      showToast('Please select an available time slot', 'error');
      return;
    }

    const apptId = 'REHAB-' + Math.floor(100000 + Math.random() * 900000);
    const selectedServ = services.find(s => s.id === bookingData.serviceId);
    const selectedDoc = therapists.find(t => t.id === bookingData.therapistId);

    const newAppointment = {
      id: apptId,
      patientId: user ? user.uid : 'guest-pt-' + Date.now(),
      serviceId: bookingData.serviceId,
      serviceName: selectedServ ? selectedServ.name : 'Physical Therapy',
      therapistId: bookingData.therapistId,
      therapistName: selectedDoc ? selectedDoc.name : 'Dr. Sarah Jenkins',
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      patientName: bookingData.fullName || patientProfile.fullName,
      email: bookingData.email || patientProfile.email,
      phone: bookingData.phone || patientProfile.phone,
      gender: bookingData.gender,
      reason: bookingData.reason,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    // Save locally
    setAppointments(prev => [newAppointment, ...prev]);

    // Save to Firestore if available
    try {
      if (user) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appointments', apptId), newAppointment);
      }
    } catch (err) {
      console.log('Saved to memory local database');
    }

    setConfirmedBooking(newAppointment);
    setBookingStep(7); // Show confirmation view
    showToast('Appointment successfully booked!');

    // Add automatically as Lead
    const newLead = {
      id: 'lead-' + Date.now(),
      name: newAppointment.patientName,
      email: newAppointment.email,
      phone: newAppointment.phone,
      service: newAppointment.serviceName,
      source: 'Online Booking System',
      message: `Appointment ID: ${newAppointment.id} on ${newAppointment.date} at ${newAppointment.timeSlot}`,
      status: 'Converted',
      createdAt: new Date().toISOString()
    };
    setLeads(prev => [newLead, ...prev]);
  };

  // Submit Contact Form as Lead
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    const newLead = {
      id: 'lead-' + Date.now(),
      name: contactForm.name,
      email: contactForm.email,
      phone: contactForm.phone || 'N/A',
      service: contactForm.service,
      source: 'Contact Form Inquiry',
      message: contactForm.message,
      status: 'New',
      createdAt: new Date().toISOString()
    };

    setLeads(prev => [newLead, ...prev]);

    try {
      if (user) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'leads', newLead.id), newLead);
      }
    } catch (err) {
      console.log('Lead stored locally');
    }

    showToast('Thank you! Our clinical team will reach out shortly.');
    setContactForm({ name: '', email: '', phone: '', service: 'General Inquiry', message: '' });
  };

  // Login simulation handler
  const handleLoginSubmit = (email, password) => {
    if (email === 'admin@rehabics.com' && password === 'admin123') {
      setUserRole('admin');
      setActiveTab('admin-dash');
      showToast('Welcome back, Admin Portal active.');
    } else {
      setUserRole('patient');
      setActiveTab('patient-dash');
      showToast('Patient Account logged in successfully.');
    }
  };

  // Status Change for Admin
  const handleUpdateApptStatus = (apptId, newStatus) => {
    setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: newStatus } : a));
    showToast(`Appointment status updated to ${newStatus}`);
  };

  const handleUpdateLeadStatus = (leadId, newStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    showToast(`Lead status updated to ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Toast Notification Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 transform translate-y-0 ${
          toast.type === 'error' ? 'bg-red-900 border-red-700 text-red-100' : 'bg-slate-900 border-slate-700 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-teal-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Clinic Info Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-teal-400" /> +1 (800) 555-REHAB</span>
          <span className="hidden md:flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-400" /> 450 Medical Plaza, Suite 200, City Health District</span>
        </div>
        <div className="flex items-center gap-4 mt-1 sm:mt-0">
          <span className="text-teal-400 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Mon-Sat: 8:00 AM - 7:00 PM</span>
          <button onClick={() => { setActiveTab('login'); }} className="hover:text-white transition">Portal Access</button>
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-11 h-11 bg-gradient-to-tr from-teal-600 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900">REHAB<span className="text-teal-600">ICS</span></span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 -mt-1">Clinic & Wellness</span>
            </div>
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {['home', 'services', 'doctors', 'contact'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`capitalize transition-colors hover:text-teal-600 relative py-1 ${activeTab === tab ? 'text-teal-600 font-bold' : ''}`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {userRole === 'guest' ? (
              <>
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-teal-600 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setBookingStep(1);
                    setActiveTab('book');
                  }}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl shadow-md hover:shadow-lg hover:from-teal-700 hover:to-emerald-700 transition flex items-center gap-2 transform active:scale-95"
                >
                  <Calendar className="w-4 h-4" /> Book Appointment
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab(userRole === 'admin' ? 'admin-dash' : 'patient-dash')}
                  className="px-4 py-2 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200 transition flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> {userRole === 'admin' ? 'Admin Portal' : 'Patient Dashboard'}
                </button>
                <button
                  onClick={() => {
                    setUserRole('guest');
                    setActiveTab('home');
                    showToast('Logged out');
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 transition rounded-lg"
                  title="Log Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Animated Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl animate-fadeIn">
            {['home', 'services', 'doctors', 'contact'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 text-base font-semibold capitalize ${activeTab === tab ? 'text-teal-600' : 'text-slate-700'}`}
              >
                {tab}
              </button>
            ))}
            <hr className="border-slate-100" />
            {userRole === 'guest' ? (
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => { setActiveTab('login'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 text-center font-semibold text-slate-700 border border-slate-200 rounded-xl"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setBookingStep(1); setActiveTab('book'); setMobileMenuOpen(false); }}
                  className="w-full py-3 text-center font-bold text-white bg-teal-600 rounded-xl shadow-md"
                >
                  Book Appointment
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveTab(userRole === 'admin' ? 'admin-dash' : 'patient-dash');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 text-center font-bold text-teal-700 bg-teal-50 rounded-xl border border-teal-200"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        )}
      </header>

      {}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <div className="space-y-24 pb-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold tracking-wide uppercase">
                      <Shield className="w-3.5 h-3.5" /> Certified Rehabilitation Excellence
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                      Move Better. <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300">
                        Recover Stronger.
                      </span> <br />
                      Live Without Limits.
                    </h1>

                    <p className="text-slate-300 text-lg sm:text-xl max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
                      Personalized physiotherapy and sports rehabilitation programs designed to help you recover, rebuild strength, and confidently return to the activities you love.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                      <button
                        onClick={() => { setBookingStep(1); setActiveTab('book'); }}
                        className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-base"
                      >
                        <Calendar className="w-5 h-5" /> Schedule Appointment
                      </button>
                      <button
                        onClick={() => setActiveTab('services')}
                        className="px-8 py-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold rounded-2xl transition flex items-center justify-center gap-2 text-base"
                      >
                        Explore Services <ArrowRight className="w-4 h-4 text-teal-400" />
                      </button>
                    </div>

                    {/* Animated Statistics Counters */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-slate-800">
                      {[
                        { num: '10+', label: 'Years Clinical Exp.' },
                        { num: '5,000+', label: 'Patients Treated' },
                        { num: '15+', label: 'Specialized Therapies' },
                        { num: '4.9/5', label: 'Patient Rating' },
                      ].map((stat, idx) => (
                        <div key={idx} className="text-center lg:text-left">
                          <p className="text-2xl sm:text-3xl font-black text-white">{stat.num}</p>
                          <p className="text-xs text-slate-400 font-medium mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hero Visual Card */}
                  <div className="lg:col-span-5 relative">
                    <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 group">
                      <img
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
                        alt="Physiotherapy treatment session"
                        className="w-full h-[450px] object-cover group-hover:scale-105 transition duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 p-6 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/80 text-white shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center text-teal-400">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">Evidence-Based Clinical Recovery</p>
                            <p className="text-xs text-slate-300">Customized 1-on-1 therapist sessions</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                <span className="text-teal-600 font-bold text-xs uppercase tracking-wider">Why Choose Rehabics</span>
                <h2 className="text-3xl font-black text-slate-900">Trusted Care. Personalized Recovery.</h2>
                <p className="text-slate-600 text-sm">We combine cutting-edge sports biomechanics with compassionate, manual clinical care.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { title: 'Experienced Clinicians', desc: 'Board-certified physical therapists with specialist credentials in orthopedic & sports care.', icon: Users },
                  { title: 'Personalized Programs', desc: 'Customized treatment plans designed specifically around your recovery goals.', icon: Activity },
                  { title: 'Modern Facilities', desc: 'Equipped with advanced biomechanical testing and active rehabilitation tech.', icon: Shield },
                  { title: 'Patient-Centered Focus', desc: 'Direct 1-on-1 care with dedicated time spent on your manual assessment.', icon: Heart },
                ].map((card, i) => {
                  const IconComp = card.icon;
                  return (
                    <div key={i} className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 group">
                      <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition duration-300">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{card.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {}
            <section className="bg-slate-100/70 py-20 border-y border-slate-200/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                  <div>
                    <span className="text-teal-600 font-bold text-xs uppercase tracking-wider">Clinical Services</span>
                    <h2 className="text-3xl font-black text-slate-900 mt-1">Targeted Rehabilitation Programs</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('services')}
                    className="mt-4 md:mt-0 text-teal-600 hover:text-teal-700 font-bold text-sm flex items-center gap-1 group"
                  >
                    View All Services <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {services.slice(0, 6).map((serv) => (
                    <div key={serv.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between">
                      <div className="p-8 space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center font-bold">
                            <Activity className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{serv.duration}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{serv.name}</h3>
                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{serv.desc}</p>
                      </div>

                      <div className="px-8 pb-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => setSelectedServiceDetail(serv)}
                          className="text-xs font-bold text-slate-700 hover:text-teal-600 flex items-center gap-1"
                        >
                          Learn Details <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSelectService(serv.id)}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
                <span className="text-teal-600 font-bold text-xs uppercase tracking-wider">Our Specialist Team</span>
                <h2 className="text-3xl font-black text-slate-900">Meet Our Certified Therapists</h2>
                <p className="text-slate-600 text-sm">Dedicated clinical experts focused on guiding your pain-free return to lifestyle.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {therapists.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition duration-300 flex flex-col">
                    <img src={doc.image} alt={doc.name} className="w-full h-56 object-cover object-top" />
                    <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">{doc.name}</h3>
                            <p className="text-xs text-teal-600 font-semibold">{doc.title}</p>
                          </div>
                          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {doc.rating}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{doc.spec}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => setSelectedTherapistDetail(doc)}
                          className="text-xs font-bold text-slate-700 hover:text-teal-600"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => handleSelectTherapist(doc.id)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-teal-600 text-white font-bold text-xs rounded-lg transition"
                        >
                          Book Doctor
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {}
            <section className="bg-slate-900 text-white py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-teal-400 font-bold text-xs uppercase tracking-wider">Patient Recovery Stories</span>
                  <h2 className="text-3xl font-black">Trusted by Athletes & Families</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { name: 'Michael Thorne', role: 'Marathon Runner', text: 'Rehabics got me back to running pain-free in 6 weeks following a severe knee ligament sprain. Their sports rehab team is world-class.', rating: 5 },
                    { name: 'Elena Vance', role: 'Post-Surgery Patient', text: 'The structured post-operative protocol after my shoulder reconstruction gave me complete confidence at every step of recovery.', rating: 5 },
                    { name: 'David Miller', role: 'Executive', text: 'Years of chronic lower back discomfort resolved after working with Dr. Sarah. The online appointment system makes scheduling seamless.', rating: 5 },
                  ].map((rev, i) => (
                    <div key={i} className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700 space-y-4">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(rev.rating)].map((_, r) => (
                          <Star key={r} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed italic">"{rev.text}"</p>
                      <div>
                        <p className="font-bold text-white text-sm">{rev.name}</p>
                        <p className="text-xs text-teal-400">{rev.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ Accordion */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="text-center space-y-2">
                <span className="text-teal-600 font-bold text-xs uppercase tracking-wider">Common Questions</span>
                <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
              </div>

              <div className="space-y-4">
                {INITIAL_FAQS.map((faq, idx) => (
                  <details key={idx} className="group bg-white rounded-2xl border border-slate-200 p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-sm">
                    <summary className="flex items-center justify-between font-bold text-slate-900 text-base">
                      <span>{faq.q}</span>
                      <span className="ml-4 flex-shrink-0 text-slate-400 group-open:-rotate-180 transition duration-300">
                        <ChevronDown className="w-5 h-5" />
                      </span>
                    </summary>
                    <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          </div>
        )}

        {}
        {activeTab === 'services' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
            <div className="max-w-3xl space-y-4">
              <span className="text-teal-600 font-bold text-xs uppercase tracking-wider">Clinical Offerings</span>
              <h1 className="text-4xl font-black text-slate-900">Comprehensive Rehabilitation Services</h1>
              <p className="text-slate-600 text-base">Each service program begins with an extensive biomechanical analysis to address root causes of pain and restriction.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((serv) => (
                <div key={serv.id} className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm hover:shadow-xl transition">
                  <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-bold">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">{serv.duration} Session</span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{serv.name}</h3>
                    <p className="text-slate-600 text-sm mt-3 leading-relaxed">{serv.desc}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-700 uppercase">Key Recovery Benefits:</p>
                    {serv.benefits.map((b, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-teal-600" /> {b}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => setSelectedServiceDetail(serv)}
                      className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
                    >
                      Program Details
                    </button>
                    <button
                      onClick={() => handleSelectService(serv.id)}
                      className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition"
                    >
                      Book Program
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {activeTab === 'doctors' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
            <div className="max-w-3xl space-y-4">
              <span className="text-teal-600 font-bold text-xs uppercase tracking-wider">Clinical Team</span>
              <h1 className="text-4xl font-black text-slate-900">Meet Our Licensed Physical Therapists</h1>
              <p className="text-slate-600 text-base">Select a clinician based on specialization, clinical experience, and real-time open availability.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {therapists.map((doc) => (
                <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-lg transition">
                  <img src={doc.image} alt={doc.name} className="w-full sm:w-44 h-48 sm:h-auto object-cover rounded-xl" />
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{doc.name}</h3>
                          <p className="text-xs text-teal-600 font-semibold">{doc.title} • {doc.qualification}</p>
                        </div>
                        <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" /> {doc.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">Specialty: {doc.spec}</p>
                      <p className="text-sm text-slate-600 mt-3 line-clamp-3">{doc.bio}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-slate-700">Days:</span> {doc.workDays.join(', ')}
                      </div>
                      <button
                        onClick={() => handleSelectTherapist(doc.id)}
                        className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Select & Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {}
        {activeTab === 'book' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            {/* Booking Wizard Steps Progress */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                {['1. Service', '2. Therapist', '3. Date & Time', '4. Patient Info', '5. Confirm'].map((stepName, i) => (
                  <div key={i} className={`flex items-center gap-2 ${bookingStep > i ? 'text-teal-600' : ''}`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                      bookingStep === i + 1 ? 'bg-teal-600 text-white font-bold' : bookingStep > i + 1 ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="hidden sm:inline">{stepName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Select Service */}
            {bookingStep === 1 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Step 1: Select Your Treatment Service</h2>
                  <p className="text-sm text-slate-500 mt-1">Choose the physical therapy or rehabilitation program that best matches your needs.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {services.map((serv) => (
                    <div
                      key={serv.id}
                      onClick={() => handleSelectService(serv.id)}
                      className={`p-6 rounded-2xl border cursor-pointer transition ${
                        bookingData.serviceId === serv.id ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900 text-base">{serv.name}</h3>
                        <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2.5 py-0.5 rounded-full">{serv.duration}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2">{serv.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Therapist */}
            {bookingStep === 2 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Step 2: Choose Your Physical Therapist</h2>
                    <p className="text-sm text-slate-500 mt-1">Select a specialist for your consultation.</p>
                  </div>
                  <button onClick={() => setBookingStep(1)} className="text-xs font-bold text-teal-600 hover:underline">← Back</button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {therapists.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectTherapist(doc.id)}
                      className={`p-6 rounded-2xl border cursor-pointer transition flex items-center gap-4 ${
                        bookingData.therapistId === doc.id ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                      }`}
                    >
                      <img src={doc.image} alt={doc.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                        <p className="text-xs text-teal-600">{doc.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{doc.spec}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 & 4: Date & Dynamic Available Time Slots */}
            {(bookingStep === 3 || bookingStep === 4) && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Step 3 & 4: Select Date & Live Time Slot</h2>
                    <p className="text-sm text-slate-500 mt-1">Select an open slot. Reserved times are automatically filtered out.</p>
                  </div>
                  <button onClick={() => setBookingStep(2)} className="text-xs font-bold text-teal-600 hover:underline">← Back</button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-2">Select Preferred Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.date}
                      onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value, timeSlot: '' }))}
                      className="w-full p-3.5 border border-slate-300 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-2">Calculated Available Slots</label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                      {availableTimeSlots.map((slotObj, idx) => (
                        <button
                          key={idx}
                          disabled={!slotObj.isAvailable}
                          onClick={() => setBookingData(prev => ({ ...prev, timeSlot: slotObj.time }))}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                            !slotObj.isAvailable
                              ? 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                              : bookingData.timeSlot === slotObj.time
                              ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                              : 'bg-white border-slate-200 hover:border-teal-400 text-slate-800'
                          }`}
                        >
                          <span>{slotObj.time}</span>
                          {!slotObj.isAvailable && <span className="text-[10px] font-semibold text-red-400">Booked</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    disabled={!bookingData.timeSlot}
                    onClick={() => setBookingStep(5)}
                    className="px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition shadow"
                  >
                    Continue to Patient Info →
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Patient Details Form */}
            {bookingStep === 5 && (
              <form onSubmit={handleConfirmAppointment} className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Step 5: Patient Information</h2>
                    <p className="text-sm text-slate-500 mt-1">Please enter your contact details for appointment confirmation.</p>
                  </div>
                  <button type="button" onClick={() => setBookingStep(3)} className="text-xs font-bold text-teal-600 hover:underline">← Back</button>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={bookingData.fullName || patientProfile.fullName}
                      onChange={(e) => setBookingData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full p-3 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={bookingData.email || patientProfile.email}
                      onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={bookingData.phone || patientProfile.phone}
                      onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-3 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Gender</label>
                    <select
                      value={bookingData.gender}
                      onChange={(e) => setBookingData(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full p-3 border border-slate-300 rounded-xl text-sm"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other / Prefer not to say</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Reason for Visit / Symptoms</label>
                    <textarea
                      rows={3}
                      placeholder="Describe any knee stiffness, lower back pain, or post-surgery details..."
                      value={bookingData.reason}
                      onChange={(e) => setBookingData(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full p-3 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-4">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:from-teal-700 hover:to-emerald-700 transition"
                  >
                    Confirm & Reserve Slot
                  </button>
                </div>
              </form>
            )}

            {/* Step 7: Confirmation Ticket Pass */}
            {bookingStep === 7 && confirmedBooking && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-6 shadow-xl max-w-xl mx-auto animate-fadeIn">
                <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">Booking Confirmed</span>
                  <h2 className="text-3xl font-black text-slate-900 mt-1">Your Session is Reserved!</h2>
                  <p className="text-xs text-slate-500 mt-1">A confirmation record has been saved to the clinic database.</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Appointment ID:</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Service:</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.serviceName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Therapist:</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.therapistName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-medium">Date & Time:</span>
                    <span className="font-bold text-teal-700">{confirmedBooking.date} at {confirmedBooking.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Patient:</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.patientName}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={() => {
                      setUserRole('patient');
                      setActiveTab('patient-dash');
                    }}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                  >
                    View in Patient Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setBookingStep(1);
                      setActiveTab('home');
                    }}
                    className="flex-1 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'login' && (
          <div className="max-w-md mx-auto px-4 py-20">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-slate-900">Sign In to Rehabics</h2>
                <p className="text-xs text-slate-500">Access your appointments, medical notes, and rehab schedule.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    defaultValue="alex.rivera@example.com"
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Password</label>
                  <input
                    id="login-pass"
                    type="password"
                    defaultValue="password123"
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm"
                  />
                </div>

                <button
                  onClick={() => {
                    const email = document.getElementById('login-email').value;
                    const pass = document.getElementById('login-pass').value;
                    handleLoginSubmit(email, pass);
                  }}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow transition"
                >
                  Sign In to Account
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Quick Demo Credentials:</p>
                <p>• Patient Portal: <span className="font-mono text-teal-700">alex@example.com</span></p>
                <p>• Clinic Admin: <span className="font-mono text-teal-700">admin@rehabics.com</span> / <span className="font-mono text-teal-700">admin123</span></p>
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'patient-dash' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center font-black text-xl">
                  {patientProfile.fullName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900">{patientProfile.fullName}</h1>
                  <p className="text-xs text-slate-500">{patientProfile.email} • {patientProfile.phone}</p>
                </div>
              </div>
              <button
                onClick={() => { setBookingStep(1); setActiveTab('book'); }}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 self-start md:self-auto"
              >
                <Plus className="w-4 h-4" /> Book New Session
              </button>
            </div>

            {/* Dashboard Cards */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Upcoming Sessions</span>
                <p className="text-3xl font-black text-slate-900">
                  {appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending').length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Completed Sessions</span>
                <p className="text-3xl font-black text-slate-900">
                  {appointments.filter(a => a.status === 'Completed').length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Active Program</span>
                <p className="text-lg font-bold text-teal-600">Orthopedic Rehabilitation</p>
              </div>
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">My Appointments</h2>
              </div>

              {appointments.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">
                  You have no appointments booked yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  {appointments.map((appt) => (
                    <div key={appt.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{appt.serviceName}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {appt.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Therapist: {appt.therapistName} • ID: {appt.id}</p>
                        <p className="text-xs font-semibold text-teal-700">{appt.date} at {appt.timeSlot}</p>
                      </div>

                      {appt.status !== 'Cancelled' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleUpdateApptStatus(appt.id, 'Cancelled');
                            }}
                            className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl transition"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {activeTab === 'admin-dash' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-2xl shadow-md">
              <div>
                <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">Clinical Administration</span>
                <h1 className="text-2xl font-black">Rehabics Operations Center</h1>
              </div>
              <button
                onClick={() => { setUserRole('guest'); setActiveTab('home'); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
              >
                Exit Portal
              </button>
            </div>

            {/* Admin Stats Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Appointments</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{appointments.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Confirmed Sessions</span>
                <p className="text-3xl font-black text-teal-600 mt-1">{appointments.filter(a => a.status === 'Confirmed').length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Active Leads</span>
                <p className="text-3xl font-black text-emerald-600 mt-1">{leads.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Therapist Staff</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{therapists.length}</p>
              </div>
            </div>

            {/* Admin Nav Tabs */}
            <div className="flex gap-4 border-b border-slate-200 pb-2">
              {[
                { id: 'appointments', label: 'Appointments Manager' },
                { id: 'leads', label: 'Lead Pipeline' },
                { id: 'therapists', label: 'Therapist Roster' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    adminTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Admin View 1: Appointments Table */}
            {adminTab === 'appointments' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <input
                    type="text"
                    placeholder="Search patient, ID, or service..."
                    value={apptSearch}
                    onChange={(e) => setApptSearch(e.target.value)}
                    className="p-2.5 border border-slate-300 rounded-xl text-xs w-full sm:w-72"
                  />
                  <select
                    value={apptFilterStatus}
                    onChange={(e) => setApptFilterStatus(e.target.value)}
                    className="p-2.5 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3">ID / Patient</th>
                        <th className="p-3">Service</th>
                        <th className="p-3">Therapist</th>
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {appointments
                        .filter(a => apptFilterStatus === 'All' || a.status === apptFilterStatus)
                        .filter(a => a.patientName.toLowerCase().includes(apptSearch.toLowerCase()) || a.id.toLowerCase().includes(apptSearch.toLowerCase()))
                        .map((appt) => (
                          <tr key={appt.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{appt.patientName}</p>
                              <p className="text-[10px] text-slate-400">{appt.id}</p>
                            </td>
                            <td className="p-3">{appt.serviceName}</td>
                            <td className="p-3">{appt.therapistName}</td>
                            <td className="p-3 text-teal-700 font-semibold">{appt.date} ({appt.timeSlot})</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : appt.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {appt.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleUpdateApptStatus(appt.id, 'Completed')}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleUpdateApptStatus(appt.id, 'Cancelled')}
                                  className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold"
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Admin View 2: Lead Pipeline */}
            {adminTab === 'leads' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-slate-900 text-base">Inbound Patient Leads & Inquiries</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Source / Program</th>
                        <th className="p-3">Message</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{lead.name}</p>
                            <p className="text-[10px] text-slate-400">{lead.email} | {lead.phone}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-slate-800">{lead.service}</p>
                            <p className="text-[10px] text-teal-600">{lead.source}</p>
                          </td>
                          <td className="p-3 max-w-xs truncate">{lead.message}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700">
                              {lead.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleUpdateLeadStatus(lead.id, 'Contacted')}
                              className="px-2.5 py-1 bg-slate-900 text-white rounded text-[10px] font-bold"
                            >
                              Mark Contacted
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Admin View 3: Therapists Roster */}
            {adminTab === 'therapists' && (
              <div className="grid md:grid-cols-2 gap-6">
                {therapists.map((doc) => (
                  <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
                    <img src={doc.image} alt={doc.name} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                      <p className="text-xs text-teal-600">{doc.spec}</p>
                      <p className="text-xs text-slate-500 mt-1">Hours: {doc.workHours}</p>
                      <p className="text-[10px] text-slate-400">Days: {doc.workDays.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'contact' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
            <div className="max-w-3xl space-y-4">
              <span className="text-teal-600 font-bold text-xs uppercase tracking-wider">Get in Touch</span>
              <h1 className="text-4xl font-black text-slate-900">Contact Rehabics Clinic</h1>
              <p className="text-slate-600 text-base">Have questions about our rehabilitation programs? Reach out to our clinical staff directly.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 bg-slate-900 text-white p-8 rounded-3xl space-y-8">
                <h3 className="text-2xl font-bold">Clinic Contact Info</h3>
                <div className="space-y-6 text-sm text-slate-300">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                    <p>450 Medical Plaza, Suite 200<br />City Health District, NY 10001</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-teal-400 flex-shrink-0" />
                    <p>+1 (800) 555-REHAB</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-teal-400 flex-shrink-0" />
                    <p>care@rehabics.com</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <p className="font-bold text-sm text-white mb-2">WhatsApp Direct Channel:</p>
                  <a
                    href="https://wa.me/18005557342"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    <MessageSquare className="w-4 h-4" /> Chat with Rehabics Desk
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900">Send an Inquiry</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-3 border border-slate-300 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full p-3 border border-slate-300 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Message *</label>
                    <textarea
                      rows={4}
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full p-3 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow transition"
                  >
                    Submit Inquiry
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {}
      {selectedServiceDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedServiceDetail(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">{selectedServiceDetail.duration} Program</span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{selectedServiceDetail.name}</h2>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">{selectedServiceDetail.desc}</p>

            <div className="space-y-2 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">Treatment Approach:</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedServiceDetail.approach}</p>
            </div>

            <div className="pt-4 flex gap-4">
              <button
                onClick={() => {
                  const servId = selectedServiceDetail.id;
                  setSelectedServiceDetail(null);
                  handleSelectService(servId);
                }}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow transition"
              >
                Book This Program
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTherapistDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTherapistDetail(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-4 items-center">
              <img src={selectedTherapistDetail.image} alt={selectedTherapistDetail.name} className="w-20 h-20 rounded-2xl object-cover" />
              <div>
                <h3 className="text-2xl font-black text-slate-900">{selectedTherapistDetail.name}</h3>
                <p className="text-xs text-teal-600 font-bold">{selectedTherapistDetail.title} • {selectedTherapistDetail.qualification}</p>
                <p className="text-xs text-slate-500 mt-1">Experience: {selectedTherapistDetail.exp}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{selectedTherapistDetail.bio}</p>

            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-800">Working Days: {selectedTherapistDetail.workDays.join(', ')}</p>
              <p className="text-slate-500">Clinic Hours: {selectedTherapistDetail.workHours}</p>
            </div>

            <button
              onClick={() => {
                const docId = selectedTherapistDetail.id;
                setSelectedTherapistDetail(null);
                handleSelectTherapist(docId);
              }}
              className="w-full py-3.5 bg-teal-600 text-white font-bold text-sm rounded-xl shadow hover:bg-teal-700 transition"
            >
              Book Appointment with {selectedTherapistDetail.name.split(' ')[1]}
            </button>
          </div>
        </div>
      )}

      {}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center text-white font-black">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">REHAB<span className="text-teal-400">ICS</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Premier physical therapy and rehabilitation clinic dedicated to restoring human movement, strength, and life quality.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              {['home', 'services', 'doctors', 'contact'].map((t) => (
                <li key={t}>
                  <button onClick={() => setActiveTab(t)} className="hover:text-teal-400 capitalize transition">
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Clinical Services</h4>
            <ul className="space-y-2 text-xs">
              {services.slice(0, 4).map((s) => (
                <li key={s.id}>{s.name}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-4">Clinic Hours</h4>
            <p className="text-xs">Mon - Fri: 8:00 AM - 7:00 PM</p>
            <p className="text-xs mt-1">Saturday: 9:00 AM - 4:00 PM</p>
            <p className="text-xs text-teal-400 mt-2 font-bold">Emergency Line Active 24/7</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Rehabics Clinic Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}