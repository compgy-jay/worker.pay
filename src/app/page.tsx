"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { downloadCsv, formatDate, formatMoney, mondayISO, toQueryString, todayISO } from "@/lib/format";
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
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
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "slate" | "green" | "red" | "amber" | "blue";
}) {
  const toneClass = {
    slate: "border-slate-200",
    green: "border-emerald-300",
    red: "border-rose-300",
    amber: "border-amber-300",
    blue: "border-blue-300",
  }[tone];

  return (
    <div className={`metric-card ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
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

  const tabs: { key: Tab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "workers", label: "Workers" },
    { key: "wages", label: "Wages" },
    { key: "materials", label: "Materials" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {notice && (
        <div className={`notice ${notice.type === "success" ? "notice-success" : "notice-error"}`}>
          {notice.message}
        </div>
      )}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Project cost control</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950 md:text-3xl">
                {settings?.project_name || "House Project Manager"}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {settings?.foreman_name ? `Foreman: ${settings.foreman_name}` : "Track wages, materials, and budget in one place."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="secondary-button" onClick={() => window.print()}>
                Print Report
              </button>
              <button className="primary-button" onClick={() => setTab("wages")}>
                Record Wage
              </button>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto border-b border-slate-200">
            {tabs.map((item) => (
              <button
                key={item.key}
                className={`tab-button ${tab === item.key ? "tab-button-active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
        {booting ? (
          <div className="panel p-8 text-center text-slate-600">Loading project ledger...</div>
        ) : (
          <>
            {tab === "dashboard" && (
              <section className="flex flex-col gap-6">
                <SectionTitle eyebrow="Overview" title="Project health" />

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Grand Total" value={money(summary.grandTotal)} detail="Wages plus material costs" tone="blue" />
                  <MetricCard label="Unpaid Wages" value={money(summary.unpaidTotal)} detail={`${summary.unpaidRecordCount} open wage record(s)`} tone="red" />
                  <MetricCard label="Materials" value={money(summary.materialTotal)} detail={`${summary.materialCount} material entry(s)`} tone="amber" />
                  <MetricCard label="Workers" value={String(summary.workerCount)} detail={`${departments.length || 0} department(s)`} tone="green" />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="panel p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">Budget progress</h3>
                        <p className="text-sm text-slate-600">
                          {summary.budget > 0
                            ? `${money(summary.budgetRemaining)} remaining from ${money(summary.budget)}`
                            : "Set a project budget in Settings to track burn rate."}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {summary.budget > 0 ? `${summary.budgetUsedPercent.toFixed(1)}% used` : "No budget"}
                      </span>
                    </div>
                    <div className="progress-track mt-4">
                      <div
                        className={`progress-bar ${summary.budgetRemaining < 0 ? "progress-over" : ""}`}
                        style={{ width: `${Math.min(summary.budgetUsedPercent, 100)}%` }}
                      />
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Paid</p>
                        <p className="mt-1 font-semibold text-emerald-700">{money(summary.paidTotal)}</p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Unpaid</p>
                        <p className="mt-1 font-semibold text-rose-700">{money(summary.unpaidTotal)}</p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Records</p>
                        <p className="mt-1 font-semibold text-slate-900">{summary.recordCount + summary.materialCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="panel p-5">
                    <h3 className="text-lg font-semibold text-slate-950">Quick actions</h3>
                    <div className="mt-4 grid gap-2">
                      <button className="secondary-button justify-between" onClick={() => setTab("workers")}>
                        Register or edit workers
                        <span>{workers.length}</span>
                      </button>
                      <button className="secondary-button justify-between" onClick={() => setTab("materials")}>
                        Add material expense
                        <span>{materials.length}</span>
                      </button>
                      <button className="secondary-button justify-between" onClick={() => setTab("settings")}>
                        Update budget/settings
                        <span>{currency}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="panel p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-950">Open wage follow-up</h3>
                      <button className="text-button" onClick={() => setTab("wages")}>View all</button>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      {unpaidRecords.slice(0, 6).map((record) => (
                        <div key={record.id} className="ledger-row">
                          <div>
                            <p className="font-medium text-slate-900">{record.worker_name}</p>
                            <p className="text-sm text-slate-500">{formatDate(record.week_start)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-rose-700">{money(record.amount)}</p>
                            <button className="text-button" onClick={() => setRecordStatus(record.id, "paid")}>Mark paid</button>
                          </div>
                        </div>
                      ))}
                      {unpaidRecords.length === 0 && <EmptyState title="No unpaid wages" detail="Nice. Every visible wage record is settled." />}
                    </div>
                  </div>

                  <div className="panel p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-950">Recent material spend</h3>
                      <button className="text-button" onClick={() => setTab("materials")}>View all</button>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      {materials.slice(0, 6).map((material) => (
                        <div key={material.id} className="ledger-row">
                          <div>
                            <p className="font-medium text-slate-900">{material.name}</p>
                            <p className="text-sm text-slate-500">
                              {formatDate(material.date)} {material.category ? `- ${material.category}` : ""}
                            </p>
                          </div>
                          <p className="font-semibold text-slate-900">{money(material.cost)}</p>
                        </div>
                      ))}
                      {materials.length === 0 && <EmptyState title="No material costs" detail="Add materials as purchases happen." />}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {tab === "workers" && (
              <section className="flex flex-col gap-5">
                <SectionTitle eyebrow="People" title="Worker register" />

                <div className="panel p-5">
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
                      placeholder="Department"
                      value={workerDraft.department}
                      onChange={(event) => setWorkerDraft((current) => ({ ...current, department: event.target.value }))}
                    />
                    <button className="primary-button" onClick={addWorker}>Register</button>
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
                                <td className="font-medium text-slate-900">{worker.name}</td>
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
                  eyebrow="Payroll"
                  title="Wage ledger"
                  action={<button className="secondary-button" onClick={exportWages}>Export CSV</button>}
                />

                <div className="panel p-5">
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                    <select className="control" value={salaryWorkerId} onChange={(event) => setSalaryWorkerId(event.target.value)}>
                      <option value="">Select worker</option>
                      {workers.map((worker) => (
                        <option key={worker.id} value={worker.id}>{worker.name}</option>
                      ))}
                    </select>
                    <input className="control" type="date" value={salaryWeekStart} onChange={(event) => setSalaryWeekStart(event.target.value)} />
                    <input className="control" type="number" min="0" step="0.01" placeholder="Weekly pay" value={salaryAmount} onChange={(event) => setSalaryAmount(event.target.value)} />
                    <button className="primary-button" onClick={addSalaryRecord}>Record</button>
                  </div>
                </div>

                <div className="filter-bar">
                  <input className="control min-w-0 flex-1" placeholder="Search worker, phone, department" value={salaryFilters.query} onChange={(event) => setSalaryFilters((current) => ({ ...current, query: event.target.value }))} />
                  <select className="control" value={salaryFilters.workerId} onChange={(event) => setSalaryFilters((current) => ({ ...current, workerId: event.target.value }))}>
                    <option value="">All workers</option>
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>{worker.name}</option>
                    ))}
                  </select>
                  <select className="control" value={salaryFilters.status} onChange={(event) => setSalaryFilters((current) => ({ ...current, status: event.target.value as SalaryFilters["status"] }))}>
                    <option value="all">All statuses</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                  <input className="control" type="date" value={salaryFilters.from} onChange={(event) => setSalaryFilters((current) => ({ ...current, from: event.target.value }))} />
                  <input className="control" type="date" value={salaryFilters.to} onChange={(event) => setSalaryFilters((current) => ({ ...current, to: event.target.value }))} />
                  <button className="secondary-button" onClick={() => setSalaryFilters({ workerId: "", status: "all", from: "", to: "", query: "" })}>Reset</button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <MetricCard label="Visible wages" value={money(visibleWageTotal)} detail={`${salaryRecords.length} record(s)`} tone="blue" />
                  <MetricCard label="Open in view" value={money(unpaidRecords.reduce((total, record) => total + record.amount, 0))} detail={`${unpaidRecords.length} unpaid record(s)`} tone="red" />
                  <MetricCard label="Project unpaid" value={money(summary.unpaidTotal)} detail="Across all filters" tone="amber" />
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
                                    <p className="font-medium text-slate-900">{record.worker_name}</p>
                                    {record.worker_department && <p className="text-xs text-slate-500">{record.worker_department}</p>}
                                  </td>
                                  <td>{record.worker_contact || "-"}</td>
                                  <td className="font-semibold text-slate-900">{money(record.amount)}</td>
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
                  eyebrow="Procurement"
                  title="Materials ledger"
                  action={<button className="secondary-button" onClick={exportMaterials}>Export CSV</button>}
                />

                <div className="panel p-5">
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_0.5fr_0.5fr_0.7fr_0.8fr_0.8fr_auto]">
                    <input className="control" placeholder="Material" value={materialDraft.name} onChange={(event) => setMaterialDraft((current) => ({ ...current, name: event.target.value }))} />
                    <input className="control" type="number" min="0" step="0.01" placeholder="Qty" value={materialDraft.quantity} onChange={(event) => setMaterialDraft((current) => ({ ...current, quantity: event.target.value }))} />
                    <input className="control" placeholder="Unit" value={materialDraft.unit} onChange={(event) => setMaterialDraft((current) => ({ ...current, unit: event.target.value }))} />
                    <input className="control" type="number" min="0" step="0.01" placeholder="Cost" value={materialDraft.cost} onChange={(event) => setMaterialDraft((current) => ({ ...current, cost: event.target.value }))} />
                    <input className="control" placeholder="Category" value={materialDraft.category} onChange={(event) => setMaterialDraft((current) => ({ ...current, category: event.target.value }))} />
                    <input className="control" type="date" value={materialDraft.date} onChange={(event) => setMaterialDraft((current) => ({ ...current, date: event.target.value }))} />
                    <button className="primary-button" onClick={addMaterial}>Add</button>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input className="control" placeholder="Supplier" value={materialDraft.supplier} onChange={(event) => setMaterialDraft((current) => ({ ...current, supplier: event.target.value }))} />
                    <input className="control" placeholder="Notes" value={materialDraft.notes} onChange={(event) => setMaterialDraft((current) => ({ ...current, notes: event.target.value }))} />
                  </div>
                </div>

                <div className="filter-bar">
                  <input className="control min-w-0 flex-1" placeholder="Search material, supplier, notes" value={materialFilters.query} onChange={(event) => setMaterialFilters((current) => ({ ...current, query: event.target.value }))} />
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
                  <MetricCard label="Visible spend" value={money(visibleMaterialTotal)} detail={`${materials.length} entry(s)`} tone="amber" />
                  <MetricCard label="Project spend" value={money(summary.materialTotal)} detail="All material costs" tone="blue" />
                  <MetricCard label="Categories" value={String(materialCategories.length)} detail="Visible material groups" tone="green" />
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
                                    <p className="font-medium text-slate-900">{material.name}</p>
                                    {material.notes && <p className="text-xs text-slate-500">{material.notes}</p>}
                                  </td>
                                  <td>{material.category || "-"}</td>
                                  <td>{material.quantity} {material.unit}</td>
                                  <td>{material.supplier || "-"}</td>
                                  <td className="font-semibold text-slate-900">{money(material.cost)}</td>
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
                <SectionTitle eyebrow="Project" title="Settings and reporting" />

                <div className="panel p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="field-label">
                      Project name
                      <input className="control" value={settingsDraft.project_name} onChange={(event) => setSettingsDraft((current) => ({ ...current, project_name: event.target.value }))} />
                    </label>
                    <label className="field-label">
                      Currency
                      <input className="control uppercase" maxLength={3} value={settingsDraft.currency} onChange={(event) => setSettingsDraft((current) => ({ ...current, currency: event.target.value.toUpperCase() }))} />
                    </label>
                    <label className="field-label">
                      Project budget
                      <input className="control" type="number" min="0" step="0.01" value={settingsDraft.budget} onChange={(event) => setSettingsDraft((current) => ({ ...current, budget: event.target.value }))} />
                    </label>
                    <label className="field-label">
                      Project manager
                      <input className="control" value={settingsDraft.pm_name} onChange={(event) => setSettingsDraft((current) => ({ ...current, pm_name: event.target.value }))} />
                    </label>
                    <label className="field-label">
                      Project manager phone
                      <input className="control" value={settingsDraft.pm_contact} onChange={(event) => setSettingsDraft((current) => ({ ...current, pm_contact: event.target.value }))} />
                    </label>
                    <label className="field-label">
                      Foreman
                      <input className="control" value={settingsDraft.foreman_name} onChange={(event) => setSettingsDraft((current) => ({ ...current, foreman_name: event.target.value }))} />
                    </label>
                    <label className="field-label">
                      Foreman phone
                      <input className="control" value={settingsDraft.foreman_contact} onChange={(event) => setSettingsDraft((current) => ({ ...current, foreman_contact: event.target.value }))} />
                    </label>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button className="primary-button" onClick={saveSettings}>Save Settings</button>
                    <button className="secondary-button" onClick={exportWages}>Export Wages</button>
                    <button className="secondary-button" onClick={exportMaterials}>Export Materials</button>
                    <button className="secondary-button" onClick={() => window.print()}>Print Report</button>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
