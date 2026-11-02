"use client";

import { useCallback, useEffect, useMemo, useState, FormEvent } from "react";

type User = { user_id: number; full_name: string; email: string; role: string };
type Job = {
  jobId: number; title: string; company: string; description?: string | null;
  type?: string; location?: string | null; salaryOrStipend?: number | string | null;
  deadline?: string | null; matchPercentage: number | null;
  matchingSkills: string[]; missingSkills: string[]; explanation: string;
};
type Application = {
  application_id: number; status: string; applied_at: string;
  job_id: number; title: string; company_name: string;
};
type InboxMessage = { message_id: number; sender_id: number; recipient_id: number; subject: string | null; body: string; created_at: string; read_at: string | null; sender_name: string; recipient_name: string };
type Section = "jobs" | "resumes" | "autopilot" | "inbox" | "applications" | "insights" | "settings" | "help";

const nav: { id: Section; label: string; icon: string }[] = [
  { id: "jobs", label: "Match Jobs", icon: "âŒ•" },
  { id: "resumes", label: "Tailored Resumes", icon: "â–¤" },
  { id: "autopilot", label: "Autopilot", icon: "âž¤" },
  { id: "inbox", label: "Inbox", icon: "âœ‰" },
  { id: "applications", label: "Application Tracker", icon: "â–£" },
  { id: "insights", label: "Insights", icon: "â–¥" },
];

export default function Home() {
  const handleTailoredPdf = async () => {
    try {
      const response = await fetch("/api/resume/tailor", {
        method: "GET",
        cache: "no-store"
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Could not generate resume PDF.");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "SmartIntern_Tailored_Resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Unable to generate PDF. Please try again.");
    }
  };

  const [user, setUser] = useState<User | null>(null);
  const [hasResume, setHasResume] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [section, setSection] = useState<Section>("jobs");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountRole, setAccountRole] = useState<"student" | "recruiter">("student");
  const [resume, setResume] = useState<File | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [minMatch, setMinMatch] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [inboxContacts, setInboxContacts] = useState<{user_id:number;full_name:string;email:string}[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [inboxSubject, setInboxSubject] = useState("");
  const [inboxBody, setInboxBody] = useState("");
  const [inboxLoading, setInboxLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    const profileRes = await fetch("/api/profile", { cache: "no-store" });
    if (!profileRes.ok) { setUser(null); return; }
    const profile = await profileRes.json();
    setUser(profile.user);
    setHasResume(Boolean(profile.hasResume));
    setResumeName(profile.resume?.file_name || "");
    const [recRes, appRes] = await Promise.all([
      fetch("/api/recommendations", { cache: "no-store" }),
      fetch("/api/applications", { cache: "no-store" }),
    ]);
    if (recRes.ok) { const d = await recRes.json(); setJobs(Array.isArray(d.recommendations) ? d.recommendations : []); }
    if (appRes.ok) { const d = await appRes.json(); setApplications(Array.isArray(d.applications) ? d.applications : []); }
  }, []);

  useEffect(() => { loadDashboard().catch(() => setError("Could not load your dashboard.")); }, [loadDashboard]);

  async function handleAuth(e: FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login" ? { email, password } : { full_name: name, email, password, role: accountRole };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Authentication failed.");
      if (mode === "register") {
        const loginRes = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error || "Account created. Please log in.");
      }
      await loadDashboard(); setMessage("Welcome to SmartIntern.");
    } catch (err) { setError(err instanceof Error ? err.message : "Authentication failed."); }
    finally { setLoading(false); }
  }

  async function handleResumeUpload(e: FormEvent) {
    e.preventDefault(); if (!resume) return; setLoading(true); setError("");
    try {
      const fd = new FormData(); fd.append("resume", resume);
      const res = await fetch("/api/resume/upload", { method: "POST", body: fd });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Resume upload failed.");
      setMessage(`Resume analyzed. ${data.extractedSkills?.length ?? 0} skills identified.`); setResume(null); await loadDashboard();
    } catch (err) { setError(err instanceof Error ? err.message : "Resume upload failed."); }
    finally { setLoading(false); }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null); setHasResume(false); setJobs([]); setApplications([]); setSection("jobs"); setMessage("Logged out.");
  }

  async function submitApplication() {
    if (!selectedJob) return; setLoading(true); setError("");
    try {
      const res = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId: selectedJob.jobId }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Could not apply.");
      setSelectedJob(null); setSection("applications"); setMessage("Application submitted successfully."); await loadDashboard();
    } catch (err) { setError(err instanceof Error ? err.message : "Application failed."); }
    finally { setLoading(false); }
  }

  const loadInbox = useCallback(async () => {
    setInboxLoading(true);
    try {
      const res = await fetch("/api/inbox", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load inbox.");
      setInboxMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load inbox."); }
    finally { setInboxLoading(false); }
  }, []);

  useEffect(() => { if (user && section === "inbox") loadInbox(); }, [user, section, loadInbox]);

  async function sendInboxMessage(e: FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/inbox", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: Number(recipientId), subject: inboxSubject, body: inboxBody }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send message.");
      setInboxSubject(""); setInboxBody(""); setMessage("Message sent successfully."); await loadInbox();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not send message."); }
    finally { setLoading(false); }
  }

  async function markInboxRead(id: number) {
    try {
      const res = await fetch(`/api/inbox/${id}/read`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not mark message read.");
      setInboxMessages(items => items.map(item => item.message_id === id ? { ...item, read_at: data.message.read_at } : item));
    } catch (err) { setError(err instanceof Error ? err.message : "Could not mark message read."); }
  }

  const filteredJobs = useMemo(() => jobs.filter(j => {
    const q = query.toLowerCase();
    const textMatch = !q || [j.title, j.company, j.description, ...(j.matchingSkills || [])].some(v => String(v || "").toLowerCase().includes(q));
    const locMatch = locationFilter === "all" || (j.location || "").toLowerCase().includes(locationFilter);
    const score = j.matchPercentage ?? -1;
    return textMatch && locMatch && (minMatch === "all" || score >= Number(minMatch));
  }), [jobs, query, locationFilter, minMatch]);

  const applied = applications.length;
  const inProgress = applications.filter(a => ["Under Review", "Shortlisted"].includes(a.status)).length;
  const selected = applications.filter(a => a.status === "Selected").length;
  const statusCount = (status: string) => applications.filter(a => a.status === status).length;
  const title = nav.find(n => n.id === section)?.label || section[0].toUpperCase() + section.slice(1);
  const card = "rounded-2xl border border-[#e9edf5] bg-white shadow-[0_3px_14px_rgba(30,55,100,.045)]";

  if (!user) return <main className="min-h-screen bg-[#f4f7ff] flex items-center justify-center p-5"><div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2"><div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-10 text-white"><div className="text-3xl font-extrabold">smartintern</div><p className="mt-16 text-sm font-semibold tracking-widest text-blue-200">YOUR CAREER, INTELLIGENTLY MATCHED</p><h1 className="mt-4 text-4xl font-bold">Find opportunities that match your potential.</h1><p className="mt-5 leading-7 text-blue-100">Upload your resume, discover skill-based opportunities and track your applications.</p></div><div className="p-8 md:p-12"><p className="text-sm font-bold text-blue-700">SMARTINTERN</p><h2 className="mt-3 text-3xl font-bold text-slate-900">{mode === "login" ? "Welcome back" : "Create account"}</h2><form onSubmit={handleAuth} className="mt-8 space-y-4">{mode === "register" && <><input className="w-full rounded-xl border p-3" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required /><select className="w-full rounded-xl border p-3 bg-white" value={accountRole} onChange={e => setAccountRole(e.target.value as "student" | "recruiter")}><option value="student">Register as Student</option><option value="recruiter">Register as Recruiter</option></select></>}<input className="w-full rounded-xl border p-3" type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required /><input className="w-full rounded-xl border p-3" type="password" placeholder="Password (minimum 8 characters)" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required /><button disabled={loading} className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white">{loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}</button></form>{error && <p className="mt-4 text-sm text-red-600">{error}</p>}<button className="mt-6 text-sm font-semibold text-blue-700" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "New here? Create an account" : "Already registered? Log in"}</button></div></div></main>;

  if (!hasResume) return <main className="min-h-screen bg-[#f5f7fc]"><header className="flex justify-between bg-white p-5 shadow-sm"><b className="text-2xl text-blue-700">smartintern</b><button onClick={logout}>Log out</button></header><section className="mx-auto max-w-2xl px-5 py-16"><h1 className="text-3xl font-bold">Welcome, {user.full_name}</h1><p className="mt-2 text-slate-600">Upload your PDF resume to generate your skill profile and recommendations.</p><form onSubmit={handleResumeUpload} className={`${card} mt-8 p-6`}><input type="file" accept="application/pdf,.pdf" onChange={e => setResume(e.target.files?.[0] || null)} className="block w-full"/><button disabled={!resume || loading} className="mt-6 w-full rounded-xl bg-blue-600 p-3 font-semibold text-white">{loading ? "Analyzing..." : "Upload and analyze resume"}</button></form>{error && <p className="mt-4 text-red-600">{error}</p>}</section></main>;

  return <main className="min-h-screen bg-[#f7f9fd] text-[#202b43]">
    <header className="flex h-[54px] items-center justify-between border-b border-slate-100 bg-white px-5">
      <div className="text-[19px] font-extrabold tracking-tight text-[#4165d9]">smartintern<span className="text-[#8aa2ef]">.</span></div>
      <div className="hidden w-[310px] items-center justify-center rounded-lg border border-slate-100 bg-[#fafbfe] py-1.5 text-[11px] text-slate-400 sm:flex">ðŸ”’ app.smartintern.ai</div>
      <div className="flex items-center gap-4"><span className="text-slate-400">â™§</span><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8efff] text-sm font-bold text-blue-700">{user.full_name.charAt(0).toUpperCase()}</span></div>
    </header>
    <div className="grid min-h-[calc(100dvh-54px)] grid-cols-[150px_minmax(0,1fr)] lg:grid-cols-[190px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col border-r border-slate-100 bg-white px-3 py-5">
        <div className="mb-7 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-300">Workspace</div>
        <nav className="space-y-1">{nav.map(n => <button key={n.id} onClick={() => setSection(n.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] font-semibold transition ${section === n.id ? "bg-[#edf2ff] text-[#4165d9]" : "text-[#68758d] hover:bg-slate-50"}`}><span className="w-4 text-[15px]">{n.icon}</span>{n.label}{n.id === "inbox" && <span className="ml-auto rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] text-blue-600">0</span>}</button>)}</nav>
        <div className="mt-auto space-y-1 border-t border-slate-100 pt-4"><button onClick={() => setSection("settings")} className="w-full rounded-lg px-3 py-2 text-left text-[11px] text-slate-500">âš™ Settings</button><button onClick={() => setSection("help")} className="w-full rounded-lg px-3 py-2 text-left text-[11px] text-slate-500">â“˜ Help</button><div className="mt-3 border-t border-slate-100 px-3 pt-3"><p className="truncate text-[10px] font-semibold">{user.full_name}</p><button onClick={logout} className="mt-1 text-[10px] text-blue-600">Log out â†—</button></div></div>
      </aside>
      <section className="min-w-0 p-3 sm:p-4 xl:p-5">
        {error && <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-700">{error}</div>}
        {message && <div className="mb-2 rounded-lg bg-green-50 px-3 py-2 text-[11px] text-green-700">{message}</div>}
        {section === "jobs" && <>
          <div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-medium text-slate-400">YOUR WORKSPACE / OPPORTUNITIES</p><h1 className="text-[21px] font-bold tracking-tight">Match Jobs</h1></div><span className="rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-semibold text-green-700">â— Recommendations Active</span></div>
          <div className="grid min-w-0 grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex gap-2"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="âŒ•  Search jobs, companies, or keywords..." className="min-w-0 flex-1 rounded-lg border border-[#e8edf5] bg-white px-3 py-2 text-[11px] outline-none focus:border-blue-300"/><select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="w-[105px] rounded-lg border border-[#e8edf5] bg-white px-2 text-[10px]"><option value="all">All locations</option><option value="remote">Remote</option><option value="bengaluru">Bengaluru</option></select><select value={minMatch} onChange={e => setMinMatch(e.target.value)} className="w-[100px] rounded-lg border border-[#e8edf5] bg-white px-2 text-[10px]"><option value="all">Filters</option><option value="70">70%+ match</option><option value="50">50%+ match</option></select></div>
              <div className={`${card} min-w-0 overflow-x-auto`}>
                <div className="grid min-w-[560px] grid-cols-[2fr_1.15fr_.65fr_1fr] border-b border-slate-100 bg-[#fbfcff] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400"><span>Job title</span><span>Company</span><span>Match</span><span>Location</span></div>
                <div className="min-w-[560px] divide-y divide-slate-100">{filteredJobs.slice(0, 6).map(j => <div key={j.jobId} className="grid grid-cols-[2fr_1.15fr_.65fr_1fr] items-center gap-2 px-4 py-3"><div className="min-w-0"><p className="truncate text-[11px] font-semibold text-[#26334d]">{j.title}</p><p className="mt-0.5 text-[9px] text-slate-400">{j.type || "Opportunity"}</p></div><span className="truncate text-[10px] text-slate-600">{j.company}</span><span className="w-fit rounded-full bg-[#eaf8ef] px-2 py-1 text-[9px] font-bold text-green-700">{j.matchPercentage === null ? "N/A" : `${j.matchPercentage}%`}</span><div className="flex min-w-0 items-center justify-between gap-1"><span className="truncate text-[9px] text-slate-500">{j.location || "â€”"}</span><button onClick={() => setSelectedJob(j)} className="rounded-md bg-[#4969e8] px-2.5 py-1.5 text-[9px] font-semibold text-white hover:bg-blue-700">Apply</button></div></div>)}
                  {filteredJobs.length === 0 && <div className="p-8 text-center text-[11px] text-slate-400">No matching active opportunities. Upload or update your resume, or change filters.</div>}
                </div>
              </div>
              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
                <section className={`${card} overflow-hidden p-3`}><div className="text-[10px] font-bold">Tailored Resume</div><p className="mt-1 text-[9px] text-slate-400">Latest uploaded resume</p><div className="mt-3 flex h-[65px] items-center justify-center rounded-md bg-[#f5f7fc]"><div className="w-[75%] rounded border border-slate-200 bg-white p-2 shadow-sm"><div className="mx-auto mb-1 h-1 w-8 rounded bg-blue-400"/><div className="space-y-1"><div className="h-1 w-full bg-slate-100"/><div className="h-1 w-4/5 bg-slate-100"/><div className="h-1 w-11/12 bg-slate-100"/></div></div></div><p className="mt-2 truncate text-[9px] font-medium">{resumeName || "Resume uploaded"}</p><button type="button" onClick={handleTailoredPdf} className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-semibold text-white">Download Tailored PDF</button></section>
                <section className={`${card} overflow-hidden p-3`}><div className="flex items-center justify-between"><h3 className="text-[10px] font-bold">Recent Applications</h3><button onClick={() => setSection("applications")} className="text-[8px] font-semibold text-blue-600">View all</button></div><div className="mt-3 space-y-2.5">{applications.slice(0, 3).map(a => <div key={a.application_id} className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="truncate text-[9px] font-semibold">{a.company_name}</p><p className="truncate text-[8px] text-slate-400">{a.title}</p></div><span className="rounded-full bg-blue-50 px-1.5 py-1 text-[8px] text-blue-700">{a.status}</span></div>)}{applications.length === 0 && <p className="pt-4 text-center text-[9px] text-slate-400">No applications yet</p>}</div></section>
                <section className={`${card} overflow-hidden p-3`}><h3 className="text-[10px] font-bold">AI Insights</h3><p className="mt-1 text-[9px] text-slate-400">Application activity Â· last 7 days</p><div className="mt-3 flex h-[62px] items-end gap-1.5">{Array.from({length: 7}, (_, i) => { const day = new Date(); day.setDate(day.getDate() - (6 - i)); const count = applications.filter(a => new Date(a.applied_at).toDateString() === day.toDateString()).length; return <div key={i} title={`${count} applications`} className="flex-1 rounded-t bg-[#6483ee]" style={{height: `${Math.max(7, count * 22)}%`}}/>; })}</div><p className="mt-2 text-[8px] text-slate-400">Calculated from your application records</p></section>
              </div>
            </div>
            <aside className={`${card} flex min-w-0 flex-col p-4 2xl:sticky 2xl:top-4`}>
              <div className="flex items-center justify-between"><h2 className="text-[13px] font-bold">Autopilot</h2><span className="rounded-full bg-green-50 px-2 py-1 text-[8px] font-semibold text-green-700">Active</span></div>
              <div className="mx-auto my-5 flex h-[145px] w-[145px] items-center justify-center rounded-full border-[9px] border-[#edf1fa] border-l-[#5478eb] border-t-[#5478eb]"><div className="text-center"><p className="text-[30px] font-bold leading-none">{applied}</p><p className="mt-1 text-[10px] font-semibold">Applications</p><p className="text-[8px] text-slate-400">all time</p></div></div>
              <div className="space-y-4 text-[10px]"><p className="flex items-center justify-between"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500"/>Applied</span><b>{statusCount("Applied")}</b></p><p className="flex items-center justify-between"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500"/>In Progress</span><b>{inProgress}</b></p><p className="flex items-center justify-between"><span><i className="mr-2 inline-block h-2 w-2 rounded-full bg-violet-500"/>Interview / Selected</span><b>{selected + statusCount("Shortlisted")}</b></p></div>
              <button onClick={() => setSection("applications")} className="mt-6 w-full rounded-lg bg-[#f0f3ff] py-2.5 text-[10px] font-semibold text-[#4165d9] hover:bg-blue-100">View All Applications</button>
              <div className="mt-auto border-t border-slate-100 pt-4"><p className="text-[9px] font-semibold text-slate-500">Your job search</p><p className="mt-1 text-[8px] leading-4 text-slate-400">Recommendations refresh when your dashboard loads. You approve every application before it is submitted.</p><button onClick={() => loadDashboard()} className="mt-3 text-[9px] font-semibold text-blue-600">â†» Refresh dashboard</button></div>
            </aside>
          </div>
        </>}
        {section === "applications" && <section className={`${card} h-full overflow-auto p-5`}><h2 className="text-lg font-bold">Application Tracker</h2><p className="mb-4 mt-1 text-[11px] text-slate-500">Track the status of opportunities you have applied for.</p>{applications.length ? <table className="w-full text-left text-[11px]"><thead className="text-[9px] text-slate-400"><tr><th className="p-3">Position</th><th className="p-3">Company</th><th className="p-3">Status</th><th className="p-3">Applied</th></tr></thead><tbody>{applications.map(a => <tr key={a.application_id} className="border-t"><td className="p-3 font-semibold">{a.title}</td><td className="p-3">{a.company_name}</td><td className="p-3">{a.status}</td><td className="p-3">{new Date(a.applied_at).toLocaleDateString()}</td></tr>)}</tbody></table> : <p className="py-10 text-center text-slate-500">No applications yet. Explore Match Jobs to apply.</p>}</section>}
        {section === "resumes" && <section className={`${card} max-w-2xl p-5`}><h2 className="text-lg font-bold">Tailored Resumes</h2><p className="mt-2 text-[11px] text-slate-600">Latest uploaded resume: {resumeName || "Not available"}</p><p className="mt-2 text-[10px] text-slate-600">Generate and download your tailored resume as a PDF.</p><button type="button" onClick={handleTailoredPdf} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-[11px] text-white">Generate Tailored PDF</button><form onSubmit={handleResumeUpload} className="mt-5"><input type="file" accept="application/pdf,.pdf" onChange={e => setResume(e.target.files?.[0] || null)} className="text-[11px]"/><button disabled={!resume || loading} className="ml-3 rounded-lg bg-blue-600 px-4 py-2 text-[11px] text-white">Upload new resume</button></form></section>}
        {section === "autopilot" && <section className={`${card} max-w-2xl p-5`}><h2 className="text-lg font-bold">Autopilot</h2><p className="mt-2 text-[11px] text-slate-600">Recommendations are refreshed when the dashboard loads. Applications are submitted only after you confirm each one.</p><button onClick={() => loadDashboard()} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-[11px] text-white">Refresh recommendations</button><p className="mt-3 text-[10px] text-slate-400">Automatic job applications are not enabled.</p></section>}
        {section === "inbox" && <section className={`${card} w-full p-5`}>
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Inbox</h2><p className="mt-1 text-xs text-slate-500">Connect with registered recruiters and exchange internship-related messages.</p></div><button onClick={loadInbox} className="rounded-lg border px-3 py-2 text-xs font-semibold text-blue-700">Refresh</button></div>
          <form onSubmit={sendInboxMessage} className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">{user.role === "student" ? "Select recruiter" : "Reply to student"}<select value={recipientId} onChange={e => setRecipientId(e.target.value)} required className="mt-1 w-full rounded-lg border bg-white p-2.5 font-normal"><option value="">Choose a person</option>{inboxContacts.map(contact => <option key={contact.user_id} value={contact.user_id}>{contact.full_name} ({contact.email})</option>)}</select></label>
            <label className="text-xs font-semibold text-slate-600">Subject (optional)<input value={inboxSubject} onChange={e => setInboxSubject(e.target.value)} maxLength={200} placeholder="Message subject" className="mt-1 w-full rounded-lg border bg-white p-2.5 font-normal" /></label>
            <label className="text-xs font-semibold text-slate-600 md:col-span-2">Message<textarea value={inboxBody} onChange={e => setInboxBody(e.target.value)} required maxLength={10000} rows={3} placeholder="Write your message..." className="mt-1 w-full rounded-lg border bg-white p-3 font-normal" /></label>
            <div className="md:col-span-2"><button disabled={loading} className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{loading ? "Sending..." : "Send message"}</button><span className="ml-3 text-[10px] text-slate-400">Choose a name from the directory. Recruiters can reply to students who contact them.</span></div>
          </form>
          <div className="mt-5"><h3 className="mb-3 text-sm font-bold">Messages</h3>{inboxLoading ? <p className="py-8 text-center text-sm text-slate-400">Loading messages...</p> : inboxMessages.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-400">No messages yet. Send a message to another registered user.</p> : <div className="space-y-3">{inboxMessages.map(m => { const received = m.recipient_id === user.user_id; return <article key={m.message_id} className="rounded-xl border border-slate-100 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold">{received ? `From: ${m.sender_name}` : `To: ${m.recipient_name}`}</p><span className="text-[10px] text-slate-400">{new Date(m.created_at).toLocaleString()}</span></div>{m.subject && <p className="mt-2 text-xs font-semibold">{m.subject}</p>}<p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{m.body}</p><div className="mt-3 flex items-center justify-between">{received ? <span className="text-[10px] text-slate-400">{m.read_at ? "Read" : "Unread"}</span> : <span className="text-[10px] text-slate-400">Sent</span>}{received && !m.read_at && <button onClick={() => markInboxRead(m.message_id)} className="text-[10px] font-semibold text-blue-700">Mark as read</button>}</div></article>; })}</div>}</div>
        </section>}
        {section === "insights" && <section className={`${card} max-w-2xl p-5`}><h2 className="text-lg font-bold">Insights</h2><p className="mt-2 text-[11px] text-slate-500">You have submitted {applications.length} applications across {new Set(applications.map(a => a.company_name)).size} companies.</p><p className="mt-2 text-[11px] text-slate-500">Your recommendation list contains {jobs.length} active opportunities.</p></section>}
        {section === "settings" && <section className={`${card} max-w-2xl p-5`}><h2 className="text-lg font-bold">Settings</h2><p className="mt-2 text-[11px]">{user.full_name}</p><p className="text-[11px] text-slate-500">{user.email}</p><button onClick={logout} className="mt-5 rounded-lg border px-4 py-2 text-[11px]">Log out</button></section>}
        {section === "help" && <section className={`${card} max-w-2xl p-5`}><h2 className="text-lg font-bold">Help</h2><p className="mt-2 text-[11px] text-slate-600">Upload a text-based PDF resume, review your skill matches, and apply to opportunities. Your application status appears in Application Tracker.</p></section>}
      </section>
    </div>
    {selectedJob && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"><p className="text-xs font-bold tracking-widest text-blue-700">APPLICATION REVIEW</p><h2 className="mt-2 text-2xl font-bold">{selectedJob.title}</h2><p className="mt-1 text-slate-500">{selectedJob.company}</p><div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm"><p>Applicant: <b>{user.full_name}</b></p><p className="mt-2">Email: <b>{user.email}</b></p><p className="mt-2">Skill match: <b>{selectedJob.matchPercentage ?? "Not available"}{selectedJob.matchPercentage === null ? "" : "%"}</b></p></div><p className="mt-4 text-xs text-slate-500">Your application will be saved only after confirmation.</p><div className="mt-6 flex gap-3"><button onClick={() => setSelectedJob(null)} disabled={loading} className="flex-1 rounded-xl border p-3">Cancel</button><button onClick={submitApplication} disabled={loading} className="flex-1 rounded-xl bg-blue-600 p-3 font-semibold text-white">{loading ? "Submitting..." : "Confirm & Apply"}</button></div></div></div>}
  </main>;
}




