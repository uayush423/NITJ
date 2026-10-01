import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AdminPage from './Admin.jsx';
import { getEvents } from './api.js';
import { imageUrl } from './assets.js';

const legacyPages = import.meta.glob('../*.html', { query: '?raw', import: 'default' });

const bootcamps = [
  { title: 'Bootcamp 1', institute: 'NIT Jalandhar', date: '20–24 May 2023', image: 'bnit1.jpg', description: 'Recent Trends in Unmanned System Technology.', href: 'Boot1.html', color: 'cyan' },
  { title: 'Bootcamp 2', institute: 'NIT Jalandhar', date: '18–22 December 2023', image: 'boot13.jpg', description: 'Exploring Drones: Applications and Security Measures.', href: 'Boot2.html', color: 'orange' },
  { title: 'Bootcamp 3', institute: 'I.K.G. Punjab Technical University, Kapurthala, Punjab', date: '27–31 May 2024', image: 'boot3.jpeg', description: 'Drone Fundamentals, Developments, and Applications (DFDA).', href: 'Boot3.html', color: 'teal' },
  { title: 'Bootcamp 4', institute: 'NIT Jalandhar', date: '3–7 June 2024', image: 'boot4.2.JPG', description: 'Drone Assembly, Security, and Application.', href: 'Boot4.html', color: 'red' },
  { title: 'Bootcamp 5', institute: 'NIT Jalandhar', date: '26–30 August 2024', image: 'bsf.jpg', description: 'Drone technology training programme and practical flight sessions.', href: 'boot5.html', color: 'indigo' },
  { title: 'Bootcamp 6', institute: 'NIT Jalandhar', date: '29 July–2 August 2024', image: 'boot6.4.JPG', description: 'Drone Assembly, Research, and Technology.', href: 'boot6.html', color: 'pink' },
  { title: 'Bootcamp 7', institute: 'NIT Jalandhar', date: '18–22 September 2024', image: 'boot7.1.jpg', description: 'Drone technology and applications training programme.', href: 'Boot7.html', color: 'teal' },
  { title: 'Bootcamp 8', institute: 'Kanya Maha Vidyalaya, Jalandhar, Punjab', date: '23–27 September 2024', image: 'boot4.png', description: 'Drone Fundamentals: Assembly to Application.', href: 'boot8.html', color: 'red' },
  { title: 'Bootcamp 9', institute: 'Guru Nanak Dev University, Amritsar', date: '2024', image: 'boot9.1.jpeg', description: 'Drone Dynamics: Drone Technology, Trends, and Applications.', href: 'boot9.html', color: 'indigo' },
  { title: 'Bootcamp 10', institute: 'Lyallpur Khalsa College Technical Campus, Jalandhar', date: '27–31 January 2025', image: 'boot10.1.jpeg', description: 'Drone Horizons: Exploring Technology and Applications.', href: 'boot10.html', color: 'pink' },
  { title: 'Bootcamp 11', institute: 'Chandigarh College of Engineering and Technology, Chandigarh', date: '17–21 March 2025', image: 'boot11.1.jpeg', description: 'DEMA: Drone Engineering, Mechanics, and Applications.', href: 'boot11.html', color: 'indigo' },
  { title: 'Bootcamp 12', institute: 'Chitkara University, Rajpura, Punjab', date: '21–25 April 2025', image: 'boot12.1.jpeg', description: 'Smart Aerial Vision: The Future of Drone Technology and Analytics.', href: 'boot12.html', color: 'pink' },
  { title: 'Bootcamp 13', institute: 'Thapar Institute of Engineering & Technology, Patiala', date: '4–8 August 2025', image: 'boot13.1.jpg', description: 'DFTA: Drone Flight Technology and Applications.', href: 'boot13.html', color: 'indigo' },
  { title: 'Bootcamp 14', institute: 'Gulzar Group of Institutes, Khanna, Punjab', date: '15–19 September 2025', image: 'boot14.2.jpeg', description: 'DIVA: Drone Innovation, Vision & Applications.', href: 'boot14.html', color: 'pink' },
  { title: 'Bootcamp 15', institute: 'NIT Jalandhar', date: '22–26 September 2025', image: 'boot15.1.jpeg', description: 'Drone technology and applications training programme.', href: 'Boot15.html', color: 'teal' },
  { title: 'Bootcamp 16', institute: 'Punjabi University, Patiala, Punjab', date: '2025', image: 'boot16.1.jpeg', description: 'DART: Drone Applications, Research & Technology.', href: 'Boot16.html', color: 'red' },
  { title: 'Bootcamp 17', institute: 'CT Group of Institutions, Shahpur, Jalandhar, Punjab', date: '2025', image: 'boot17.1.jpeg', description: 'NextGen Drones: Technology and Applications.', href: 'boot17.html', color: 'indigo' },
  { title: 'Bootcamp 18', institute: 'NIT Jalandhar', date: '3–7 November 2025', image: 'boot18.1.jpeg', description: 'DroneSphere: Technology & Applications.', href: 'Boot18.html', color: 'pink' },
  { title: 'Bootcamp 19', institute: 'Sri Sri University, Cuttack, Odisha', date: '2025', image: 'boot19.1.jpeg', description: 'Smart Drones: Autonomy, Sensing & Applications.', href: 'boot19.html', color: 'indigo' },
  { title: 'Bootcamp 20', institute: 'NIT Jalandhar', date: '21–25 April 2025', image: 'boot20.1.jpeg', description: 'Smart Drone Vision: Insight, Imaging and Innovation.', href: 'boot20.html', color: 'pink' },
];

const team = [
  { name: 'Dr Arun K Khosla', role: 'Chief Investigator', designation: 'Professor', department: 'Department of Electronics and Communication Engineering', email: 'khoslaak@nitj.ac.in', image: 'AkS.jpg' },
  { name: 'Dr Hemant S. Chore', role: 'Co-Principal Investigator', designation: 'Associate Professor', department: 'Department of Civil Engineering', email: 'chorehs@nitj.ac.in', image: 'HS.jpg' },
  { name: 'Dr K P Sharma', role: 'Co-Principal Investigator', designation: 'Assistant Professor', department: 'Department of Computer Science and Engineering', email: 'sharmakp@nitj.ac.in', image: 'KP.jpg' },
  { name: 'Dr Smayveer Singh', role: 'Co-Principal Investigator', designation: 'Assistant Professor', department: 'Department of Computer Science and Engineering', email: 'samays@nitj.ac.in', image: 'Smay.jpg' },
  { name: 'Dr Om Prakash Verma', role: 'Co-Principal Investigator', designation: 'Assistant Professor', department: 'Department of Instrumentation and Control Engineering', email: 'vermaop@nitj.ac.in', image: 'op.jpg' },
  { name: 'Dr Gurjot Kaur', role: 'Project Lead', designation: 'Ph.D (Electronics and Communication Engineering)', department: 'Department of Electronics and Communication Engineering', email: 'gurjotk.pl@nitj.ac.in', image: 'Gurjot.jpeg' },
  { name: 'Mr Prem Kumar Rawat', role: 'Junior Research Fellow', designation: 'M.E. (Computer Science Engineering)', department: 'Department of Electronics and Communication Engineering', email: 'premkr.jrf.24@nitj.ac.in', image: 'prem.jpg' },
  { name: 'Mr Kunwar Pratap Singh', role: 'Junior Research Fellow', designation: 'M.E (Electronics and Communication Engineering)', department: 'Department of Electronics and Communication Engineering', email: 'kunwarps.ec.25@nitj.ac.in', image: 'kp.jpeg' },
];

const slides = [
  { image: 'drone.webp', alt: 'Drone Image 1' },
  { image: 'slide2.jpg', alt: 'Drone Image 2' },
  { image: 'slide3.JPG', alt: 'Drone Image 3' },
  { image: 'slide4.jpg', alt: 'Drone Image 4' },
];

function currentDetailNumber() {
  const hash = window.location.hash.match(/^#bootcamp-(\d+)$/);
  const path = window.location.pathname.match(/\/boot(\d+)\.html$/i);
  return hash ? Number(hash[1]) : path ? Number(path[1]) : null;
}

function Header({ detail = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle('mobile-nav-active', mobileOpen);
    return () => document.body.classList.remove('mobile-nav-active');
  }, [mobileOpen]);

  const prefix = detail ? '/index.html' : 'index.html';
  return (
    <header id="header" className={`header d-flex align-items-center ${detail ? 'sticky-top' : 'fixed-top'}`}>
      <div className={detail ? 'container d-flex align-items-center' : 'container-fluid container-xl position-relative d-flex align-items-center'}>
        {detail ? <a href="/index.html" className="logo d-flex align-items-center me-auto"><img src={imageUrl('nit.png')} alt="NIT Logo" /><img src={imageUrl('Swayaan.png')} alt="Swayaan Logo" /><img src={imageUrl('meity.png')} alt="MeitY Logo" /></a> : <div className="logo d-flex align-items-center me-auto">
          <a href="/index.html"><img src={imageUrl('nit.png')} alt="NIT Logo" /></a>
          <a href="https://swayaan.meity.gov.in/workthemes" target="_blank" rel="noreferrer"><img src={imageUrl('Swayaan.png')} alt="Swayaan Logo" /></a>
          <a href="https://www.meity.gov.in" target="_blank" rel="noreferrer"><img src={imageUrl('meity.png')} alt="MeitY Logo" /></a>
        </div>}
        <nav id="navmenu" className="navmenu">
          <ul>
            <li><a href={`${prefix}#hero`} className="active" onClick={() => setMobileOpen(false)}>Home</a></li>
            <li><a href={`${prefix}#about`} onClick={() => setMobileOpen(false)}>About</a></li>
            <li><a href={`${prefix}#services`} onClick={() => setMobileOpen(false)}>Bootcamps</a></li>
            <li><a href={`${prefix}#contact`} onClick={() => setMobileOpen(false)}>Contact</a></li>
          </ul>
          {!detail && <i className={`mobile-nav-toggle d-xl-none bi ${mobileOpen ? 'bi-x' : 'bi-list'}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation" role="button" />}
        </nav>
        {!detail && <a className="btn-getstarted" href="/upcoming.html">Upcoming Events</a>}
      </div>
    </header>
  );
}

function Footer() {
  const projectText = "The project 'Capacity Building for Human Resource Development in Unmanned Aircraft Systems/Drone & related technology’ titled as 'SwaYaan' is a National Initiative by the Ministry of Electronics and Information Technology (MeitY) to develop and strengthen the UAS/Drone ecosystem in India. The vision is in line with the Government of India's initiative to make India a global Drone hub by the year 2030.";
  return (
    <footer id="footer" className="footer position-relative light-background">
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

function Hero() {
  const [active, setActive] = useState(0);
  const changeSlide = (offset) => setActive((active + offset + slides.length) % slides.length);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((slide) => (slide + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <section id="hero" className="hero section">
      <div className="hero-bg" />
      <div className="container text-center"><div className="d-flex flex-column justify-content-center align-items-center">
        <h1>Drone Project MeitY@ NITJ</h1>
        <p>"Capacity Building for Human Resource Development in Unmanned Aircraft Systems (Drone &amp; Related Technology)"</p>
        <div id="droneCarousel" className="carousel slide"><div className="carousel-inner">
          {slides.map((slide, index) => <div className={`carousel-item ${index === active ? 'active' : ''}`} key={slide.image}><img src={imageUrl(slide.image)} className="d-block img-fluid" alt={slide.alt} /></div>)}
        </div>
          <button className="carousel-control-prev" type="button" aria-label="Previous" onClick={() => changeSlide(-1)}><span className="carousel-control-prev-icon" aria-hidden="true" /></button>
          <button className="carousel-control-next" type="button" aria-label="Next" onClick={() => changeSlide(1)}><span className="carousel-control-next-icon" aria-hidden="true" /></button>
        </div>
      </div></div>
    </section>
  );
}

function FeaturedServices() {
  const goals = [
    ['Enhance Institutional Capacities', 'To institutionalize a collaborative ecosystem through identified Resource Centres (RCs) and Participating Institutions (PIs) for synergy of capabilities & expertise.'],
    ['Human Resource Development', 'To foster development of competent human resources at various levels including Postgraduate & Graduate programs, PG Diploma/Certificate programs, Faculty Development and Master Trainers in niche areas of UAS.'],
    ['Promote Innovation and Entrepreneurship', 'To promote entrepreneurial mindset and nurture technical talent among the student community through innovative interventions such as Bootcamps and Proof-of Concepts.'],
  ];
  const projectText = 'The project ‘Capacity Building for Human Resource Development in Unmanned Aircraft Systems/Drone & related technology’ titled as ‘SwaYaan’ is a National Initiative by the Ministry of Electronics and Information Technology (MeitY) to develop and strengthen the UAS/Drone ecosystem in India. The vision is in line with the Government of India\'s initiative to make India a global Drone hub by the year 2030.\n\nSwaYaan aims to empower participants from all walks of life, ranging from undergraduates to faculties and open learners across five identified technical areas, through more than 1500 academic, non-formal, research, and knowledge-sharing activities. The project is implemented through a network of 30 premier Academic and R&D institutions, including IIT, IISc, IIIT, NITs, IIITDM, C-DAC, and NIELIT Centres. In addition, Skill councils and Industrial bodies like FICCI, ESSCI, TSSC, DFI, HAL, etc., are integral parts of Project mentoring and supervision teams that work towards creating a global impact by guiding on the latest technological transformations, market needs, standards as part of activity planning & curriculum development across verticals.\n\nThe key deliverables under ‘SwaYaan’ include the conduction of MTech Courses, Faculty Development programmes, Minor Degrees, Open Online Courses, 6 months certificate programs, Skill Courses, Bootcamps, Laboratory establishment, Intellectual Property Rights (IPR) creation (including papers, publications, and patents), Proof-of-Concept (PoC) development, National seminars and workshops, International Conferences, and Innovation challenges.\n\nThus, a comprehensive National UAS/Drone HR Development and Training System is getting unfolded, considering a wide range of educational levels, regional boundaries, and institutional portfolios, as well as existing developments and technical expertise in UAS/Drones. The Project is strategized to develop around 40,000+ trained manpower in UAS/Drone & related technology over a period of 5 years to address the growing manpower requirement of the industry.';
  return (
    <section id="featured-services" className="featured-services section light-background"><div className="container"><div className="row gy-4">
      {goals.map(([title, description]) => <div className="col-xl-4 col-lg-6" key={title}><div className="service-item d-flex"><div className="icon flex-shrink-0"><i className="bi bi-card-checklist" /></div><div><h4 className="title"><a href="#about" className="stretched-link">{title}</a></h4><p className="description" style={{ textAlign: 'justify' }}>{description}</p></div></div></div>)}
      <div className="container section-title"><br /><h2>SwaYaan</h2><p style={{ textAlign: 'justify', whiteSpace: 'pre-line' }}>{projectText}</p></div>
    </div></div></section>
  );
}

function About() {
  return (
    <section id="about" className="about section"><div className="container"><div className="row gy-4">
      <div className="col-lg-6 content"><p className="who-we-are">About</p><h3>Work Theme 4(Drone Applications)</h3>
        <p className="fst-italic">Drones/UAS have transformed industries with innovative applications, driving advancements in agriculture, construction, healthcare, entertainment, communication, goods delivery, surveillance, and strategic sectors..</p>
        <ul><li><i className="bi bi-check-circle" /><span>The integration of drones into various domains is revolutionizing mobility and automation, offering efficient and effective solutions for diverse challenges.</span></li><li><i className="bi bi-check-circle" /><span>Focused on developing skilled manpower and indigenous solutions, efforts include training for applied domains, academic programs, and international conferences.</span></li><li><i className="bi bi-check-circle" /><span>Steering activities in drone applications, emphasizing research, academic initiatives, and the creation of open learning programs to drive innovation and knowledge sharing.</span></li></ul>
      </div>
      <div className="col-lg-6 about-images"><div className="row gy-4"><div className="col-lg-6"><img src={imageUrl('bsf.jpg')} className="img-fluid" alt="" loading="lazy" /><img src={imageUrl('nit1.JPG')} className="img-fluid mt-4" alt="" loading="lazy" /></div><div className="col-lg-6"><div className="row gy-4"><div className="col-lg-12"><img src={imageUrl('bsf1.jpg')} className="img-fluid" alt="" loading="lazy" /></div><div className="col-lg-12"><img src={imageUrl('nit.jpeg')} className="img-fluid" alt="" loading="lazy" /></div></div></div></div></div>
    </div></div></section>
  );
}

function TeamMember({ member }) {
  return <div className="team-member"><img src={imageUrl(member.image)} alt={member.name} className="img-fluid" loading="lazy" /><div><h4>{member.name}</h4><p className="position">{member.role}</p><p>{member.designation}</p><p>{member.department}</p><p>Email: <a href={`mailto:${member.email}`}>{member.email}</a></p></div></div>;
}

function Team() {
  return <section id="team" className="team section"><div className="container section-title"><h2>Meet Our Team</h2></div><div className="container"><div className="row">{team.slice(0, 6).map((member) => <div className="col-lg-4" key={member.email}><TeamMember member={member} /></div>)}</div><div className="row mt-4 justify-content-center">{team.slice(6).map((member) => <div className="col-lg-4 d-flex justify-content-center" key={member.email}><TeamMember member={member} /></div>)}</div></div></section>;
}

function StaticBootcampCard({ camp }) {
  return <div className={`service-item item-${camp.color} position-relative`}><img src={imageUrl(camp.image)} className="img-fluid service-img" alt={camp.title} loading="lazy" /><div><h3>{camp.title}</h3><p className="bootcamp-meta"><strong>Institute:</strong> {camp.institute}<br /><strong>Date:</strong> {camp.date}</p><p>{camp.description}</p><a href={camp.href} className="read-more stretched-link">Read More <i className="bi bi-arrow-right" /></a></div></div>;
}

function Bootcamps() {
  return (
    <section id="services" className="services section light-background"><div className="container section-title"><h2>Bootcamp Completed</h2><p>Drone Applications' work theme the major activity in this area is conducting bootcamps. Now we are ready to conduct the bootcamp so that the we will multiple orginzing so that the we codnuct more bootcamp, we defining the specfic area for tht bootcamp</p></div>
      <div className="container"><div className="row g-5">
        {bootcamps.slice(0, 4).map((camp) => <div className="col-lg-6" key={camp.href}><StaticBootcampCard camp={camp} /></div>)}
      </div></div>
      <div className="container text-center mt-4"><a href="/bootcamps.html" className="btn btn-primary">Read More Bootcamps <i className="bi bi-arrow-right" /></a></div>
    </section>
  );
}

function BootcampArchivePage() {
  const [managedEvents, setManagedEvents] = useState([]);

  useEffect(() => {
    let active = true;
    getEvents().then((data) => {
      if (active) setManagedEvents((data || []).filter((event) => event.status === 'completed'));
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  return <><Header /><main className="main"><section className="services section light-background"><div className="container section-title"><h2>All Bootcamps</h2><p>Explore completed drone technology bootcamps and training programmes.</p></div><div className="container"><div className="row g-5">
    {bootcamps.map((camp) => <div className="col-lg-6" key={camp.href}><StaticBootcampCard camp={camp} /></div>)}
    {managedEvents.map((event) => <div className="col-lg-6" key={event.id}><div className="service-item item-teal position-relative">{event.image_url && <img src={event.image_url} className="img-fluid service-img" alt={event.title} loading="lazy" />}<div><h3>{event.title}</h3><p>{event.description}</p><p><strong>Institute:</strong> {event.venue}<br /><strong>Date:</strong> {new Date(`${event.event_date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div></div>)}
  </div></div></section></main><Footer /></>;
}

function UpcomingEventsPage() {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const loadEvents = () => getEvents().then((data) => {
      if (active) {
        setEvents((data || []).filter((event) => event.status === 'upcoming'));
        setLoaded(true);
      }
    }).catch(() => {
      if (active) setLoaded(true);
    });
    loadEvents();
    const timer = window.setInterval(loadEvents, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return <><Header /><main className="main"><section className="services section light-background"><div className="container section-title"><h2>Upcoming Events</h2><p>Upcoming drone technology programmes and activities at NIT Jalandhar.</p></div><div className="container"><div className="row g-5">
    {events.map((event) => <div className="col-lg-6" key={event.id}><div className="service-item item-cyan position-relative">{event.image_url && <img src={event.image_url} className="img-fluid service-img" alt={event.title} loading="lazy" />}<div><h3>{event.title}</h3><p>{event.description}</p><p><strong>Institute:</strong> {event.venue}<br /><strong>Date:</strong> {new Date(`${event.event_date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div></div>)}
    {loaded && events.length === 0 && <div className="col-12"><p className="text-center">No upcoming events currently.</p></div>}
  </div></div></section></main><Footer /></>;
}

function Contact() {
  const map = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3405.6564071001144!2d75.53427717560658!3d31.39603627427112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a51d30455c189%3A0x69bb14ee6ae6548d!2sDepartment%20Of%20Electronics%20And%20Communication%20Engineering!5e0!3m2!1sen!2sin!4v1734675800425!5m2!1sen!2sin';
  return <section id="contact" className="contact section"><div className="container section-title"><h2>Contact Us</h2></div><div className="container"><div className="row gy-4">
    <div className="col-lg-6"><div className="info-item d-flex flex-column justify-content-center align-items-center"><i className="bi bi-geo-alt" /><h3>Address</h3><p>Dr B R Ambedkar National Institute of Technology Jalandhar<br /><br />Grand Trunk Rd, Preet Nagar, Jalandhar, Punjab 144008</p></div></div>
    <div className="col-lg-3 col-md-6"><div className="info-item d-flex flex-column justify-content-center align-items-center"><i className="bi bi-telephone" /><h3>Call Us</h3><p>+91 99143 74003</p></div></div>
    <div className="col-lg-3 col-md-6"><div className="info-item d-flex flex-column justify-content-center align-items-center"><i className="bi bi-envelope" /><h3>Email Us</h3><p>drone-meity@nitj.ac.in</p></div></div>
  </div><div className="row gy-4 mt-1" style={{ margin: 0, padding: 0 }}><div className="col-lg-12" style={{ width: '100vw', height: '100vh', padding: 0 }}><iframe title="NIT Jalandhar map" src={map} style={{ border: 0, width: '100%', height: '100%' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div></div></div></section>;
}

function HomePage() {
  useEffect(() => {
    document.body.classList.add('index-page');
    const onScroll = () => {
      document.body.classList.toggle('scrolled', window.scrollY > 100);
      document.getElementById('scroll-top')?.classList.toggle('active', window.scrollY > 100);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => { document.body.classList.remove('index-page', 'scrolled'); window.removeEventListener('scroll', onScroll); };
  }, []);
  return <><Header /><main className="main"><Hero /><FeaturedServices /><About /><Team /><Bootcamps /><Contact /></main><Footer /><a href="#" id="scroll-top" className="scroll-top d-flex align-items-center justify-content-center" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><i className="bi bi-arrow-up-short" /></a></>;
}

function BootcampPage({ number }) {
  const [event, setEvent] = useState(null);
  const summary = bootcamps[number - 1];
  const pagePath = Object.keys(legacyPages).find((path) => path.toLowerCase().endsWith(`/boot${number}.html`));
  useEffect(() => {
    let current = true;
    if (!pagePath) return () => { current = false; };
    legacyPages[pagePath]().then((html) => {
      const page = new DOMParser().parseFromString(html, 'text/html');
      const description = page.querySelector('h2')?.parentElement?.querySelector('p')?.textContent?.trim() || '';
      const images = [...page.querySelectorAll('main img')].map((image) => ({ src: imageUrl(image.getAttribute('src')?.split('/').pop()), alt: image.alt }));
      if (current) setEvent({ description, images });
    });
    return () => { current = false; };
  }, [pagePath]);
  return <><Header detail /><main><div className="page-title text-center py-4 bg-light"><h1>{summary?.title || `Bootcamp ${number}.0`}</h1></div><section className="container my-5"><div className="row"><div className="col-lg-6"><h2>About the Bootcamp</h2>{summary && <p className="bootcamp-meta"><strong>Institute:</strong> {summary.institute}<br /><strong>Date:</strong> {summary.date}</p>}<p style={{ textAlign: 'justify' }}>{event?.description || 'Loading bootcamp details...'}</p></div><div className="col-lg-6 text-center">{event?.images[0] && <img src={event.images[0].src} alt={event.images[0].alt || 'Bootcamp Session'} className="img-fluid rounded" />}</div></div></section><section className="container my-5"><div className="row">{event?.images.slice(1).map((image, index) => <div className="col-md-4" key={`${image.src}-${index}`}><img src={image.src} alt={image.alt || 'Bootcamp Activity'} className="img-fluid rounded" loading="lazy" /></div>)}</div></section></main><Footer /></>;
}

function PublicApp() {
  const [number, setNumber] = useState(currentDetailNumber);
  useEffect(() => {
    const onHashChange = () => setNumber(currentDetailNumber());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return number ? <BootcampPage number={number} /> : <HomePage />;
}

function App() {
  const path = window.location.pathname.toLowerCase();
  if (path.endsWith('/admin.html')) return <AdminPage />;
  if (path.endsWith('/upcoming.html')) return <UpcomingEventsPage />;
  if (path.endsWith('/bootcamps.html')) return <BootcampArchivePage />;
  return <PublicApp />;
}

const rootElement = document.getElementById('root');
rootElement._reactRoot ??= createRoot(rootElement);
rootElement._reactRoot.render(<App />);
