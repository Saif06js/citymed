/* =============================================
   CITYMED — hos2.js  (premium update)
   ============================================= */

   const SUPABASE_URL  = 'https://qzppzysjzgslfmlalqcd.supabase.co';
   const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cHB6eXNqemdzbGZtbGFscWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NjA0MjEsImV4cCI6MjA5MTEzNjQyMX0.HWIbu_3BTvbrJDjQyPrX0f0-gcHr4YWBaNc1EWRHWkw';
   const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
   
   let currentUser    = null;
   let selectedDoctor = null;
   
   /* ─────────────────────────────────────────────
      DARK / LIGHT MODE
   ───────────────────────────────────────────── */
   function applyTheme(theme) {
     if (theme === 'dark') {
       document.body.classList.add('dark');
     } else {
       document.body.classList.remove('dark');
     }
     localStorage.setItem('citymed-theme', theme);
     // Update dock buttons if open
     document.querySelectorAll('.theme-dock-btn').forEach(b => {
       b.classList.toggle('active', b.dataset.theme === theme);
     });
   }
   
   window.setTheme = function(theme) {
     applyTheme(theme);
   };
   
   // Init theme
   (function() {
     const saved = localStorage.getItem('citymed-theme') || 'light';
     applyTheme(saved);
   })();
   
   
   /* ─────────────────────────────────────────────
      PREMIUM TOAST SYSTEM
   ───────────────────────────────────────────── */
   let toastContainer = null;
   let toastList = [];
   let toastIdCounter = 0;
   
   function getToastContainer() {
     if (!toastContainer) {
       toastContainer = document.createElement('div');
       toastContainer.className = 'toast-container';
       document.body.appendChild(toastContainer);
     }
     return toastContainer;
   }
   
   function showToast(msg, type = '', duration = 3500, action = null, onAction = null) {
     const container = getToastContainer();
     const id = ++toastIdCounter;
   
     const item = document.createElement('div');
     item.className = 'toast-item' + (type ? ' ' + type : '');
     item.dataset.id = id;
   
     const svgClose = `<svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
   
     item.innerHTML = `
       <span class="toast-item-text">${msg}</span>
       ${action ? `<button class="toast-item-action">${action}</button>` : ''}
       <button class="toast-item-close">${svgClose}</button>
     `;
   
     // Stack existing toasts upward
     toastList.forEach((t, i) => {
       const offset = (toastList.length - i) * 10;
       const scale  = 1 - (toastList.length - i) * 0.04;
       t.el.style.transform = `translateY(-${offset}px) scale(${scale})`;
       t.el.style.opacity   = toastList.length - i >= 3 ? '0' : '1';
     });
   
     container.appendChild(item);
   
     const entry = { id, el: item };
     toastList.push(entry);
   
     // Action button
     if (action && onAction) {
       item.querySelector('.toast-item-action').addEventListener('click', () => {
         onAction();
         removeToast(id);
       });
     }
   
     // Close button
     item.querySelector('.toast-item-close').addEventListener('click', () => removeToast(id));
   
     // Show animation
     requestAnimationFrame(() => {
       requestAnimationFrame(() => item.classList.add('show'));
     });
   
     // Pause on hover
     let timer = setTimeout(() => removeToast(id), duration);
     item.addEventListener('mouseenter', () => clearTimeout(timer));
     item.addEventListener('mouseleave', () => {
       timer = setTimeout(() => removeToast(id), 1500);
     });
   
     entry.timer = timer;
     return id;
   }
   
   function removeToast(id) {
     const idx = toastList.findIndex(t => t.id === id);
     if (idx === -1) return;
     const { el } = toastList[idx];
     el.classList.remove('show');
     el.style.opacity = '0';
     el.style.transform = 'translateY(20px)';
     setTimeout(() => {
       el.remove();
       toastList.splice(idx, 1);
       // Re-stack remaining
       toastList.forEach((t, i) => {
         const offset = (toastList.length - 1 - i) * 10;
         const scale  = 1 - (toastList.length - 1 - i) * 0.04;
         t.el.style.transform = `translateY(-${offset}px) scale(${scale})`;
         t.el.style.opacity   = toastList.length - 1 - i >= 3 ? '0' : '1';
       });
     }, 350);
   }
   
   /* ─────────────────────────────────────────────
      SVG ICON HELPERS
   ───────────────────────────────────────────── */
   const icons = {
     user:      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
     records:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
     calendar:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
     logout:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
     sun:       `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
     moon:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
     settings:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
     hospital:  `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M12 9v6M9 12h6"/></svg>`,
     heart:     `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
     brain:     `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a4 4 0 014 4c0 1-.3 2-.8 2.7A4 4 0 0118 12a4 4 0 01-2 3.5V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-1.5A4 4 0 016 12a4 4 0 012.8-3.3C8.3 8 8 7 8 6a4 4 0 014-4z"/></svg>`,
     eye:       `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
     leaf:      `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 8C8 10 5.9 16.17 3.82 19.83l1.02.57C7 18 8 17 12 17c5 0 8-3 9-10-3 0-5 1-6 2 1-2 2-4 2-6z"/></svg>`,
     home:      `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
     cross:     `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M2 12h20" stroke-linecap="round"/></svg>`,
   };
   
   function getHospitalIcon(hospital) {
     const iconMap = {
       1: icons.hospital,
       2: icons.cross,
       3: icons.heart,
       4: icons.leaf,
       5: icons.heart,
       6: icons.brain,
       7: icons.eye,
       8: icons.home,
     };
     return iconMap[hospital.id] || icons.hospital;
   }
   
   /* ─────────────────────────────────────────────
      DATA — Doctors
   ───────────────────────────────────────────── */
   const doctors = [
     { id:1,  name:"Dr. Sarah Chen",     spec:"Cardiology",    hospital:"Capital Cardiology Center",    rating:4.9, fee:200, avail:"Mon, Wed, Fri" },
     { id:2,  name:"Dr. James Okafor",   spec:"Neurology",     hospital:"Union Neurology Hospital",     rating:4.8, fee:180, avail:"Tue, Thu" },
     { id:3,  name:"Dr. Lin Wei",        spec:"Pediatrics",    hospital:"Children's Research Hospital", rating:4.9, fee:150, avail:"Mon–Fri" },
     { id:4,  name:"Dr. Ahmed Hassan",   spec:"Orthopedics",   hospital:"City General Hospital",        rating:4.7, fee:170, avail:"Mon, Tue, Thu" },
     { id:5,  name:"Dr. Maria Santos",   spec:"Oncology",      hospital:"Metro Medical Center",         rating:4.9, fee:220, avail:"Wed, Fri" },
     { id:6,  name:"Dr. Yuki Tanaka",    spec:"Ophthalmology", hospital:"East Eye & Dental Clinic",     rating:4.8, fee:140, avail:"Mon–Sat" },
     { id:7,  name:"Dr. Priya Sharma",   spec:"Cardiology",    hospital:"City General Hospital",        rating:4.7, fee:190, avail:"Tue, Thu, Sat" },
     { id:8,  name:"Dr. Carlos Rivera",  spec:"Neurology",     hospital:"City General Hospital",        rating:4.6, fee:160, avail:"Mon, Wed" },
     { id:9,  name:"Dr. Fatima Al-Said", spec:"Pediatrics",    hospital:"North Community Hospital",     rating:4.8, fee:130, avail:"Mon–Fri" },
     { id:10, name:"Dr. Robert Kim",     spec:"Orthopedics",   hospital:"North Community Hospital",     rating:4.7, fee:155, avail:"Tue, Fri" },
     { id:11, name:"Dr. Elena Volkov",   spec:"Oncology",      hospital:"Metro Medical Center",         rating:4.9, fee:210, avail:"Mon, Thu" },
     { id:12, name:"Dr. David Mensah",   spec:"Cardiology",    hospital:"Capital Cardiology Center",    rating:4.8, fee:195, avail:"Wed, Sat" },
   ];
   
   /* ─────────────────────────────────────────────
      DATA — Medicines
   ───────────────────────────────────────────── */
   const medicines = [
     { name:"Aspirin",      generic:"Acetylsalicylic acid",  category:"Analgesic",      desc:"Used for pain relief, fever reduction, and prevention of blood clots.", tags:["Pain","Fever","Heart"], warn:"Avoid in children under 12" },
     { name:"Metformin",    generic:"Metformin HCl",         category:"Antidiabetic",   desc:"First-line medication for type 2 diabetes. Reduces glucose production in the liver.", tags:["Diabetes","Blood Sugar"], warn:"Take with food" },
     { name:"Lisinopril",   generic:"Lisinopril",            category:"ACE Inhibitor",  desc:"Treats high blood pressure and heart failure. Helps kidneys function properly.", tags:["Hypertension","Heart"], warn:"Monitor potassium levels" },
     { name:"Atorvastatin", generic:"Atorvastatin calcium",  category:"Statin",         desc:"Lowers cholesterol and reduces risk of heart disease and stroke.", tags:["Cholesterol","Heart"], warn:"Report muscle pain" },
     { name:"Amoxicillin",  generic:"Amoxicillin trihydrate",category:"Antibiotic",     desc:"Broad-spectrum antibiotic for bacterial infections.", tags:["Infection","Antibiotic"], warn:"Complete full course" },
     { name:"Omeprazole",   generic:"Omeprazole",            category:"PPI",            desc:"Reduces stomach acid. Treats GERD, ulcers, and acid reflux.", tags:["Acid Reflux","Stomach"], warn:"Long-term use needs review" },
     { name:"Paracetamol",  generic:"Acetaminophen",         category:"Analgesic",      desc:"Effective for mild to moderate pain and fever.", tags:["Pain","Fever"], warn:"Do not exceed 4g/day" },
     { name:"Amlodipine",   generic:"Amlodipine besylate",   category:"Calcium Blocker",desc:"Treats high blood pressure and chest pain. Relaxes blood vessels.", tags:["Hypertension","Angina"], warn:"May cause ankle swelling" },
     { name:"Ibuprofen",    generic:"Ibuprofen",             category:"NSAID",          desc:"Anti-inflammatory drug for pain, fever, and inflammation.", tags:["Pain","Inflammation"], warn:"Take with food" },
   ];
   
   /* ─────────────────────────────────────────────
      DATA — Hospitals
   ───────────────────────────────────────────── */
   const hospitals = [
     { id:1, name:"City General Hospital",        level:"Grade A+", phone:"010-69155564", addr:"12 Health Ave, East District",     district:"east",  depts:["Cardiology","Neurology","Pediatrics","Surgery","Orthopedics","General Medicine"], desc:"City General Hospital is the city's flagship medical institution, offering comprehensive care across 30+ specialties. Established in 1952, it has served millions of patients with world-class facilities and a team of over 800 specialists.", hours:{"Mon–Fri":"7:00 AM – 8:00 PM","Saturday":"8:00 AM – 5:00 PM","Sunday":"9:00 AM – 3:00 PM","Emergency":"24/7"} },
     { id:2, name:"Metro Medical Center",          level:"Grade A+", phone:"010-69155000", addr:"88 Zhongguancun St, West District", district:"west",  depts:["Oncology","Cardiology","Internal Medicine","Radiology"], desc:"Metro Medical Center specializes in oncology and cardiovascular care, housing the city's most advanced cancer treatment center with proton therapy technology.", hours:{"Mon–Fri":"8:00 AM – 7:00 PM","Saturday":"9:00 AM – 4:00 PM","Sunday":"Closed","Emergency":"24/7"} },
     { id:3, name:"Children's Research Hospital", level:"Grade A+", phone:"010-58301234", addr:"22 Blossom Rd, North District",     district:"north", depts:["Pediatrics","Neonatal Care","Child Neurology","Growth Medicine"], desc:"The city's premier pediatric hospital, dedicated exclusively to children's health. Our team of 400+ pediatric specialists handles complex conditions from birth through adolescence.", hours:{"Mon–Fri":"7:30 AM – 8:00 PM","Saturday":"8:00 AM – 6:00 PM","Sunday":"9:00 AM – 4:00 PM","Emergency":"24/7"} },
     { id:4, name:"TCM Science Hospital",          level:"Grade A",  phone:"010-64014411", addr:"16 Jingshan Blvd, Central",         district:"other", depts:["Traditional Medicine","Acupuncture","Herbal Medicine","Rehabilitation"], desc:"The leading traditional Chinese medicine hospital, blending ancient healing practices with modern diagnostics.", hours:{"Mon–Fri":"8:00 AM – 6:00 PM","Saturday":"9:00 AM – 3:00 PM","Sunday":"Closed","Emergency":"N/A"} },
     { id:5, name:"Capital Cardiology Center",     level:"Grade A+", phone:"010-88396699", addr:"5 Heart Lane, South District",      district:"south", depts:["Cardiology","Cardiac Surgery","Hypertension","Vascular Medicine"], desc:"A dedicated heart center performing over 3,000 cardiac surgeries annually. Home to the region's first robotic-assisted heart surgery program.", hours:{"Mon–Fri":"7:00 AM – 9:00 PM","Saturday":"8:00 AM – 5:00 PM","Sunday":"9:00 AM – 2:00 PM","Emergency":"24/7"} },
     { id:6, name:"Union Neurology Hospital",      level:"Grade A",  phone:"010-69156688", addr:"30 Brain St, West District",         district:"west",  depts:["Neurology","Neurosurgery","Stroke Care","Epilepsy Center"], desc:"Specializing exclusively in neurological conditions, Union Hospital offers cutting-edge treatments for stroke, epilepsy, Parkinson's disease, and brain tumors.", hours:{"Mon–Fri":"8:00 AM – 7:00 PM","Saturday":"9:00 AM – 4:00 PM","Sunday":"Closed","Emergency":"24/7"} },
     { id:7, name:"East Eye & Dental Clinic",      level:"Grade B",  phone:"010-77231100", addr:"44 Clarity Rd, East District",      district:"east",  depts:["Ophthalmology","Dentistry","Orthodontics","Laser Vision"], desc:"A specialized outpatient clinic for vision correction and dental care, with same-day appointment availability and the latest LASIK technology.", hours:{"Mon–Fri":"9:00 AM – 6:00 PM","Saturday":"9:00 AM – 5:00 PM","Sunday":"10:00 AM – 2:00 PM","Emergency":"N/A"} },
     { id:8, name:"North Community Hospital",      level:"Grade B",  phone:"010-66120099", addr:"7 Maple Ave, North District",        district:"north", depts:["General Medicine","Orthopedics","Physiotherapy","Family Medicine"], desc:"A trusted community hospital serving the North District for 40 years, with a strong focus on family medicine, preventive care, and chronic disease management.", hours:{"Mon–Fri":"8:00 AM – 6:00 PM","Saturday":"9:00 AM – 1:00 PM","Sunday":"Closed","Emergency":"N/A"} },
   ];
   
   let visibleCount    = 6;
   let currentFilter   = 'all';
   let currentHospital = null;
   
   /* ─────────────────────────────────────────────
      AUTH STATE
   ───────────────────────────────────────────── */
   db.auth.onAuthStateChange(async (event, session) => {
     if (session?.user) {
       currentUser = session.user;
       const { data: profile } = await db.from('profiles').select('full_name, phone, dob, blood_type, notes, avatar_url').eq('id', currentUser.id).single();
       updateTopbarLoggedIn(profile?.full_name || currentUser.email);
       updateHeaderUser(profile?.full_name || currentUser.email, profile?.avatar_url);
     } else {
       currentUser = null;
       updateTopbarLoggedOut();
       updateHeaderUserLoggedOut();
     }
   });
   
   /* ─────────────────────────────────────────────
      TOPBAR + HEADER USER
   ───────────────────────────────────────────── */
   window.updateTopbarLoggedIn = function(name) {
     const el = document.getElementById('topbarRight');
     if (!el) return;
     el.innerHTML = `
       <span>Hello, <strong style="color:#7fe8d8">${name}</strong></span>
       <span class="topbar-divider">|</span>
       <a href="#" class="topbar-link" onclick="requireLogin(()=>openModal('profileModal')); return false;">My Profile</a>
       <a href="#" class="topbar-link" onclick="requireLogin(()=>openModal('reportsModal')); loadMyAppointments(); return false;">My Records</a>
       <span class="topbar-divider">|</span>
       <a href="#" class="topbar-link" onclick="openModal('helpModal'); return false;">Help</a>
       <a href="#" class="topbar-link" onclick="handleLogout(); return false;">Sign Out</a>
     `;
   };
   
   window.updateTopbarLoggedOut = function() {
    const el = document.getElementById('topbarRight');
    if (!el) return;
    el.innerHTML = `
      <span>Welcome to CityMed</span>
      <span class="topbar-divider">|</span>
      <a href="#" class="topbar-link" onclick="openModal('loginModal'); return false;">Sign In</a>
      <a href="#" class="topbar-link" onclick="openModal('registerModal'); return false;">Register</a>
      <span class="topbar-divider">|</span>
      <a href="#" class="topbar-link" onclick="openModal('helpModal'); return false;">Help</a>
      <a href="#" class="topbar-link" onclick="openModal('qrModal'); setTimeout(drawQR, 100); return false;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="17" y="14" width="4" height="4"/><rect x="14" y="17" width="4" height="4"/></svg>
        QR
      </a>
    `;
  };
   
   function getThemeDock() {
     const current = localStorage.getItem('citymed-theme') || 'light';
     return `
       <div class="theme-dock">
         <button class="theme-dock-btn ${current==='light'?'active':''}" data-theme="light" onclick="setTheme('light')">
           ${icons.sun}
           <span>Light</span>
         </button>
         <button class="theme-dock-btn ${current==='dark'?'active':''}" data-theme="dark" onclick="setTheme('dark')">
           ${icons.moon}
           <span>Dark</span>
         </button>
         <button class="theme-dock-btn" data-theme="settings" onclick="requireLogin(()=>openModal('profileModal')); toggleUserDropdown();">
           ${icons.settings}
           <span>Settings</span>
         </button>
       </div>
     `;
   }
   
   function updateHeaderUser(name, avatarUrl) {
     const el = document.getElementById('headerUser');
     if (!el) return;
     const initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
     const avatarContent = avatarUrl
       ? `<img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`
       : initials;
   
     el.innerHTML = `
       <div class="user-menu-wrap">
         <button class="user-avatar-btn" onclick="toggleUserDropdown()">
           <div class="user-avatar-circle" id="headerAvatarCircle">${avatarContent}</div>
           <span>${name.split(' ')[0]}</span>
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
         </button>
         <div class="user-dropdown" id="userDropdown">
           <div class="user-dropdown-header">
             <div class="udh-name">${name}</div>
             <div class="udh-id">ID: ${currentUser.id.slice(0,8).toUpperCase()}</div>
           </div>
           <div class="user-dropdown-menu">
             <div class="udm-item" onclick="requireLogin(()=>openModal('profileModal')); toggleUserDropdown();">${icons.user} My Profile</div>
             <div class="udm-item" onclick="requireLogin(()=>openModal('reportsModal')); loadMyAppointments(); toggleUserDropdown();">${icons.records} My Records</div>
             <div class="udm-item" onclick="requireLogin(()=>openModal('bookingModal')); toggleUserDropdown();">${icons.calendar} Book Appointment</div>
             <div class="udm-sep"></div>
             ${getThemeDock()}
             <div class="udm-sep"></div>
             <div class="udm-item danger" onclick="handleLogout()">${icons.logout} Sign Out</div>
           </div>
         </div>
       </div>
     `;
   }
   
   function updateHeaderUserLoggedOut() {
     const el = document.getElementById('headerUser');
     if (!el) return;
     el.innerHTML = `
       <button class="header-user-btn" onclick="openModal('loginModal')">
         ${icons.user} Sign In
       </button>
     `;
   }
   
   window.toggleUserDropdown = function() {
     const dd = document.getElementById('userDropdown');
     if (dd) dd.classList.toggle('open');
   };
   
   document.addEventListener('click', e => {
     const wrap = document.querySelector('.user-menu-wrap');
     if (wrap && !wrap.contains(e.target)) {
       document.getElementById('userDropdown')?.classList.remove('open');
     }
   });
   
   /* ─────────────────────────────────────────────
      REQUIRE LOGIN GUARD
   ───────────────────────────────────────────── */
   window.requireLogin = function(callback) {
     if (currentUser) { callback(); }
     else { showToast('Please sign in to continue.', 'error'); openModal('loginModal'); }
   };
   
   /* ─────────────────────────────────────────────
      MODAL SYSTEM
   ───────────────────────────────────────────── */
   const backdrop = document.getElementById('modalBackdrop');
   
   window.openModal = function(id) {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (id === 'profileModal') fillProfileModal();
    if (id === 'qrModal') setTimeout(drawQR, 50); // ADD THIS LINE
  };
   
   function closeAllModals() {
     document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
     backdrop.classList.remove('open');
     document.body.style.overflow = '';
   }
   
   window.switchModal = function(fromId, toId) {
     document.getElementById(fromId)?.classList.remove('open');
     document.getElementById(toId)?.classList.add('open');
     return false;
   };
   
   ['closeLogin','closeRegister','closeHelp','closeHospital','closeBooking','closeProfile','closeReports','closeForgot','closeQr'].forEach(id => {
     document.getElementById(id)?.addEventListener('click', closeAllModals);
   });
   backdrop.addEventListener('click', closeAllModals);
   document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllModals(); });
   
   /* ─────────────────────────────────────────────
      REGISTER
   ───────────────────────────────────────────── */
   window.handleRegister = async function() {
     clearErrors(['rg-fn','rg-ln','rg-email','rg-phone','rg-pass']);
     const firstName = document.getElementById('regFirstName')?.value.trim();
     const lastName  = document.getElementById('regLastName')?.value.trim();
     const email     = document.getElementById('regEmail')?.value.trim();
     const phone     = document.getElementById('regPhone')?.value.trim();
     const password  = document.getElementById('regPassword')?.value;
   
     let valid = true;
     if (!firstName) { setError('rg-fn',  'First name is required'); valid = false; }
     if (!lastName)  { setError('rg-ln',  'Last name is required');  valid = false; }
     if (!email)     { setError('rg-email','Email is required');      valid = false; }
     if (!password || password.length < 8) { setError('rg-pass', 'Min. 8 characters'); valid = false; }
     if (!valid) return;
   
     const btn = document.getElementById('registerBtn');
     btn.textContent = 'Creating account...'; btn.disabled = true;
   
     const { data, error } = await db.auth.signUp({ email, password, options: { data: { full_name: `${firstName} ${lastName}` } } });
     if (error) { showToast(error.message, 'error'); btn.textContent = 'Create Account'; btn.disabled = false; return; }
     if (data.user) { await db.from('profiles').upsert({ id: data.user.id, full_name: `${firstName} ${lastName}`, phone: phone || '' }); }
     btn.textContent = 'Create Account'; btn.disabled = false;
     closeAllModals();
     showToast('Account created! Welcome to CityMed.', 'success', 4000);
   };
   
   /* ─────────────────────────────────────────────
      LOGIN
   ───────────────────────────────────────────── */
   window.handleLogin = async function() {
     clearErrors(['lg-email','lg-pass']);
     const email    = document.getElementById('loginEmail')?.value.trim();
     const password = document.getElementById('loginPassword')?.value;
     let valid = true;
     if (!email)    { setError('lg-email', 'Email is required');    valid = false; }
     if (!password) { setError('lg-pass',  'Password is required'); valid = false; }
     if (!valid) return;
   
     const btn = document.getElementById('loginBtn');
     btn.textContent = 'Signing in...'; btn.disabled = true;
     const { error } = await db.auth.signInWithPassword({ email, password });
     if (error) { setError('lg-pass', error.message); shakeField('lg-pass-group'); btn.textContent = 'Sign In'; btn.disabled = false; return; }
     btn.textContent = 'Sign In'; btn.disabled = false;
     closeAllModals();
     showToast('Welcome back!', 'success', 3000);
   };
   
   /* ─────────────────────────────────────────────
      GOOGLE OAUTH
   ───────────────────────────────────────────── */
   window.signInWithGoogle = async function() {
     const { error } = await db.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });
     if (error) showToast(error.message, 'error');
   };
   
   /* ─────────────────────────────────────────────
      FORGOT PASSWORD
   ───────────────────────────────────────────── */
   window.sendResetCode = async function() {
     const email = document.getElementById('fpEmail')?.value.trim();
     if (!email) { setError('fp-email', 'Enter your email address'); return; }
     const btn = document.getElementById('fpSendBtn');
     btn.textContent = 'Sending...'; btn.disabled = true;
     const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/hos2.html' });
     btn.textContent = 'Send Reset Code'; btn.disabled = false;
     if (error) { setError('fp-email', error.message); return; }
     document.getElementById('fpOtpSection').style.display = 'block';
     btn.style.display = 'none';
     showToast('Reset link sent — check your email.', 'success', 4000);
   };
   
   window.handleResetPassword = async function() {
     const newPass = document.getElementById('fpNewPass')?.value;
     if (!newPass || newPass.length < 8) { setError('fp-newpass', 'Min. 8 characters'); return; }
     const { error } = await db.auth.updateUser({ password: newPass });
     if (error) { showToast(error.message, 'error'); return; }
     closeAllModals();
     showToast('Password updated! Please sign in.', 'success', 4000);
   };
   
   /* ─────────────────────────────────────────────
      LOGOUT
   ───────────────────────────────────────────── */
   window.handleLogout = async function() {
     await db.auth.signOut();
     showToast('Signed out successfully.');
   };
   
   /* ─────────────────────────────────────────────
      PROFILE MODAL
   ───────────────────────────────────────────── */
   async function fillProfileModal() {
     if (!currentUser) return;
     document.getElementById('profileUserId').textContent = currentUser.id.slice(0,8).toUpperCase();
     document.getElementById('pfEmail').value = currentUser.email;
     const { data: profile } = await db.from('profiles').select('*').eq('id', currentUser.id).single();
     if (!profile) return;
     const nameParts = (profile.full_name || '').split(' ');
     document.getElementById('pfFirstName').value = nameParts[0] || '';
     document.getElementById('pfLastName').value  = nameParts.slice(1).join(' ') || '';
     document.getElementById('pfPhone').value     = profile.phone || '';
     document.getElementById('pfDob').value       = profile.dob   || '';
     document.getElementById('pfBlood').value     = profile.blood_type || '';
     document.getElementById('pfNotes').value     = profile.notes || '';
     if (profile.avatar_url) {
       document.getElementById('profileAvatarImg').src = profile.avatar_url;
       document.getElementById('profileAvatarImg').style.display = 'block';
       document.getElementById('avatarPlaceholder').style.display = 'none';
     }
     const { data: bookings } = await db.from('bookings').select('id', { count: 'exact' }).eq('user_id', currentUser.id);
     document.getElementById('pstatAppt').textContent = bookings?.length || 0;
   }
   
   window.saveProfile = async function() {
     if (!currentUser) return;
     const firstName = document.getElementById('pfFirstName').value.trim();
     const lastName  = document.getElementById('pfLastName').value.trim();
     const phone     = document.getElementById('pfPhone').value.trim();
     const dob       = document.getElementById('pfDob').value;
     const blood     = document.getElementById('pfBlood').value;
     const notes     = document.getElementById('pfNotes').value.trim();
     const btn = document.querySelector('#profileModal .modal-btn');
     btn.textContent = 'Saving...'; btn.disabled = true;
     const { error } = await db.from('profiles').upsert({ id: currentUser.id, full_name: `${firstName} ${lastName}`.trim(), phone, dob: dob || null, blood_type: blood || null, notes });
     btn.textContent = 'Save Changes'; btn.disabled = false;
     if (error) { showToast(error.message, 'error'); return; }
     updateTopbarLoggedIn(`${firstName} ${lastName}`.trim());
     updateHeaderUser(`${firstName} ${lastName}`.trim());
     showToast('Profile saved!', 'success');
   };
   
   window.uploadAvatar = async function(input) {
     if (!currentUser || !input.files[0]) return;
     const file = input.files[0];
     const ext  = file.name.split('.').pop();
     const path = `${currentUser.id}/avatar.${ext}`;
     const { error: upErr } = await db.storage.from('avatars').upload(path, file, { upsert: true });
     if (upErr) { showToast('Upload failed: ' + upErr.message, 'error'); return; }
     const { data: { publicUrl } } = db.storage.from('avatars').getPublicUrl(path);
     await db.from('profiles').upsert({ id: currentUser.id, avatar_url: publicUrl });
     document.getElementById('profileAvatarImg').src = publicUrl;
     document.getElementById('profileAvatarImg').style.display = 'block';
     document.getElementById('avatarPlaceholder').style.display = 'none';
     const circle = document.getElementById('headerAvatarCircle');
     if (circle) circle.innerHTML = `<img src="${publicUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"/>`;
     showToast('Avatar updated!', 'success');
   };
   
   /* ─────────────────────────────────────────────
      REPORTS / APPOINTMENTS
   ───────────────────────────────────────────── */
   window.switchReportTab = function(btn, panelId) {
     document.querySelectorAll('.rtab').forEach(t => t.classList.remove('active'));
     document.querySelectorAll('.report-panel').forEach(p => p.classList.add('hidden'));
     btn.classList.add('active');
     document.getElementById(panelId)?.classList.remove('hidden');
     if (panelId === 'rtAppts') loadMyAppointments();
   };
   
   window.loadMyAppointments = async function() {
     if (!currentUser) return;
     const list = document.getElementById('myAppointmentsList');
     if (!list) return;
     list.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:10px 0;">Loading...</p>';
     const { data, error } = await db.from('bookings').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
     if (error || !data?.length) { list.innerHTML = '<div class="empty-state-small"><p>No appointments found.</p></div>'; return; }
     list.innerHTML = data.map(b => `
       <div class="appt-record">
         <div class="appt-record-info">
           <strong>${b.hospital}</strong>
           <span>${b.department} — ${b.book_date}</span>
         </div>
         <span class="appt-status ${b.status}">${b.status}</span>
       </div>
     `).join('');
     document.getElementById('pstatAppt').textContent = data.length;
   };
   
   /* ─────────────────────────────────────────────
      BOOKING — 3-step flow
   ───────────────────────────────────────────── */
   window.bookingNextStep = function(step) {
     if (step === 1) {
       const name  = document.getElementById('bookName')?.value.trim();
       const phone = document.getElementById('bookPhone')?.value.trim();
       const date  = document.getElementById('bookDate')?.value;
       const time  = document.getElementById('bookTime')?.value;
       const dept  = document.getElementById('bookDept')?.value;
       clearErrors(['bk-name','bk-phone','bk-date','bk-time','bk-dept']);
       let valid = true;
       if (!name)  { setError('bk-name',  'Full name required');  valid = false; }
       if (!phone) { setError('bk-phone', 'Phone required');       valid = false; }
       if (!date)  { setError('bk-date',  'Date required');        valid = false; }
       if (!time)  { setError('bk-time',  'Time required');        valid = false; }
       if (!dept)  { setError('bk-dept',  'Department required');  valid = false; }
       if (!valid) return;
   
       const filtered = doctors.filter(d => d.spec.toLowerCase().includes(dept.toLowerCase()) || dept === 'General Medicine');
       const grid = document.getElementById('doctorSelectGrid');
       const docList = filtered.length ? filtered : doctors.slice(0,4);
       grid.innerHTML = docList.map(d => `
         <div class="doc-select-card" onclick="selectDoctor(${d.id}, this)">
           <div class="dsc-avatar">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
           </div>
           <div>
             <div class="dsc-name">${d.name}</div>
             <div class="dsc-spec">${d.spec}</div>
             <div class="dsc-fee">¥ ${d.fee} &nbsp;·&nbsp; ${d.avail}</div>
           </div>
         </div>
       `).join('');
       bookingGoStep(2);
     } else if (step === 2) {
       const dept     = document.getElementById('bookDept')?.value;
       const date     = document.getElementById('bookDate')?.value;
       const time     = document.getElementById('bookTime')?.value;
       const name     = document.getElementById('bookName')?.value;
       const subtitle = document.getElementById('bookingSubtitle')?.textContent.replace('Booking at ','');
       const docName  = selectedDoctor ? selectedDoctor.name : 'Any available doctor';
       const fee      = selectedDoctor ? `¥ ${selectedDoctor.fee}.00` : '¥ 150.00';
       document.getElementById('bookingSummary').innerHTML = `
         <div class="booking-summary-row"><strong>Hospital</strong><span>${subtitle}</span></div>
         <div class="booking-summary-row"><strong>Department</strong><span>${dept}</span></div>
         <div class="booking-summary-row"><strong>Doctor</strong><span>${docName}</span></div>
         <div class="booking-summary-row"><strong>Patient</strong><span>${name}</span></div>
         <div class="booking-summary-row"><strong>Date & Time</strong><span>${date} at ${time}</span></div>
       `;
       document.querySelector('.total-amount').textContent = fee;
       bookingGoStep(3);
     }
   };
   
   window.bookingGoStep = function(step) {
     document.querySelectorAll('.booking-step-panel').forEach((p,i) => p.classList.toggle('hidden', i+1 !== step));
     document.querySelectorAll('.bstep').forEach((s,i) => {
       const n = i+1;
       s.classList.remove('active','done');
       if (n < step)  s.classList.add('done');
       if (n === step) s.classList.add('active');
     });
   };
   
   window.selectDoctor = function(id, el) {
     document.querySelectorAll('.doc-select-card').forEach(c => c.classList.remove('selected'));
     el.classList.add('selected');
     selectedDoctor = doctors.find(d => d.id === id);
   };
   
   document.querySelectorAll('input[name="payMethod"]').forEach(radio => {
     radio.addEventListener('change', () => {
       const cf = document.getElementById('cardFields');
       if (cf) cf.style.display = radio.value === 'card' ? 'block' : 'none';
     });
   });
   
   window.formatCard = function(input) {
     let v = input.value.replace(/\D/g,'').slice(0,16);
     input.value = v.replace(/(.{4})/g,'$1 ').trim();
   };
   
   /* ─────────────────────────────────────────────
      CONFIRM BOOKING
   ───────────────────────────────────────────── */
   window.confirmBooking = async function() {
     const name     = document.getElementById('bookName')?.value.trim();
     const phone    = document.getElementById('bookPhone')?.value.trim();
     const date     = document.getElementById('bookDate')?.value;
     const time     = document.getElementById('bookTime')?.value;
     const dept     = document.getElementById('bookDept')?.value;
     const hospital = document.getElementById('bookingSubtitle')?.textContent.replace('Booking at ','').trim();
     const method   = document.querySelector('input[name="payMethod"]:checked')?.value || 'card';
     const btn = document.getElementById('confirmBookingBtn');
     btn.textContent = 'Processing...'; btn.disabled = true;
     const { error } = await db.from('bookings').insert({ user_id: currentUser?.id || null, full_name: name, phone, hospital, department: dept, book_date: date, book_time: time, doctor_name: selectedDoctor?.name || null, payment_method: method, status: 'pending' });
     btn.textContent = 'Confirm & Pay'; btn.disabled = false;
     if (error) { showToast('Booking failed: ' + error.message, 'error'); return; }
     closeAllModals();
     bookingGoStep(1);
     selectedDoctor = null;
     showToast(`Appointment confirmed for ${name} on ${date}!`, 'success', 5000);
   };
   
   /* ─────────────────────────────────────────────
      QUICK BOOK
   ───────────────────────────────────────────── */
   window.quickBookSubmit = function() {
     const district = document.getElementById('qbDistrict')?.value;
     const hospital = document.getElementById('qbHospital')?.value;
     const dept     = document.getElementById('qbDept')?.value;
     if (!district || !hospital || !dept) { showToast('Please fill in all fields.', 'warning'); return; }
     requireLogin(() => {
       const subtitle = document.getElementById('bookingSubtitle');
       if (subtitle) subtitle.textContent = `Booking at ${hospital}`;
       const deptSel = document.getElementById('bookDept');
       if (deptSel) { for (let opt of deptSel.options) { if (opt.value === dept) { deptSel.value = dept; break; } } }
       openModal('bookingModal');
     });
   };
   
   /* ─────────────────────────────────────────────
      SEARCH → RESULTS PAGE
   ───────────────────────────────────────────── */
   function buildResultsPage() {
     if (document.getElementById('resultsPage')) return;
     const page = document.createElement('div');
     page.id = 'resultsPage';
     page.innerHTML = `
       <div class="results-header">
         <button class="results-back-btn" onclick="closeResultsPage()">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
           Back
         </button>
         <span class="results-query" id="resultsQuery"></span>
       </div>
       <div class="results-body">
         <p class="results-count" id="resultsCount"></p>
         <div class="results-grid" id="resultsGrid"></div>
       </div>
     `;
     document.body.appendChild(page);
   }
   
   window.doSearch = function() {
     const query = document.getElementById('searchInput')?.value.trim().toLowerCase();
     const type  = document.getElementById('searchType')?.value;
     if (!query) { showToast('Please enter a search term.', 'warning'); return; }
     buildResultsPage();
   
     let results = [];
     if (type === 'medicine') {
       results = medicines.filter(m => m.name.toLowerCase().includes(query) || m.generic.toLowerCase().includes(query) || m.category.toLowerCase().includes(query) || m.tags.some(t => t.toLowerCase().includes(query)));
       document.getElementById('resultsQuery').innerHTML = `Medicine results for <strong>"${query}"</strong>`;
       document.getElementById('resultsCount').innerHTML = `<strong>${results.length}</strong> medicine${results.length!==1?'s':''} found`;
       document.getElementById('resultsGrid').innerHTML = results.length === 0
         ? `<div class="results-empty" style="grid-column:1/-1"><h3>No medicines found</h3></div>`
         : results.map(m => `
             <div class="result-card">
               <div class="med-category">${m.category}</div>
               <div class="result-name">${m.name}</div>
               <div style="font-size:12px;color:var(--muted);font-style:italic;margin-bottom:6px;">${m.generic}</div>
               <div style="font-size:12.5px;color:var(--text-2);line-height:1.6;">${m.desc}</div>
               <div class="result-depts" style="margin-top:8px;">${m.tags.map(t=>`<span class="result-dept-tag">${t}</span>`).join('')}</div>
             </div>`).join('');
     } else if (type === 'doctor') {
       results = doctors.filter(d => d.name.toLowerCase().includes(query) || d.spec.toLowerCase().includes(query) || d.hospital.toLowerCase().includes(query));
       document.getElementById('resultsQuery').innerHTML = `Doctor results for <strong>"${query}"</strong>`;
       document.getElementById('resultsCount').innerHTML = `<strong>${results.length}</strong> doctor${results.length!==1?'s':''} found`;
       document.getElementById('resultsGrid').innerHTML = results.length === 0
         ? `<div class="results-empty" style="grid-column:1/-1"><h3>No doctors found</h3></div>`
         : results.map(d => `
             <div class="result-card" onclick="requireLogin(()=>openModal('bookingModal'))">
               <div class="result-card-top">
                 <div class="result-icon">${icons.user}</div>
                 <div><div class="result-name">${d.name}</div><span class="result-badge">${d.spec}</span></div>
               </div>
               <div class="result-meta">${d.hospital}<br>★ ${d.rating} &nbsp;·&nbsp; ¥${d.fee} consultation</div>
             </div>`).join('');
     } else {
       results = hospitals.filter(h => {
         const matchName  = h.name.toLowerCase().includes(query);
         const matchDepts = h.depts.some(d => d.toLowerCase().includes(query));
         const matchAddr  = h.addr.toLowerCase().includes(query);
         if (type === 'hospital')   return matchName || matchAddr;
         if (type === 'department') return matchDepts;
         return matchName || matchDepts || matchAddr;
       });
       document.getElementById('resultsQuery').innerHTML = `Results for <strong>"${query}"</strong>`;
       document.getElementById('resultsCount').innerHTML = `<strong>${results.length}</strong> hospital${results.length!==1?'s':''} found`;
       document.getElementById('resultsGrid').innerHTML = results.length === 0
         ? `<div class="results-empty" style="grid-column:1/-1"><h3>No results found</h3></div>`
         : results.map(h => `
             <div class="result-card" onclick="openHospitalModal(${h.id})">
               <div class="result-card-top">
                 <div class="result-icon">${getHospitalIcon(h)}</div>
                 <div><div class="result-name">${h.name}</div><span class="result-badge">${h.level}</span></div>
               </div>
               <div class="result-meta">Tel: ${h.phone}<br>${h.addr}</div>
               <div class="result-depts">
                 ${h.depts.slice(0,3).map(d=>`<span class="result-dept-tag">${d}</span>`).join('')}
                 ${h.depts.length>3?`<span class="result-dept-tag">+${h.depts.length-3}</span>`:''}
               </div>
             </div>`).join('');
     }
   
     document.getElementById('resultsPage').classList.add('open');
     document.body.style.overflow = 'hidden';
   };
   
   window.closeResultsPage = function() {
     document.getElementById('resultsPage')?.classList.remove('open');
     document.body.style.overflow = '';
   };
   
   /* ─────────────────────────────────────────────
      HOSPITAL CARDS
   ───────────────────────────────────────────── */
   function renderHospitalCards(filter = 'all', limit = 6) {
     const grid = document.getElementById('hospitalGrid');
     if (!grid) return;
     const filtered = filter === 'all' ? hospitals : hospitals.filter(h => h.district === filter);
     grid.innerHTML = filtered.slice(0, limit).map(h => `
       <div class="hosp-card" onclick="openHospitalModal(${h.id})">
         <div class="hosp-img">${getHospitalIcon(h)}</div>
         <div class="hosp-info">
           <div class="hosp-name">${h.name} <span class="hosp-badge">${h.level}</span></div>
           <div class="hosp-meta">Tel: ${h.phone}<br>${h.addr}</div>
         </div>
       </div>
     `).join('');
   }
   renderHospitalCards();
   
   /* ─────────────────────────────────────────────
      HOSPITAL DETAIL MODAL
   ───────────────────────────────────────────── */
   window.openHospitalModal = function(id) {
     const h = hospitals.find(x => x.id === id);
     if (!h) return;
     currentHospital = h;
     document.getElementById('hospModalIcon').innerHTML  = getHospitalIcon(h);
     document.getElementById('hospModalName').textContent  = h.name;
     document.getElementById('hospModalBadge').textContent = h.level;
     document.getElementById('hospModalDesc').textContent  = h.desc;
     document.getElementById('bookingSubtitle').textContent = `Booking at ${h.name}`;
     document.getElementById('hospModalMeta').innerHTML    = `Tel: ${h.phone} &nbsp;&nbsp; ${h.addr}`;
     document.getElementById('hospModalDepts').innerHTML   = h.depts.map(d=>`<span>${d}</span>`).join('');
     document.getElementById('hospModalHours').innerHTML   = Object.entries(h.hours).map(([day,time])=>`<div><strong>${day}:</strong> ${time}</div>`).join('');
     document.querySelectorAll('.hm-tab').forEach((t,i)  => t.classList.toggle('active', i===0));
     document.querySelectorAll('.hosp-tab-panel').forEach((p,i) => p.classList.toggle('hidden', i!==0));
     document.getElementById('resultsPage')?.classList.remove('open');
     openModal('hospitalModal');
   };
   
   window.switchHospTab = function(btn, panelId) {
     document.querySelectorAll('.hm-tab').forEach(t => t.classList.remove('active'));
     document.querySelectorAll('.hosp-tab-panel').forEach(p => p.classList.add('hidden'));
     btn.classList.add('active');
     document.getElementById(panelId)?.classList.remove('hidden');
   };
   
   window.openBookingFromHospital = function() {
     requireLogin(() => {
       switchModal('hospitalModal','bookingModal');
       if (currentHospital) {
         document.getElementById('bookingSubtitle').textContent = `Booking at ${currentHospital.name}`;
         document.getElementById('bookDept').innerHTML = `<option value="">Select department</option>` + currentHospital.depts.map(d=>`<option>${d}</option>`).join('');
       }
     });
   };
   
   /* ─────────────────────────────────────────────
      FILTERS
   ───────────────────────────────────────────── */
   window.filterDistrict = function(btn, district) {
     document.querySelectorAll('.dist-btn').forEach(b => b.classList.remove('active'));
     btn.classList.add('active');
     currentFilter = district; visibleCount = 6;
     renderHospitalCards(district, visibleCount);
   };
   
   window.filterByDept = function(dept) {
     const results = hospitals.filter(h => h.depts.some(d => d.toLowerCase().includes(dept.toLowerCase())));
     buildResultsPage();
     document.getElementById('resultsQuery').innerHTML = `Hospitals offering <strong>"${dept}"</strong>`;
     document.getElementById('resultsCount').innerHTML = `<strong>${results.length}</strong> hospital${results.length!==1?'s':''} found`;
     document.getElementById('resultsGrid').innerHTML = results.length === 0
       ? `<div class="results-empty" style="grid-column:1/-1"><h3>No hospitals found for "${dept}"</h3></div>`
       : results.map(h=>`
           <div class="result-card" onclick="openHospitalModal(${h.id})">
             <div class="result-card-top">
               <div class="result-icon">${getHospitalIcon(h)}</div>
               <div><div class="result-name">${h.name}</div><span class="result-badge">${h.level}</span></div>
             </div>
             <div class="result-meta">Tel: ${h.phone}<br>${h.addr}</div>
             <div class="result-depts">${h.depts.slice(0,3).map(d=>`<span class="result-dept-tag">${d}</span>`).join('')}</div>
           </div>`).join('');
     document.getElementById('resultsPage').classList.add('open');
     document.body.style.overflow = 'hidden';
     return false;
   };
   
   window.loadMoreHospitals = function() {
     visibleCount += 4;
     renderHospitalCards(currentFilter, visibleCount);
     const total = hospitals.filter(h => currentFilter==='all' ? true : h.district===currentFilter).length;
     if (visibleCount >= total) {
       const link = document.querySelector('.more-link a');
       if (link) link.textContent = 'All hospitals shown';
     }
   };
   
   window.switchTab = function(btn) {
     document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
     btn.classList.add('active');
   };
   
   window.scrollToSection = function(id) {
     document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
     return false;
   };
   
   /* ─────────────────────────────────────────────
      DOCTORS SECTION
   ───────────────────────────────────────────── */
   function renderDoctors(filter = 'all') {
     const grid = document.getElementById('doctorsGrid');
     if (!grid) return;
     const filtered = filter === 'all' ? doctors : doctors.filter(d => d.spec === filter);
     grid.innerHTML = filtered.map(d => `
       <div class="doctor-card" onclick="requireLogin(()=>openModal('bookingModal'))">
         <div class="doctor-avatar">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
         </div>
         <div class="doctor-name">${d.name}</div>
         <div class="doctor-spec">${d.spec}</div>
         <div class="doctor-hospital">${d.hospital}</div>
         <div class="doctor-rating">
           <span class="doctor-rating-stars">${'★'.repeat(Math.floor(d.rating))}${d.rating%1?'½':''}</span>
           <span class="doctor-rating-num">${d.rating}</span>
         </div>
         <button class="doctor-book-btn">Book — ¥${d.fee}</button>
       </div>
     `).join('');
   }
   renderDoctors();
   
   window.filterDoctors = function(btn, filter) {
     document.querySelectorAll('.dcat-btn').forEach(b => b.classList.remove('active'));
     btn.classList.add('active');
     renderDoctors(filter);
   };
   
   /* ─────────────────────────────────────────────
      MEDICINES
   ───────────────────────────────────────────── */
   function renderMedicines(list) {
     const grid = document.getElementById('medicinesGrid');
     if (!grid) return;
     if (!list.length) { grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);">No medicines found.</div>`; return; }
     grid.innerHTML = list.map(m => `
       <div class="med-card">
         <div class="med-category">${m.category}</div>
         <div class="med-name">${m.name}</div>
         <div class="med-generic">${m.generic}</div>
         <div class="med-desc">${m.desc}</div>
         <div class="med-tags">
           ${m.tags.map(t=>`<span class="med-tag">${t}</span>`).join('')}
           <span class="med-warn">${m.warn}</span>
         </div>
       </div>
     `).join('');
   }
   renderMedicines(medicines);
   
   window.searchMedicines = function() {
     const q = document.getElementById('medSearchInput')?.value.trim().toLowerCase();
     if (!q) { renderMedicines(medicines); return; }
     renderMedicines(medicines.filter(m => m.name.toLowerCase().includes(q) || m.generic.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q))));
   };
   
   /* ─────────────────────────────────────────────
      NOTICES
   ───────────────────────────────────────────── */
   const notices = [
     "Outpatient specialist clinics — temporary suspension notice",
     "Updated epidemic prevention and control guidelines",
     "Emergency dept appointment system maintenance notice",
     "Health insurance policy upgrade effective immediately",
     "Online booking platform scheduled downtime notice",
   ];
   const suspensions = [
     "City General Hospital — ENT dept suspension notice",
     "Metro Medical Center — cardiology clinic rescheduled",
     "North Children's Hospital — outpatient slots reduced",
     "Union Hospital — radiology dept temporary closure",
     "Capital Cardiology Center — doctor leave notice",
   ];
   function renderList(id, items) {
     const ul = document.getElementById(id);
     if (!ul) return;
     items.forEach((txt, i) => {
       const li = document.createElement('li');
       li.innerHTML = `<span class="list-num">${i+1}</span><span>${txt}</span>`;
       ul.appendChild(li);
     });
   }
   renderList('noticeList', notices);
   renderList('suspensionList', suspensions);
   
   /* ─────────────────────────────────────────────
      CAROUSEL
   ───────────────────────────────────────────── */
   const track = document.getElementById('carouselTrack');
   const dots  = document.querySelectorAll('.dot');
   let current = 0;
   const total = 3;
   let autoTimer;
   function goTo(index) {
     current = (index + total) % total;
     if (track) track.style.transform = `translateX(-${current * 100}%)`;
     dots.forEach((d,i) => d.classList.toggle('active', i === current));
   }
   document.getElementById('prevBtn')?.addEventListener('click', () => { goTo(current-1); resetAuto(); });
   document.getElementById('nextBtn')?.addEventListener('click', () => { goTo(current+1); resetAuto(); });
   dots.forEach((dot,i) => dot.addEventListener('click', () => { goTo(i); resetAuto(); }));
   function resetAuto() {
     clearInterval(autoTimer);
     autoTimer = setInterval(() => goTo(current+1), 4000);
   }
   resetAuto();
   
   /* ─────────────────────────────────────────────
      STATS COUNTER
   ───────────────────────────────────────────── */
   function animateCounters() {
     document.querySelectorAll('.stat-num').forEach(el => {
       const target = parseInt(el.dataset.target);
       const step = target / (1500 / 16);
       let val = 0;
       const timer = setInterval(() => {
         val += step;
         if (val >= target) { el.textContent = target.toLocaleString(); clearInterval(timer); }
         else el.textContent = Math.floor(val).toLocaleString();
       }, 16);
     });
   }
   const statsBanner = document.querySelector('.stats-banner');
   if (statsBanner) {
     new IntersectionObserver(entries => {
       if (entries[0].isIntersecting) animateCounters();
     }, { threshold: 0.3 }).observe(statsBanner);
   }
   
   /* ─────────────────────────────────────────────
      QR CODE — FIXED
   ───────────────────────────────────────────── */
   window.drawQR = function() {
    const el = document.getElementById('qrCanvas');
    if (!el) return;
    el.innerHTML = '';
    const url = 'https://saif06js.github.io/citymed/hos2.html';
    const isDark = document.body.classList.contains('dark');
    
    const canvas = document.createElement('canvas');
    el.appendChild(canvas);
    
    QRCode.toCanvas(canvas, url, {
      width: 200,
      margin: 2,
      color: {
        dark: isDark ? '#ffffff' : '#0a4d68',
        light: isDark ? '#0a1520' : '#ffffff'
      }
    }, function(error) {
      if (error) {
        el.innerHTML = '<p style="color:var(--muted);font-size:12px;text-align:center;padding:30px;">QR generation failed.</p>';
      }
    });
  };
   /* ─────────────────────────────────────────────
      FORM VALIDATION HELPERS
   ───────────────────────────────────────────── */
   function setError(prefix, msg) {
     const group = document.getElementById(prefix + '-group');
     const err   = document.getElementById(prefix + '-err');
     if (group) group.classList.add('error');
     if (err)   err.textContent = msg;
   }
   function clearErrors(prefixes) {
     prefixes.forEach(p => {
       const group = document.getElementById(p + '-group');
       const err   = document.getElementById(p + '-err');
       if (group) group.classList.remove('error','shake');
       if (err)   err.textContent = '';
     });
   }
   function shakeField(groupId) {
     const el = document.getElementById(groupId);
     if (!el) return;
     el.classList.add('shake');
     setTimeout(() => el.classList.remove('shake'), 600);
   }
   window.togglePass = function(inputId, btn) {
     const input = document.getElementById(inputId);
     if (!input) return;
     const isPass = input.type === 'password';
     input.type = isPass ? 'text' : 'password';
     btn.classList.toggle('visible', isPass);
   };


  //  safety net for qr

  if (!window.drawQR) {
    window.drawQR = function() {
      const el = document.getElementById('qrCanvas');
      if (!el) return;
      el.innerHTML = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="white"/><rect x="10" y="10" width="50" height="50" fill="#0a4d68"/><rect x="18" y="18" width="34" height="34" fill="white"/><rect x="26" y="26" width="18" height="18" fill="#0a4d68"/><rect x="140" y="10" width="50" height="50" fill="#0a4d68"/><rect x="148" y="18" width="34" height="34" fill="white"/><rect x="156" y="26" width="18" height="18" fill="#0a4d68"/><rect x="10" y="140" width="50" height="50" fill="#0a4d68"/><rect x="18" y="148" width="34" height="34" fill="white"/><rect x="26" y="156" width="18" height="18" fill="#0a4d68"/></svg>`;
    };
  }
