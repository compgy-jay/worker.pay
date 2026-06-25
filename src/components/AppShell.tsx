"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEntranceAnimation, useCountUp } from "@/hooks/useEntranceAnimation";
import { downloadCsv, formatDate, formatMoney, mondayISO, toQueryString, todayISO } from "@/lib/format";
import DashboardHero from "@/components/DashboardHero";
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
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange">{eyebrow}</p>
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
  tone?: "slate" | "green" | "red" | "orange" | "blue";
  countKey?: number;
}) {
  const toneClass = {
    slate: "border-border-subtle",
    green: "border-emerald-300/20",
    red: "border-rose-300/20",
    orange: "border-orange/30",
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

export default function AppShell({ initialTab }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab || "dashboard");
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

  useEffect(() => {
    if (!contentRef.current || booting) return;
    const el = contentRef.current;
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    el.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
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

  const booted = useRef(false);

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
        booted.current = true;
        setBooting(false);
      })
      .catch(() => {
        if (!isCurrent) return;
        booted.current = true;
        setBooting(false);
        notify("error", "Failed to load project data");
      });

    return () => {
      isCurrent = false;
    };
  }, [notify]);

  useEffect(() => {
    if (!booted.current) return;
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
    if (!booted.current) return;
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

  return (
    <div ref={mainRef}>
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

      {booting ? (
        <div className="rounded-lg border border-orange/20 bg-orange/5 p-8 text-center text-orange">Loading project data...</div>
      ) : (
        <div ref={contentRef}>
          {tab === "dashboard" && (
            <section className="flex flex-col gap-6">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" data-animate>
                <MetricCard label="Total Spend" value={money(summary.grandTotal)} detail="Labor + Materials" tone="blue" countKey={summary.grandTotal} />
                <MetricCard label="Outstanding Labor" value={money(summary.unpaidTotal)} detail={`${summary.unpaidRecordCount} pending`} tone="red" countKey={summary.unpaidTotal} />
                <MetricCard label="Material Cost" value={money(summary.materialTotal)} detail={`${summary.materialCount} items`} tone="orange" countKey={summary.materialTotal} />
                <MetricCard label="Team Size" value={String(summary.workerCount)} detail={`${departments.length || 0} department(s)`} tone="green" countKey={summary.workerCount} />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]" data-animate>
                <div className="panel p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange/10">
                        <svg className="h-4 w-4 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-ink">Budget Utilization</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-ink-muted">
                        {summary.budget > 0
                          ? `${summary.budgetUsedPercent.toFixed(1)}% spent`
                          : "No budget set"}
                      </p>
                    </div>
                  </div>
                  <div className="progress-track mt-4">
                    <div
                      className={`progress-bar ${summary.budgetRemaining < 0 ? "progress-over" : ""}`}
                      style={{ width: `${Math.min(summary.budgetUsedPercent, 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-ink-muted">
                      {summary.budget > 0
                        ? `${money(summary.budgetRemaining)} remaining`
                        : "Set a budget in Settings"}
                    </span>
                    <span className="font-semibold text-ink">{summary.budget > 0 ? money(summary.budget) : "—"}</span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border-subtle bg-bg-surface/50 p-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                        <p className="text-xs uppercase tracking-[0.12em] text-ink-muted">Paid</p>
                      </div>
                      <p className="mt-1 font-semibold text-emerald-400">{money(summary.paidTotal)}</p>
                    </div>
                    <div className="rounded-lg border border-border-subtle bg-bg-surface/50 p-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.4)]" />
                        <p className="text-xs uppercase tracking-[0.12em] text-ink-muted">Pending</p>
                      </div>
                      <p className="mt-1 font-semibold text-rose-400">{money(summary.unpaidTotal)}</p>
                    </div>
                    <div className="rounded-lg border border-border-subtle bg-bg-surface/50 p-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-ink-muted shadow-[0_0_6px_rgba(138,138,154,0.4)]" />
                        <p className="text-xs uppercase tracking-[0.12em] text-ink-muted">Records</p>
                      </div>
                      <p className="mt-1 font-semibold text-ink">{summary.recordCount + summary.materialCount}</p>
                    </div>
                  </div>
                </div>

                <div className="panel p-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange/10">
                      <svg className="h-4 w-4 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-ink">Team Overview</h3>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    {departments.slice(0, 5).map((dept) => {
                      const count = workers.filter((w) => w.department === dept).length;
                      const pct = summary.workerCount > 0 ? (count / summary.workerCount) * 100 : 0;
                      return (
                        <div key={dept} className="flex items-center gap-3">
                          <span className="w-24 truncate text-sm text-ink-muted">{dept}</span>
                          <div className="progress-track flex-1">
                            <div className="progress-bar" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-sm font-semibold text-ink">{count}</span>
                        </div>
                      );
                    })}
                    {departments.length === 0 && (
                      <p className="text-sm text-ink-muted">No departments assigned yet.</p>
                    )}
                  </div>
                  <div className="mt-5 border-t border-border-subtle pt-4">
                    <div className="grid grid-cols-2 gap-2">
                      <button className="secondary-button justify-center" onClick={() => setTab("workers")}>
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Member
                      </button>
                      <button className="secondary-button justify-center" onClick={() => setTab("materials")}>
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                          <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                        Add Material
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2" data-animate>
                <div className="panel p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
                        <svg className="h-4 w-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-ink">Pending Labor</h3>
                    </div>
                    <button className="text-button" onClick={() => setTab("wages")}>
                      View all
                      <svg className="ml-1 inline-block h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    {unpaidRecords.slice(0, 5).map((record) => (
                      <div key={record.id} className="ledger-row">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-xs font-bold text-rose-400">
                            {record.worker_name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-ink">{record.worker_name}</p>
                            <p className="text-xs text-ink-muted">Week of {formatDate(record.week_start)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-rose-400">{money(record.amount)}</p>
                          <button className="text-button whitespace-nowrap" onClick={() => setRecordStatus(record.id, "paid")}>Mark paid</button>
                        </div>
                      </div>
                    ))}
                    {unpaidRecords.length === 0 && <EmptyState title="All labor costs settled" detail="Great! No pending payments." />}
                  </div>
                  {unpaidRecords.length > 5 && (
                    <p className="mt-3 text-center text-xs text-ink-muted">
                      +{unpaidRecords.length - 5} more pending {unpaidRecords.length - 5 === 1 ? "record" : "records"} — <button className="text-button inline" onClick={() => setTab("wages")}>view all</button>
                    </p>
                  )}
                </div>

                <div className="panel p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange/10">
                        <svg className="h-4 w-4 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                          <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-ink">Recent Materials</h3>
                    </div>
                    <button className="text-button" onClick={() => setTab("materials")}>
                      View all
                      <svg className="ml-1 inline-block h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    {materials.slice(0, 5).map((material) => (
                      <div key={material.id} className="ledger-row">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange/10">
                            <svg className="h-4 w-4 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 2 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-ink">{material.name}</p>
                            <p className="text-xs text-ink-muted">
                              {formatDate(material.date)}{material.category ? ` • ${material.category}` : ""}{material.supplier ? ` • ${material.supplier}` : ""}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-ink">{money(material.cost)}</p>
                      </div>
                    ))}
                    {materials.length === 0 && <EmptyState title="No materials recorded" detail="Add material costs as they occur." />}
                  </div>
                  {materials.length > 5 && (
                    <p className="mt-3 text-center text-xs text-ink-muted">
                      +{materials.length - 5} more {materials.length - 5 === 1 ? "entry" : "entries"} — <button className="text-button inline" onClick={() => setTab("materials")}>view all</button>
                    </p>
                  )}
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
                <MetricCard label="Project Pending" value={money(summary.unpaidTotal)} detail="All records" tone="orange" countKey={summary.unpaidTotal} />
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
                <MetricCard label="Visible Spend" value={money(visibleMaterialTotal)} detail={`${materials.length} items`} tone="orange" countKey={visibleMaterialTotal} />
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
                <SectionTitle eyebrow="Notifications" title="Send Notification" />
                <div className="mt-4">
                  <NotificationSender />
                </div>
              </div>
            </section>
          )}
        </div>
      )}
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
        <div className="rounded-lg border border-orange/20 bg-orange/5 px-3 py-2 text-sm text-orange">
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
