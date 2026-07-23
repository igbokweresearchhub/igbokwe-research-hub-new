import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4173';
const SERVICES = [
  {
    title: 'Research Project Support',
    category: 'Project',
    description: 'Guidance for topic development, objectives, research questions, literature structure, and chapter planning.',
    tags: ['undergraduate project', 'final year project', 'research topic', 'chapter guidance']
  },
  {
    title: 'Master’s Dissertation Guidance',
    category: 'Dissertation',
    description: 'Support with proposal development, methodology design, literature review planning, data analysis, and academic editing.',
    tags: ['masters dissertation', 'proposal', 'methodology', 'literature review']
  },
  {
    title: 'Research Article Preparation',
    category: 'Publication',
    description: 'Help turning research work into journal-ready articles, including structure, referencing, proofreading, and submission checks.',
    tags: ['research article', 'journal paper', 'publication', 'manuscript']
  },
  {
    title: 'Data Analysis & Interpretation',
    category: 'Analysis',
    description: 'Assistance with questionnaire coding, descriptive statistics, reliability, correlation, regression, and interpretation of results.',
    tags: ['SPSS', 'Excel', 'statistics', 'data analysis', 'interpretation']
  },
  {
    title: 'Editing, Proofreading & Formatting',
    category: 'Editing',
    description: 'Academic language improvement, grammar checks, APA/Harvard formatting, table formatting, and document presentation.',
    tags: ['proofreading', 'formatting', 'APA', 'Harvard', 'editing']
  },
  {
    title: 'Proposal & Synopsis Support',
    category: 'Proposal',
    description: 'Support preparing clear research proposals with background, problem statement, aims, methodology, and references.',
    tags: ['research proposal', 'synopsis', 'problem statement', 'objectives']
  }
];

const RESOURCES = [
  'How to choose a strong dissertation topic',
  'How to write research objectives and questions',
  'Common mistakes in literature review writing',
  'Understanding reliability analysis for questionnaires',
  'How to present regression results in a dissertation',
  'APA and Harvard referencing checklist'
];

function api(path, options = {}) {
  const token = localStorage.getItem('irh_token');
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  });
}

function Header({ user, onOpenAuth, onOpenDashboard, onLogout }) {
  const [open, setOpen] = useState(false);
  const links = ['services', 'how-it-works', 'resources', 'contact'];
  return (
    <header className="header">
      <nav className="nav">
        <a className="brand" href="#home">
          <span className="brandIcon">IRH</span>
          <span><strong>Igbokwe Research Hub</strong><small>Research • Writing • Analysis</small></span>
        </a>
        <button className="mobileToggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">☰</button>
        <div className={`navLinks ${open ? 'show' : ''}`}>
          {links.map((link) => <a key={link} href={`#${link}`} onClick={() => setOpen(false)}>{link.replaceAll('-', ' ')}</a>)}
          {user ? (
            <>
              <button className="linkButton" onClick={onOpenDashboard}>Dashboard</button>
              <button className="btn ghost small" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <button className="btn primary small" onClick={onOpenAuth}>Client Login</button>
          )}
        </div>
      </nav>
    </header>
  );
}

function Hero({ onOpenAuth }) {
  return (
    <section id="home" className="hero">
      <div className="heroText">
        <p className="eyebrow">Ethical academic research support</p>
        <h1>Get expert guidance for projects, articles, dissertations, and data analysis.</h1>
        <p>
          Igbokwe Research Hub helps students, researchers, and professionals develop stronger research work through coaching, editing, methodology support, article preparation, and statistical analysis.
        </p>
        <div className="heroActions">
          <button className="btn primary" onClick={onOpenAuth}>Request Research Support</button>
          <a className="btn secondary" href="#services">Explore Services</a>
        </div>
        <div className="trustRow">
          <span>✓ Dissertation guidance</span>
          <span>✓ Research article support</span>
          <span>✓ Data analysis</span>
        </div>
      </div>
      <div className="heroPanel">
        <div className="panelTop">
          <span>Service Request Portal</span>
          <strong>Login, submit your brief, and track your request.</strong>
        </div>
        <div className="stepsMini">
          <div><b>01</b><span>Create client account</span></div>
          <div><b>02</b><span>Submit project details</span></div>
          <div><b>03</b><span>Receive a response</span></div>
        </div>
      </div>
    </section>
  );
}

function SearchableServices({ onRequest }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SERVICES;
    return SERVICES.filter((s) => [s.title, s.category, s.description, ...s.tags].join(' ').toLowerCase().includes(q));
  }, [query]);

  return (
    <section id="services" className="section light">
      <div className="sectionHead">
        <p className="eyebrow">Services</p>
        <h2>Search and request the exact academic support you need</h2>
        <p>Visitors can search your public service list, then create an account to submit a project request.</p>
      </div>
      <div className="searchBox">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services e.g. dissertation, SPSS, article, proofreading..." />
      </div>
      <div className="serviceGrid">
        {filtered.map((service) => (
          <article className="serviceCard" key={service.title}>
            <span className="badge">{service.category}</span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <div className="tagRow">{service.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
            <button className="cardLink" onClick={() => onRequest(service.title)}>Request this service →</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const items = [
    ['Create an Account', 'Clients sign up or log in to access a secure request dashboard.'],
    ['Submit a Brief', 'They provide the service type, academic level, topic, deadline, budget, and project details.'],
    ['Review & Quote', 'You review the request from the admin dashboard and contact the client with next steps.'],
    ['Support Delivery', 'You provide ethical guidance, editing, coaching, analysis, or article preparation support.']
  ];
  return (
    <section id="how-it-works" className="section">
      <div className="sectionHead centered">
        <p className="eyebrow">How it works</p>
        <h2>A simple workflow for receiving client requests</h2>
      </div>
      <div className="processGrid">
        {items.map(([title, text], i) => (
          <div className="process" key={title}><span>{String(i + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></div>
        ))}
      </div>
    </section>
  );
}

function Resources() {
  const [query, setQuery] = useState('');
  const results = RESOURCES.filter((r) => r.toLowerCase().includes(query.toLowerCase()));
  return (
    <section id="resources" className="section dark">
      <div className="sectionHead">
        <p className="eyebrow">Search resources</p>
        <h2>Helpful research topics visitors can find through search engines</h2>
        <p>These public resource titles improve the website’s search relevance. You can later turn each one into a full blog article.</p>
      </div>
      <div className="searchBox darkSearch"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search research resources..." /></div>
      <div className="resourceList">
        {results.map((r) => <article key={r}><h3>{r}</h3><p>Coming soon: practical guide from Igbokwe Research Hub.</p></article>)}
      </div>
    </section>
  );
}

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  async function submit(e) {
    e.preventDefault();
    setStatus('Sending...');
    try {
      await api('/api/contact', { method: 'POST', body: JSON.stringify(form) });
      setStatus('Message saved successfully.');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus(err.message);
    }
  }
  return (
    <section id="contact" className="section light">
      <div className="contactWrap">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>Ready to discuss a research task?</h2>
          <p>Add your real phone number, WhatsApp link, business email, address, and social media links here before launch.</p>
          <ul className="contactList">
            <li>Email: hello@igbokweresearchhub.com</li>
            <li>WhatsApp: +234 XXX XXX XXXX</li>
            <li>Location: Nigeria / Online consultations</li>
          </ul>
        </div>
        <form className="form" onSubmit={submit}>
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea placeholder="How can we help?" rows="5" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <button className="btn primary" type="submit">Send Message</button>
          {status && <p className="status">{status}</p>}
        </form>
      </div>
    </section>
  );
}

function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api(endpoint, { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem('irh_token', data.token);
      onAuth(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <div className="modalBackdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <button className="close" onClick={onClose}>×</button>
        <p className="eyebrow">Client Portal</p>
        <h2>{mode === 'login' ? 'Login to your account' : 'Create a client account'}</h2>
        <form className="form" onSubmit={submit}>
          {mode === 'signup' && <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
          <input placeholder="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn primary" type="submit">{mode === 'login' ? 'Login' : 'Sign Up'}</button>
          {error && <p className="error">{error}</p>}
        </form>
        <button className="switchMode" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'No account? Create one' : 'Already have an account? Login'}
        </button>
        <p className="adminHint">Demo admin: admin@igbokweresearchhub.com / ChangeMe123!</p>
      </div>
    </div>
  );
}

function Dashboard({ user, onClose, initialService }) {
  const [requests, setRequests] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ serviceType: initialService || '', academicLevel: '', topic: '', deadline: '', budget: '', phone: '', details: '' });

  async function load() {
    try {
      const mine = await api('/api/requests');
      setRequests(mine.requests);
      if (user.role === 'admin') {
        const all = await api('/api/admin/requests');
        setAdminRequests(all.requests);
      }
    } catch (err) {
      setStatus(err.message);
    }
  }
  useEffect(() => { load(); }, []);

  async function submitRequest(e) {
    e.preventDefault();
    setStatus('Submitting request...');
    try {
      await api('/api/requests', { method: 'POST', body: JSON.stringify(form) });
      setStatus('Request submitted successfully.');
      setForm({ serviceType: '', academicLevel: '', topic: '', deadline: '', budget: '', phone: '', details: '' });
      load();
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function updateStatus(id, nextStatus) {
    await api(`/api/admin/requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
    load();
  }

  return (
    <div className="modalBackdrop dashboardBackdrop" role="dialog" aria-modal="true">
      <div className="dashboard">
        <button className="close" onClick={onClose}>×</button>
        <div className="dashHead"><div><p className="eyebrow">Dashboard</p><h2>Welcome, {user.name}</h2></div><span className="roleBadge">{user.role}</span></div>
        <div className="dashGrid">
          <form className="form requestForm" onSubmit={submitRequest}>
            <h3>Submit a project request</h3>
            <select value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
              <option value="">Select service type</option>
              {SERVICES.map((s) => <option key={s.title}>{s.title}</option>)}
            </select>
            <select value={form.academicLevel} onChange={(e) => setForm({ ...form, academicLevel: e.target.value })}>
              <option value="">Academic level</option>
              <option>Undergraduate</option><option>Postgraduate Diploma</option><option>Master's</option><option>PhD</option><option>Professional/Article</option>
            </select>
            <input placeholder="Research topic or working title" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <input placeholder="Budget / expected price range" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            <input placeholder="Phone / WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <textarea rows="5" placeholder="Describe what you need. Include institution requirements, word count, referencing style, software, and deadline." value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
            <button className="btn primary" type="submit">Submit Request</button>
            {status && <p className="status">{status}</p>}
          </form>
          <div className="requestList">
            <h3>{user.role === 'admin' ? 'Admin: all client requests' : 'My requests'}</h3>
            {(user.role === 'admin' ? adminRequests : requests).length === 0 && <p className="muted">No requests yet.</p>}
            {(user.role === 'admin' ? adminRequests : requests).map((r) => (
              <article className="requestItem" key={r.id}>
                <div className="requestTop"><strong>{r.serviceType}</strong><span>{r.status}</span></div>
                <p><b>Topic:</b> {r.topic}</p>
                <p><b>Level:</b> {r.academicLevel} • <b>Deadline:</b> {r.deadline}</p>
                {user.role === 'admin' && <p><b>Client:</b> {r.clientName} ({r.clientEmail}) {r.phone && `• ${r.phone}`}</p>}
                <p>{r.details}</p>
                {user.role === 'admin' && <div className="statusButtons"><button onClick={() => updateStatus(r.id, 'Reviewing')}>Reviewing</button><button onClick={() => updateStatus(r.id, 'Quoted')}>Quoted</button><button onClick={() => updateStatus(r.id, 'Completed')}>Completed</button></div>}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrityNotice() {
  return (
    <section className="integrity">
      <strong>Academic integrity notice:</strong> Igbokwe Research Hub provides research guidance, coaching, editing, analysis support, and writing development. Clients remain responsible for their own academic submissions and institutional compliance.
    </section>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('irh_token');
    if (!token) return;
    api('/api/me').then((data) => setUser(data.user)).catch(() => localStorage.removeItem('irh_token'));
  }, []);

  function requestService(serviceTitle) {
    setSelectedService(serviceTitle);
    if (user) setDashOpen(true);
    else setAuthOpen(true);
  }

  function logout() {
    localStorage.removeItem('irh_token');
    setUser(null);
  }

  return (
    <>
      <Header user={user} onOpenAuth={() => setAuthOpen(true)} onOpenDashboard={() => setDashOpen(true)} onLogout={logout} />
      <main>
        <Hero onOpenAuth={() => setAuthOpen(true)} />
        <SearchableServices onRequest={requestService} />
        <HowItWorks />
        <Resources />
        <IntegrityNotice />
        <Contact />
      </main>
      <footer className="footer"><p>© 2026 Igbokwe Research Hub. All rights reserved.</p><a href="#home">Back to top</a></footer>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuth={setUser} />}
      {dashOpen && user && <Dashboard user={user} onClose={() => setDashOpen(false)} initialService={selectedService} />}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
