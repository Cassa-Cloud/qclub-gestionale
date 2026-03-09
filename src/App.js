import { useState, useEffect, useCallback } from "react";

// ─── Q CLUB LAYOUT ───────────────────────────────────────────────────────────
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

const DEFAULT_BOTTLES = [
  { id: "b1", name: "Belvedere",      category: "Vodka",      costPrice: 35, sellPrice: 120, stock: 12 },
  { id: "b2", name: "Grey Goose",     category: "Vodka",      costPrice: 32, sellPrice: 110, stock: 8  },
  { id: "b3", name: "Hendricks",      category: "Gin",        costPrice: 28, sellPrice: 100, stock: 6  },
  { id: "b4", name: "Don Julio",      category: "Tequila",    costPrice: 45, sellPrice: 150, stock: 5  },
  { id: "b5", name: "Moët",           category: "Champagne",  costPrice: 40, sellPrice: 130, stock: 10 },
  { id: "b6", name: "Veuve Clicquot", category: "Champagne",  costPrice: 50, sellPrice: 160, stock: 7  },
  { id: "b7", name: "Jack Daniel's",  category: "Whisky",     costPrice: 22, sellPrice: 80,  stock: 15 },
  { id: "b8", name: "Aperol",         category: "Aperitivo",  costPrice: 12, sellPrice: 45,  stock: 20 },
];

const DEFAULT_PRS = [
  { id: "pr1", name: "Alessandro", commissionPct: 10 },
  { id: "pr2", name: "Giulia",     commissionPct: 12 },
  { id: "pr3", name: "Marco",      commissionPct: 10 },
];

const EMPTY_RESERVATION = {
  clientName: "", tableName: "", guests: "", phone: "",
  caparra: "", caparraPaid: false, bottles: [], prId: "", note: "",
};

const KEYS = { reservations: "qclub-res", bottles: "qclub-bot", prs: "qclub-prs", ts: "qclub-ts" };

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); localStorage.setItem(KEYS.ts, Date.now()); }
  catch {}
}

export default function App() {
  const [tab, setTab] = useState("map");
  const [reservations, setReservations] = useState(() => load(KEYS.reservations, {}));
  const [bottles, setBottles] = useState(() => load(KEYS.bottles, DEFAULT_BOTTLES));
  const [prs, setPrs] = useState(() => load(KEYS.prs, DEFAULT_PRS));
  const [lastSync, setLastSync] = useState(new Date());
  const [lastTs, setLastTs] = useState(() => localStorage.getItem(KEYS.ts) || "0");

  const [formOpen, setFormOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [form, setForm] = useState(EMPTY_RESERVATION);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [bottleForm, setBottleForm] = useState({ name:"", category:"", costPrice:"", sellPrice:"", stock:"" });
  const [prForm, setPrForm] = useState({ name:"", commissionPct:"" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterZone, setFilterZone] = useState("Tutti");

  // Poll localStorage for cross-tab sync (same device) + BroadcastChannel for same-origin tabs
  const syncFromStorage = useCallback(() => {
    const ts = localStorage.getItem(KEYS.ts) || "0";
    if (ts !== lastTs) {
      setReservations(load(KEYS.reservations, {}));
      setBottles(load(KEYS.bottles, DEFAULT_BOTTLES));
      setPrs(load(KEYS.prs, DEFAULT_PRS));
      setLastTs(ts);
    }
    setLastSync(new Date());
  }, [lastTs]);

  useEffect(() => {
    const interval = setInterval(syncFromStorage, 3000);
    window.addEventListener("storage", syncFromStorage);
    return () => { clearInterval(interval); window.removeEventListener("storage", syncFromStorage); };
  }, [syncFromStorage]);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const updateReservations = (next) => { setReservations(next); save(KEYS.reservations, next); };
  const updateBottles = (next) => { setBottles(next); save(KEYS.bottles, next); };
  const updatePrs = (next) => { setPrs(next); save(KEYS.prs, next); };

  const openForm = (table) => {
    setSelectedTable(table);
    const ex = reservations[table.id];
    if (ex) { setForm({ ...EMPTY_RESERVATION, ...ex }); setEditingId(table.id); }
    else { setForm({ ...EMPTY_RESERVATION, tableName: table.name }); setEditingId(null); }
    setFormOpen(true);
  };
  const closeForm = () => { setFormOpen(false); setSelectedTable(null); };

  const saveReservation = () => {
    if (!form.clientName.trim()) { showToast("Inserisci il nome del cliente", "err"); return; }
    if (!form.guests || Number(form.guests) < 1) { showToast("Inserisci il numero di ospiti", "err"); return; }
    updateReservations({ ...reservations, [selectedTable.id]: { ...form, guests: Number(form.guests), caparra: Number(form.caparra) } });
    showToast(`✓ Salvato: ${form.clientName}`);
    closeForm();
  };

  const deleteReservation = (id) => {
    const next = { ...reservations }; delete next[id];
    updateReservations(next);
    showToast("Prenotazione eliminata", "err");
    closeForm();
  };

  const addBottleToForm = (bottleId) => {
    const ex = form.bottles.find(b => b.bottleId === bottleId);
    if (ex) setForm(f => ({ ...f, bottles: f.bottles.map(b => b.bottleId === bottleId ? { ...b, qty: b.qty + 1 } : b) }));
    else setForm(f => ({ ...f, bottles: [...f.bottles, { bottleId, qty: 1 }] }));
  };
  const removeBottleFromForm = (bottleId) => {
    setForm(f => ({ ...f, bottles: f.bottles.filter(b => b.bottleId !== bottleId) }));
  };

  const getTableTotal = (res) => {
    if (!res) return 0;
    return (res.bottles || []).reduce((sum, b) => {
      const bottle = bottles.find(bt => bt.id === b.bottleId);
      return sum + (bottle ? bottle.sellPrice * b.qty : 0);
    }, 0);
  };

  const stats = {
    total: TABLES.length,
    booked: Object.keys(reservations).length,
    free: TABLES.length - Object.keys(reservations).length,
    incasso: Object.values(reservations).reduce((s, r) => s + getTableTotal(r), 0),
  };

  const bottleUsage = bottles.map(b => {
    let used = 0;
    Object.values(reservations).forEach(r => { (r.bottles||[]).forEach(rb => { if (rb.bottleId === b.id) used += rb.qty; }); });
    return { ...b, used, revenue: used * b.sellPrice, cost: used * b.costPrice };
  }).filter(b => b.used > 0);

  const prReport = prs.map(pr => {
    let tables = 0, total = 0;
    Object.values(reservations).forEach(r => { if (r.prId === pr.id) { tables++; total += getTableTotal(r); } });
    return { ...pr, tables, total, commission: Math.round(total * pr.commissionPct / 100) };
  });

  const filteredTables = TABLES.filter(t => {
    const r = reservations[t.id];
    const matchZone = filterZone === "Tutti" || t.zone === filterZone;
    const matchSearch = !searchTerm || (r && r.clientName?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchZone && matchSearch;
  });

  const resetSerata = () => {
    if (window.confirm("Sicuro di voler azzerare tutta la serata? I dati non saranno recuperabili.")) {
      updateReservations({});
      showToast("Serata azzerata ✓");
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f2f5", fontFamily:"Georgia, serif", color:"#1a1a2e" }}>

      {toast && (
        <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:9999,
          background: toast.type==="err"?"#dc2626":"#16a34a", color:"#fff", padding:"11px 28px",
          borderRadius:50, fontSize:14, fontWeight:600, boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
          whiteSpace:"nowrap", animation:"slideDown 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div style={{ background:"#1a1a2e", color:"#fff", padding:"0 20px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:34, height:34, background:"#f59e0b", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900 }}>Q</div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, letterSpacing:"0.06em" }}>Q CLUB</div>
              <div style={{ fontSize:10, color:"#64748b", letterSpacing:"0.15em" }}>GESTIONALE TAVOLI</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 8px #22c55e" }} />
            <span style={{ fontSize:11, color:"#94a3b8" }}>
              Sync {lastSync.toLocaleTimeString("it-IT", {hour:"2-digit",minute:"2-digit",second:"2-digit"})}
            </span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
          {[
            { label:"Tavoli Totali", value:stats.total,        color:"#64748b", icon:"🪑" },
            { label:"Prenotati",     value:stats.booked,       color:"#d97706", icon:"✅" },
            { label:"Liberi",        value:stats.free,         color:"#16a34a", icon:"⭕" },
            { label:"Incasso",       value:`€${stats.incasso.toLocaleString("it-IT")}`, color:"#2563eb", icon:"💰" },
          ].map((s,i) => (
            <div key={s.label} style={{ padding:"14px 20px", textAlign:"center", borderRight: i<3?"1px solid #f1f5f9":"none" }}>
              <div style={{ fontSize:10, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:4 }}>{s.icon} {s.label.toUpperCase()}</div>
              <div style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ background:"#fff", borderBottom:"2px solid #e5e7eb", overflowX:"auto" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex" }}>
          {[
            { key:"map",     label:"🗺 Mappa" },
            { key:"list",    label:"📋 Ospiti" },
            { key:"bottles", label:"🍾 Bottiglie" },
            { key:"prs",     label:"👤 PR" },
            { key:"report",  label:"📊 Report" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding:"12px 18px", border:"none", background:"none", whiteSpace:"nowrap",
              borderBottom: tab===t.key ? "3px solid #f59e0b" : "3px solid transparent",
              color: tab===t.key ? "#1a1a2e" : "#94a3b8",
              fontWeight: tab===t.key ? 700 : 400,
              fontSize:13, cursor:"pointer", fontFamily:"Georgia,serif",
              transition:"all 0.15s", marginBottom:-2,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px" }}>

        {/* ── MAPPA ── */}
        {tab === "map" && (
          <div>
            <div style={{ display:"flex", gap:16, marginBottom:16, flexWrap:"wrap" }}>
              {Object.entries(ZONE_META).map(([zone, m]) => (
                <div key={zone} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#64748b" }}>
                  <div style={{ width:12, height:12, borderRadius:3, background:m.bg, border:`2px solid ${m.border}` }} />
                  {zone}
                </div>
              ))}
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#64748b" }}>
                <div style={{ width:12, height:12, borderRadius:3, background:"#f8fafc", border:"2px solid #e2e8f0" }} />
                Libero
              </div>
            </div>

            <div style={{ position:"relative", width:"100%", paddingBottom:"72%",
              background:"#fff", border:"1px solid #e2e8f0", borderRadius:16, overflow:"hidden",
              boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>

              <div style={{ position:"absolute", left:"55%", top:"2%", width:"16%", height:"24%", background:"#dbeafe", border:"2px solid #93c5fd", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#1d4ed8", fontWeight:700 }}>BAR 1</div>
              <div style={{ position:"absolute", left:"78%", top:"2%", width:"5%", height:"24%", background:"#dbeafe", border:"2px solid #93c5fd", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#1d4ed8", writingMode:"vertical-rl" }}>BAR 2</div>
              <div style={{ position:"absolute", left:"16%", top:"44%", width:"12%", height:"22%", background:"#fef3c7", border:"2px solid #fcd34d", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#b45309", writingMode:"vertical-rl", fontWeight:700 }}>🎵 CONSOLE</div>
              <div style={{ position:"absolute", left:"76%", bottom:"2%", width:"22%", height:"10%", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#94a3b8", letterSpacing:"0.1em" }}>INGRESSO</div>

              {TABLES.map(t => {
                const res = reservations[t.id];
                const zm = ZONE_META[t.zone];
                const total = getTableTotal(res);
                return (
                  <div key={t.id} onClick={() => openForm(t)}
                    style={{ position:"absolute", left:`${t.x}%`, top:`${t.y}%`, width:`${t.w}%`, height:`${t.h}%`,
                      background: res ? zm.bg : "#f8fafc",
                      border: `2px solid ${res ? zm.border : "#e2e8f0"}`,
                      borderRadius:8, cursor:"pointer",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                      transition:"all 0.15s",
                      boxShadow: res ? `0 2px 10px ${zm.border}99` : "none",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform="scale(1.06)"; e.currentTarget.style.zIndex=10; }}
                    onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.zIndex=1; }}>
                    <div style={{ fontSize:11, fontWeight:700, color: res ? zm.color : "#94a3b8" }}>{t.name}</div>
                    {res ? (
                      <>
                        <div style={{ fontSize:9, color:zm.color, maxWidth:"92%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textAlign:"center" }}>{res.clientName}</div>
                        <div style={{ fontSize:9, color:"#64748b" }}>👥{res.guests}</div>
                        {total > 0 && <div style={{ fontSize:9, color:"#2563eb", fontWeight:700 }}>€{total}</div>}
                      </>
                    ) : (
                      <div style={{ fontSize:9, color:"#cbd5e1" }}>Libero</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign:"center", color:"#94a3b8", fontSize:12, marginTop:10 }}>
              Clicca un tavolo per prenotare · sync automatico ogni 3 secondi tra tutti i dispositivi
            </div>
          </div>
        )}

        {/* ── LISTA ── */}
        {tab === "list" && (
          <div>
            <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
              <input placeholder="🔍 Cerca cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ flex:1, minWidth:180, padding:"9px 14px", borderRadius:8, background:"#fff", border:"1px solid #e2e8f0", fontSize:13, outline:"none" }} />
              <select value={filterZone} onChange={e => setFilterZone(e.target.value)}
                style={{ padding:"9px 14px", borderRadius:8, background:"#fff", border:"1px solid #e2e8f0", fontSize:13, cursor:"pointer" }}>
                <option>Tutti</option>
                {Object.keys(ZONE_META).map(z => <option key={z}>{z}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {filteredTables.map(t => {
                const res = reservations[t.id];
                const zm = ZONE_META[t.zone];
                const total = getTableTotal(res);
                const pr = res?.prId ? prs.find(p => p.id === res.prId) : null;
                return (
                  <div key={t.id} style={{ background:"#fff", border:`1px solid ${res?zm.border:"#e5e7eb"}`,
                    borderLeft:`4px solid ${res?zm.dot:"#e5e7eb"}`, borderRadius:10, padding:"14px 18px",
                    display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:38, height:38, borderRadius:8, background:zm.bg, border:`2px solid ${zm.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:zm.color }}>{t.name}</div>
                      <div>
                        <div style={{ fontSize:11, color:zm.color, letterSpacing:"0.08em", marginBottom:2 }}>{t.zone} · {t.capacity} posti</div>
                        {res ? <div style={{ fontSize:15, fontWeight:700 }}>{res.clientName}</div>
                          : <div style={{ fontSize:13, color:"#94a3b8" }}>Libero</div>}
                      </div>
                    </div>
                    {res && (
                      <div style={{ display:"flex", gap:12, fontSize:12, color:"#64748b", flexWrap:"wrap", alignItems:"center" }}>
                        <span>👥 {res.guests}</span>
                        {res.phone && <span>📞 {res.phone}</span>}
                        {res.caparra > 0 && <span style={{ color:res.caparraPaid?"#16a34a":"#dc2626", fontWeight:600 }}>{res.caparraPaid?"✓":"✗"} Cap. €{res.caparra}</span>}
                        {res.bottles?.length > 0 && <span>🍾 {res.bottles.reduce((s,b)=>s+b.qty,0)} bot.</span>}
                        {total > 0 && <span style={{ color:"#2563eb", fontWeight:700 }}>€{total}</span>}
                        {pr && <span style={{ color:"#9333ea" }}>PR: {pr.name}</span>}
                        {res.note && <span style={{ color:"#d97706" }}>📝 {res.note}</span>}
                      </div>
                    )}
                    <button onClick={() => openForm(t)} style={{ padding:"7px 16px", borderRadius:6,
                      background: res?zm.bg:"#f0fdf4", border:`1px solid ${res?zm.border:"#86efac"}`,
                      color: res?zm.color:"#16a34a", fontSize:12, cursor:"pointer", fontWeight:600 }}>
                      {res ? "Modifica" : "+ Prenota"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── BOTTIGLIE ── */}
        {tab === "bottles" && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>🍾 Gestione Bottiglie</h2>
            <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:20, marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#64748b", letterSpacing:"0.12em", marginBottom:14 }}>AGGIUNGI BOTTIGLIA</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10 }}>
                {[
                  { key:"name",      label:"Nome",           placeholder:"Es. Belvedere" },
                  { key:"category",  label:"Categoria",      placeholder:"Es. Vodka" },
                  { key:"costPrice", label:"Prezzo Costo €", placeholder:"Es. 35", type:"number" },
                  { key:"sellPrice", label:"Prezzo Vendita €",placeholder:"Es. 120", type:"number" },
                  { key:"stock",     label:"Stock iniziale", placeholder:"Es. 10", type:"number" },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize:10, color:"#94a3b8", marginBottom:4 }}>{f.label}</div>
                    <input type={f.type||"text"} placeholder={f.placeholder} value={bottleForm[f.key]}
                      onChange={e => setBottleForm(p=>({...p,[f.key]:e.target.value}))}
                      style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:"1px solid #e2e8f0", fontSize:13, outline:"none", boxSizing:"border-box" }} />
                  </div>
                ))}
              </div>
              <button onClick={() => {
                if (!bottleForm.name.trim()) { showToast("Inserisci il nome", "err"); return; }
                updateBottles([...bottles, { id:`b${Date.now()}`, ...bottleForm, costPrice:Number(bottleForm.costPrice), sellPrice:Number(bottleForm.sellPrice), stock:Number(bottleForm.stock) }]);
                setBottleForm({ name:"", category:"", costPrice:"", sellPrice:"", stock:"" });
                showToast("Bottiglia aggiunta ✓");
              }} style={{ marginTop:12, padding:"9px 24px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                + Aggiungi
              </button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
              {bottles.map(b => {
                const used = Object.values(reservations).reduce((s,r) => s+((r.bottles||[]).find(rb=>rb.bottleId===b.id)?.qty||0), 0);
                return (
                  <div key={b.id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:10, padding:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:15 }}>{b.name}</div>
                        <div style={{ fontSize:12, color:"#94a3b8" }}>{b.category}</div>
                      </div>
                      <button onClick={() => { updateBottles(bottles.filter(x=>x.id!==b.id)); showToast("Rimossa","err"); }}
                        style={{ background:"none", border:"none", color:"#fca5a5", cursor:"pointer", fontSize:16 }}>✕</button>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:12 }}>
                      {[
                        { label:"Costo",   value:`€${b.costPrice}`,             color:"#dc2626" },
                        { label:"Vendita", value:`€${b.sellPrice}`,             color:"#2563eb" },
                        { label:"Margine", value:`€${b.sellPrice-b.costPrice}`, color:"#16a34a" },
                      ].map(x => (
                        <div key={x.label} style={{ textAlign:"center", background:"#f8fafc", borderRadius:6, padding:"6px 4px" }}>
                          <div style={{ fontSize:10, color:"#94a3b8" }}>{x.label}</div>
                          <div style={{ fontSize:14, fontWeight:700, color:x.color }}>{x.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, fontSize:12, color:"#64748b" }}>
                      <span>Stock: <b>{b.stock}</b></span>
                      <span>Usate: <b style={{ color:used>0?"#d97706":"#94a3b8" }}>{used}</b></span>
                      <span>Rimaste: <b style={{ color:(b.stock-used)<3?"#dc2626":"#16a34a" }}>{b.stock-used}</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PR ── */}
        {tab === "prs" && (
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:20 }}>👤 Gestione PR</h2>
            <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:20, marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#64748b", letterSpacing:"0.12em", marginBottom:14 }}>AGGIUNGI PR</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
                <div style={{ flex:2, minWidth:160 }}>
                  <div style={{ fontSize:10, color:"#94a3b8", marginBottom:4 }}>Nome</div>
                  <input placeholder="Es. Alessandro" value={prForm.name} onChange={e=>setPrForm(p=>({...p,name:e.target.value}))}
                    style={{ width:"100%", padding:"8px 12px", borderRadius:7, border:"1px solid #e2e8f0", fontSize:13, outline:"none", boxSizing:"border-box" }} />
                </div>
                <div style={{ flex:1, minWidth:120 }}>
                  <div style={{ fontSize:10, color:"#94a3b8", marginBottom:4 }}>Provvigione %</div>
                  <input type="number" placeholder="Es. 10" value={prForm.commissionPct} onChange={e=>setPrForm(p=>({...p,commissionPct:e.target.value}))}
                    style={{ width:"100%", padding:"8px 12px", borderRadius:7, border:"1px solid #e2e8f0", fontSize:13, outline:"none", boxSizing:"border-box" }} />
                </div>
                <button onClick={() => {
                  if (!prForm.name.trim()) { showToast("Inserisci il nome","err"); return; }
                  updatePrs([...prs, { id:`pr${Date.now()}`, name:prForm.name, commissionPct:Number(prForm.commissionPct) }]);
                  setPrForm({ name:"", commissionPct:"" });
                  showToast("PR aggiunto ✓");
                }} style={{ padding:"9px 24px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                  + Aggiungi
                </button>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
              {prs.map(pr => {
                const rep = prReport.find(r=>r.id===pr.id)||{};
                return (
                  <div key={pr.id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:18 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:16 }}>{pr.name}</div>
                        <div style={{ fontSize:12, color:"#9333ea", fontWeight:600 }}>{pr.commissionPct}% provvigione</div>
                      </div>
                      <button onClick={() => { updatePrs(prs.filter(x=>x.id!==pr.id)); showToast("PR rimosso","err"); }}
                        style={{ background:"none", border:"none", color:"#fca5a5", cursor:"pointer", fontSize:16 }}>✕</button>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                      {[
                        { label:"Tavoli",   value:rep.tables||0,         color:"#d97706" },
                        { label:"Incasso",  value:`€${rep.total||0}`,    color:"#2563eb" },
                        { label:"Guadagno", value:`€${rep.commission||0}`,color:"#16a34a" },
                      ].map(x => (
                        <div key={x.label} style={{ textAlign:"center", background:"#f8fafc", borderRadius:6, padding:"8px 4px" }}>
                          <div style={{ fontSize:10, color:"#94a3b8" }}>{x.label}</div>
                          <div style={{ fontSize:15, fontWeight:700, color:x.color }}>{x.value}</div>
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
        {tab === "report" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
              <h2 style={{ fontSize:18, fontWeight:700, margin:0 }}>📊 Report Fine Serata</h2>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={resetSerata} style={{ padding:"8px 16px", background:"#fee2e2", color:"#dc2626", border:"1px solid #fca5a5", borderRadius:7, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                  🔄 Nuova Serata
                </button>
                <button onClick={() => window.print()} style={{ padding:"8px 20px", background:"#1a1a2e", color:"#fff", border:"none", borderRadius:7, cursor:"pointer", fontSize:13 }}>
                  🖨 Stampa
                </button>
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
              {[
                { label:"Incasso Totale",   value:`€${stats.incasso.toLocaleString("it-IT")}`, color:"#2563eb", bg:"#dbeafe" },
                { label:"Tavoli Serviti",   value:stats.booked,                                  color:"#d97706", bg:"#fef3c7" },
                { label:"Costo Bottiglie",  value:`€${bottleUsage.reduce((s,b)=>s+b.cost,0)}`,  color:"#dc2626", bg:"#fee2e2" },
              ].map(x => (
                <div key={x.label} style={{ background:x.bg, borderRadius:12, padding:18, textAlign:"center" }}>
                  <div style={{ fontSize:11, color:x.color, letterSpacing:"0.1em", marginBottom:6 }}>{x.label.toUpperCase()}</div>
                  <div style={{ fontSize:28, fontWeight:700, color:x.color }}>{x.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:20, marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:14, borderBottom:"1px solid #f1f5f9", paddingBottom:10 }}>🍾 SCARICO BOTTIGLIE</div>
              {bottleUsage.length === 0 ? (
                <div style={{ color:"#94a3b8", textAlign:"center", padding:20 }}>Nessuna bottiglia consumata stasera</div>
              ) : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr style={{ borderBottom:"2px solid #f1f5f9" }}>
                        {["Bottiglia","Categoria","Qt.","Rimanenti","Costo Tot.","Ricavo","Margine"].map(h => (
                          <th key={h} style={{ padding:"8px 10px", textAlign:"left", fontSize:11, color:"#94a3b8", letterSpacing:"0.08em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bottleUsage.map(b => (
                        <tr key={b.id} style={{ borderBottom:"1px solid #f8fafc" }}>
                          <td style={{ padding:"10px", fontWeight:600 }}>{b.name}</td>
                          <td style={{ padding:"10px", color:"#64748b" }}>{b.category}</td>
                          <td style={{ padding:"10px", fontWeight:700, color:"#d97706" }}>{b.used}</td>
                          <td style={{ padding:"10px", fontWeight:700, color:(b.stock-b.used)<3?"#dc2626":"#16a34a" }}>{b.stock-b.used}</td>
                          <td style={{ padding:"10px", color:"#dc2626" }}>€{b.cost}</td>
                          <td style={{ padding:"10px", color:"#2563eb", fontWeight:600 }}>€{b.revenue}</td>
                          <td style={{ padding:"10px", color:"#16a34a", fontWeight:700 }}>€{b.revenue-b.cost}</td>
                        </tr>
                      ))}
                      <tr style={{ background:"#f8fafc", fontWeight:700 }}>
                        <td colSpan={4} style={{ padding:"10px", color:"#64748b", fontSize:12 }}>TOTALE</td>
                        <td style={{ padding:"10px", color:"#dc2626" }}>€{bottleUsage.reduce((s,b)=>s+b.cost,0)}</td>
                        <td style={{ padding:"10px", color:"#2563eb" }}>€{bottleUsage.reduce((s,b)=>s+b.revenue,0)}</td>
                        <td style={{ padding:"10px", color:"#16a34a" }}>€{bottleUsage.reduce((s,b)=>s+b.revenue-b.cost,0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:20 }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:14, borderBottom:"1px solid #f1f5f9", paddingBottom:10 }}>👤 PROVVIGIONI PR</div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:"2px solid #f1f5f9" }}>
                      {["PR","Tavoli","Incasso","%","Provvigione"].map(h => (
                        <th key={h} style={{ padding:"8px 10px", textAlign:"left", fontSize:11, color:"#94a3b8" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prReport.map(pr => (
                      <tr key={pr.id} style={{ borderBottom:"1px solid #f8fafc" }}>
                        <td style={{ padding:"10px", fontWeight:600 }}>{pr.name}</td>
                        <td style={{ padding:"10px", color:"#d97706", fontWeight:700 }}>{pr.tables}</td>
                        <td style={{ padding:"10px", color:"#2563eb" }}>€{pr.total}</td>
                        <td style={{ padding:"10px", color:"#9333ea" }}>{pr.commissionPct}%</td>
                        <td style={{ padding:"10px", fontWeight:700, fontSize:15, color:"#16a34a" }}>€{pr.commission}</td>
                      </tr>
                    ))}
                    <tr style={{ background:"#f8fafc", fontWeight:700 }}>
                      <td colSpan={4} style={{ padding:"10px", color:"#64748b", fontSize:12 }}>TOTALE PROVVIGIONI</td>
                      <td style={{ padding:"10px", color:"#16a34a", fontSize:16 }}>€{prReport.reduce((s,p)=>s+p.commission,0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL PRENOTAZIONE ── */}
      {formOpen && selectedTable && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000,
          display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={e => { if (e.target===e.currentTarget) closeForm(); }}>
          <div style={{ background:"#fff", borderRadius:16, padding:28, width:"100%", maxWidth:560,
            maxHeight:"92vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <div style={{ fontSize:11, color:ZONE_META[selectedTable.zone].color, fontWeight:700, letterSpacing:"0.12em", marginBottom:4 }}>
                  {selectedTable.zone.toUpperCase()} · MAX {selectedTable.capacity} POSTI
                </div>
                <h2 style={{ margin:0, fontSize:20 }}>
                  {editingId ? `Modifica – ${selectedTable.name}` : `Prenota – ${selectedTable.name}`}
                </h2>
              </div>
              <button onClick={closeForm} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#94a3b8" }}>✕</button>
            </div>

            <SL>Info Cliente</SL>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:4 }}>
              <F label="Nome Cliente *" value={form.clientName} onChange={v=>setForm(f=>({...f,clientName:v}))} placeholder="Es. Marco Rossi" />
              <F label="Telefono" value={form.phone} onChange={v=>setForm(f=>({...f,phone:v}))} placeholder="333-1234567" type="tel" />
            </div>

            <SL>Tavolo</SL>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:4 }}>
              <F label="Nome Tavolo" value={form.tableName} onChange={v=>setForm(f=>({...f,tableName:v}))} placeholder={selectedTable.name} />
              <F label="N° Ospiti *" value={form.guests} onChange={v=>setForm(f=>({...f,guests:v}))} placeholder="Es. 4" type="number" />
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:5 }}>PR DI RIFERIMENTO</div>
              <select value={form.prId} onChange={e=>setForm(f=>({...f,prId:e.target.value}))}
                style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1px solid #e2e8f0", fontSize:13, outline:"none" }}>
                <option value="">— Nessun PR —</option>
                {prs.map(pr => <option key={pr.id} value={pr.id}>{pr.name} ({pr.commissionPct}%)</option>)}
              </select>
            </div>

            <SL>Bottiglie Ordinate</SL>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8, marginBottom:12 }}>
              {bottles.map(b => {
                const inOrder = form.bottles.find(x=>x.bottleId===b.id);
                return (
                  <div key={b.id} style={{ border:`2px solid ${inOrder?"#fcd34d":"#e2e8f0"}`, background:inOrder?"#fef3c7":"#f8fafc", borderRadius:8, padding:"8px 10px" }}>
                    <div style={{ fontSize:12, fontWeight:700 }}>{b.name}</div>
                    <div style={{ fontSize:10, color:"#94a3b8" }}>{b.category} · €{b.sellPrice}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6 }}>
                      <button onClick={()=>removeBottleFromForm(b.id)} style={{ width:24, height:24, borderRadius:5, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                      <span style={{ fontSize:15, fontWeight:700, color:"#d97706", minWidth:18, textAlign:"center" }}>{inOrder?.qty||0}</span>
                      <button onClick={()=>addBottleToForm(b.id)} style={{ width:24, height:24, borderRadius:5, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {form.bottles.length > 0 && (
              <div style={{ background:"#dbeafe", borderRadius:8, padding:"10px 14px", marginBottom:14, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:13, color:"#1d4ed8" }}>Totale bottiglie</span>
                <span style={{ fontSize:16, fontWeight:700, color:"#1d4ed8" }}>
                  €{form.bottles.reduce((s,b)=>{const bt=bottles.find(x=>x.id===b.bottleId);return s+(bt?bt.sellPrice*b.qty:0);},0)}
                </span>
              </div>
            )}

            <SL>Caparra</SL>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12, marginBottom:14, alignItems:"end" }}>
              <F label="Importo (€)" value={form.caparra} onChange={v=>setForm(f=>({...f,caparra:v}))} placeholder="Es. 100" type="number" />
              <div>
                <div style={{ fontSize:11, color:"#94a3b8", letterSpacing:"0.08em", marginBottom:8 }}>RICEVUTA</div>
                <div onClick={()=>setForm(f=>({...f,caparraPaid:!f.caparraPaid}))}
                  style={{ width:48, height:26, borderRadius:13, background:form.caparraPaid?"#16a34a":"#e2e8f0", position:"relative", cursor:"pointer", transition:"background 0.2s" }}>
                  <div style={{ position:"absolute", top:3, left:form.caparraPaid?25:3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            </div>

            <F label="Note" value={form.note} onChange={v=>setForm(f=>({...f,note:v}))} placeholder="Es. Compleanno, allergie..." />

            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button onClick={saveReservation} style={{ flex:1, padding:"12px", borderRadius:8, background:"#1a1a2e", color:"#fff", border:"none", fontSize:14, cursor:"pointer", fontWeight:700 }}>
                ✓ Salva
              </button>
              {editingId && (
                <button onClick={()=>deleteReservation(editingId)} style={{ padding:"12px 18px", borderRadius:8, background:"#fee2e2", border:"1px solid #fca5a5", color:"#dc2626", fontSize:13, cursor:"pointer", fontWeight:600 }}>
                  🗑 Elimina
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        input:focus,select:focus{border-color:#f59e0b!important;outline:none;box-shadow:0 0 0 3px rgba(245,158,11,0.15)}
        @media print{button{display:none!important}}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:#f1f5f9}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
      `}</style>
    </div>
  );
}

function SL({ children }) {
  return <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:"0.15em", textTransform:"uppercase", margin:"14px 0 10px", borderBottom:"1px solid #f1f5f9", paddingBottom:6 }}>{children}</div>;
}
function F({ label, value, onChange, placeholder, type="text" }) {
  return (
    <div style={{ marginBottom:4 }}>
      <div style={{ fontSize:11, color:"#94a3b8", letterSpacing:"0.1em", marginBottom:5 }}>{label}</div>
      <input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}
        style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1px solid #e2e8f0", fontSize:13, color:"#1a1a2e", boxSizing:"border-box" }} />
    </div>
  );
}
