import { useState, useEffect, useCallback } from "react";

const TABLES = [
  { id: 1,  name: "C1",   zone: "Console",     capacity: 6, x: 2,  y: 72, w: 13, h: 14 },
  { id: 2,  name: "C2",   zone: "Console",     capacity: 6, x: 2,  y: 30, w: 13, h: 14 },
  { id: 3,  name: "C3",   zone: "Console",     capacity: 6, x: 2,  y: 50, w: 13, h: 14 },
  { id: 4,  name: "P3",   zone: "Perimetrale", capacity: 4, x: 20, y: 82, w: 9,  h: 12 },
  { id: 5,  name: "P4",   zone: "Perimetrale", capacity: 4, x: 30, y: 82, w: 9,  h: 12 },
  { id: 6,  name: "P5",   zone: "Perimetrale", capacity: 4, x: 40, y: 82, w: 9,  h: 12 },
  { id: 7,  name: "P6",   zone: "Perimetrale", capacity: 4, x: 50, y: 82, w: 9,  h: 12 },
  { id: 8,  name: "P7",   zone: "Perimetrale", capacity: 4, x: 60, y: 82, w: 9,  h: 12 },
  { id: 9,  name: "P8",   zone: "Perimetrale", capacity: 4, x: 20, y: 28, w: 12, h: 11 },
  { id: 10, name: "P9",   zone: "Perimetrale", capacity: 4, x: 42, y: 28, w: 13, h: 11 },
  { id: 11, name: "P10a", zone: "Perimetrale", capacity: 4, x: 84, y: 2,  w: 13, h: 10 },
  { id: 12, name: "P10b", zone: "Perimetrale", capacity: 4, x: 84, y: 13, w: 13, h: 10 },
  { id: 13, name: "P11",  zone: "Perimetrale", capacity: 6, x: 84, y: 38, w: 13, h: 18 },
  { id: 14, name: "R1",   zone: "Centrale",    capacity: 4, x: 47, y: 48, w: 11, h: 13 },
  { id: 15, name: "R2",   zone: "Centrale",    capacity: 4, x: 59, y: 48, w: 11, h: 13 },
  { id: 16, name: "R3",   zone: "Centrale",    capacity: 4, x: 47, y: 62, w: 11, h: 13 },
  { id: 17, name: "R4",   zone: "Centrale",    capacity: 4, x: 59, y: 62, w: 11, h: 13 },
  { id: 18, name: "M1",   zone: "Mensola",     capacity: 2, x: 72, y: 5,  w: 6,  h: 10 },
  { id: 19, name: "M2",   zone: "Mensola",     capacity: 2, x: 72, y: 16, w: 6,  h: 10 },
  { id: 20, name: "L1",   zone: "Lounge",      capacity: 4, x: 70, y: 82, w: 8,  h: 12 },
  { id: 21, name: "L2",   zone: "Lounge",      capacity: 4, x: 79, y: 82, w: 8,  h: 12 },
  { id: 22, name: "L3",   zone: "Lounge",      capacity: 4, x: 88, y: 82, w: 8,  h: 12 },
];

const ZONE_META = {
  Console:     { color: "#b45309", bg: "#fef3c7", border: "#fcd34d", dot: "#d97706" },
  Perimetrale: { color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd", dot: "#2563eb" },
  Centrale:    { color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5", dot: "#dc2626" },
  Mensola:     { color: "#6b21a8", bg: "#f3e8ff", border: "#d8b4fe", dot: "#9333ea" },
  Lounge:      { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", dot: "#059669" },
};

function calcPrCommission(total, pr) {
  if (pr.tier1000 && total >= 1000) return Math.round(total * 20 / 100);
  if (pr.tier250  && total >= 250)  return Math.round(total * 15 / 100);
  return Math.round(total * 10 / 100);
}
function getPrRate(total, pr) {
  if (pr.tier1000 && total >= 1000) return 20;
  if (pr.tier250  && total >= 250)  return 15;
  return 10;
}

const DEFAULT_BOTTLES = [
  { id: "b1", name: "Belvedere",      category: "Vodka",     costPrice: 35, sellPrice: 120, stock: 12 },
  { id: "b2", name: "Grey Goose",     category: "Vodka",     costPrice: 32, sellPrice: 110, stock: 8  },
  { id: "b3", name: "Hendricks",      category: "Gin",       costPrice: 28, sellPrice: 100, stock: 6  },
  { id: "b4", name: "Don Julio",      category: "Tequila",   costPrice: 45, sellPrice: 150, stock: 5  },
  { id: "b5", name: "Moët",           category: "Champagne", costPrice: 40, sellPrice: 130, stock: 10 },
  { id: "b6", name: "Veuve Clicquot", category: "Champagne", costPrice: 50, sellPrice: 160, stock: 7  },
  { id: "b7", name: "Jack Daniel's",  category: "Whisky",    costPrice: 22, sellPrice: 80,  stock: 15 },
  { id: "b8", name: "Aperol",         category: "Aperitivo", costPrice: 12, sellPrice: 45,  stock: 20 },
];

const DEFAULT_PRS = [
  { id: "pr1", name: "Alessandro", tier250: true,  tier1000: false },
  { id: "pr2", name: "Giulia",     tier250: true,  tier1000: true  },
  { id: "pr3", name: "Marco",      tier250: false, tier1000: false },
];

const EMPTY_RES = {
  clientName: "", tableName: "", guests: "", phone: "",
  caparra: "", caparraPaid: false, bottles: [], prId: "",
  pricePerPerson: "", note: "",
};

const KEYS = { res: "qclub-res", bot: "qclub-bot", prs: "qclub-prs", ts: "qclub-ts", history: "qclub-history" };

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); localStorage.setItem(KEYS.ts, Date.now()); } catch {}
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const CREDS = {
  cassa:   { password: "qclub2024",   role: "cassa",   label: "Cassa" },
  cambusa: { password: "cambusa2024", role: "cambusa", label: "Cambusa" },
};

function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(""); const [show, setShow] = useState(false);
  const go = () => {
    const f = Object.values(CREDS).find(c => c.password === pw.trim());
    if (f) onLogin(f.role, f.label);
    else { setErr("Password errata. Riprova."); setTimeout(() => setErr(""), 2500); }
  };
  return (
    <div style={{ minHeight:"100vh",background:"#1a1a2e",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",padding:20 }}>
      <div style={{ width:"100%",maxWidth:380 }}>
        <div style={{ textAlign:"center",marginBottom:40 }}>
          <div style={{ width:64,height:64,background:"#f59e0b",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:900,margin:"0 auto 16px" }}>Q</div>
          <div style={{ fontSize:22,fontWeight:700,color:"#fff",letterSpacing:"0.06em" }}>Q CLUB</div>
          <div style={{ fontSize:12,color:"#64748b",letterSpacing:"0.2em",marginTop:4 }}>GESTIONALE TAVOLI</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"32px 28px" }}>
          <div style={{ fontSize:14,color:"#94a3b8",marginBottom:20,textAlign:"center" }}>Inserisci la password per accedere</div>
          <div style={{ position:"relative",marginBottom:16 }}>
            <input type={show?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Password..." autoFocus
              style={{ width:"100%",padding:"12px 44px 12px 16px",borderRadius:10,border:`1px solid ${err?"#dc2626":"rgba(255,255,255,0.15)"}`,background:"rgba(255,255,255,0.08)",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"Georgia,serif" }} />
            <button onClick={()=>setShow(s=>!s)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:16 }}>{show?"🙈":"👁"}</button>
          </div>
          {err && <div style={{ background:"rgba(220,38,38,0.15)",border:"1px solid #dc2626",borderRadius:8,padding:"8px 14px",color:"#fca5a5",fontSize:13,marginBottom:14,textAlign:"center" }}>{err}</div>}
          <button onClick={go} style={{ width:"100%",padding:"13px",borderRadius:10,background:"#f59e0b",color:"#1a1a2e",border:"none",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"Georgia,serif" }}>Accedi</button>
          <div style={{ marginTop:20,padding:"12px 14px",background:"rgba(255,255,255,0.03)",borderRadius:8,fontSize:11,color:"#475569",lineHeight:1.8 }}>
            <div>🔒 <strong style={{color:"#64748b"}}>Cassa</strong> — accesso completo</div>
            <div>🔒 <strong style={{color:"#64748b"}}>Cambusa</strong> — solo visualizzazione</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STAMPA LISTA CASSIERE ────────────────────────────────────────────────────
function printCashierList(reservations, bottles) {
  const booked = TABLES.filter(t => reservations[t.id]);
  const date = new Date().toLocaleDateString("it-IT", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const totalIncasso = booked.reduce((s,t) => {
    const r = reservations[t.id];
    const bTot = (r.bottles||[]).reduce((bs,b)=>{ const bt=bottles.find(x=>x.id===b.bottleId); return bs+(bt?bt.sellPrice*b.qty:0); },0);
    const tTot = r.pricePerPerson&&r.guests ? Number(r.pricePerPerson)*Number(r.guests) : 0;
    return s + bTot + tTot;
  }, 0);
  const rows = booked.map(t => {
    const r = reservations[t.id];
    const bots = (r.bottles||[]).map(b=>{ const bt=bottles.find(x=>x.id===b.bottleId); return bt?`${bt.name} ×${b.qty}`:""; }).filter(Boolean).join(", ");
    const bTot = (r.bottles||[]).reduce((s,b)=>{ const bt=bottles.find(x=>x.id===b.bottleId); return s+(bt?bt.sellPrice*b.qty:0); },0);
    const tTot = r.pricePerPerson&&r.guests ? Number(r.pricePerPerson)*Number(r.guests) : 0;
    const total = bTot + tTot;
    return `<tr>
      <td><strong>${r.tableName||t.name}</strong><br><small style="color:#64748b">${t.zone}</small></td>
      <td>${r.clientName}</td>
      <td style="text-align:center;font-size:18px;font-weight:700">${r.guests}</td>
      <td style="text-align:center">${r.pricePerPerson?"€"+r.pricePerPerson:"—"}</td>
      <td style="text-align:center;font-weight:700;color:#2563eb">${total>0?"€"+total:"—"}</td>
      <td style="text-align:center;color:${r.caparraPaid?"#16a34a":"#dc2626"}">${r.caparra>0?(r.caparraPaid?"✓ ":"✗ ")+"€"+r.caparra:"—"}</td>
      <td style="font-size:11px;color:#64748b">${bots||"—"}</td>
      <td style="text-align:center;color:#94a3b8">${r.note||""}</td>
    </tr>`;
  }).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lista Cassiere – Q Club</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:12px;padding:20px;color:#1a1a2e}
  h1{font-size:18px;margin-bottom:2px}.sub{color:#64748b;font-size:11px;margin-bottom:16px}
  table{width:100%;border-collapse:collapse}th{background:#1a1a2e;color:#f59e0b;padding:8px 10px;text-align:left;font-size:11px;letter-spacing:.06em}
  td{padding:9px 10px;border-bottom:1px solid #e5e7eb;vertical-align:middle}tr:nth-child(even) td{background:#f8fafc}
  .total-box{background:#1a1a2e;color:#fff;border-radius:8px;padding:10px 18px;display:flex;align-items:center;gap:16px;margin-bottom:14px}
  @media print{body{padding:10px}}</style></head><body>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
    <div style="width:38px;height:38px;background:#1a1a2e;color:#f59e0b;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900">Q</div>
    <div><h1>Lista Cassiere — Q Club</h1><div class="sub">${date} · ${booked.length} tavoli prenotati</div></div>
  </div>
  <div class="total-box">
    <span>💰 Incasso totale stimato: <strong style="font-size:16px;color:#f59e0b">€${totalIncasso.toLocaleString("it-IT")}</strong></span>
    <span style="color:#94a3b8;font-size:11px">Tavoli: ${booked.length} / ${TABLES.length}</span>
  </div>
  <table><thead><tr><th>Tavolo</th><th>Cliente</th><th>Paganti</th><th>€/Testa</th><th>Totale</th><th>Caparra</th><th>Bottiglie</th><th>Note</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <div style="text-align:right;font-size:10px;color:#94a3b8;margin-top:12px">Stampato il ${new Date().toLocaleString("it-IT")}</div>
  </body></html>`;
  const w = window.open("","_blank"); w.document.write(html); w.document.close(); w.print();
}

// ─── STAMPA PIANTINA ─────────────────────────────────────────────────────────
function printFloorPlan(reservations) {
  const date = new Date().toLocaleDateString("it-IT", { weekday:"long", day:"numeric", month:"long" });
  const zmP = {
    Console:     { bg:"#fef3c7", border:"#fcd34d", color:"#b45309" },
    Perimetrale: { bg:"#dbeafe", border:"#93c5fd", color:"#1d4ed8" },
    Centrale:    { bg:"#fee2e2", border:"#fca5a5", color:"#b91c1c" },
    Mensola:     { bg:"#f3e8ff", border:"#d8b4fe", color:"#6b21a8" },
    Lounge:      { bg:"#d1fae5", border:"#6ee7b7", color:"#065f46" },
  };
  const tableHTML = TABLES.map(t => {
    const r = reservations[t.id]; const zm = zmP[t.zone];
    return `<div style="position:absolute;left:${t.x}%;top:${t.y}%;width:${t.w}%;height:${t.h}%;background:${r?zm.bg:"#f8fafc"};border:2px solid ${r?zm.border:"#e2e8f0"};border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;overflow:hidden">
      <div style="font-size:9px;font-weight:700;color:${r?zm.color:"#94a3b8"}">${t.name}</div>
      ${r ? `<div style="font-size:7px;color:${zm.color};max-width:94%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center">${r.clientName}</div>`
          : `<div style="font-size:7px;color:#cbd5e1">libero</div>`}
    </div>`;
  }).join("");
  const legend = Object.entries({Console:"#fef3c7",Perimetrale:"#dbeafe",Centrale:"#fee2e2",Mensola:"#f3e8ff",Lounge:"#d1fae5"})
    .map(([z,c])=>`<div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;background:${c};border:1px solid #ccc;border-radius:2px"></div><span>${z}</span></div>`).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Piantina Q Club</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;padding:14px;color:#1a1a2e}
  @media print{body{padding:6px}@page{size:A4 landscape;margin:8mm}}</style></head><body>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:34px;height:34px;background:#1a1a2e;color:#f59e0b;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900">Q</div>
      <div><div style="font-size:15px;font-weight:700">Q Club — Piantina Serata</div><div style="font-size:11px;color:#64748b">${date}</div></div>
    </div>
    <div style="display:flex;gap:10px;font-size:10px;align-items:center">${legend}
      <div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:2px"></div><span>Libero</span></div>
    </div>
  </div>
  <div style="position:relative;width:100%;padding-bottom:68%;background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
    <div style="position:absolute;left:55%;top:2%;width:16%;height:24%;background:#eff6ff;border:2px solid #93c5fd;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#1d4ed8;font-weight:700">BAR 1</div>
    <div style="position:absolute;left:78%;top:2%;width:5%;height:24%;background:#eff6ff;border:2px solid #93c5fd;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#1d4ed8;writing-mode:vertical-rl">BAR 2</div>
    <div style="position:absolute;left:16%;top:44%;width:12%;height:22%;background:#fefce8;border:2px solid #fcd34d;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#b45309;writing-mode:vertical-rl;font-weight:700">🎵 CONSOLE</div>
    <div style="position:absolute;left:76%;bottom:2%;width:22%;height:9%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#94a3b8;letter-spacing:.08em">INGRESSO</div>
    ${tableHTML}
  </div>
  <div style="text-align:right;font-size:10px;color:#94a3b8;margin-top:6px">Stampato il ${new Date().toLocaleString("it-IT")}</div>
  </body></html>`;
  const w = window.open("","_blank"); w.document.write(html); w.document.close(); setTimeout(()=>w.print(),400);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState(null);
  const [roleLabel, setRL] = useState("");
  if (!role) return <LoginScreen onLogin={(r,l)=>{ setRole(r); setRL(l); }} />;
  return <AppInner role={role} roleLabel={roleLabel} isCassa={role==="cassa"} onLogout={()=>setRole(null)} />;
}

function AppInner({ role, roleLabel, isCassa, onLogout }) {
  const [tab, setTab]                   = useState("map");
  const [reservations, setReservations] = useState(() => load(KEYS.res, {}));
  const [bottles, setBottles]           = useState(() => load(KEYS.bot, DEFAULT_BOTTLES));
  const [prs, setPrs]                   = useState(() => load(KEYS.prs, DEFAULT_PRS));
  const [history, setHistory]           = useState(() => load(KEYS.history, []));
  const [lastSync, setLastSync]         = useState(new Date());
  const [lastTs, setLastTs]             = useState(() => localStorage.getItem(KEYS.ts)||"0");
  const [formOpen, setFormOpen]         = useState(false);
  const [selTable, setSelTable]         = useState(null);
  const [form, setForm]                 = useState(EMPTY_RES);
  const [editingId, setEditingId]       = useState(null);
  const [toast, setToast]               = useState(null);
  const [bottleForm, setBottleForm]     = useState({ name:"",category:"",costPrice:"",sellPrice:"",stock:"" });
  const [prForm, setPrForm]             = useState({ name:"",tier250:false,tier1000:false });
  const [search, setSearch]             = useState("");
  const [filterZone, setFilterZone]     = useState("Tutti");
  // Storico
  const [saveModal, setSaveModal]       = useState(false);
  const [nightName, setNightName]       = useState("");
  const [historyDetail, setHistoryDetail] = useState(null); // serata aperta
  const [editingNight, setEditingNight] = useState(null);   // serata in modifica

  const sync = useCallback(()=>{
    const ts = localStorage.getItem(KEYS.ts)||"0";
    if (ts !== lastTs) {
      setReservations(load(KEYS.res,{})); setBottles(load(KEYS.bot,DEFAULT_BOTTLES));
      setPrs(load(KEYS.prs,DEFAULT_PRS)); setHistory(load(KEYS.history,[])); setLastTs(ts);
    }
    setLastSync(new Date());
  },[lastTs]);

  useEffect(()=>{
    const iv = setInterval(sync,3000);
    window.addEventListener("storage",sync);
    return ()=>{ clearInterval(iv); window.removeEventListener("storage",sync); };
  },[sync]);

  const toast$ = (msg,type="ok")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),2800); };
  const setRes  = next=>{ setReservations(next); save(KEYS.res,next); };
  const setBot  = next=>{ setBottles(next);      save(KEYS.bot,next); };
  const setPR   = next=>{ setPrs(next);          save(KEYS.prs,next); };
  const setHist = next=>{ setHistory(next);      save(KEYS.history,next); };

  const tableTotal = res => {
    if (!res) return 0;
    const b=(res.bottles||[]).reduce((s,b)=>{ const bt=bottles.find(x=>x.id===b.bottleId); return s+(bt?bt.sellPrice*b.qty:0); },0);
    const t=res.pricePerPerson&&res.guests?Number(res.pricePerPerson)*Number(res.guests):0;
    return b+t;
  };
  const tableTotalWith = (res, bots) => {
    if (!res) return 0;
    const b=(res.bottles||[]).reduce((s,b)=>{ const bt=bots.find(x=>x.id===b.bottleId); return s+(bt?bt.sellPrice*b.qty:0); },0);
    const t=res.pricePerPerson&&res.guests?Number(res.pricePerPerson)*Number(res.guests):0;
    return b+t;
  };

  // ── Salva serata nello storico ──
  const saveNight = () => {
    if (!nightName.trim()) { toast$("Inserisci un nome per la serata","err"); return; }
    const night = {
      id: `night_${Date.now()}`,
      name: nightName.trim(),
      date: new Date().toISOString(),
      reservations: { ...reservations },
      bottles: [...bottles],
      prs: [...prs],
    };
    const next = [night, ...history];
    setHist(next);
    setRes({}); // azzera serata corrente
    setSaveModal(false);
    setNightName("");
    toast$(`✓ Serata "${night.name}" salvata!`);
  };

  // ── Elimina serata storico ──
  const deleteNight = (id) => {
    if (!window.confirm("Eliminare questa serata dallo storico?")) return;
    setHist(history.filter(n=>n.id!==id));
    if (historyDetail?.id===id) setHistoryDetail(null);
    toast$("Serata eliminata","err");
  };

  // ── Rinomina serata ──
  const renameNight = (id, newName) => {
    setHist(history.map(n=>n.id===id?{...n,name:newName}:n));
    setEditingNight(null);
    toast$("Nome aggiornato ✓");
  };

  const openForm = t => {
    setSelTable(t);
    const ex = reservations[t.id];
    if (ex) { setForm({...EMPTY_RES,...ex}); setEditingId(t.id); }
    else    { setForm({...EMPTY_RES,tableName:t.name}); setEditingId(null); }
    setFormOpen(true);
  };
  const saveRes = () => {
    if (!form.clientName.trim()) { toast$("Inserisci il nome del cliente","err"); return; }
    if (!form.guests||Number(form.guests)<1) { toast$("Inserisci il numero di ospiti","err"); return; }
    setRes({...reservations,[selTable.id]:{...form,guests:Number(form.guests),caparra:Number(form.caparra)||0,pricePerPerson:Number(form.pricePerPerson)||""}});
    toast$(`✓ Salvato: ${form.clientName}`);
    setFormOpen(false);
  };
  const delRes = id=>{ const n={...reservations}; delete n[id]; setRes(n); toast$("Eliminata","err"); setFormOpen(false); };
  const addBot = bid=>{ const ex=form.bottles.find(b=>b.bottleId===bid); if(ex) setForm(f=>({...f,bottles:f.bottles.map(b=>b.bottleId===bid?{...b,qty:b.qty+1}:b)})); else setForm(f=>({...f,bottles:[...f.bottles,{bottleId:bid,qty:1}]})); };
  const remBot = bid=>setForm(f=>({...f,bottles:f.bottles.filter(b=>b.bottleId!==bid)}));

  const stats={ total:TABLES.length, booked:Object.keys(reservations).length, free:TABLES.length-Object.keys(reservations).length, incasso:Object.values(reservations).reduce((s,r)=>s+tableTotal(r),0) };
  const bottleUsage=bottles.map(b=>{ let u=0; Object.values(reservations).forEach(r=>(r.bottles||[]).forEach(rb=>{ if(rb.bottleId===b.id) u+=rb.qty; })); return {...b,used:u,revenue:u*b.sellPrice,cost:u*b.costPrice}; }).filter(b=>b.used>0);
  const prReport=prs.map(pr=>{ let tables=0,total=0; Object.values(reservations).forEach(r=>{ if(r.prId===pr.id){tables++;total+=tableTotal(r);} }); return {...pr,tables,total,commission:calcPrCommission(total,pr),rate:getPrRate(total,pr)}; });
  const filtered=TABLES.filter(t=>{ const r=reservations[t.id]; return (filterZone==="Tutti"||t.zone===filterZone)&&(!search||(r&&r.clientName?.toLowerCase().includes(search.toLowerCase()))); });

  // ── Calcola stats per una serata storico ──
  const nightStats = (night) => {
    const { reservations: res, bottles: bots, prs: nPrs } = night;
    const incasso = Object.values(res).reduce((s,r)=>s+tableTotalWith(r,bots),0);
    const booked = Object.keys(res).length;
    const botUsage = bots.map(b=>{ let u=0; Object.values(res).forEach(r=>(r.bottles||[]).forEach(rb=>{ if(rb.bottleId===b.id) u+=rb.qty; })); return {...b,used:u,revenue:u*b.sellPrice,cost:u*b.costPrice}; }).filter(b=>b.used>0);
    const prRep = nPrs.map(pr=>{ let tables=0,total=0; Object.values(res).forEach(r=>{ if(r.prId===pr.id){tables++;total+=tableTotalWith(r,bots);} }); return {...pr,tables,total,commission:calcPrCommission(total,pr),rate:getPrRate(total,pr)}; });
    return { incasso, booked, botUsage, prRep };
  };

  return (
    <div style={{ minHeight:"100vh",background:"#f0f2f5",fontFamily:"Georgia,serif",color:"#1a1a2e" }}>
      {toast&&<div style={{ position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:toast.type==="err"?"#dc2626":"#16a34a",color:"#fff",padding:"11px 28px",borderRadius:50,fontSize:14,fontWeight:600,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",whiteSpace:"nowrap" }}>{toast.msg}</div>}

      {/* HEADER */}
      <div style={{ background:"#1a1a2e",color:"#fff",padding:"0 20px" }}>
        <div style={{ maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:56 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:34,height:34,background:"#f59e0b",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900 }}>Q</div>
            <div><div style={{ fontSize:15,fontWeight:700,letterSpacing:"0.06em" }}>Q CLUB</div><div style={{ fontSize:10,color:"#64748b",letterSpacing:"0.15em" }}>GESTIONALE TAVOLI</div></div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.07)",borderRadius:20,padding:"4px 12px" }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:isCassa?"#f59e0b":"#22c55e" }} />
              <span style={{ fontSize:12,color:isCassa?"#fcd34d":"#86efac",fontWeight:700,letterSpacing:"0.08em" }}>{roleLabel.toUpperCase()}</span>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:5 }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e" }} />
              <span style={{ fontSize:11,color:"#94a3b8" }}>Sync {lastSync.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>
            </div>
            <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"#94a3b8",borderRadius:7,padding:"5px 12px",fontSize:11,cursor:"pointer" }}>Esci</button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background:"#fff",borderBottom:"1px solid #e5e7eb" }}>
        <div style={{ maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)" }}>
          {[{label:"Totali",value:stats.total,color:"#64748b",icon:"🪑"},{label:"Prenotati",value:stats.booked,color:"#d97706",icon:"✅"},{label:"Liberi",value:stats.free,color:"#16a34a",icon:"⭕"},{label:"Incasso",value:`€${stats.incasso.toLocaleString("it-IT")}`,color:"#2563eb",icon:"💰"}].map((s,i)=>(
            <div key={s.label} style={{ padding:"14px 20px",textAlign:"center",borderRight:i<3?"1px solid #f1f5f9":"none" }}>
              <div style={{ fontSize:10,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:4 }}>{s.icon} {s.label.toUpperCase()}</div>
              <div style={{ fontSize:22,fontWeight:700,color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ background:"#fff",borderBottom:"2px solid #e5e7eb",overflowX:"auto" }}>
        <div style={{ maxWidth:1100,margin:"0 auto",display:"flex" }}>
          {[{key:"map",label:"🗺 Mappa"},{key:"list",label:"📋 Ospiti"},{key:"bottles",label:"🍾 Bottiglie"},{key:"prs",label:"👤 PR"},{key:"report",label:"📊 Report"},{key:"history",label:`📅 Storico${history.length>0?` (${history.length})`:""}` }].map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{ padding:"12px 18px",border:"none",background:"none",whiteSpace:"nowrap",borderBottom:tab===t.key?"3px solid #f59e0b":"3px solid transparent",color:tab===t.key?"#1a1a2e":"#94a3b8",fontWeight:tab===t.key?700:400,fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif",marginBottom:-2 }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1100,margin:"0 auto",padding:"24px 20px" }}>

        {/* ── MAPPA ── */}
        {tab==="map"&&(
          <div>
            <div style={{ display:"flex",gap:10,marginBottom:16,justifyContent:"space-between",flexWrap:"wrap",alignItems:"center" }}>
              <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
                {Object.entries(ZONE_META).map(([z,m])=>(
                  <div key={z} style={{ display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#64748b" }}>
                    <div style={{ width:12,height:12,borderRadius:3,background:m.bg,border:`2px solid ${m.border}` }} />{z}
                  </div>
                ))}
                <div style={{ display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#64748b" }}>
                  <div style={{ width:12,height:12,borderRadius:3,background:"#f8fafc",border:"2px solid #e2e8f0" }} />Libero
                </div>
              </div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                <button onClick={()=>printCashierList(reservations,bottles)} style={{ padding:"8px 14px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12,cursor:"pointer",fontWeight:600 }}>🖨 Lista Cassiere</button>
                <button onClick={()=>printFloorPlan(reservations)} style={{ padding:"8px 14px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12,cursor:"pointer",fontWeight:600 }}>🗺 Piantina</button>
              </div>
            </div>
            <div style={{ position:"relative",width:"100%",paddingBottom:"72%",background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ position:"absolute",left:"55%",top:"2%",width:"16%",height:"24%",background:"#dbeafe",border:"2px solid #93c5fd",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#1d4ed8",fontWeight:700 }}>BAR 1</div>
              <div style={{ position:"absolute",left:"78%",top:"2%",width:"5%",height:"24%",background:"#dbeafe",border:"2px solid #93c5fd",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#1d4ed8",writingMode:"vertical-rl" }}>BAR 2</div>
              <div style={{ position:"absolute",left:"16%",top:"44%",width:"12%",height:"22%",background:"#fef3c7",border:"2px solid #fcd34d",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#b45309",writingMode:"vertical-rl",fontWeight:700 }}>🎵 CONSOLE</div>
              <div style={{ position:"absolute",left:"76%",bottom:"2%",width:"22%",height:"10%",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#94a3b8",letterSpacing:"0.1em" }}>INGRESSO</div>
              {TABLES.map(t=>{
                const r=reservations[t.id]; const zm=ZONE_META[t.zone]; const tot=tableTotal(r);
                return (
                  <div key={t.id} onClick={()=>isCassa&&openForm(t)}
                    style={{ position:"absolute",left:`${t.x}%`,top:`${t.y}%`,width:`${t.w}%`,height:`${t.h}%`,background:r?zm.bg:"#f8fafc",border:`2px solid ${r?zm.border:"#e2e8f0"}`,borderRadius:8,cursor:isCassa?"pointer":"default",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"all 0.15s",boxShadow:r?`0 2px 10px ${zm.border}99`:"none" }}
                    onMouseEnter={e=>{ if(isCassa){e.currentTarget.style.transform="scale(1.05)";e.currentTarget.style.zIndex=10;} }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)";e.currentTarget.style.zIndex=1; }}>
                    <div style={{ fontSize:11,fontWeight:700,color:r?zm.color:"#94a3b8" }}>{t.name}</div>
                    {r?<><div style={{ fontSize:9,color:zm.color,maxWidth:"92%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"center" }}>{r.clientName}</div><div style={{ fontSize:9,color:"#64748b" }}>👥{r.guests}</div>{r.pricePerPerson&&<div style={{ fontSize:9,color:"#059669",fontWeight:700 }}>€{r.pricePerPerson}/p</div>}{tot>0&&<div style={{ fontSize:9,color:"#2563eb",fontWeight:700 }}>€{tot}</div>}</>:<div style={{ fontSize:9,color:"#cbd5e1" }}>Libero</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign:"center",color:"#94a3b8",fontSize:12,marginTop:10 }}>
              {isCassa?"Clicca un tavolo per prenotare · ":"Modalità sola lettura · "}aggiornamento ogni 3 secondi
            </div>
          </div>
        )}

        {/* ── LISTA ── */}
        {tab==="list"&&(
          <div>
            <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ display:"flex",gap:10,flex:1,flexWrap:"wrap" }}>
                <input placeholder="🔍 Cerca cliente..." value={search} onChange={e=>setSearch(e.target.value)}
                  style={{ flex:1,minWidth:180,padding:"9px 14px",borderRadius:8,background:"#fff",border:"1px solid #e2e8f0",fontSize:13,outline:"none" }} />
                <select value={filterZone} onChange={e=>setFilterZone(e.target.value)}
                  style={{ padding:"9px 14px",borderRadius:8,background:"#fff",border:"1px solid #e2e8f0",fontSize:13,cursor:"pointer" }}>
                  <option>Tutti</option>
                  {Object.keys(ZONE_META).map(z=><option key={z}>{z}</option>)}
                </select>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={()=>printCashierList(reservations,bottles)} style={{ padding:"8px 14px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12,cursor:"pointer",fontWeight:600 }}>🖨 Cassiere</button>
                <button onClick={()=>printFloorPlan(reservations)} style={{ padding:"8px 14px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12,cursor:"pointer",fontWeight:600 }}>🗺 Piantina</button>
              </div>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {filtered.map(t=>{
                const r=reservations[t.id]; const zm=ZONE_META[t.zone]; const tot=tableTotal(r); const pr=r?.prId?prs.find(p=>p.id===r.prId):null;
                return (
                  <div key={t.id} style={{ background:"#fff",border:`1px solid ${r?zm.border:"#e5e7eb"}`,borderLeft:`4px solid ${r?zm.dot:"#e5e7eb"}`,borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                      <div style={{ width:38,height:38,borderRadius:8,background:zm.bg,border:`2px solid ${zm.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:zm.color }}>{t.name}</div>
                      <div>
                        <div style={{ fontSize:11,color:zm.color,letterSpacing:"0.08em",marginBottom:2 }}>{t.zone}</div>
                        {r?<div style={{ fontSize:15,fontWeight:700 }}>{r.clientName}</div>:<div style={{ fontSize:13,color:"#94a3b8" }}>Libero</div>}
                      </div>
                    </div>
                    {r&&<div style={{ display:"flex",gap:10,fontSize:12,color:"#64748b",flexWrap:"wrap",alignItems:"center" }}>
                      <span>👥 <b>{r.guests}</b></span>
                      {r.pricePerPerson&&<span style={{ color:"#059669",fontWeight:700 }}>€{r.pricePerPerson}/p</span>}
                      {r.phone&&<span>📞 {r.phone}</span>}
                      {r.caparra>0&&<span style={{ color:r.caparraPaid?"#16a34a":"#dc2626",fontWeight:600 }}>{r.caparraPaid?"✓":"✗"} Cap. €{r.caparra}</span>}
                      {r.bottles?.length>0&&<span>🍾 {r.bottles.reduce((s,b)=>s+b.qty,0)}</span>}
                      {tot>0&&<span style={{ color:"#2563eb",fontWeight:700 }}>€{tot}</span>}
                      {pr&&<span style={{ color:"#9333ea" }}>PR: {pr.name}</span>}
                      {r.note&&<span style={{ color:"#d97706" }}>📝 {r.note}</span>}
                    </div>}
                    {isCassa&&<button onClick={()=>openForm(t)} style={{ padding:"7px 16px",borderRadius:6,background:r?zm.bg:"#f0fdf4",border:`1px solid ${r?zm.border:"#86efac"}`,color:r?zm.color:"#16a34a",fontSize:12,cursor:"pointer",fontWeight:600 }}>{r?"Modifica":"+ Prenota"}</button>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── BOTTIGLIE ── */}
        {tab==="bottles"&&(
          <div>
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:20 }}>🍾 Gestione Bottiglie</h2>
            {isCassa&&<div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20,marginBottom:20 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:"0.12em",marginBottom:14 }}>AGGIUNGI BOTTIGLIA</div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10 }}>
                {[{k:"name",l:"Nome",p:"Es. Belvedere"},{k:"category",l:"Categoria",p:"Es. Vodka"},{k:"costPrice",l:"Prezzo Costo €",p:"35",t:"number"},{k:"sellPrice",l:"Prezzo Vendita €",p:"120",t:"number"},{k:"stock",l:"Stock",p:"10",t:"number"}].map(f=>(
                  <div key={f.k}><div style={{ fontSize:10,color:"#94a3b8",marginBottom:4 }}>{f.l}</div>
                  <input type={f.t||"text"} placeholder={f.p} value={bottleForm[f.k]} onChange={e=>setBottleForm(p=>({...p,[f.k]:e.target.value}))}
                    style={{ width:"100%",padding:"8px 10px",borderRadius:7,border:"1px solid #e2e8f0",fontSize:13,outline:"none",boxSizing:"border-box" }} /></div>
                ))}
              </div>
              <button onClick={()=>{
                if(!bottleForm.name.trim()){toast$("Inserisci il nome","err");return;}
                setBot([...bottles,{id:`b${Date.now()}`,name:bottleForm.name,category:bottleForm.category,costPrice:Number(bottleForm.costPrice),sellPrice:Number(bottleForm.sellPrice),stock:Number(bottleForm.stock)}]);
                setBottleForm({name:"",category:"",costPrice:"",sellPrice:"",stock:""});
                toast$("Bottiglia aggiunta ✓");
              }} style={{ marginTop:12,padding:"9px 24px",background:"#1a1a2e",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontSize:13,fontWeight:600 }}>+ Aggiungi</button>
            </div>}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:12 }}>
              {bottles.map(b=>{
                const used=Object.values(reservations).reduce((s,r)=>s+((r.bottles||[]).find(rb=>rb.bottleId===b.id)?.qty||0),0);
                return (
                  <div key={b.id} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:16 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                      <div><div style={{ fontWeight:700,fontSize:15 }}>{b.name}</div><div style={{ fontSize:12,color:"#94a3b8" }}>{b.category}</div></div>
                      {isCassa&&<button onClick={()=>{setBot(bottles.filter(x=>x.id!==b.id));toast$("Rimossa","err");}} style={{ background:"none",border:"none",color:"#fca5a5",cursor:"pointer",fontSize:16 }}>✕</button>}
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:12 }}>
                      {[{l:"Costo",v:`€${b.costPrice}`,c:"#dc2626"},{l:"Vendita",v:`€${b.sellPrice}`,c:"#2563eb"},{l:"Margine",v:`€${b.sellPrice-b.costPrice}`,c:"#16a34a"}].map(x=>(
                        <div key={x.l} style={{ textAlign:"center",background:"#f8fafc",borderRadius:6,padding:"6px 4px" }}>
                          <div style={{ fontSize:10,color:"#94a3b8" }}>{x.l}</div>
                          <div style={{ fontSize:14,fontWeight:700,color:x.c }}>{x.v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex",justifyContent:"space-between",marginTop:10,fontSize:12,color:"#64748b" }}>
                      <span>Stock: <b>{b.stock}</b></span><span>Usate: <b style={{ color:used>0?"#d97706":"#94a3b8" }}>{used}</b></span><span>Rimaste: <b style={{ color:(b.stock-used)<3?"#dc2626":"#16a34a" }}>{b.stock-used}</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PR ── */}
        {tab==="prs"&&(
          <div>
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:10 }}>👤 Gestione PR</h2>
            <div style={{ background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:8,padding:"10px 16px",marginBottom:20,fontSize:12,color:"#92400e",lineHeight:1.7 }}>
              <strong>Scaglioni:</strong> base <strong>10%</strong> · &gt;€250 → <strong>15%</strong> (se attivato) · &gt;€1000 → <strong>20%</strong> (se attivato)
            </div>
            {isCassa&&<div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20,marginBottom:20 }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#64748b",letterSpacing:"0.12em",marginBottom:14 }}>AGGIUNGI PR</div>
              <div style={{ display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end" }}>
                <div style={{ flex:2,minWidth:160 }}>
                  <div style={{ fontSize:10,color:"#94a3b8",marginBottom:4 }}>Nome PR</div>
                  <input placeholder="Es. Alessandro" value={prForm.name} onChange={e=>setPrForm(p=>({...p,name:e.target.value}))}
                    style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,outline:"none",boxSizing:"border-box" }} />
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                  <div style={{ fontSize:10,color:"#94a3b8" }}>Scaglioni attivi</div>
                  <label style={{ display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer" }}><input type="checkbox" checked={prForm.tier250} onChange={e=>setPrForm(p=>({...p,tier250:e.target.checked}))} style={{ width:16,height:16 }} />15% sopra €250</label>
                  <label style={{ display:"flex",alignItems:"center",gap:8,fontSize:13,cursor:"pointer" }}><input type="checkbox" checked={prForm.tier1000} onChange={e=>setPrForm(p=>({...p,tier1000:e.target.checked}))} style={{ width:16,height:16 }} />20% sopra €1000</label>
                </div>
                <button onClick={()=>{
                  if(!prForm.name.trim()){toast$("Inserisci il nome","err");return;}
                  setPR([...prs,{id:`pr${Date.now()}`,name:prForm.name,tier250:prForm.tier250,tier1000:prForm.tier1000}]);
                  setPrForm({name:"",tier250:false,tier1000:false});
                  toast$("PR aggiunto ✓");
                }} style={{ padding:"9px 24px",background:"#1a1a2e",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontSize:13,fontWeight:600 }}>+ Aggiungi</button>
              </div>
            </div>}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12 }}>
              {prs.map(pr=>{
                const rep=prReport.find(r=>r.id===pr.id)||{};
                return (
                  <div key={pr.id} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:18 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                      <div>
                        <div style={{ fontWeight:700,fontSize:16 }}>{pr.name}</div>
                        <div style={{ display:"flex",gap:5,marginTop:6,flexWrap:"wrap" }}>
                          <span style={{ fontSize:11,background:"#f1f5f9",borderRadius:4,padding:"2px 8px",color:"#64748b" }}>10% base</span>
                          {pr.tier250&&<span style={{ fontSize:11,background:"#fef3c7",borderRadius:4,padding:"2px 8px",color:"#b45309",fontWeight:600 }}>15% &gt;€250</span>}
                          {pr.tier1000&&<span style={{ fontSize:11,background:"#dcfce7",borderRadius:4,padding:"2px 8px",color:"#16a34a",fontWeight:600 }}>20% &gt;€1000</span>}
                        </div>
                      </div>
                      {isCassa&&<div style={{ display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end" }}>
                        <button onClick={()=>{setPR(prs.filter(x=>x.id!==pr.id));toast$("PR rimosso","err");}} style={{ background:"none",border:"none",color:"#fca5a5",cursor:"pointer",fontSize:16 }}>✕</button>
                        <label style={{ display:"flex",alignItems:"center",gap:4,fontSize:11,cursor:"pointer",color:"#64748b" }}><input type="checkbox" checked={!!pr.tier250} onChange={e=>setPR(prs.map(p=>p.id===pr.id?{...p,tier250:e.target.checked}:p))} />15%</label>
                        <label style={{ display:"flex",alignItems:"center",gap:4,fontSize:11,cursor:"pointer",color:"#64748b" }}><input type="checkbox" checked={!!pr.tier1000} onChange={e=>setPR(prs.map(p=>p.id===pr.id?{...p,tier1000:e.target.checked}:p))} />20%</label>
                      </div>}
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                      {[{l:"Tavoli",v:rep.tables||0,c:"#d97706"},{l:"Incasso",v:`€${rep.total||0}`,c:"#2563eb"},{l:`Provv. ${rep.rate||10}%`,v:`€${rep.commission||0}`,c:"#16a34a"}].map(x=>(
                        <div key={x.l} style={{ textAlign:"center",background:"#f8fafc",borderRadius:6,padding:"8px 4px" }}>
                          <div style={{ fontSize:10,color:"#94a3b8" }}>{x.l}</div>
                          <div style={{ fontSize:15,fontWeight:700,color:x.c }}>{x.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── REPORT ── */}
        {tab==="report"&&(
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10 }}>
              <h2 style={{ fontSize:18,fontWeight:700,margin:0 }}>📊 Report Fine Serata</h2>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                <button onClick={()=>printCashierList(reservations,bottles)} style={{ padding:"8px 14px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600 }}>🖨 Lista Cassiere</button>
                <button onClick={()=>printFloorPlan(reservations)} style={{ padding:"8px 14px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600 }}>🗺 Piantina</button>
                {isCassa&&<button onClick={()=>{ setNightName(new Date().toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long",year:"numeric"})); setSaveModal(true); }} style={{ padding:"8px 16px",background:"#f59e0b",color:"#1a1a2e",border:"none",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:700 }}>💾 Salva &amp; Nuova Serata</button>}
                <button onClick={()=>window.print()} style={{ padding:"8px 16px",background:"#1a1a2e",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontSize:12 }}>🖨 Stampa Report</button>
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24 }}>
              {[{l:"Incasso Totale",v:`€${stats.incasso.toLocaleString("it-IT")}`,c:"#2563eb",bg:"#dbeafe"},{l:"Tavoli Serviti",v:stats.booked,c:"#d97706",bg:"#fef3c7"},{l:"Costo Bottiglie",v:`€${bottleUsage.reduce((s,b)=>s+b.cost,0)}`,c:"#dc2626",bg:"#fee2e2"}].map(x=>(
                <div key={x.l} style={{ background:x.bg,borderRadius:12,padding:18,textAlign:"center" }}>
                  <div style={{ fontSize:11,color:x.c,letterSpacing:"0.1em",marginBottom:6 }}>{x.l.toUpperCase()}</div>
                  <div style={{ fontSize:26,fontWeight:700,color:x.c }}>{x.v}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20,marginBottom:20 }}>
              <div style={{ fontSize:13,fontWeight:700,marginBottom:14,borderBottom:"1px solid #f1f5f9",paddingBottom:10 }}>🍾 SCARICO BOTTIGLIE</div>
              {bottleUsage.length===0?<div style={{ color:"#94a3b8",textAlign:"center",padding:20 }}>Nessuna bottiglia consumata</div>:(
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                    <thead><tr style={{ borderBottom:"2px solid #f1f5f9" }}>{["Bottiglia","Cat.","Qt.","Rimaste","Costo Tot.","Ricavo","Margine"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"left",fontSize:11,color:"#94a3b8" }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {bottleUsage.map(b=>(
                        <tr key={b.id} style={{ borderBottom:"1px solid #f8fafc" }}>
                          <td style={{ padding:"10px",fontWeight:600 }}>{b.name}</td><td style={{ padding:"10px",color:"#64748b" }}>{b.category}</td>
                          <td style={{ padding:"10px",fontWeight:700,color:"#d97706" }}>{b.used}</td><td style={{ padding:"10px",fontWeight:700,color:(b.stock-b.used)<3?"#dc2626":"#16a34a" }}>{b.stock-b.used}</td>
                          <td style={{ padding:"10px",color:"#dc2626" }}>€{b.cost}</td><td style={{ padding:"10px",color:"#2563eb",fontWeight:600 }}>€{b.revenue}</td>
                          <td style={{ padding:"10px",color:"#16a34a",fontWeight:700 }}>€{b.revenue-b.cost}</td>
                        </tr>
                      ))}
                      <tr style={{ background:"#f8fafc",fontWeight:700 }}>
                        <td colSpan={4} style={{ padding:"10px",color:"#64748b",fontSize:12 }}>TOTALE</td>
                        <td style={{ padding:"10px",color:"#dc2626" }}>€{bottleUsage.reduce((s,b)=>s+b.cost,0)}</td>
                        <td style={{ padding:"10px",color:"#2563eb" }}>€{bottleUsage.reduce((s,b)=>s+b.revenue,0)}</td>
                        <td style={{ padding:"10px",color:"#16a34a" }}>€{bottleUsage.reduce((s,b)=>s+b.revenue-b.cost,0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20 }}>
              <div style={{ fontSize:13,fontWeight:700,marginBottom:14,borderBottom:"1px solid #f1f5f9",paddingBottom:10 }}>👤 PROVVIGIONI PR</div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead><tr style={{ borderBottom:"2px solid #f1f5f9" }}>{["PR","Scaglioni","Tavoli","Incasso","% App.","Provvigione"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"left",fontSize:11,color:"#94a3b8" }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {prReport.map(pr=>(
                      <tr key={pr.id} style={{ borderBottom:"1px solid #f8fafc" }}>
                        <td style={{ padding:"10px",fontWeight:600 }}>{pr.name}</td>
                        <td style={{ padding:"10px" }}><div style={{ display:"flex",gap:4 }}><span style={{ fontSize:10,background:"#f1f5f9",borderRadius:3,padding:"1px 6px",color:"#64748b" }}>10%</span>{pr.tier250&&<span style={{ fontSize:10,background:"#fef3c7",borderRadius:3,padding:"1px 6px",color:"#b45309" }}>15%</span>}{pr.tier1000&&<span style={{ fontSize:10,background:"#dcfce7",borderRadius:3,padding:"1px 6px",color:"#16a34a" }}>20%</span>}</div></td>
                        <td style={{ padding:"10px",color:"#d97706",fontWeight:700 }}>{pr.tables}</td>
                        <td style={{ padding:"10px",color:"#2563eb" }}>€{pr.total}</td>
                        <td style={{ padding:"10px",color:"#9333ea",fontWeight:700 }}>{pr.rate}%</td>
                        <td style={{ padding:"10px",fontWeight:700,fontSize:15,color:"#16a34a" }}>€{pr.commission}</td>
                      </tr>
                    ))}
                    <tr style={{ background:"#f8fafc",fontWeight:700 }}>
                      <td colSpan={5} style={{ padding:"10px",color:"#64748b",fontSize:12 }}>TOTALE</td>
                      <td style={{ padding:"10px",color:"#16a34a",fontSize:16 }}>€{prReport.reduce((s,p)=>s+p.commission,0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── STORICO ── */}
        {tab==="history"&&(
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10 }}>
              <h2 style={{ fontSize:18,fontWeight:700,margin:0 }}>📅 Storico Serate</h2>
              {isCassa&&<button onClick={()=>{ setNightName(new Date().toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long",year:"numeric"})); setSaveModal(true); }} style={{ padding:"9px 20px",background:"#f59e0b",color:"#1a1a2e",border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700 }}>💾 Salva Serata Corrente</button>}
            </div>

            {history.length===0?(
              <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:40,textAlign:"center",color:"#94a3b8" }}>
                <div style={{ fontSize:32,marginBottom:12 }}>📅</div>
                <div style={{ fontSize:15,fontWeight:600,marginBottom:6 }}>Nessuna serata salvata</div>
                <div style={{ fontSize:13 }}>Vai al Report e clicca "Salva &amp; Nuova Serata" per archiviare la serata corrente</div>
              </div>
            ):(
              historyDetail ? (
                // ── DETTAGLIO SERATA ──
                <div>
                  <button onClick={()=>setHistoryDetail(null)} style={{ display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:13,marginBottom:16,padding:0 }}>← Torna allo storico</button>
                  <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20,marginBottom:20 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10 }}>
                      <div>
                        {editingNight===historyDetail.id?(
                          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                            <input defaultValue={historyDetail.name} id="renameInput"
                              style={{ padding:"8px 12px",borderRadius:8,border:"1px solid #f59e0b",fontSize:16,fontWeight:700,outline:"none",minWidth:260 }} />
                            <button onClick={()=>{ const v=document.getElementById("renameInput").value; if(v.trim()){renameNight(historyDetail.id,v.trim()); setHistoryDetail({...historyDetail,name:v.trim()});} }} style={{ padding:"8px 16px",background:"#1a1a2e",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontSize:13,fontWeight:600 }}>✓ Salva</button>
                            <button onClick={()=>setEditingNight(null)} style={{ padding:"8px 12px",background:"none",border:"1px solid #e2e8f0",borderRadius:7,cursor:"pointer",fontSize:13,color:"#64748b" }}>Annulla</button>
                          </div>
                        ):(
                          <div>
                            <div style={{ fontSize:20,fontWeight:700,marginBottom:4 }}>{historyDetail.name}</div>
                            <div style={{ fontSize:12,color:"#64748b" }}>{new Date(historyDetail.date).toLocaleString("it-IT")}</div>
                          </div>
                        )}
                      </div>
                      {isCassa&&<div style={{ display:"flex",gap:8 }}>
                        <button onClick={()=>setEditingNight(historyDetail.id)} style={{ padding:"7px 16px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600 }}>✏️ Rinomina</button>
                        <button onClick={()=>deleteNight(historyDetail.id)} style={{ padding:"7px 16px",background:"#fee2e2",border:"1px solid #fca5a5",color:"#dc2626",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:600 }}>🗑 Elimina</button>
                      </div>}
                    </div>
                  </div>

                  {(()=>{
                    const { incasso, booked, botUsage, prRep } = nightStats(historyDetail);
                    const bookedTables = TABLES.filter(t=>historyDetail.reservations[t.id]);
                    return (
                      <>
                        {/* Stats serata */}
                        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20 }}>
                          {[{l:"Incasso",v:`€${incasso.toLocaleString("it-IT")}`,c:"#2563eb",bg:"#dbeafe"},{l:"Tavoli",v:booked,c:"#d97706",bg:"#fef3c7"},{l:"Costo Bottiglie",v:`€${botUsage.reduce((s,b)=>s+b.cost,0)}`,c:"#dc2626",bg:"#fee2e2"}].map(x=>(
                            <div key={x.l} style={{ background:x.bg,borderRadius:12,padding:16,textAlign:"center" }}>
                              <div style={{ fontSize:11,color:x.c,letterSpacing:"0.1em",marginBottom:4 }}>{x.l.toUpperCase()}</div>
                              <div style={{ fontSize:24,fontWeight:700,color:x.c }}>{x.v}</div>
                            </div>
                          ))}
                        </div>

                        {/* Tavoli */}
                        <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20,marginBottom:16 }}>
                          <div style={{ fontSize:13,fontWeight:700,marginBottom:14,borderBottom:"1px solid #f1f5f9",paddingBottom:10 }}>🪑 TAVOLI ({booked})</div>
                          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                            {bookedTables.map(t=>{
                              const r=historyDetail.reservations[t.id]; const zm=ZONE_META[t.zone];
                              const tot=tableTotalWith(r,historyDetail.bottles);
                              const pr=r?.prId?historyDetail.prs.find(p=>p.id===r.prId):null;
                              const bots=(r.bottles||[]).map(b=>{ const bt=historyDetail.bottles.find(x=>x.id===b.bottleId); return bt?`${bt.name} ×${b.qty}`:""; }).filter(Boolean).join(", ");
                              return (
                                <div key={t.id} style={{ border:`1px solid ${zm.border}`,borderLeft:`4px solid ${zm.dot}`,borderRadius:8,padding:"12px 16px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,alignItems:"center" }}>
                                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                                    <div style={{ width:34,height:34,borderRadius:7,background:zm.bg,border:`2px solid ${zm.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:zm.color }}>{t.name}</div>
                                    <div>
                                      <div style={{ fontSize:14,fontWeight:700 }}>{r.clientName}</div>
                                      <div style={{ fontSize:11,color:"#64748b" }}>{t.zone} · 👥{r.guests}{r.pricePerPerson?` · €${r.pricePerPerson}/p`:""}{pr?` · PR: ${pr.name}`:""}</div>
                                    </div>
                                  </div>
                                  <div style={{ display:"flex",gap:12,fontSize:12,color:"#64748b",flexWrap:"wrap",alignItems:"center" }}>
                                    {bots&&<span>🍾 {bots}</span>}
                                    {r.caparra>0&&<span style={{ color:r.caparraPaid?"#16a34a":"#dc2626" }}>{r.caparraPaid?"✓":"✗"} Cap. €{r.caparra}</span>}
                                    {tot>0&&<span style={{ color:"#2563eb",fontWeight:700,fontSize:14 }}>€{tot}</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bottiglie */}
                        {botUsage.length>0&&<div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20,marginBottom:16 }}>
                          <div style={{ fontSize:13,fontWeight:700,marginBottom:14,borderBottom:"1px solid #f1f5f9",paddingBottom:10 }}>🍾 BOTTIGLIE</div>
                          <div style={{ overflowX:"auto" }}>
                            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                              <thead><tr style={{ borderBottom:"2px solid #f1f5f9" }}>{["Bottiglia","Qt.","Costo","Ricavo","Margine"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"left",fontSize:11,color:"#94a3b8" }}>{h}</th>)}</tr></thead>
                              <tbody>
                                {botUsage.map(b=>(
                                  <tr key={b.id} style={{ borderBottom:"1px solid #f8fafc" }}>
                                    <td style={{ padding:"9px 10px",fontWeight:600 }}>{b.name}</td>
                                    <td style={{ padding:"9px 10px",fontWeight:700,color:"#d97706" }}>{b.used}</td>
                                    <td style={{ padding:"9px 10px",color:"#dc2626" }}>€{b.cost}</td>
                                    <td style={{ padding:"9px 10px",color:"#2563eb",fontWeight:600 }}>€{b.revenue}</td>
                                    <td style={{ padding:"9px 10px",color:"#16a34a",fontWeight:700 }}>€{b.revenue-b.cost}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>}

                        {/* PR */}
                        <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20 }}>
                          <div style={{ fontSize:13,fontWeight:700,marginBottom:14,borderBottom:"1px solid #f1f5f9",paddingBottom:10 }}>👤 PROVVIGIONI PR</div>
                          <div style={{ overflowX:"auto" }}>
                            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                              <thead><tr style={{ borderBottom:"2px solid #f1f5f9" }}>{["PR","Tavoli","Incasso","% App.","Provvigione"].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"left",fontSize:11,color:"#94a3b8" }}>{h}</th>)}</tr></thead>
                              <tbody>
                                {prRep.filter(p=>p.tables>0).map(pr=>(
                                  <tr key={pr.id} style={{ borderBottom:"1px solid #f8fafc" }}>
                                    <td style={{ padding:"9px 10px",fontWeight:600 }}>{pr.name}</td>
                                    <td style={{ padding:"9px 10px",color:"#d97706",fontWeight:700 }}>{pr.tables}</td>
                                    <td style={{ padding:"9px 10px",color:"#2563eb" }}>€{pr.total}</td>
                                    <td style={{ padding:"9px 10px",color:"#9333ea",fontWeight:700 }}>{pr.rate}%</td>
                                    <td style={{ padding:"9px 10px",fontWeight:700,fontSize:15,color:"#16a34a" }}>€{pr.commission}</td>
                                  </tr>
                                ))}
                                <tr style={{ background:"#f8fafc",fontWeight:700 }}>
                                  <td colSpan={4} style={{ padding:"9px 10px",color:"#64748b",fontSize:12 }}>TOTALE</td>
                                  <td style={{ padding:"9px 10px",color:"#16a34a",fontSize:15 }}>€{prRep.reduce((s,p)=>s+p.commission,0)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                // ── LISTA STORICO ──
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {history.map(night=>{
                    const { incasso, booked } = nightStats(night);
                    return (
                      <div key={night.id} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                          <div style={{ width:44,height:44,background:"#1a1a2e",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🌙</div>
                          <div>
                            <div style={{ fontSize:15,fontWeight:700 }}>{night.name}</div>
                            <div style={{ fontSize:12,color:"#64748b",marginTop:2 }}>{new Date(night.date).toLocaleString("it-IT")} · {booked} tavoli</div>
                          </div>
                        </div>
                        <div style={{ display:"flex",alignItems:"center",gap:16 }}>
                          <div style={{ textAlign:"center" }}>
                            <div style={{ fontSize:10,color:"#94a3b8",letterSpacing:"0.08em" }}>INCASSO</div>
                            <div style={{ fontSize:20,fontWeight:700,color:"#2563eb" }}>€{incasso.toLocaleString("it-IT")}</div>
                          </div>
                          <div style={{ display:"flex",gap:8 }}>
                            <button onClick={()=>setHistoryDetail(night)} style={{ padding:"8px 16px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,color:"#1a1a2e" }}>👁 Dettaglio</button>
                            {isCassa&&<button onClick={()=>deleteNight(night.id)} style={{ padding:"8px 12px",background:"#fee2e2",border:"1px solid #fca5a5",color:"#dc2626",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600 }}>🗑</button>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ── MODAL SALVA SERATA ── */}
      {saveModal&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div style={{ background:"#fff",borderRadius:16,padding:32,width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize:20,fontWeight:700,marginBottom:6 }}>💾 Salva Serata</div>
            <div style={{ fontSize:13,color:"#64748b",marginBottom:20 }}>Dai un nome alla serata corrente. Verrà archiviata nello Storico e la mappa si azzererà per la serata successiva.</div>
            <div style={{ fontSize:10,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:6 }}>NOME SERATA</div>
            <input value={nightName} onChange={e=>setNightName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveNight()}
              placeholder="Es. Sabato 8 Marzo 2025"
              style={{ width:"100%",padding:"12px 14px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:20 }} autoFocus />
            <div style={{ background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#92400e",marginBottom:20 }}>
              ⚠️ Dopo il salvataggio la serata corrente verrà azzerata. Questa operazione non è reversibile.
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={saveNight} style={{ flex:1,padding:"12px",borderRadius:8,background:"#f59e0b",color:"#1a1a2e",border:"none",fontSize:14,cursor:"pointer",fontWeight:700 }}>✓ Salva e Azzera</button>
              <button onClick={()=>setSaveModal(false)} style={{ padding:"12px 20px",borderRadius:8,background:"#f1f5f9",border:"1px solid #e2e8f0",color:"#64748b",fontSize:13,cursor:"pointer" }}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PRENOTAZIONE ── */}
      {formOpen&&selTable&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}
          onClick={e=>e.target===e.currentTarget&&setFormOpen(false)}>
          <div style={{ background:"#fff",borderRadius:16,padding:28,width:"100%",maxWidth:560,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
              <div>
                <div style={{ fontSize:11,color:ZONE_META[selTable.zone].color,fontWeight:700,letterSpacing:"0.12em",marginBottom:4 }}>{selTable.zone.toUpperCase()}</div>
                <h2 style={{ margin:0,fontSize:20 }}>{editingId?`Modifica – ${selTable.name}`:`Prenota – ${selTable.name}`}</h2>
              </div>
              <button onClick={()=>setFormOpen(false)} style={{ background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#94a3b8" }}>✕</button>
            </div>
            <SL>Cliente</SL>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              <F label="Nome Cliente *" value={form.clientName} set={v=>setForm(f=>({...f,clientName:v}))} ph="Es. Mario Rossi" />
              <F label="Telefono" value={form.phone} set={v=>setForm(f=>({...f,phone:v}))} ph="333-1234567" t="tel" />
            </div>
            <SL>Dettagli Tavolo</SL>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12 }}>
              <F label="Nome Tavolo" value={form.tableName} set={v=>setForm(f=>({...f,tableName:v}))} ph={selTable.name} />
              <F label="N° Paganti *" value={form.guests} set={v=>setForm(f=>({...f,guests:v}))} ph="Es. 4" t="number" />
              <F label="Prezzo a Testa €" value={form.pricePerPerson} set={v=>setForm(f=>({...f,pricePerPerson:v}))} ph="Es. 30" t="number" />
            </div>
            {form.guests&&form.pricePerPerson&&(
              <div style={{ background:"#dcfce7",borderRadius:8,padding:"8px 14px",marginBottom:8,display:"flex",justifyContent:"space-between" }}>
                <span style={{ fontSize:13,color:"#16a34a" }}>Totale paganti</span>
                <span style={{ fontSize:16,fontWeight:700,color:"#16a34a" }}>€{Number(form.guests)*Number(form.pricePerPerson)}</span>
              </div>
            )}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:6 }}>PR DI RIFERIMENTO</div>
              <select value={form.prId} onChange={e=>setForm(f=>({...f,prId:e.target.value}))}
                style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,outline:"none" }}>
                <option value="">— Nessun PR —</option>
                {prs.map(pr=><option key={pr.id} value={pr.id}>{pr.name} ({pr.tier1000?"10/15/20%":pr.tier250?"10/15%":"10%"})</option>)}
              </select>
            </div>
            <SL>Bottiglie</SL>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8,marginBottom:10 }}>
              {bottles.map(b=>{
                const inOrd=form.bottles.find(x=>x.bottleId===b.id);
                return (
                  <div key={b.id} style={{ border:`2px solid ${inOrd?"#fcd34d":"#e2e8f0"}`,background:inOrd?"#fef3c7":"#f8fafc",borderRadius:8,padding:"8px 10px" }}>
                    <div style={{ fontSize:11,fontWeight:700 }}>{b.name}</div>
                    <div style={{ fontSize:10,color:"#94a3b8" }}>€{b.sellPrice}</div>
                    <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:6 }}>
                      <button onClick={()=>remBot(b.id)} style={{ width:24,height:24,borderRadius:5,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:16,lineHeight:1 }}>−</button>
                      <span style={{ fontSize:15,fontWeight:700,color:"#d97706",minWidth:18,textAlign:"center" }}>{inOrd?.qty||0}</span>
                      <button onClick={()=>addBot(b.id)} style={{ width:24,height:24,borderRadius:5,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer",fontSize:16,lineHeight:1 }}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {form.bottles.length>0&&(
              <div style={{ background:"#dbeafe",borderRadius:8,padding:"9px 14px",marginBottom:8,display:"flex",justifyContent:"space-between" }}>
                <span style={{ fontSize:13,color:"#1d4ed8" }}>Totale bottiglie</span>
                <span style={{ fontSize:16,fontWeight:700,color:"#1d4ed8" }}>€{form.bottles.reduce((s,b)=>{const bt=bottles.find(x=>x.id===b.bottleId);return s+(bt?bt.sellPrice*b.qty:0);},0)}</span>
              </div>
            )}
            <SL>Caparra</SL>
            <div style={{ display:"grid",gridTemplateColumns:"1fr auto",gap:12,alignItems:"end",marginBottom:12 }}>
              <F label="Importo €" value={form.caparra} set={v=>setForm(f=>({...f,caparra:v}))} ph="Es. 100" t="number" />
              <div>
                <div style={{ fontSize:10,color:"#94a3b8",letterSpacing:"0.08em",marginBottom:8 }}>RICEVUTA</div>
                <div onClick={()=>setForm(f=>({...f,caparraPaid:!f.caparraPaid}))} style={{ width:48,height:26,borderRadius:13,background:form.caparraPaid?"#16a34a":"#e2e8f0",position:"relative",cursor:"pointer",transition:"background 0.2s" }}>
                  <div style={{ position:"absolute",top:3,left:form.caparraPaid?25:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            </div>
            <F label="Note" value={form.note} set={v=>setForm(f=>({...f,note:v}))} ph="Es. Compleanno, allergie..." />
            <div style={{ display:"flex",gap:10,marginTop:20 }}>
              <button onClick={saveRes} style={{ flex:1,padding:"12px",borderRadius:8,background:"#1a1a2e",color:"#fff",border:"none",fontSize:14,cursor:"pointer",fontWeight:700 }}>✓ Salva</button>
              {editingId&&<button onClick={()=>delRes(editingId)} style={{ padding:"12px 18px",borderRadius:8,background:"#fee2e2",border:"1px solid #fca5a5",color:"#dc2626",fontSize:13,cursor:"pointer",fontWeight:600 }}>🗑 Elimina</button>}
            </div>
          </div>
        </div>
      )}

      <style>{`input:focus,select:focus{border-color:#f59e0b!important;box-shadow:0 0 0 3px rgba(245,158,11,0.12)}@media print{button{display:none!important}}`}</style>
    </div>
  );
}

function SL({children}){return<div style={{fontSize:10,fontWeight:700,color:"#94a3b8",letterSpacing:"0.15em",textTransform:"uppercase",margin:"14px 0 8px",borderBottom:"1px solid #f1f5f9",paddingBottom:6}}>{children}</div>;}
function F({label,value,set,ph,t="text"}){return<div style={{marginBottom:4}}><div style={{fontSize:10,color:"#94a3b8",letterSpacing:"0.1em",marginBottom:5}}>{label}</div><input type={t} value={value} placeholder={ph} onChange={e=>set(e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:13,color:"#1a1a2e",boxSizing:"border-box",fontFamily:"Georgia,serif"}}/></div>;}
