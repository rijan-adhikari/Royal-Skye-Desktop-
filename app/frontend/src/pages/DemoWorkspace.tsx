import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

type Tab = "home" | "tables" | "pos" | "inventory" | "more";
type MenuItem = { id: number; name: string; category: string; price: number; emoji: string };
const menu: MenuItem[] = [
  { id: 1, name: "Chicken Momo", category: "Starters", price: 280, emoji: "🥟" },
  { id: 2, name: "Veg Momo", category: "Starters", price: 220, emoji: "🥟" },
  { id: 3, name: "Chicken Sekuwa", category: "Mains", price: 420, emoji: "🍢" },
  { id: 4, name: "Paneer Tikka", category: "Mains", price: 380, emoji: "🍛" },
  { id: 5, name: "Club Sandwich", category: "Snacks", price: 350, emoji: "🥪" },
  { id: 6, name: "French Fries", category: "Snacks", price: 180, emoji: "🍟" },
  { id: 7, name: "Coke", category: "Drinks", price: 100, emoji: "🥤" },
  { id: 8, name: "Fresh Lemon Soda", category: "Drinks", price: 160, emoji: "🍋" },
];
const initialTables = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `T-${String(i + 1).padStart(2, "0")}`, status: i < 5 ? "Occupied" : i === 5 ? "Billing" : "Available", seats: i % 3 === 0 ? 4 : 2 }));
const initialOrders = [
  { id: "RS-1048", table: "T-02", items: 3, total: 860, status: "Preparing" },
  { id: "RS-1047", table: "T-04", items: 2, total: 640, status: "Ready" },
  { id: "RS-1046", table: "Takeaway", items: 4, total: 1240, status: "Preparing" },
];
const money = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

export default function DemoWorkspace() {
  const { logout, fullName } = useAuth();
  const [tab, setTab] = useState<Tab>("home");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState(initialOrders);
  const [tables, setTables] = useState(initialTables);
  const [notice, setNotice] = useState("");
  const [inventory, setInventory] = useState([
    { name: "Chicken", unit: "kg", stock: 8.5, level: "Good" },
    { name: "Onion", unit: "kg", stock: 3.2, level: "Low" },
    { name: "Tomato", unit: "kg", stock: 6, level: "Good" },
    { name: "Cooking oil", unit: "L", stock: 4, level: "Good" },
    { name: "Momo wrappers", unit: "pcs", stock: 42, level: "Low" },
  ]);
  const categories = ["All", ...Array.from(new Set(menu.map(item => item.category)))];
  const visibleMenu = useMemo(() => menu.filter(item => category === "All" || item.category === category), [category]);
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const addToCart = (item: MenuItem) => { setCart(current => [...current, item]); setNotice(`${item.name} added to demo cart.`); };
  const placeOrder = () => {
    if (!cart.length) { setNotice("Add at least one menu item first."); return; }
    const id = `RS-${1050 + orders.length}`;
    setOrders(current => [{ id, table: "Takeaway", items: cart.length, total, status: "New demo order" }, ...current]);
    setCart([]);
    setNotice(`${id} created locally. This is a demo order only.`);
    setTab("tables");
  };
  const nav: { id: Tab; label: string; icon: string }[] = [
    { id: "home", label: "Home", icon: "⌂" },
    { id: "tables", label: "Tables", icon: "▦" },
    { id: "pos", label: "POS", icon: "+" },
    { id: "inventory", label: "Stock", icon: "▤" },
    { id: "more", label: "More", icon: "•••" },
  ];
  const heading: Record<Tab, string> = { home: "Overview", tables: "Tables & Orders", pos: "Point of Sale", inventory: "Inventory", more: "More tools" };

  return <div className="rs-demo min-h-screen bg-[#f6f3ef] text-[#302722]">
    <header className="sticky top-0 z-30 border-b border-[#e8dfd5] bg-[#17120f] px-4 pb-4 pt-3 text-white shadow-lg">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white"><img src="/images/logo.jpg" alt="Royal Skye" className="h-full w-full object-contain"/></div>
          <div className="min-w-0"><p className="truncate text-xs font-black tracking-[.18em]">ROYAL SKYE</p><p className="mt-1 text-[9px] font-semibold tracking-[.16em] text-[#d5b78f]">MOBILE DEMO WORKSPACE</p></div>
        </div>
        <span className="rounded-full border border-[#d9b98f]/30 bg-[#d9b98f]/10 px-3 py-1.5 text-[9px] font-bold tracking-wider text-[#e8c99f]">OFFLINE DEMO</span>
      </div>
    </header>
    <main className="mx-auto max-w-5xl space-y-5 px-4 pb-28 pt-5 sm:px-6">
      <div className="rounded-2xl border border-[#e8d7be] bg-[#fffaf2] p-3 text-xs leading-5 text-[#765b3e]"><strong>Demo environment:</strong> Sample records are stored only in this temporary session. No restaurant server, database, staff account or real transaction is connected.</div>
      <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#967a5d]">Royal Skye / {heading[tab]}</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#302722]">{heading[tab]}</h1></div><span className="text-right text-[10px] font-semibold text-[#8b7b6e]">{fullName || "Demo Manager"}<br/>Administrator</span></div>
      {notice && <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-[#b9d6c4] bg-[#eef8f0] px-3 py-2.5 text-xs text-[#38634a]"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss" className="font-bold">✕</button></div>}

      {tab === "home" && <>
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Today's sales", money(24850)], ["Orders", String(orders.length + 29)], ["Occupied tables", `${tables.filter(t => t.status === "Occupied").length}/12`], ["Low stock", String(inventory.filter(i => i.level === "Low").length)]].map(([label,value]) => <article key={label} className="rounded-2xl border border-[#e9e1d9] bg-white p-4 shadow-sm"><p className="text-[10px] font-semibold text-[#89796c]">{label}</p><p className="mt-2 text-xl font-extrabold tabular-nums text-[#382d26]">{value}</p></article>)}
        </section>
        <section className="rounded-2xl bg-[#29211d] p-5 text-white"><p className="text-[10px] font-bold tracking-[.18em] text-[#d7b17b]">QUICK ACTIONS</p><div className="mt-4 grid grid-cols-2 gap-3"><button onClick={() => setTab("pos")} className="rounded-xl bg-[#8b1a1a] p-4 text-left text-sm font-bold">＋ New order<span className="mt-1 block text-[10px] font-normal text-white/70">Build a sample cart</span></button><button onClick={() => setTab("tables")} className="rounded-xl border border-white/15 bg-white/5 p-4 text-left text-sm font-bold">▦ View tables<span className="mt-1 block text-[10px] font-normal text-white/70">Check table status</span></button></div></section>
        <section className="rounded-2xl border border-[#e9e1d9] bg-white p-4"><div className="mb-3 flex items-center justify-between"><h2 className="font-extrabold">Recent orders</h2><button onClick={() => setTab("tables")} className="text-xs font-bold text-[#8b1a1a]">View all →</button></div>{orders.slice(0,3).map(order => <div key={order.id} className="flex items-center justify-between gap-3 border-t border-[#f0ebe5] py-3 text-xs"><div><strong>{order.id}</strong><p className="mt-1 text-[#8c7e72]">{order.table} · {order.items} items</p></div><div className="text-right"><strong>{money(order.total)}</strong><p className="mt-1 text-[#8c7e72]">{order.status}</p></div></div>)}</section>
      </>}

      {tab === "tables" && <>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold"><div className="rounded-xl bg-white p-3 text-[#467b58]">{tables.filter(t=>t.status==="Available").length}<br/>Available</div><div className="rounded-xl bg-white p-3 text-[#9a4944]">{tables.filter(t=>t.status==="Occupied").length}<br/>Occupied</div><div className="rounded-xl bg-white p-3 text-[#9a763f]">{tables.filter(t=>t.status==="Billing").length}<br/>Billing</div></div>
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">{tables.map(table => <button key={table.id} onClick={() => { setTables(current => current.map(t => t.id === table.id ? {...t,status:t.status==="Available"?"Occupied":t.status==="Occupied"?"Billing":"Available"} : t)); setNotice(`${table.name} status changed in demo data.`); }} className={`rounded-2xl border p-4 text-left shadow-sm ${table.status==="Available"?"border-[#d6e6d8] bg-[#f4faf4]":table.status==="Occupied"?"border-[#ead1cf] bg-[#fff5f3]":"border-[#eadfc9] bg-[#fffaf0]"}`}><div className="flex items-center justify-between"><strong className="text-lg">{table.name}</strong><span className="text-[9px] font-bold">{table.seats} seats</span></div><p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-[#796c61]">{table.status}</p></button>)}</section>
        <section className="rounded-2xl border border-[#e9e1d9] bg-white p-4"><h2 className="mb-3 font-extrabold">Open orders</h2>{orders.map(order => <div key={order.id} className="flex justify-between gap-3 border-t border-[#f0ebe5] py-3 text-xs"><span><strong>{order.id}</strong><span className="block mt-1 text-[#8c7e72]">{order.table} · {order.status}</span></span><strong>{money(order.total)}</strong></div>)}</section>
      </>}

      {tab === "pos" && <>
        <div className="flex gap-2 overflow-x-auto pb-1">{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${category===c?"bg-[#8b1a1a] text-white":"border border-[#e7ddd3] bg-white text-[#6e5d50]"}`}>{c}</button>)}</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{visibleMenu.map(item => <button key={item.id} onClick={() => addToCart(item)} className="rounded-2xl border border-[#e9e1d9] bg-white p-4 text-left shadow-sm active:scale-[.98]"><span className="text-3xl">{item.emoji}</span><strong className="mt-3 block text-sm">{item.name}</strong><span className="mt-1 block text-xs text-[#8c7e72]">{item.category}</span><span className="mt-3 block font-extrabold text-[#8b1a1a]">{money(item.price)}</span><span className="mt-2 block text-[10px] font-bold text-[#8b1a1a]">＋ Add item</span></button>)}</div>
        <section className="rounded-2xl border border-[#e9e1d9] bg-white p-4"><div className="flex items-center justify-between"><h2 className="font-extrabold">Demo cart ({cart.length})</h2><strong>{money(total)}</strong></div>{cart.length===0?<p className="py-5 text-center text-xs text-[#8c7e72]">Tap a menu item to add it to your cart.</p>:<div className="mt-3 space-y-2">{cart.map((item,index)=><div key={`${item.id}-${index}`} className="flex items-center justify-between border-t border-[#f0ebe5] py-2 text-xs"><span>{item.name}</span><span className="font-bold">{money(item.price)} <button onClick={()=>setCart(current=>current.filter((_,i)=>i!==index))} className="ml-2 text-[#9a4944]">✕</button></span></div>)}</div>}<button onClick={placeOrder} disabled={!cart.length} className="mt-4 w-full rounded-xl bg-[#8b1a1a] px-4 py-3 text-xs font-extrabold tracking-wider text-white disabled:opacity-40">CREATE DEMO ORDER · {money(total)}</button></section>
      </>}

      {tab === "inventory" && <section className="overflow-hidden rounded-2xl border border-[#e9e1d9] bg-white"><div className="border-b border-[#f0ebe5] p-4"><h2 className="font-extrabold">Stock overview</h2><p className="mt-1 text-xs text-[#8c7e72]">Illustrative quantities — not live stock.</p></div>{inventory.map(item=><div key={item.name} className="flex items-center justify-between gap-3 border-b border-[#f0ebe5] px-4 py-3 text-xs"><div><strong>{item.name}</strong><p className="mt-1 text-[#8c7e72]">{item.unit}</p></div><div className="text-right"><strong>{item.stock} {item.unit}</strong><p className={`mt-1 text-[10px] font-bold ${item.level==="Low"?"text-[#a14a43]":"text-[#477c59]"}`}>{item.level} stock</p></div></div>)}</section>}

      {tab === "more" && <div className="space-y-3"><button onClick={() => setTab("inventory")} className="w-full rounded-2xl border border-[#e9e1d9] bg-white p-4 text-left text-sm font-bold">▤ Inventory & stock <span className="float-right">→</span></button><div className="rounded-2xl border border-[#e9e1d9] bg-white p-4"><h2 className="font-extrabold">Testing information</h2><p className="mt-2 text-xs leading-5 text-[#7d6e62]">You are using a local demo session. Menu additions, table status changes and sample orders are held in this screen's memory only. Closing or restarting the app resets the sample workspace. Live staff login and shared restaurant records become available after the Windows host is installed and running on the same network.</p></div><button onClick={logout} className="w-full rounded-xl border border-[#e4d4d0] bg-white px-4 py-3 text-xs font-extrabold text-[#8b1a1a]">EXIT DEMO</button></div>}
    </main>
    <nav aria-label="Demo navigation" className="rs-demo-nav fixed inset-x-0 bottom-0 z-40 border-t border-[#e8dfd5] bg-white/95 px-2 pt-2 shadow-[0_-8px_28px_rgba(40,30,20,.09)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">{nav.map(item=><button key={item.id} onClick={()=>{setTab(item.id);setNotice("");}} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[9px] font-bold ${tab===item.id?"bg-[#f7efea] text-[#8b1a1a]":"text-[#8b7b6e]"}`}><span className="text-lg leading-5">{item.icon}</span>{item.label}</button>)}</div>
    </nav>
  </div>;
}
