"use client";

import { useCallback, useEffect, useState } from "react";

interface Worker {
  id: number;
  name: string;
  contact: string;
  department: string;
  created_at: string;
}
interface SalaryRecord {
  id: number;
  worker_id: number;
  worker_name?: string;
  worker_contact?: string;
  week_start: string;
  amount: number;
  status: string;
}
interface ProjectSettings {
  id: number;
  project_name: string;
  pm_name: string;
  pm_contact: string;
  foreman_name: string;
  foreman_contact: string;
}
interface Material {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  date: string;
  notes: string;
}
interface Summary {
  salaryTotal: number;
  paidTotal: number;
  unpaidTotal: number;
  materialTotal: number;
  grandTotal: number;
}

function HouseHero() {
  return (
    <div
      className="relative w-full h-48 md:h-72 overflow-hidden shadow-2xl"
      style={{
        borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
        boxShadow: "0 8px 32px rgba(212, 175, 55, 0.15)",
      }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80')",
          willChange: "transform",
        }}
      />
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}

function ParallaxSection({ image, label }: { image: string; label: string }) {
  return (
    <div className="parallax-section relative w-full h-64 md:h-80 overflow-hidden rounded-xl shadow-2xl">
      <div
        className="parallax-bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${image}')` }}
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <span className="text-[#d4af37] text-sm md:text-base tracking-[0.3em] uppercase font-light">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [tab, setTab] = useState<"employee" | "salaries" | "materials">("employee");

  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [editSettings, setEditSettings] = useState<Partial<ProjectSettings>>({});

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerContact, setNewWorkerContact] = useState("");
  const [newWorkerDepartment, setNewWorkerDepartment] = useState("");
  const [editingWorker, setEditingWorker] = useState<{ id: number; name: string; contact: string; department: string } | null>(null);
  const [deptTab, setDeptTab] = useState("All");
  const [expandedWorkers, setExpandedWorkers] = useState<Set<number>>(new Set());

  const [allRecords, setAllRecords] = useState<SalaryRecord[]>([]);
  const [salaryWorkerId, setSalaryWorkerId] = useState("");
  const [salaryWeekStart, setSalaryWeekStart] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryUnpaidOnly, setSalaryUnpaidOnly] = useState(false);
  const [editingSalary, setEditingSalary] = useState<Record<number, { week_start: string; amount: string; status: string }>>({});

  const [materials, setMaterials] = useState<Material[]>([]);
  const [newMaterial, setNewMaterial] = useState({ name: "", quantity: "1", unit: "pcs", cost: "", date: "", notes: "" });
  const [editingMaterial, setEditingMaterial] = useState<Record<number, Partial<Material>>>({});

  const [summary, setSummary] = useState<Summary>({ salaryTotal: 0, paidTotal: 0, unpaidTotal: 0, materialTotal: 0, grandTotal: 0 });
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const notify = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const apiFetch = useCallback(async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed (${res.status})`);
    }
    return res.json();
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await apiFetch("/api/project-settings");
      setSettings(data);
      setEditSettings(data);
    } catch {
      notify("error", "Failed to load settings");
    }
  }, [apiFetch, notify]);

  const fetchWorkers = useCallback(async () => {
    try {
      const data = await apiFetch("/api/workers");
      setWorkers(data);
    } catch { notify("error", "Failed to load workers"); }
  }, [apiFetch, notify]);

  const fetchAllRecords = useCallback(async () => {
    try {
      const url = salaryUnpaidOnly ? "/api/records?status=unpaid" : "/api/records";
      const data = await apiFetch(url);
      setAllRecords(data);
    } catch { notify("error", "Failed to load records"); }
  }, [apiFetch, notify, salaryUnpaidOnly]);

  const fetchMaterials = useCallback(async () => {
    try {
      const data = await apiFetch("/api/materials");
      setMaterials(data);
    } catch { notify("error", "Failed to load materials"); }
  }, [apiFetch, notify]);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await apiFetch("/api/summary");
      setSummary(data);
    } catch { notify("error", "Failed to load summary"); }
  }, [apiFetch, notify]);

  useEffect(() => {
    fetchSettings();
    fetchWorkers();
    fetchMaterials();
    fetchSummary();
  }, [fetchSettings, fetchWorkers, fetchMaterials, fetchSummary]);

  useEffect(() => {
    fetchAllRecords();
  }, [fetchAllRecords]);

  const saveSettings = async () => {
    try {
      await apiFetch("/api/project-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editSettings),
      });
      notify("success", "Settings saved");
      fetchSettings();
    } catch (e: unknown) {
      notify("error", e instanceof Error ? e.message : "Failed to save settings");
    }
  };

  const addWorker = async () => {
    if (!newWorkerName.trim()) { notify("error", "Worker name is required"); return; }
    try {
      await apiFetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWorkerName, contact: newWorkerContact, department: newWorkerDepartment }),
      });
      notify("success", "Worker registered");
      setNewWorkerName("");
      setNewWorkerContact("");
      setNewWorkerDepartment("");
      fetchWorkers();
    } catch (e: unknown) {
      notify("error", e instanceof Error ? e.message : "Failed to register worker");
    }
  };

  const updateWorker = async (id: number) => {
    if (!editingWorker || !editingWorker.name.trim()) { notify("error", "Name is required"); return; }
    try {
      await apiFetch(`/api/workers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingWorker.name, contact: editingWorker.contact, department: editingWorker.department }),
      });
      notify("success", "Worker updated");
      setEditingWorker(null);
      fetchWorkers();
    } catch (e: unknown) {
      notify("error", e instanceof Error ? e.message : "Failed to update worker");
    }
  };

  const deleteWorker = async (id: number) => {
    try {
      await apiFetch(`/api/workers/${id}`, { method: "DELETE" });
      notify("success", "Worker removed");
      fetchWorkers();
      fetchAllRecords();
      fetchSummary();
    } catch (e: unknown) {
      notify("error", e instanceof Error ? e.message : "Failed to delete worker");
    }
  };

  const markPaid = async (id: number) => {
    try {
      await apiFetch(`/api/records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      notify("success", "Marked as paid");
      fetchAllRecords();
      fetchSummary();
    } catch (e: unknown) {
      notify("error", e instanceof Error ? e.message : "Failed to update record");
    }
  };

  const markUnpaid = async (id: number) => {
    try {
      await apiFetch(`/api/records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "unpaid" }),
      });
      notify("success", "Marked as unpaid");
      fetchAllRecords();
      fetchSummary();
    } catch (e: unknown) {
      notify("error", e instanceof Error ? e.message : "Failed to update record");
    }
  };

  const addSalaryRecord = async () => {
    if (!salaryWorkerId || !salaryWeekStart || !salaryAmount) { notify("error", "Fill all salary fields"); return; }
    try {
      await apiFetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worker_id: parseInt(salaryWorkerId),
          week_start: salaryWeekStart,
          amount: parseFloat(salaryAmount),
          status: "unpaid",
        }),
      });
      notify("success", "Wage recorded");
      setSalaryWeekStart("");
      setSalaryAmount("");
      fetchAllRecords();
      fetchSummary();
    } catch (e: unknown) {
      notify("error", e instanceof Error ? e.message : "Failed to record wage");
    }
  };

  const updateSalaryRecord = async (id: number) => {
    const r = editingSalary[id];
    if (!r?.week_start || !r?.amount) { notify("error", "Fill all fields"); return; }
    try {
      await apiFetch(`/api/records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week_start: r.week_start, amount: parseFloat(r.amount), status: r.status }),
      });
      notify("success", "Record updated");
      setEditingSalary((prev) => { const n = { ...prev }; delete n[id]; return n; });
      fetchAllRecords();
      fetchSummary();
    } catch (e: unknown) {
      notify("error", e instanceof Error ? e.message : "Failed to update record");
    }
  };

  const deleteSalaryRecord = async (id: number) => {
    try {
      await apiFetch(`/api/records/${id}`, { method: "DELETE" });
      notify("success", "Record deleted");
      fetchAllRecords();
      fetchSummary();
    } catch (e: unknown) {
      notify("error", e instanceof Error ? e.message : "Failed to delete record");
    }
  };

  const addMaterial = async () => {
    if (!newMaterial.name.trim()) { notify("error", "Material name is required"); return; }
    try {
      await apiFetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newMaterial.name,
          quantity: parseFloat(newMaterial.quantity) || 1,
          unit: newMaterial.unit || "pcs",
          cost: parseFloat(newMaterial.cost) || 0,
          date: newMaterial.date || new Date().toISOString().split("T")[0],
          notes: newMaterial.notes,
        }),
      });
      notify("success", "Material added");
      setNewMaterial({ name: "", quantity: "1", unit: "pcs", cost: "", date: "", notes: "" });
      fetchMaterials();
      fetchSummary();
    } catch (e: unknown) {
      notify("error", e instanceof Error ? e.message : "Failed to add material");
    }
  };

  const updateMaterial = async (id: number) => {
    const m = editingMaterial[id];
    if (!m) { notify("error", "No data to update"); return; }
    try {
      await apiFetch(`/api/materials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(m),
      });
      notify("success", "Material updated");
      setEditingMaterial((prev) => { const n = { ...prev }; delete n[id]; return n; });
      fetchMaterials();
      fetchSummary();
    } catch (e: unknown) {
      notify("error", e instanceof Error ? e.message : "Failed to update material");
    }
  };

  const deleteMaterial = async (id: number) => {
    try {
      await apiFetch(`/api/materials/${id}`, { method: "DELETE" });
      notify("success", "Material deleted");
      fetchMaterials();
      fetchSummary();
    } catch (e: unknown) {
      notify("error", e instanceof Error ? e.message : "Failed to delete material");
    }
  };

  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split("T")[0];
  };

  const todayMonday = getMonday(new Date());

  const tabs = [
    { key: "employee" as const, label: "Employee" },
    { key: "salaries" as const, label: "Salaries" },
    { key: "materials" as const, label: "Materials & Cost" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-5">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-xl text-sm font-semibold transition-all duration-300 ${
          notification.type === "success" ? "bg-green-700 text-white" : "bg-red-700 text-white"
        }`}>
          {notification.message}
        </div>
      )}
      <HouseHero />

      <h1 className="text-3xl md:text-4xl font-bold text-center text-[#d4af37] tracking-wide">
        {settings?.project_name || "House Project Manager"}
      </h1>

      <div className="flex border-b border-[#d4af37]/30">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`px-4 md:px-6 py-3 -mb-px text-sm md:text-base font-medium cursor-pointer transition-colors ${
              tab === t.key
                ? "border-b-2 border-[#d4af37] text-[#d4af37]"
                : "text-[#f0e6d3]/60 hover:text-[#f0e6d3]"
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Employee ──────────────────────────── */}
      {tab === "employee" && (
        <div className="flex flex-col gap-3">
          <div className="parchment-card p-4">
            <h3 className="font-bold mb-3 text-[#d4af37] tracking-wide text-sm uppercase">Register Employee</h3>
            <div className="flex flex-col md:flex-row gap-2">
              <input
                className="parchment-input rounded px-3 py-2 flex-1 text-base"
                placeholder="Full name"
                value={newWorkerName}
                onChange={(e) => setNewWorkerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWorker()}
              />
              <input
                className="parchment-input rounded px-3 py-2 flex-1 text-base"
                placeholder="Phone number"
                value={newWorkerContact}
                onChange={(e) => setNewWorkerContact(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWorker()}
              />
              <input
                className="parchment-input rounded px-3 py-2 flex-1 text-base"
                placeholder="Department (e.g. Masonry, Plumbing)"
                value={newWorkerDepartment}
                onChange={(e) => setNewWorkerDepartment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWorker()}
              />
              <button className="gold-bg px-4 py-2 rounded font-semibold cursor-pointer tracking-wide whitespace-nowrap" onClick={addWorker}>
                Register
              </button>
            </div>
          </div>

          {workers.length > 0 && (() => {
            const departments = [...new Set(workers.map((w) => w.department).filter(Boolean))];
            const filteredWorkers = deptTab === "All" ? workers : workers.filter((w) => w.department === deptTab);
            return (
              <>
                <div className="flex flex-wrap border-b border-[#d4af37]/20 gap-0">
                  <button
                    className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                      deptTab === "All"
                        ? "border-b-2 border-[#d4af37] text-[#d4af37]"
                        : "text-[#f0e6d3]/50 hover:text-[#f0e6d3]"
                    }`}
                    onClick={() => setDeptTab("All")}
                  >
                    All
                  </button>
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        deptTab === dept
                          ? "border-b-2 border-[#d4af37] text-[#d4af37]"
                          : "text-[#f0e6d3]/50 hover:text-[#f0e6d3]"
                      }`}
                      onClick={() => setDeptTab(dept)}
                    >
                      {dept}
                    </button>
                  ))}
                </div>

                {filteredWorkers.map((worker) => (
                  <div key={worker.id} className="parchment-card overflow-hidden">
                    <div className="flex items-center gap-2 p-3 parchment-card-alt">
                      {editingWorker?.id === worker.id ? (
                        <div className="flex flex-col md:flex-row gap-2 flex-1">
                          <input
                            className="parchment-input rounded px-2 py-1 flex-1 text-base"
                            value={editingWorker.name}
                            onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && updateWorker(worker.id)}
                            autoFocus
                          />
                          <input
                            className="parchment-input rounded px-2 py-1 flex-1 text-base"
                            placeholder="Phone"
                            value={editingWorker.contact}
                            onChange={(e) => setEditingWorker({ ...editingWorker, contact: e.target.value })}
                          />
                          <input
                            className="parchment-input rounded px-2 py-1 flex-1 text-base"
                            placeholder="Department"
                            value={editingWorker.department}
                            onChange={(e) => setEditingWorker({ ...editingWorker, department: e.target.value })}
                          />
                          <div className="flex gap-1">
                            <button className="gold-bg px-3 py-1 rounded font-semibold cursor-pointer text-sm" onClick={() => updateWorker(worker.id)}>Save</button>
                            <button className="bg-gray-400 text-white px-3 py-1 rounded cursor-pointer text-sm hover:bg-gray-500" onClick={() => setEditingWorker(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            className="font-semibold flex-1 text-left cursor-pointer flex items-center gap-2"
                            onClick={() => setExpandedWorkers((prev) => {
                              const next = new Set(prev);
                              next.has(worker.id) ? next.delete(worker.id) : next.add(worker.id);
                              return next;
                            })}
                          >
                            <span className={`transition-transform duration-200 inline-block ${expandedWorkers.has(worker.id) ? "rotate-90" : ""}`}>
                              &#9654;
                            </span>
                            <span>{worker.name}</span>
                            {worker.department && (
                              <span className="text-[10px] uppercase tracking-wider text-[#d4af37]/70 font-normal ml-1 border border-[#d4af37]/30 rounded px-1.5 py-0.5">
                                {worker.department}
                              </span>
                            )}
                            {worker.contact && (
                              <span className="text-xs text-gray-500 font-normal ml-1">({worker.contact})</span>
                            )}
                          </button>
                          <button className="text-[#d4af37] hover:text-[#e8c94a] cursor-pointer text-sm" onClick={() => setEditingWorker({ id: worker.id, name: worker.name, contact: worker.contact, department: worker.department })}>Edit</button>
                          <button className="text-[#8b0000] hover:text-[#cc0000] cursor-pointer text-sm" onClick={() => deleteWorker(worker.id)}>Remove</button>
                        </>
                      )}
                    </div>
                    {expandedWorkers.has(worker.id) && (
                      <div className="p-3 border-t border-[#c9b99a] flex flex-col gap-2 text-sm text-gray-600">
                        <p><strong>Name:</strong> {worker.name}</p>
                        <p><strong>Phone:</strong> {worker.contact || "Not provided"}</p>
                        {worker.department && <p><strong>Department:</strong> {worker.department}</p>}
                        <p className="italic text-xs">Record weekly wages in the <strong className="not-italic text-[#d4af37]">Salaries</strong> tab.</p>
                      </div>
                    )}
                  </div>
                ))}
              </>
            );
          })()}
          {workers.length === 0 && (
            <p className="text-center py-8 text-[#f0e6d3]/60 italic">No employees added yet.</p>
          )}

          {settings && (settings.foreman_name || settings.foreman_contact) && (
            <div className="parchment-card p-4 text-sm text-gray-600">
              <h3 className="font-bold text-[#d4af37] tracking-wide text-xs uppercase mb-2">Foreman</h3>
              <p><strong>{settings.foreman_name || "—"}</strong> {settings.foreman_contact && <span className="text-gray-500">({settings.foreman_contact})</span>}</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Salaries ───────────────────────────── */}
      {tab === "salaries" && (
        <div className="flex flex-col gap-3">
          <div className="parchment-card p-4 md:p-5">
            <h3 className="font-bold mb-3 text-[#d4af37] tracking-wide text-sm md:text-base uppercase">Record Weekly Wage</h3>
            <div className="flex flex-wrap gap-2">
              <select
                className="parchment-input rounded px-3 py-2 text-sm flex-1 min-w-[140px]"
                value={salaryWorkerId}
                onChange={(e) => setSalaryWorkerId(e.target.value)}
              >
                <option value="">Select employee</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              <input
                type="date"
                className="parchment-input rounded px-3 py-2 text-sm"
                value={salaryWeekStart}
                onChange={(e) => setSalaryWeekStart(e.target.value)}
                placeholder="Week starting"
              />
              <input
                type="number"
                step="0.01"
                className="parchment-input rounded px-3 py-2 text-sm w-28"
                placeholder="Weekly pay"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSalaryRecord()}
              />
              <button className="gold-bg px-4 py-2 rounded font-semibold cursor-pointer tracking-wide text-sm" onClick={addSalaryRecord}>
                Record
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Enter the Monday of the pay week. Records are created as <strong>unpaid</strong> by default.</p>
          </div>

          {allRecords.length > 0 && (
            <div className="parchment-card p-3 md:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="font-bold text-[#d4af37] tracking-wide text-sm uppercase">Wage Ledger</h3>
                <div className="flex items-center gap-3 text-sm">
                  <label className="flex items-center gap-1.5 text-[#f0e6d3]/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={salaryUnpaidOnly}
                      onChange={(e) => setSalaryUnpaidOnly(e.target.checked)}
                      className="accent-[#d4af37]"
                    />
                    Unpaid only
                  </label>
                  <span className="text-[#d4af37] font-bold">
                    Paid: ${summary.paidTotal.toFixed(2)}
                  </span>
                  <span className="text-[#8b0000] font-bold">
                    Unpaid: ${summary.unpaidTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm parchment-table">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">Week Start</th>
                      <th className="p-2">Employee</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRecords.map((rec) => (
                      <tr key={rec.id}>
                        {editingSalary[rec.id] ? (
                          <>
                            <td className="p-1">
                              <input type="date" className="parchment-input rounded px-1 py-0.5 text-xs w-full"
                                value={editingSalary[rec.id]?.week_start ?? rec.week_start}
                                onChange={(e) => setEditingSalary((p) => ({ ...p, [rec.id]: { ...p[rec.id], week_start: e.target.value, amount: p[rec.id]?.amount ?? "", status: p[rec.id]?.status ?? rec.status } }))}
                              />
                            </td>
                            <td className="p-1 text-gray-500 text-xs">{rec.worker_name}</td>
                            <td className="p-1 text-gray-500 text-xs">{rec.worker_contact || "—"}</td>
                            <td className="p-1">
                              <input type="number" step="0.01" className="parchment-input rounded px-1 py-0.5 text-xs w-full"
                                value={editingSalary[rec.id]?.amount ?? rec.amount}
                                onChange={(e) => setEditingSalary((p) => ({ ...p, [rec.id]: { ...p[rec.id], week_start: p[rec.id]?.week_start ?? "", amount: e.target.value, status: p[rec.id]?.status ?? rec.status } }))}
                              />
                            </td>
                            <td className="p-1">
                              <select
                                className="parchment-input rounded px-1 py-0.5 text-xs"
                                value={editingSalary[rec.id]?.status ?? rec.status}
                                onChange={(e) => setEditingSalary((p) => ({ ...p, [rec.id]: { ...p[rec.id], week_start: p[rec.id]?.week_start ?? "", amount: p[rec.id]?.amount ?? "", status: e.target.value } }))}
                              >
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                              </select>
                            </td>
                            <td className="p-1 flex gap-1">
                              <button className="text-[#d4af37] hover:text-[#e8c94a] cursor-pointer text-xs font-semibold" onClick={() => updateSalaryRecord(rec.id)}>Save</button>
                              <button className="text-gray-500 hover:text-gray-700 cursor-pointer text-xs"
                                onClick={() => setEditingSalary((p) => { const n = { ...p }; delete n[rec.id]; return n; })}
                              >Cancel</button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2">{rec.week_start}</td>
                            <td className="p-2 font-medium">{rec.worker_name}</td>
                            <td className="p-2 text-gray-500 text-xs">{rec.worker_contact || "—"}</td>
                            <td className="p-2 font-medium">${rec.amount.toFixed(2)}</td>
                            <td className="p-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                rec.status === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {rec.status === "paid" ? "Paid" : "Unpaid"}
                              </span>
                            </td>
                            <td className="p-2 flex gap-2">
                              {rec.status === "unpaid" ? (
                                <button className="text-green-700 hover:text-green-900 cursor-pointer text-xs font-semibold" onClick={() => markPaid(rec.id)}>
                                  Mark Paid
                                </button>
                              ) : (
                                <button className="text-orange-700 hover:text-orange-900 cursor-pointer text-xs font-semibold" onClick={() => markUnpaid(rec.id)}>
                                  Mark Unpaid
                                </button>
                              )}
                              <button className="text-[#d4af37] hover:text-[#e8c94a] cursor-pointer text-xs"
                                onClick={() => setEditingSalary((p) => ({ ...p, [rec.id]: { week_start: rec.week_start, amount: String(rec.amount), status: rec.status } }))}
                              >Edit</button>
                              <button className="text-[#8b0000] hover:text-[#cc0000] cursor-pointer text-xs" onClick={() => deleteSalaryRecord(rec.id)}>Delete</button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {allRecords.length === 0 && (
            <p className="text-center py-8 text-[#f0e6d3]/60 italic">No wages recorded yet.</p>
          )}
        </div>
      )}

      <ParallaxSection
        image="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1600&q=80"
        label="Architectural Blueprints"
      />

      {/* ── TAB: Materials & Cost ──────────────────── */}
      {tab === "materials" && (
        <div className="flex flex-col gap-3">
          <div className="parchment-card p-4 md:p-5">
            <h3 className="font-bold mb-3 text-[#d4af37] tracking-wide text-sm md:text-base uppercase">Add Material Entry</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
              <input className="parchment-input rounded px-2 py-1 text-sm" placeholder="Material name"
                value={newMaterial.name} onChange={(e) => setNewMaterial((p) => ({ ...p, name: e.target.value }))}
              />
              <input type="number" step="0.01" className="parchment-input rounded px-2 py-1 text-sm" placeholder="Qty"
                value={newMaterial.quantity} onChange={(e) => setNewMaterial((p) => ({ ...p, quantity: e.target.value }))}
              />
              <input className="parchment-input rounded px-2 py-1 text-sm" placeholder="Unit"
                value={newMaterial.unit} onChange={(e) => setNewMaterial((p) => ({ ...p, unit: e.target.value }))}
              />
              <input type="number" step="0.01" className="parchment-input rounded px-2 py-1 text-sm" placeholder="Cost"
                value={newMaterial.cost} onChange={(e) => setNewMaterial((p) => ({ ...p, cost: e.target.value }))}
              />
              <input type="date" className="parchment-input rounded px-2 py-1 text-sm"
                value={newMaterial.date} onChange={(e) => setNewMaterial((p) => ({ ...p, date: e.target.value }))}
              />
              <button className="gold-bg px-3 py-1.5 rounded font-semibold cursor-pointer text-sm tracking-wide" onClick={addMaterial}>
                Add
              </button>
            </div>
            <input className="parchment-input rounded px-2 py-1 text-sm w-full" placeholder="Notes (optional)"
              value={newMaterial.notes} onChange={(e) => setNewMaterial((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>

          {materials.length > 0 && (
            <div className="parchment-card p-3 md:p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-[#d4af37] tracking-wide text-sm uppercase">Materials Ledger</h3>
                <span className="font-bold text-[#d4af37]">Total: ${summary.materialTotal.toFixed(2)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm parchment-table">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">Date</th>
                      <th className="p-2">Material</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Unit</th>
                      <th className="p-2">Cost</th>
                      <th className="p-2">Notes</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((mat) => (
                      <tr key={mat.id}>
                        {editingMaterial[mat.id] ? (
                          <>
                            <td className="p-1">
                              <input type="date" className="parchment-input rounded px-1 py-0.5 text-xs w-full"
                                value={editingMaterial[mat.id]?.date ?? mat.date}
                                onChange={(e) => setEditingMaterial((p) => ({ ...p, [mat.id]: { ...p[mat.id], date: e.target.value } }))}
                              />
                            </td>
                            <td className="p-1">
                              <input className="parchment-input rounded px-1 py-0.5 text-xs w-full"
                                value={editingMaterial[mat.id]?.name ?? mat.name}
                                onChange={(e) => setEditingMaterial((p) => ({ ...p, [mat.id]: { ...p[mat.id], name: e.target.value } }))}
                              />
                            </td>
                            <td className="p-1">
                              <input type="number" step="0.01" className="parchment-input rounded px-1 py-0.5 text-xs w-16"
                                value={editingMaterial[mat.id]?.quantity ?? mat.quantity}
                                onChange={(e) => setEditingMaterial((p) => ({ ...p, [mat.id]: { ...p[mat.id], quantity: parseFloat(e.target.value) } }))}
                              />
                            </td>
                            <td className="p-1">
                              <input className="parchment-input rounded px-1 py-0.5 text-xs w-16"
                                value={editingMaterial[mat.id]?.unit ?? mat.unit}
                                onChange={(e) => setEditingMaterial((p) => ({ ...p, [mat.id]: { ...p[mat.id], unit: e.target.value } }))}
                              />
                            </td>
                            <td className="p-1">
                              <input type="number" step="0.01" className="parchment-input rounded px-1 py-0.5 text-xs w-20"
                                value={editingMaterial[mat.id]?.cost ?? mat.cost}
                                onChange={(e) => setEditingMaterial((p) => ({ ...p, [mat.id]: { ...p[mat.id], cost: parseFloat(e.target.value) } }))}
                              />
                            </td>
                            <td className="p-1">
                              <input className="parchment-input rounded px-1 py-0.5 text-xs w-full"
                                value={editingMaterial[mat.id]?.notes ?? mat.notes}
                                onChange={(e) => setEditingMaterial((p) => ({ ...p, [mat.id]: { ...p[mat.id], notes: e.target.value } }))}
                              />
                            </td>
                            <td className="p-1 flex gap-1">
                              <button className="text-[#d4af37] hover:text-[#e8c94a] cursor-pointer text-xs font-semibold" onClick={() => updateMaterial(mat.id)}>Save</button>
                              <button className="text-gray-500 hover:text-gray-700 cursor-pointer text-xs"
                                onClick={() => setEditingMaterial((p) => { const n = { ...p }; delete n[mat.id]; return n; })}
                              >Cancel</button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2">{mat.date}</td>
                            <td className="p-2 font-medium">{mat.name}</td>
                            <td className="p-2">{mat.quantity}</td>
                            <td className="p-2">{mat.unit}</td>
                            <td className="p-2 font-medium text-[#d4af37]">${mat.cost.toFixed(2)}</td>
                            <td className="p-2 text-gray-500 text-xs">{mat.notes}</td>
                            <td className="p-2 flex gap-2">
                              <button className="text-[#d4af37] hover:text-[#e8c94a] cursor-pointer text-xs"
                                onClick={() => setEditingMaterial((p) => ({ ...p, [mat.id]: { name: mat.name, quantity: mat.quantity, unit: mat.unit, cost: mat.cost, date: mat.date, notes: mat.notes } }))}
                              >Edit</button>
                              <button className="text-[#8b0000] hover:text-[#cc0000] cursor-pointer text-xs" onClick={() => deleteMaterial(mat.id)}>Delete</button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {materials.length === 0 && (
            <p className="text-center py-8 text-[#f0e6d3]/60 italic">No materials added yet.</p>
          )}
        </div>
      )}

      {/* ── Grand Total ───────────────────────────── */}
      <div className="parchment-card p-4 md:p-5 text-center ring-2 ring-[#d4af37]">
        <div className="text-xs text-[#d4af37] uppercase tracking-[0.2em] font-semibold mb-1">Project Grand Total</div>
        <div className="text-2xl md:text-3xl font-bold">${summary.grandTotal.toFixed(2)}</div>
        <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm text-gray-600">
          <span>Salaries: <strong>${summary.salaryTotal.toFixed(2)}</strong></span>
          <span className="text-green-700">Paid: <strong>${summary.paidTotal.toFixed(2)}</strong></span>
          <span className="text-red-700">Unpaid: <strong>${summary.unpaidTotal.toFixed(2)}</strong></span>
          <span>Materials: <strong>${summary.materialTotal.toFixed(2)}</strong></span>
        </div>
      </div>

      <ParallaxSection
        image="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
        label="Landscape & Greenery"
      />
    </div>
  );
}
