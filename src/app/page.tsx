"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useEntranceAnimation, useCountUp } from "@/hooks/useEntranceAnimation";
import { downloadCsv, formatDate, formatMoney, mondayISO, toQueryString, todayISO } from "@/lib/format";
import DashboardHero from "@/components/DashboardHero";
import LoginScreen from "@/components/LoginScreen";
import { useAuth } from "@/lib/auth-context";
import type {
  Material,
  MaterialFilters,
  PayStatus,
  ProjectSettings,
  SalaryFilters,
  SalaryRecord,
  Summary,
  Worker,
} from "@/lib/types";

type Tab = "dashboard" | "workers" | "wages" | "materials" | "settings";
type Notice = { type: "success" | "error"; message: string } | null;

const tabIcons: Record<Tab, React.ReactNode> = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  workers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  wages: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  materials: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};
type WorkerDraft = { name: string; contact: string; department: string };
type SalaryEdit = { week_start: string; amount: string; status: PayStatus };
type MaterialDraft = {
  name: string;
  quantity: string;
  unit: string;
  cost: string;
  date: string;
  category: string;
  supplier: string;
  notes: string;
};
type SettingsDraft = {
  project_name: string;
  pm_name: string;
  pm_contact: string;
  foreman_name: string;
  foreman_contact: string;
  currency: string;
  budget: string;
};

const emptySummary: Summary = {
  salaryTotal: 0,
  paidTotal: 0,
  unpaidTotal: 0,
  materialTotal: 0,
  grandTotal: 0,
  workerCount: 0,
  recordCount: 0,
  materialCount: 0,
  unpaidRecordCount: 0,
  budget: 0,
  budgetRemaining: 0,
  budgetUsedPercent: 0,
};

const emptyWorker: WorkerDraft = { name: "", contact: "", department: "" };
const emptyMaterial = (): MaterialDraft => ({
  name: "",
  quantity: "1",
  unit: "pcs",
  cost: "",
  date: todayISO(),
  category: "",
  supplier: "",
  notes: "",
});
const emptySettings: SettingsDraft = {
  project_name: "",
  pm_name: "",
  pm_contact: "",
  foreman_name: "",
  foreman_contact: "",
  currency: "KES",
  budget: "",
};

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }
  return response.json();
}

function settingsToDraft(settings: ProjectSettings): SettingsDraft {
  return {
    project_name: settings.project_name || "",
    pm_name: settings.pm_name || "",
    pm_contact: settings.pm_contact || "",
    foreman_name: settings.foreman_name || "",
    foreman_contact: settings.foreman_contact || "",
    currency: settings.currency || "KES",
    budget: settings.budget ? String(settings.budget) : "",
  };
}

function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone = "slate",
  countKey,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "slate" | "green" | "red" | "amber" | "blue";
  countKey?: number;
}) {
  const toneClass = {
    slate: "border-border-subtle",
    green: "border-emerald-300/20",
    red: "border-rose-300/20",
    amber: "border-amber/30",
    blue: "border-border-subtle",
  }[tone];

  const numeric = countKey ?? 0;
  const countRef = useCountUp(numeric);

  return (
    <div className={`metric-card ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">
        {countKey !== undefined ? (
          <span>
            {value.replace(/[\d,]+/, "")}
            <span ref={countRef}>0</span>
          </span>
        ) : (
          value
        )}
      </p>
      <p className="mt-1 text-sm text-ink-muted">{detail}</p>
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border-subtle bg-bg-surface/50 px-6 py-10 text-center">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-ink-muted">{detail}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: PayStatus }) {
  return (
    <span className={`status-pill ${status === "paid" ? "status-paid" : "status-unpaid"}`}>
      {status === "paid" ? "Paid" : "Unpaid"}
    </span>
  );
}

export default function Home() {
  const { admin, loading, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const [tab, setTab] = useState<Tab>("dashboard");
  const [booting, setBooting] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);

  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<SettingsDraft>(emptySettings);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [workerDraft, setWorkerDraft] = useState<WorkerDraft>(emptyWorker);
  const [workerSearch, setWorkerSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [editingWorker, setEditingWorker] = useState<(WorkerDraft & { id: number }) | null>(null);

  const [salaryWorkerId, setSalaryWorkerId] = useState("");
  const [salaryWeekStart, setSalaryWeekStart] = useState(mondayISO());
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryFilters, setSalaryFilters] = useState<SalaryFilters>({
    workerId: "",
    status: "all",
    from: "",
    to: "",
    query: "",
  });
  const [editingSalary, setEditingSalary] = useState<Record<number, SalaryEdit>>({});

  const [materialDraft, setMaterialDraft] = useState<MaterialDraft>(emptyMaterial);
  const [materialFilters, setMaterialFilters] = useState<MaterialFilters>({
    category: "",
    from: "",
    to: "",
    query: "",
  });
  const [editingMaterial, setEditingMaterial] = useState<Record<number, MaterialDraft>>({});

  const mainRef = useEntranceAnimation([tab, booting]);
  const contentRef = useRef<HTMLDivElement>(null);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const tabs = useMemo<{ key: Tab; label: string }[]>(() => [
    { key: "dashboard", label: "Dashboard" },
    { key: "workers", label: "Workers" },
    { key: "wages", label: "Wages" },
    { key: "materials", label: "Materials" },
    { key: "settings", label: "Settings" },
  ], []);

  useEffect(() => {
    const updateIndicator = () => {
      const idx = tabs.findIndex((t) => t.key === tab);
      const el = tabRefs.current[idx];
      if (el) {
        setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
      }
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [tab, tabs]);

  useEffect(() => {
    if (!contentRef.current || booting) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }, contentRef);
    return () => ctx.revert();
  }, [tab, booting]);

  const currency = settings?.currency || "KES";
  const money = useCallback((value: number) => formatMoney(value, currency), [currency]);

  const notify = useCallback((type: "success" | "error", message: string) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 3500);
  }, []);

  const salaryQuery = useMemo(
    () =>
      toQueryString({
        worker_id: salaryFilters.workerId,
        status: salaryFilters.status === "all" ? "" : salaryFilters.status,
        from: salaryFilters.from,
        to: salaryFilters.to,
        q: salaryFilters.query.trim(),
      }),
    [salaryFilters]
  );

  const materialQuery = useMemo(
    () =>
      toQueryString({
        category: materialFilters.category,
        from: materialFilters.from,
        to: materialFilters.to,
        q: materialFilters.query.trim(),
      }),
    [materialFilters]
  );

  const refreshSummary = useCallback(() => {
    apiFetch<Summary>("/api/summary")
      .then(setSummary)
      .catch(() => notify("error", "Failed to refresh summary"));
  }, [notify]);

  const refreshWorkers = useCallback(() => {
    apiFetch<Worker[]>("/api/workers")
      .then(setWorkers)
      .catch(() => notify("error", "Failed to refresh workers"));
  }, [notify]);

  const refreshSalaryRecords = useCallback(() => {
    apiFetch<SalaryRecord[]>(`/api/records${salaryQuery}`)
      .then(setSalaryRecords)
      .catch(() => notify("error", "Failed to refresh wage records"));
  }, [notify, salaryQuery]);

  const refreshMaterials = useCallback(() => {
    apiFetch<Material[]>(`/api/materials${materialQuery}`)
      .then(setMaterials)
      .catch(() => notify("error", "Failed to refresh materials"));
  }, [materialQuery, notify]);

  useEffect(() => {
    let isCurrent = true;

    Promise.all([
      apiFetch<ProjectSettings>("/api/project-settings"),
      apiFetch<Worker[]>("/api/workers"),
      apiFetch<SalaryRecord[]>("/api/records"),
      apiFetch<Material[]>("/api/materials"),
      apiFetch<Summary>("/api/summary"),
    ])
      .then(([settingsData, workersData, recordsData, materialsData, summaryData]) => {
        if (!isCurrent) return;
        setSettings(settingsData);
        setSettingsDraft(settingsToDraft(settingsData));
        setWorkers(workersData);
        setSalaryRecords(recordsData);
        setMaterials(materialsData);
        setSummary(summaryData);
        setBooting(false);
      })
      .catch(() => {
        if (!isCurrent) return;
        setBooting(false);
        notify("error", "Failed to load project data");
      });

    return () => {
      isCurrent = false;
    };
  }, [notify]);

  useEffect(() => {
    let isCurrent = true;

    apiFetch<SalaryRecord[]>(`/api/records${salaryQuery}`)
      .then((records) => {
        if (isCurrent) setSalaryRecords(records);
      })
      .catch(() => {
        if (isCurrent) notify("error", "Failed to load wage records");
      });

    return () => {
      isCurrent = false;
    };
  }, [notify, salaryQuery]);

  useEffect(() => {
    let isCurrent = true;

    apiFetch<Material[]>(`/api/materials${materialQuery}`)
      .then((entries) => {
        if (isCurrent) setMaterials(entries);
      })
      .catch(() => {
        if (isCurrent) notify("error", "Failed to load material records");
      });

    return () => {
      isCurrent = false;
    };
  }, [materialQuery, notify]);

  const departments = useMemo(
    () => Array.from(new Set(workers.map((worker) => worker.department).filter(Boolean))).sort(),
    [workers]
  );
  const materialCategories = useMemo(
    () => Array.from(new Set(materials.map((material) => material.category).filter(Boolean))).sort(),
    [materials]
  );

  const filteredWorkers = useMemo(() => {
    const query = workerSearch.trim().toLowerCase();
    return workers.filter((worker) => {
      const matchesDepartment = departmentFilter === "All" || worker.department === departmentFilter;
      const matchesQuery =
        !query ||
        worker.name.toLowerCase().includes(query) ||
        worker.contact.toLowerCase().includes(query) ||
        worker.department.toLowerCase().includes(query);
      return matchesDepartment && matchesQuery;
    });
  }, [departmentFilter, workerSearch, workers]);

  const visibleWageTotal = useMemo(
    () => salaryRecords.reduce((total, record) => total + record.amount, 0),
    [salaryRecords]
  );
  const visibleMaterialTotal = useMemo(
    () => materials.reduce((total, material) => total + material.cost, 0),
    [materials]
  );
  const unpaidRecords = useMemo(
    () => salaryRecords.filter((record) => record.status === "unpaid"),
    [salaryRecords]
  );

  const addWorker = async () => {
    if (!workerDraft.name.trim()) {
      notify("error", "Worker name is required");
      return;
    }
    try {
      await apiFetch<Worker>("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workerDraft),
      });
      setWorkerDraft(emptyWorker);
      notify("success", "Worker registered");
      refreshWorkers();
      refreshSummary();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to register worker");
    }
  };

  const updateWorker = async () => {
    if (!editingWorker?.name.trim()) {
      notify("error", "Worker name is required");
      return;
    }
    try {
      await apiFetch<Worker>(`/api/workers/${editingWorker.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingWorker),
      });
      setEditingWorker(null);
      notify("success", "Worker updated");
      refreshWorkers();
      refreshSalaryRecords();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to update worker");
    }
  };

  const deleteWorker = async (id: number) => {
    try {
      await apiFetch(`/api/workers/${id}`, { method: "DELETE" });
      notify("success", "Worker removed");
      refreshWorkers();
      refreshSalaryRecords();
      refreshSummary();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to remove worker");
    }
  };

  const addSalaryRecord = async () => {
    if (!salaryWorkerId || !salaryWeekStart || !salaryAmount) {
      notify("error", "Worker, week, and pay amount are required");
      return;
    }
    try {
      await apiFetch<SalaryRecord>("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worker_id: Number(salaryWorkerId),
          week_start: salaryWeekStart,
          amount: Number(salaryAmount),
          status: "unpaid",
        }),
      });
      setSalaryAmount("");
      setSalaryWeekStart(mondayISO());
      notify("success", "Wage recorded");
      refreshSalaryRecords();
      refreshSummary();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to record wage");
    }
  };

  const updateSalaryRecord = async (id: number) => {
    const draft = editingSalary[id];
    if (!draft?.week_start || !draft.amount) {
      notify("error", "Week and amount are required");
      return;
    }
    try {
      await apiFetch<SalaryRecord>(`/api/records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, amount: Number(draft.amount) }),
      });
      setEditingSalary((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      notify("success", "Wage record updated");
      refreshSalaryRecords();
      refreshSummary();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to update wage record");
    }
  };

  const setRecordStatus = async (id: number, status: PayStatus) => {
    try {
      await apiFetch<SalaryRecord>(`/api/records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      notify("success", status === "paid" ? "Marked as paid" : "Marked as unpaid");
      refreshSalaryRecords();
      refreshSummary();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to update wage status");
    }
  };

  const deleteSalaryRecord = async (id: number) => {
    try {
      await apiFetch(`/api/records/${id}`, { method: "DELETE" });
      notify("success", "Wage record deleted");
      refreshSalaryRecords();
      refreshSummary();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to delete wage record");
    }
  };

  const addMaterial = async () => {
    if (!materialDraft.name.trim()) {
      notify("error", "Material name is required");
      return;
    }
    try {
      await apiFetch<Material>("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...materialDraft,
          quantity: Number(materialDraft.quantity),
          cost: Number(materialDraft.cost || 0),
        }),
      });
      setMaterialDraft(emptyMaterial());
      notify("success", "Material entry added");
      refreshMaterials();
      refreshSummary();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to add material");
    }
  };

  const updateMaterial = async (id: number) => {
    const draft = editingMaterial[id];
    if (!draft?.name.trim()) {
      notify("error", "Material name is required");
      return;
    }
    try {
      await apiFetch<Material>(`/api/materials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          quantity: Number(draft.quantity),
          cost: Number(draft.cost || 0),
        }),
      });
      setEditingMaterial((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      notify("success", "Material entry updated");
      refreshMaterials();
      refreshSummary();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to update material");
    }
  };

  const deleteMaterial = async (id: number) => {
    try {
      await apiFetch(`/api/materials/${id}`, { method: "DELETE" });
      notify("success", "Material entry deleted");
      refreshMaterials();
      refreshSummary();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to delete material");
    }
  };

  const saveSettings = async () => {
    try {
      const saved = await apiFetch<ProjectSettings>("/api/project-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settingsDraft,
          budget: settingsDraft.budget ? Number(settingsDraft.budget) : 0,
        }),
      });
      setSettings(saved);
      setSettingsDraft(settingsToDraft(saved));
      notify("success", "Project settings saved");
      refreshSummary();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to save settings");
    }
  };

  const exportWages = () => {
    downloadCsv("wage-ledger.csv", [
      ["Week Start", "Worker", "Department", "Phone", "Amount", "Status"],
      ...salaryRecords.map((record) => [
        record.week_start,
        record.worker_name,
        record.worker_department,
        record.worker_contact,
        record.amount,
        record.status,
      ]),
    ]);
  };

  const exportMaterials = () => {
    downloadCsv("materials-ledger.csv", [
      ["Date", "Material", "Category", "Supplier", "Quantity", "Unit", "Cost", "Notes"],
      ...materials.map((material) => [
        material.date,
        material.name,
        material.category,
        material.supplier,
        material.quantity,
        material.unit,
        material.cost,
        material.notes,
      ]),
    ]);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-deep">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber border-t-transparent" />
          <p className="text-sm text-ink-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <LoginScreen />;
  }

  return (
    <div ref={mainRef} className="min-h-screen bg-bg-deep text-ink">
      {notice && (
        <div className={`notice ${notice.type === "success" ? "notice-success" : "notice-error"}`}>
          {notice.message}
        </div>
      )}

      <DashboardHero
        projectName={settings?.project_name || "Project Overview"}
        pmName={settings?.pm_name || ""}
        onRecordLabor={() => setTab("wages")}
        onPrint={() => window.print()}
      />

      <div className="sticky top-[57px] z-20 border-b border-border-subtle bg-bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center overflow-x-auto px-6 scrollbar-none">
          <nav className="tab-bar shrink-0">
            {tabs.map((item, i) => (
              <button
                key={item.key}
                ref={(el) => { tabRefs.current[i] = el; }}
                className={`tab-button ${tab === item.key ? "tab-button-active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                {tabIcons[item.key]}
                <span>{item.label}</span>
              </button>
            ))}
            <div className="tab-indicator" style={{ left: indicator.left, width: indicator.width }} />
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-3 pl-4">
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber/20 text-[10px] font-bold text-amber">
                {admin?.name?.charAt(0)?.toUpperCase() || "A"}
              </span>
              <span className="hidden sm:inline">{admin?.name || "Admin"}</span>
            </div>
            <div className="relative">
              <button
                className="rounded-md px-2 py-1 text-xs text-ink-muted transition-colors hover:bg-amber/10 hover:text-amber"
                onClick={() => setShowLogout(!showLogout)}
              >
                Logout
              </button>
              {showLogout && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLogout(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-border-subtle bg-bg-elevated p-3 shadow-xl">
                    <p className="mb-1 text-xs text-ink-muted">Signed in as</p>
                    <p className="mb-3 text-sm font-medium text-ink">{admin?.name || "Admin"}</p>
                    <button
                      className="w-full rounded-md bg-red-500/10 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/20"
                      onClick={() => { logout(); setShowLogout(false); }}
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:px-6">
        {booting ? (
          <div className="rounded-lg border border-amber/20 bg-amber/5 p-8 text-center text-amber">Loading project data...</div>
        ) : (
          <div ref={contentRef}>
            {tab === "dashboard" && (
              <section className="flex flex-col gap-6">
                <SectionTitle eyebrow="Dashboard" title="Project Health & Metrics" />

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" data-animate>
                  <MetricCard label="Total Spend" value={money(summary.grandTotal)} detail="Labor + Materials" tone="blue" countKey={summary.grandTotal} />
                  <MetricCard label="Outstanding Labor" value={money(summary.unpaidTotal)} detail={`${summary.unpaidRecordCount} pending`} tone="red" countKey={summary.unpaidTotal} />
                  <MetricCard label="Material Cost" value={money(summary.materialTotal)} detail={`${summary.materialCount} items`} tone="amber" countKey={summary.materialTotal} />
                  <MetricCard label="Team Size" value={String(summary.workerCount)} detail={`${departments.length || 0} department(s)`} tone="green" countKey={summary.workerCount} />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]" data-animate>
                  <div className="panel p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-ink">Budget Overview</h3>
                        <p className="text-sm text-ink-muted">
                          {summary.budget > 0
                            ? `${money(summary.budgetRemaining)} of ${money(summary.budget)} remaining`
                            : "Set a budget in Settings to track project spending"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-ink-muted">
                        {summary.budget > 0 ? `${summary.budgetUsedPercent.toFixed(1)}% spent` : "No budget set"}
                      </span>
                    </div>
                    <div className="progress-track mt-4">
                      <div
                        className={`progress-bar ${summary.budgetRemaining < 0 ? "progress-over" : ""}`}
                        style={{ width: `${Math.min(summary.budgetUsedPercent, 100)}%` }}
                      />
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-md bg-bg-deep p-3">
                        <p className="text-xs uppercase tracking-[0.12em] text-ink-muted">Paid</p>
                        <p className="mt-1 font-semibold text-emerald-400">{money(summary.paidTotal)}</p>
                      </div>
                      <div className="rounded-md bg-bg-deep p-3">
                        <p className="text-xs uppercase tracking-[0.12em] text-ink-muted">Pending</p>
                        <p className="mt-1 font-semibold text-rose-400">{money(summary.unpaidTotal)}</p>
                      </div>
                      <div className="rounded-md bg-bg-deep p-3">
                        <p className="text-xs uppercase tracking-[0.12em] text-ink-muted">Total Items</p>
                        <p className="mt-1 font-semibold text-ink">{summary.recordCount + summary.materialCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="panel p-5">
                    <h3 className="text-lg font-semibold text-ink">Quick Actions</h3>
                    <div className="mt-4 grid gap-2">
                      <button className="secondary-button justify-between" onClick={() => setTab("workers")}>
                        <span>Manage Team</span>
                        <span className="rounded bg-bg-deep px-2 py-1 text-xs font-semibold">{workers.length}</span>
                      </button>
                      <button className="secondary-button justify-between" onClick={() => setTab("materials")}>
                        <span>Record Material</span>
                        <span className="rounded bg-bg-deep px-2 py-1 text-xs font-semibold">{materials.length}</span>
                      </button>
                      <button className="secondary-button justify-between" onClick={() => setTab("settings")}>
                        <span>Update Settings</span>
                        <span className="rounded bg-bg-deep px-2 py-1 text-xs font-semibold">{currency}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2" data-animate>
                  <div className="panel p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-ink">Pending Labor Costs</h3>
                      <button className="text-button" onClick={() => setTab("wages")}>View all</button>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      {unpaidRecords.slice(0, 6).map((record) => (
                        <div key={record.id} className="ledger-row">
                          <div>
                            <p className="font-medium text-ink">{record.worker_name}</p>
                            <p className="text-sm text-ink-muted">{formatDate(record.week_start)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-rose-400">{money(record.amount)}</p>
                            <button className="text-button" onClick={() => setRecordStatus(record.id, "paid")}>Mark paid</button>
                          </div>
                        </div>
                      ))}
                      {unpaidRecords.length === 0 && <EmptyState title="All labor costs settled" detail="Great! No pending payments." />}
                    </div>
                  </div>

                  <div className="panel p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-ink">Recent Material Spend</h3>
                      <button className="text-button" onClick={() => setTab("materials")}>View all</button>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      {materials.slice(0, 6).map((material) => (
                        <div key={material.id} className="ledger-row">
                          <div>
                            <p className="font-medium text-ink">{material.name}</p>
                            <p className="text-sm text-ink-muted">
                              {formatDate(material.date)} {material.category ? `- ${material.category}` : ""}
                            </p>
                          </div>
                          <p className="font-semibold text-ink">{money(material.cost)}</p>
                        </div>
                      ))}
                      {materials.length === 0 && <EmptyState title="No materials recorded" detail="Add material costs as they occur." />}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {tab === "workers" && (
              <section className="flex flex-col gap-5">
                <SectionTitle eyebrow="Team Management" title="Team Members" />

                <div className="panel p-5" data-animate>
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                    <input
                      className="control"
                      placeholder="Full name"
                      value={workerDraft.name}
                      onChange={(event) => setWorkerDraft((current) => ({ ...current, name: event.target.value }))}
                    />
                    <input
                      className="control"
                      placeholder="Phone number"
                      value={workerDraft.contact}
                      onChange={(event) => setWorkerDraft((current) => ({ ...current, contact: event.target.value }))}
                    />
                    <input
                      className="control"
                      placeholder="Department/Role"
                      value={workerDraft.department}
                      onChange={(event) => setWorkerDraft((current) => ({ ...current, department: event.target.value }))}
                    />
                    <button className="primary-button" onClick={addWorker}>Add Member</button>
                  </div>
                </div>

                <div className="filter-bar">
                  <input
                    className="control min-w-0 flex-1"
                    placeholder="Search name, phone, department"
                    value={workerSearch}
                    onChange={(event) => setWorkerSearch(event.target.value)}
                  />
                  <select className="control" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                    <option value="All">All departments</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </div>

                <div className="panel table-shell">
                  {filteredWorkers.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Department</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredWorkers.map((worker) => (
                          <tr key={worker.id}>
                            {editingWorker?.id === worker.id ? (
                              <>
                                <td><input className="control" value={editingWorker.name} onChange={(event) => setEditingWorker({ ...editingWorker, name: event.target.value })} /></td>
                                <td><input className="control" value={editingWorker.contact} onChange={(event) => setEditingWorker({ ...editingWorker, contact: event.target.value })} /></td>
                                <td><input className="control" value={editingWorker.department} onChange={(event) => setEditingWorker({ ...editingWorker, department: event.target.value })} /></td>
                                <td className="table-actions">
                                  <button className="text-button" onClick={updateWorker}>Save</button>
                                  <button className="text-button" onClick={() => setEditingWorker(null)}>Cancel</button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="font-medium text-ink">{worker.name}</td>
                                <td>{worker.contact || "-"}</td>
                                <td>{worker.department || "-"}</td>
                                <td className="table-actions">
                                  <button
                                    className="text-button"
                                    onClick={() => {
                                      setSalaryWorkerId(String(worker.id));
                                      setTab("wages");
                                    }}
                                  >
                                    Add wage
                                  </button>
                                  <button className="text-button" onClick={() => setEditingWorker({ id: worker.id, name: worker.name, contact: worker.contact, department: worker.department })}>Edit</button>
                                  <button className="danger-text-button" onClick={() => deleteWorker(worker.id)}>Remove</button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <EmptyState title="No workers found" detail="Adjust the search or register the first worker." />
                  )}
                </div>
              </section>
            )}

            {tab === "wages" && (
              <section className="flex flex-col gap-5">
                <SectionTitle
                  eyebrow="Labor Costs"
                  title="Wage Records & Payments"
                  action={<button className="secondary-button" onClick={exportWages}>📥 Export CSV</button>}
                />

                <div className="panel p-5" data-animate>
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                    <select className="control" value={salaryWorkerId} onChange={(event) => setSalaryWorkerId(event.target.value)}>
                      <option value="">Select team member</option>
                      {workers.map((worker) => (
                        <option key={worker.id} value={worker.id}>{worker.name}</option>
                      ))}
                    </select>
                    <input className="control" type="date" value={salaryWeekStart} onChange={(event) => setSalaryWeekStart(event.target.value)} />
                    <input className="control" type="number" min="0" step="0.01" placeholder="Labor cost" value={salaryAmount} onChange={(event) => setSalaryAmount(event.target.value)} />
                    <button className="primary-button" onClick={addSalaryRecord}>Add Cost</button>
                  </div>
                </div>

                <div className="filter-bar">
                  <input className="control min-w-0 flex-1" placeholder="Search by name, phone, department" value={salaryFilters.query} onChange={(event) => setSalaryFilters((current) => ({ ...current, query: event.target.value }))} />
                  <select className="control" value={salaryFilters.workerId} onChange={(event) => setSalaryFilters((current) => ({ ...current, workerId: event.target.value }))}>
                    <option value="">All team members</option>
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>{worker.name}</option>
                    ))}
                  </select>
                  <select className="control" value={salaryFilters.status} onChange={(event) => setSalaryFilters((current) => ({ ...current, status: event.target.value as SalaryFilters["status"] }))}>
                    <option value="all">All statuses</option>
                    <option value="unpaid">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                  <input className="control" type="date" value={salaryFilters.from} onChange={(event) => setSalaryFilters((current) => ({ ...current, from: event.target.value }))} />
                  <input className="control" type="date" value={salaryFilters.to} onChange={(event) => setSalaryFilters((current) => ({ ...current, to: event.target.value }))} />
                  <button className="secondary-button" onClick={() => setSalaryFilters({ workerId: "", status: "all", from: "", to: "", query: "" })}>Reset</button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <MetricCard label="Visible Costs" value={money(visibleWageTotal)} detail={`${salaryRecords.length} entry(s)`} tone="blue" countKey={visibleWageTotal} />
                  <MetricCard label="Pending in View" value={money(unpaidRecords.reduce((total, record) => total + record.amount, 0))} detail={`${unpaidRecords.length} pending`} tone="red" countKey={unpaidRecords.reduce((total, record) => total + record.amount, 0)} />
                  <MetricCard label="Project Pending" value={money(summary.unpaidTotal)} detail="All records" tone="amber" countKey={summary.unpaidTotal} />
                </div>

                <div className="panel table-shell">
                  {salaryRecords.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Week</th>
                          <th>Worker</th>
                          <th>Phone</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salaryRecords.map((record) => {
                          const draft = editingSalary[record.id];
                          return (
                            <tr key={record.id}>
                              {draft ? (
                                <>
                                  <td><input className="control" type="date" value={draft.week_start} onChange={(event) => setEditingSalary((current) => ({ ...current, [record.id]: { ...draft, week_start: event.target.value } }))} /></td>
                                  <td>{record.worker_name}</td>
                                  <td>{record.worker_contact || "-"}</td>
                                  <td><input className="control" type="number" min="0" step="0.01" value={draft.amount} onChange={(event) => setEditingSalary((current) => ({ ...current, [record.id]: { ...draft, amount: event.target.value } }))} /></td>
                                  <td>
                                    <select className="control" value={draft.status} onChange={(event) => setEditingSalary((current) => ({ ...current, [record.id]: { ...draft, status: event.target.value as PayStatus } }))}>
                                      <option value="unpaid">Unpaid</option>
                                      <option value="paid">Paid</option>
                                    </select>
                                  </td>
                                  <td className="table-actions">
                                    <button className="text-button" onClick={() => updateSalaryRecord(record.id)}>Save</button>
                                    <button className="text-button" onClick={() => setEditingSalary((current) => {
                                      const next = { ...current };
                                      delete next[record.id];
                                      return next;
                                    })}>Cancel</button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td>{formatDate(record.week_start)}</td>
                                  <td>
                                    <p className="font-medium text-ink">{record.worker_name}</p>
                                    {record.worker_department && <p className="text-xs text-ink-muted">{record.worker_department}</p>}
                                  </td>
                                  <td>{record.worker_contact || "-"}</td>
                                  <td className="font-semibold text-ink">{money(record.amount)}</td>
                                  <td><StatusBadge status={record.status} /></td>
                                  <td className="table-actions">
                                    <button className="text-button" onClick={() => setRecordStatus(record.id, record.status === "paid" ? "unpaid" : "paid")}>
                                      {record.status === "paid" ? "Mark unpaid" : "Mark paid"}
                                    </button>
                                    <button className="text-button" onClick={() => setEditingSalary((current) => ({ ...current, [record.id]: { week_start: record.week_start, amount: String(record.amount), status: record.status } }))}>Edit</button>
                                    <button className="danger-text-button" onClick={() => deleteSalaryRecord(record.id)}>Delete</button>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <EmptyState title="No wage records" detail="Record weekly pay or clear the active filters." />
                  )}
                </div>
              </section>
            )}

            {tab === "materials" && (
              <section className="flex flex-col gap-5">
                <SectionTitle
                  eyebrow="Resource Costs"
                  title="Material & Supply Tracking"
                  action={<button className="secondary-button" onClick={exportMaterials}>📥 Export CSV</button>}
                />

                <div className="panel p-5" data-animate>
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_0.5fr_0.5fr_0.7fr_0.8fr_0.8fr_auto]">
                    <input className="control" placeholder="Item/Material name" value={materialDraft.name} onChange={(event) => setMaterialDraft((current) => ({ ...current, name: event.target.value }))} />
                    <input className="control" type="number" min="0" step="0.01" placeholder="Qty" value={materialDraft.quantity} onChange={(event) => setMaterialDraft((current) => ({ ...current, quantity: event.target.value }))} />
                    <input className="control" placeholder="Unit" value={materialDraft.unit} onChange={(event) => setMaterialDraft((current) => ({ ...current, unit: event.target.value }))} />
                    <input className="control" type="number" min="0" step="0.01" placeholder="Cost" value={materialDraft.cost} onChange={(event) => setMaterialDraft((current) => ({ ...current, cost: event.target.value }))} />
                    <input className="control" placeholder="Category" value={materialDraft.category} onChange={(event) => setMaterialDraft((current) => ({ ...current, category: event.target.value }))} />
                    <input className="control" type="date" value={materialDraft.date} onChange={(event) => setMaterialDraft((current) => ({ ...current, date: event.target.value }))} />
                    <button className="primary-button" onClick={addMaterial}>Add Item</button>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input className="control" placeholder="Vendor/Supplier" value={materialDraft.supplier} onChange={(event) => setMaterialDraft((current) => ({ ...current, supplier: event.target.value }))} />
                    <input className="control" placeholder="Notes" value={materialDraft.notes} onChange={(event) => setMaterialDraft((current) => ({ ...current, notes: event.target.value }))} />
                  </div>
                </div>

                <div className="filter-bar">
                  <input className="control min-w-0 flex-1" placeholder="Search item, vendor, notes" value={materialFilters.query} onChange={(event) => setMaterialFilters((current) => ({ ...current, query: event.target.value }))} />
                  <select className="control" value={materialFilters.category} onChange={(event) => setMaterialFilters((current) => ({ ...current, category: event.target.value }))}>
                    <option value="">All categories</option>
                    {materialCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <input className="control" type="date" value={materialFilters.from} onChange={(event) => setMaterialFilters((current) => ({ ...current, from: event.target.value }))} />
                  <input className="control" type="date" value={materialFilters.to} onChange={(event) => setMaterialFilters((current) => ({ ...current, to: event.target.value }))} />
                  <button className="secondary-button" onClick={() => setMaterialFilters({ category: "", from: "", to: "", query: "" })}>Reset</button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <MetricCard label="Visible Spend" value={money(visibleMaterialTotal)} detail={`${materials.length} items`} tone="amber" countKey={visibleMaterialTotal} />
                  <MetricCard label="Project Spend" value={money(summary.materialTotal)} detail="All materials" tone="blue" countKey={summary.materialTotal} />
                  <MetricCard label="Categories" value={String(materialCategories.length)} detail="Categories in use" tone="green" countKey={materialCategories.length} />
                </div>

                <div className="panel table-shell">
                  {materials.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Material</th>
                          <th>Category</th>
                          <th>Qty</th>
                          <th>Supplier</th>
                          <th>Cost</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.map((material) => {
                          const draft = editingMaterial[material.id];
                          return (
                            <tr key={material.id}>
                              {draft ? (
                                <>
                                  <td><input className="control" type="date" value={draft.date} onChange={(event) => setEditingMaterial((current) => ({ ...current, [material.id]: { ...draft, date: event.target.value } }))} /></td>
                                  <td><input className="control" value={draft.name} onChange={(event) => setEditingMaterial((current) => ({ ...current, [material.id]: { ...draft, name: event.target.value } }))} /></td>
                                  <td><input className="control" value={draft.category} onChange={(event) => setEditingMaterial((current) => ({ ...current, [material.id]: { ...draft, category: event.target.value } }))} /></td>
                                  <td>
                                    <div className="grid grid-cols-[0.8fr_0.7fr] gap-2">
                                      <input className="control" type="number" min="0" step="0.01" value={draft.quantity} onChange={(event) => setEditingMaterial((current) => ({ ...current, [material.id]: { ...draft, quantity: event.target.value } }))} />
                                      <input className="control" value={draft.unit} onChange={(event) => setEditingMaterial((current) => ({ ...current, [material.id]: { ...draft, unit: event.target.value } }))} />
                                    </div>
                                  </td>
                                  <td><input className="control" value={draft.supplier} onChange={(event) => setEditingMaterial((current) => ({ ...current, [material.id]: { ...draft, supplier: event.target.value } }))} /></td>
                                  <td><input className="control" type="number" min="0" step="0.01" value={draft.cost} onChange={(event) => setEditingMaterial((current) => ({ ...current, [material.id]: { ...draft, cost: event.target.value } }))} /></td>
                                  <td className="table-actions">
                                    <button className="text-button" onClick={() => updateMaterial(material.id)}>Save</button>
                                    <button className="text-button" onClick={() => setEditingMaterial((current) => {
                                      const next = { ...current };
                                      delete next[material.id];
                                      return next;
                                    })}>Cancel</button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td>{formatDate(material.date)}</td>
                                  <td>
                                    <p className="font-medium text-ink">{material.name}</p>
                                    {material.notes && <p className="text-xs text-ink-muted">{material.notes}</p>}
                                  </td>
                                  <td>{material.category || "-"}</td>
                                  <td>{material.quantity} {material.unit}</td>
                                  <td>{material.supplier || "-"}</td>
                                  <td className="font-semibold text-ink">{money(material.cost)}</td>
                                  <td className="table-actions">
                                    <button className="text-button" onClick={() => setEditingMaterial((current) => ({
                                      ...current,
                                      [material.id]: {
                                        name: material.name,
                                        quantity: String(material.quantity),
                                        unit: material.unit,
                                        cost: String(material.cost),
                                        date: material.date,
                                        category: material.category,
                                        supplier: material.supplier,
                                        notes: material.notes,
                                      },
                                    }))}>Edit</button>
                                    <button className="danger-text-button" onClick={() => deleteMaterial(material.id)}>Delete</button>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <EmptyState title="No material entries" detail="Add a purchase or clear the active filters." />
                  )}
                </div>
              </section>
            )}

            {tab === "settings" && (
              <section className="flex flex-col gap-5">
                <SectionTitle eyebrow="Configuration" title="Project Settings & Reports" />

                <div className="panel p-5" data-animate>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="field-label">
                      Project Name
                      <input className="control" value={settingsDraft.project_name} onChange={(event) => setSettingsDraft((current) => ({ ...current, project_name: event.target.value }))} />
                    </label>
                    <label className="field-label">
                      Currency
                      <select className="control" value={settingsDraft.currency} onChange={(event) => setSettingsDraft((current) => ({ ...current, currency: event.target.value }))}>
                        <option value="KES">KES - Kenyan Shilling (Ksh)</option>
                        <option value="USD">USD - US Dollar ($)</option>
                        <option value="EUR">EUR - Euro (€)</option>
                        <option value="GBP">GBP - British Pound (£)</option>
                        <option value="JPY">JPY - Japanese Yen (¥)</option>
                        <option value="CNY">CNY - Chinese Yuan (¥)</option>
                        <option value="INR">INR - Indian Rupee (₹)</option>
                        <option value="NGN">NGN - Nigerian Naira (₦)</option>
                        <option value="ZAR">ZAR - South African Rand (R)</option>
                        <option value="TZS">TZS - Tanzanian Shilling (TSh)</option>
                        <option value="UGX">UGX - Ugandan Shilling (USh)</option>
                        <option value="RWF">RWF - Rwandan Franc (FRw)</option>
                        <option value="ETB">ETB - Ethiopian Birr (Br)</option>
                        <option value="GHS">GHS - Ghanaian Cedi (₵)</option>
                        <option value="XAF">XAF - Central African CFA (FCFA)</option>
                        <option value="XOF">XOF - West African CFA (CFA)</option>
                        <option value="MAD">MAD - Moroccan Dirham (DH)</option>
                        <option value="EGP">EGP - Egyptian Pound (E£)</option>
                        <option value="AED">AED - UAE Dirham (د.إ)</option>
                        <option value="SAR">SAR - Saudi Riyal (﷼)</option>
                        <option value="QAR">QAR - Qatari Riyal (﷼)</option>
                        <option value="KWD">KWD - Kuwaiti Dinar (د.ك)</option>
                        <option value="BHD">BHD - Bahraini Dinar (د.ب)</option>
                        <option value="OMR">OMR - Omani Riyal (﷼)</option>
                        <option value="ILS">ILS - Israeli Shekel (₪)</option>
                        <option value="TRY">TRY - Turkish Lira (₺)</option>
                        <option value="RUB">RUB - Russian Ruble (₽)</option>
                        <option value="CHF">CHF - Swiss Franc (Fr)</option>
                        <option value="SEK">SEK - Swedish Krona (kr)</option>
                        <option value="NOK">NOK - Norwegian Krone (kr)</option>
                        <option value="DKK">DKK - Danish Krone (kr)</option>
                        <option value="PLN">PLN - Polish Zloty (zł)</option>
                        <option value="CZK">CZK - Czech Koruna (Kč)</option>
                        <option value="HUF">HUF - Hungarian Forint (Ft)</option>
                        <option value="BRL">BRL - Brazilian Real (R$)</option>
                        <option value="MXN">MXN - Mexican Peso ($)</option>
                        <option value="ARS">ARS - Argentine Peso ($)</option>
                        <option value="CLP">CLP - Chilean Peso ($)</option>
                        <option value="COP">COP - Colombian Peso ($)</option>
                        <option value="CAD">CAD - Canadian Dollar ($)</option>
                        <option value="AUD">AUD - Australian Dollar (A$)</option>
                        <option value="NZD">NZD - New Zealand Dollar (NZ$)</option>
                        <option value="SGD">SGD - Singapore Dollar (S$)</option>
                        <option value="MYR">MYR - Malaysian Ringgit (RM)</option>
                        <option value="THB">THB - Thai Baht (฿)</option>
                        <option value="PHP">PHP - Philippine Peso (₱)</option>
                        <option value="IDR">IDR - Indonesian Rupiah (Rp)</option>
                        <option value="VND">VND - Vietnamese Dong (₫)</option>
                        <option value="KRW">KRW - South Korean Won (₩)</option>
                        <option value="PKR">PKR - Pakistani Rupee (₨)</option>
                        <option value="BDT">BDT - Bangladeshi Taka (৳)</option>
                        <option value="LKR">LKR - Sri Lankan Rupee (₨)</option>
                        <option value="NPR">NPR - Nepalese Rupee (₨)</option>
                        <option value="PEN">PEN - Peruvian Sol (S/)</option>
                      </select>
                    </label>
                    <label className="field-label">
                      Total Budget
                      <input className="control" type="number" min="0" step="0.01" value={settingsDraft.budget} onChange={(event) => setSettingsDraft((current) => ({ ...current, budget: event.target.value }))} />
                    </label>
                    <label className="field-label">
                      Project Manager Name
                      <input className="control" value={settingsDraft.pm_name} onChange={(event) => setSettingsDraft((current) => ({ ...current, pm_name: event.target.value }))} />
                    </label>
                    <label className="field-label">
                      Project Manager Contact
                      <input className="control" value={settingsDraft.pm_contact} onChange={(event) => setSettingsDraft((current) => ({ ...current, pm_contact: event.target.value }))} />
                    </label>
                    <label className="field-label">
                      Site Foreman/Supervisor
                      <input className="control" value={settingsDraft.foreman_name} onChange={(event) => setSettingsDraft((current) => ({ ...current, foreman_name: event.target.value }))} />
                    </label>
                    <label className="field-label">
                      Foreman Contact
                      <input className="control" value={settingsDraft.foreman_contact} onChange={(event) => setSettingsDraft((current) => ({ ...current, foreman_contact: event.target.value }))} />
                    </label>
                  </div>
                  <div className="mt-6 border-t border-border-subtle pt-5">
                    <h3 className="text-sm font-semibold text-ink mb-3">Export & Reporting</h3>
                    <div className="flex flex-wrap gap-2">
                      <button className="primary-button" onClick={saveSettings}>Save Settings</button>
                      <button className="secondary-button" onClick={exportWages}>Export Labor Costs (CSV)</button>
                      <button className="secondary-button" onClick={exportMaterials}>Export Materials (CSV)</button>
                      <button className="secondary-button" onClick={() => window.print()}>Print Report</button>
                    </div>
                  </div>
                </div>

                <div className="panel p-5" data-animate>
                  <SectionTitle eyebrow="Account" title="Account Settings" />
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-xs text-ink-muted">Name</p>
                        <p className="text-sm font-medium text-ink">{admin?.name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-muted">Phone</p>
                        <p className="text-sm font-medium text-ink">{admin?.phone || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-muted">Email</p>
                        <p className="text-sm font-medium text-ink">{admin?.email || "-"}</p>
                      </div>
                    </div>

                    <details className="rounded-lg border border-border-subtle bg-bg-deep/30">
                      <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-ink-muted transition hover:text-ink">
                        Change password
                      </summary>
                      <PasswordChangeForm adminId={admin?.id} notify={notify} />
                    </details>
                  </div>
                </div>

                <div className="panel p-5" data-animate>
                  <SectionTitle eyebrow="Administration" title="Admin Management" />
                  <div className="mt-4">
                    <AdminPanel />
                  </div>
                </div>

                <div className="panel p-5" data-animate>
                  <SectionTitle eyebrow="Notifications" title="Send Notification" />
                  <div className="mt-4">
                    <NotificationSender />
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

interface AdminUser {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string;
}

function AdminPanel() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetPhone, setResetPhone] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/admins");
    if (res.ok) setAdmins(await res.json());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addAdmin = async () => {
    if (!name.trim() || !password) { setMsg("Name and password required"); return; }
    setBusy(true);
    const res = await fetch("/api/auth/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim(), password }),
    });
    setBusy(false);
    if (res.ok) {
      setName(""); setPhone(""); setEmail(""); setPassword("");
      setMsg("Admin added");
      refresh();
    } else {
      const data = await res.json();
      setMsg(data.error || "Failed to add admin");
    }
  };

  const deleteAdmin = async (id: number) => {
    if (!confirm("Remove this admin?")) return;
    const res = await fetch(`/api/auth/admins/${id}`, { method: "DELETE" });
    if (res.ok) { setMsg("Admin removed"); refresh(); }
    else { const data = await res.json(); setMsg(data.error || "Failed to remove"); }
  };

  const handleReset = async () => {
    if (!resetPhone || !resetPassword) { setMsg("Phone and new password required"); return; }
    setBusy(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: resetPhone.trim(), newPassword: resetPassword }),
    });
    setBusy(false);
    const data = await res.json();
    setMsg(data.message || data.error || "Done");
  };

  return (
    <div className="space-y-4">
      {msg && (
        <div className="rounded-lg border border-amber/20 bg-amber/5 px-3 py-2 text-sm text-amber">
          {msg}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1.2fr_auto]">
        <input className="control" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="control" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="control" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="primary-button" disabled={busy} onClick={addAdmin}>Add Admin</button>
      </div>

      {admins.length > 0 && (
        <div className="panel table-shell mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Role</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium text-ink">{a.name}</td>
                  <td>{a.phone || "-"}</td>
                  <td>{a.email || "-"}</td>
                  <td><span className="status-pill status-paid">{a.role}</span></td>
                  <td className="table-actions">
                    {a.role !== "superadmin" && (
                      <button className="danger-text-button" onClick={() => deleteAdmin(a.id)}>Remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <details className="mt-4 rounded-lg border border-border-subtle bg-bg-deep/30">
        <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink transition">
          Reset password via phone
        </summary>
        <div className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto]">
          <input className="control" placeholder="Admin phone number" value={resetPhone} onChange={(e) => setResetPhone(e.target.value)} />
          <input className="control" type="password" placeholder="New password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
          <button className="primary-button" disabled={busy} onClick={handleReset}>Reset Password</button>
        </div>
      </details>
    </div>
  );
}

function PasswordChangeForm({ adminId, notify }: { adminId?: number; notify: (type: "success" | "error", message: string) => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = async () => {
    if (!currentPassword || !newPassword) { setMsg("Fill in all fields"); return; }
    if (newPassword.length < 4) { setMsg("New password must be at least 4 characters"); return; }
    if (newPassword !== confirmPassword) { setMsg("Passwords do not match"); return; }
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        notify("success", "Password changed successfully");
      } else {
        setMsg(data.error || "Failed to change password");
      }
    } catch { setMsg("Network error"); }
    setBusy(false);
  };

  return (
    <div className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
      <input className="control" type="password" placeholder="Current password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); setMsg(""); }} disabled={busy} />
      <input className="control" type="password" placeholder="New password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setMsg(""); }} disabled={busy} />
      <input className="control" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setMsg(""); }} disabled={busy} />
      <button className="primary-button" disabled={busy} onClick={handleChange}>
        {busy ? "Changing..." : "Save"}
      </button>
      {msg && <div className="col-span-full rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{msg}</div>}
    </div>
  );
}

function NotificationSender() {
  const [channel, setChannel] = useState("email");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  const send = async () => {
    if (!to || !message) { setResult("Recipient and message required"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, to: to.trim(), subject, message }),
      });
      const data = await res.json();
      setResult(data.success ? `Sent via ${channel} (${data.mode || "sent"})` : `Failed: ${data.error}`);
    } catch { setResult("Failed to send"); }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      {result && (
        <div className="rounded-lg border border-amber/20 bg-amber/5 px-3 py-2 text-sm text-amber">
          {result}
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-[0.8fr_1fr]">
        <select className="control" value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
        <input className="control" placeholder={channel === "email" ? "Email address" : "Phone number"} value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      {channel === "email" && (
        <input className="control" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      )}
      <textarea
        className="control min-h-[80px] resize-y"
        placeholder="Your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button className="primary-button" disabled={busy} onClick={send}>
        {busy ? "Sending..." : `Send via ${channel}`}
      </button>
    </div>
  );
}
