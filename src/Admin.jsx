import { useEffect, useState } from 'react';
import { deleteEvent as removeEvent, getAdminSession, getApiHealth, getEvents, saveEvent as persistEvent, signIn as apiSignIn, signOut as apiSignOut } from './api.js';
import { imageUrl } from './assets.js';
import './admin.css';

const emptyForm = {
  title: '',
  venue: '',
  event_date: '',
  status: 'upcoming',
  description: '',
};

function AdminHeader({ onSignOut }) {
  return (
    <header className="header d-flex align-items-center sticky-top">
      <div className="container d-flex align-items-center">
        <a href="/index.html" className="logo d-flex align-items-center me-auto" aria-label="Back to the Drone Project home">
          <img src={imageUrl('nit.png')} alt="NIT Logo" />
          <img src={imageUrl('Swayaan.png')} alt="SwaYaan Logo" />
          <img src={imageUrl('meity.png')} alt="MeitY Logo" />
        </a>
        <nav className="admin-top-links" aria-label="Admin navigation">
          <a href="/index.html">Home</a>
          {onSignOut && <button className="btn btn-outline-secondary btn-sm" type="button" onClick={onSignOut}>Sign out</button>}
        </nav>
      </div>
    </header>
  );
}

function AdminFooter() {
  const projectText = "The project 'Capacity Building for Human Resource Development in Unmanned Aircraft Systems/Drone & related technology’ titled as 'SwaYaan' is a National Initiative by the Ministry of Electronics and Information Technology (MeitY) to develop and strengthen the UAS/Drone ecosystem in India. The vision is in line with the Government of India's initiative to make India a global Drone hub by the year 2030.";
  return (
    <footer className="footer position-relative light-background">
      <div className="container footer-top"><div className="row gy-4">
        <div className="col-lg-4 col-md-6 footer-about">
          <a href="/index.html" className="logo d-flex align-items-center"><span className="sitename">Drone Project</span></a>
          <div className="footer-contact pt-3"><p>Dr B R Ambedkar National Institute of Technology Jalandhar</p><p>G.T Road, Amritsar Bypass, Jalandhar, Punjab, India-144008</p><p><strong>Email:</strong> <span>drone-meity@nitj.ac.in</span></p></div>
          <div className="social-links d-flex mt-4"><a href="https://twitter.com/"><i className="bi bi-twitter-x" /></a><a href="https://facebook.com/"><i className="bi bi-facebook" /></a><a href="https://instagram.com/"><i className="bi bi-instagram" /></a><a href="https://linkedin.com/"><i className="bi bi-linkedin" /></a></div>
        </div>
        <div className="col-lg-2 col-md-3 footer-links"><h4>Useful Links</h4><ul><li><a href="/index.html#hero">Home</a></li><li><a href="/index.html#about">About</a></li><li><a href="/index.html#services">Bootcamps</a></li><li><a href="/index.html#contact">Contact</a></li><li><a href="/admin.html">Admin</a></li></ul></div>
        <div className="col-lg-4 col-md-12 footer-newsletter"><h4>About MeitY Drone Project</h4><p style={{ textAlign: 'justify' }}>{projectText}</p></div>
      </div></div>
    </footer>
  );
}

function SetupNotice({ message }) {
  return (
    <div className="alert alert-warning" role="status">
      <p className="mb-2">Admin sign-in is not connected yet{message ? `: ${message}` : '.'}</p>
      <p className="mb-2">Start local MongoDB or use MongoDB Atlas. Copy <strong>.env.example</strong> to <strong>.env.local</strong> and set <strong>MONGODB_URI</strong>, a random 32+ character JWT secret, admin email, and admin password.</p>
      <p className="mb-0">Then restart <strong>npm run dev</strong>. Collections and the hashed admin account are created automatically.</p>
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [setupMessage, setSetupMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getApiHealth()
      .then(() => {
        if (!active) return null;
        setApiReady(true);
        return getAdminSession();
      })
      .then((result) => {
        if (active) setSession(result?.admin || null);
      })
      .catch((apiError) => {
        if (active) setSetupMessage(apiError.message);
      })
      .finally(() => {
        if (active) setAuthChecked(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session || !apiReady) {
      setEvents([]);
      return undefined;
    }
    let active = true;
    getEvents().then((data) => { if (active) setEvents(data || []); }).catch((loadError) => { if (active) setError(loadError.message); });
    return () => { active = false; };
  }, [session, apiReady]);

  async function signIn(event) {
    event.preventDefault();
    if (!apiReady) {
      setError(setupMessage || 'MongoDB is not connected. Configure .env.local and restart the server.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const admin = await apiSignIn(email, password);
      setSession(admin);
      setPassword('');
    } catch (signInError) {
      setError(signInError.message);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await apiSignOut();
    setSession(null);
    setNotice('Signed out.');
    setError('');
  }

  function beginEdit(event) {
    setEditingId(event.id);
    setForm({ title: event.title, venue: event.venue, event_date: event.event_date, status: event.status, description: event.description });
    setImageFile(null);
    setNotice('Editing event.');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
  }

  async function saveEvent(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const data = await persistEvent(form, editingId, imageFile);
      setEvents((current) => [...current.filter((item) => item.id !== data.id), data].sort((left, right) => left.event_date.localeCompare(right.event_date)));
      setNotice(editingId ? 'Event updated. The homepage will show the latest details.' : 'Event published to the homepage.');
      setForm(emptyForm);
      setImageFile(null);
      setEditingId(null);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteEvent(eventId) {
    if (!window.confirm('Delete this event from the homepage?')) return;
    setBusy(true);
    setError('');
    try {
      await removeEvent(eventId);
      setEvents((current) => current.filter((event) => event.id !== eventId));
      if (editingId === eventId) cancelEdit();
      setNotice('Event deleted from the homepage.');
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  }

  const page = (content) => <><AdminHeader onSignOut={session ? signOut : null} /><main className="main">{content}</main><AdminFooter /></>;

  if (!authChecked) return page(<div className="container section admin-section"><p>Checking admin session...</p></div>);
  if (!session) return page(
    <section className="container section admin-section">
      <div className="section-title"><h2>Admin Sign In</h2><p>Sign in with an account added to the project admin list.</p></div>
      {!apiReady && <SetupNotice message={setupMessage} />}
      <div className="admin-login-wrap"><form className="admin-panel" onSubmit={signIn}>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <div className="mb-3"><label className="form-label" htmlFor="admin-email">Email</label><input className="form-control" id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
        <div className="mb-3"><label className="form-label" htmlFor="admin-password">Password</label><input className="form-control" id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
      </form></div>
    </section>,
  );
  return page(
    <section className="container section admin-section">
      <div className="section-title"><h2>Event Management</h2><p>Add completed and upcoming events. Published events appear on the homepage.</p></div>
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <div className="row gy-4">
        <div className="col-lg-5">
          <form className="admin-panel" onSubmit={saveEvent}>
            <h3>{editingId ? 'Edit event' : 'Add an event'}</h3>
            <div className="mb-3"><label className="form-label" htmlFor="event-title">Event title</label><input id="event-title" className="form-control" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required maxLength={180} /></div>
            <div className="row">
              <div className="col-md-6 mb-3"><label className="form-label" htmlFor="event-date">Date</label><input id="event-date" className="form-control" type="date" value={form.event_date} onChange={(event) => setForm({ ...form, event_date: event.target.value })} required /></div>
              <div className="col-md-6 mb-3"><label className="form-label" htmlFor="event-status">Status</label><select id="event-status" className="form-select" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="upcoming">Upcoming</option><option value="completed">Completed</option></select></div>
            </div>
            <div className="mb-3"><label className="form-label" htmlFor="event-venue">Institute / venue</label><input id="event-venue" className="form-control" value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })} maxLength={180} /></div>
            <div className="mb-3"><label className="form-label" htmlFor="event-description">Event details</label><textarea id="event-description" className="form-control" rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required maxLength={5000} /></div>
            <div className="mb-3"><label className="form-label" htmlFor="event-image">Event photo</label><input id="event-image" className="form-control" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] || null)} /><div className="form-text">JPEG, PNG, or WebP; maximum 10 MB.</div></div>
            {editingId && events.find((event) => event.id === editingId)?.image_url && <img className="admin-image-preview" src={events.find((event) => event.id === editingId).image_url} alt="Current event" />}
            <div className="admin-form-actions"><button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Saving...' : editingId ? 'Save changes' : 'Publish event'}</button>{editingId && <button className="btn btn-outline-secondary" type="button" onClick={cancelEdit} disabled={busy}>Cancel</button>}</div>
          </form>
        </div>
        <div className="col-lg-7">
          <div className="admin-events-head"><h3>Published events</h3><span>{events.length} total</span></div>
          {events.length === 0 ? <div className="admin-panel"><p className="mb-0">No events have been added yet.</p></div> : <div className="table-responsive admin-table-wrap"><table className="table align-middle admin-table"><thead><tr><th>Event</th><th>Date</th><th>Status</th><th><span className="visually-hidden">Actions</span></th></tr></thead><tbody>
            {events.map((event) => <tr key={event.id}><td><strong>{event.title}</strong><small>{event.venue}</small></td><td>{new Date(`${event.event_date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td><span className={`badge ${event.status === 'upcoming' ? 'bg-info text-dark' : 'bg-success'}`}>{event.status}</span></td><td className="admin-row-actions"><button className="btn btn-sm btn-outline-primary" type="button" onClick={() => beginEdit(event)}>Edit</button><button className="btn btn-sm btn-outline-danger" type="button" onClick={() => deleteEvent(event.id)} disabled={busy}>Delete</button></td></tr>)}
          </tbody></table></div>}
        </div>
      </div>
    </section>,
  );
}
