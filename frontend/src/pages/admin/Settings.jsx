// frontend/src/pages/admin/Settings.jsx

import {
  useEffect,
  useState,
} from "react";

import axiosInstance from "../../api/axiosInstance";

import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  ShieldCheck,
  Bell,
  Building2,
  Clock3,
  Palette,
  Lock,
} from "lucide-react";

const Settings = () => {
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState({
      companyName:
        "ResolveHub",
      supportEmail:
        "support@resolvehub.com",
      timezone:
        "Asia/Kolkata",
      theme:
        "light",

      defaultPriority:
        "medium",

      autoCloseDays:
        7,

      slaLow:
        72,

      slaMedium:
        48,

      slaHigh:
        24,

      requireResolutionNote:
        true,

      emailAlerts:
        true,

      newComplaintAlert:
        true,

      slaBreachAlert:
        true,

      dailySummary:
        false,

      minPasswordLength:
        8,

      sessionExpiryHours:
        24,
    });

  // =====================================
  // LOAD SETTINGS
  // =====================================
  useEffect(() => {
    const loadData =
      async () => {
        try {
          const res =
            await axiosInstance.get(
              "/admin/settings"
            );

          if (
            res.data
          ) {
            setForm(
              (
                prev
              ) => ({
                ...prev,
                ...res.data,
              })
            );
          }
        } catch (
          error
        ) {
          console.log(
            error
          );
        } finally {
          setLoading(
            false
          );
        }
      };

    loadData();
  }, []);

  // =====================================
  // CHANGE
  // =====================================
  const handleChange =
    (e) => {
      const {
        name,
        value,
        type,
        checked,
      } = e.target;

      setForm(
        (
          prev
        ) => ({
          ...prev,
          [name]:
            type ===
            "checkbox"
              ? checked
              : value,
        })
      );
    };

  // =====================================
  // SAVE
  // =====================================
  const handleSave =
    async () => {
      try {
        setSaving(
          true
        );

        await axiosInstance.put(
          "/admin/settings",
          form
        );
      } catch (
        error
      ) {
        console.log(
          error
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  const Card = ({
    title,
    desc,
    icon,
    children,
  }) => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
          {icon}
        </div>

        <div>
          <h3 className="font-bold text-slate-800">
            {title}
          </h3>

          <p className="text-sm text-slate-500">
            {desc}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const Input = ({
    label,
    ...props
  }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <input
        {...props}
        className="w-full h-11 border rounded-2xl px-4 outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const Select = ({
    label,
    children,
    ...props
  }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <select
        {...props}
        className="w-full h-11 border rounded-2xl px-4 outline-none focus:ring-2 focus:ring-blue-500"
      >
        {children}
      </select>
    </div>
  );

  const Toggle = ({
    label,
    name,
    checked,
  }) => (
    <label className="flex items-center justify-between border rounded-2xl px-4 py-3 cursor-pointer">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        type="checkbox"
        name={name}
        checked={
          checked
        }
        onChange={
          handleChange
        }
      />
    </label>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center text-slate-500">
        <Loader2 className="animate-spin mr-2" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-sm mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>
              <p className="text-blue-100 text-sm">
                System Administration
              </p>

              <h1 className="text-4xl font-bold mt-2">
                Settings
              </h1>

              <p className="text-blue-100 mt-3">
                Configure workflows, branding, notifications, and security.
              </p>
            </div>

            <button
              onClick={
                handleSave
              }
              disabled={
                saving
              }
              className="h-12 px-6 rounded-2xl bg-white text-blue-700 font-semibold flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Settings
                </>
              )}
            </button>

          </div>

        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* GENERAL */}
          <Card
            title="General"
            desc="Portal information and appearance"
            icon={<Building2 size={18} />}
          >
            <Input
              label="Company Name"
              name="companyName"
              value={
                form.companyName
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="Support Email"
              name="supportEmail"
              value={
                form.supportEmail
              }
              onChange={
                handleChange
              }
            />

            <Select
              label="Timezone"
              name="timezone"
              value={
                form.timezone
              }
              onChange={
                handleChange
              }
            >
              <option value="Asia/Kolkata">
                Asia/Kolkata
              </option>
              <option value="UTC">
                UTC
              </option>
            </Select>

            <Select
              label="Theme"
              name="theme"
              value={
                form.theme
              }
              onChange={
                handleChange
              }
            >
              <option value="light">
                Light
              </option>
              <option value="dark">
                Dark
              </option>
            </Select>
          </Card>

          {/* SLA */}
          <Card
            title="Complaint Rules"
            desc="Priority defaults and SLA timings"
            icon={<Clock3 size={18} />}
          >
            <Select
              label="Default Priority"
              name="defaultPriority"
              value={
                form.defaultPriority
              }
              onChange={
                handleChange
              }
            >
              <option value="low">
                Low
              </option>
              <option value="medium">
                Medium
              </option>
              <option value="high">
                High
              </option>
            </Select>

            <Input
              label="Auto Close After (Days)"
              type="number"
              name="autoCloseDays"
              value={
                form.autoCloseDays
              }
              onChange={
                handleChange
              }
            />

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Low SLA (hrs)"
                type="number"
                name="slaLow"
                value={
                  form.slaLow
                }
                onChange={
                  handleChange
                }
              />

              <Input
                label="Medium SLA"
                type="number"
                name="slaMedium"
                value={
                  form.slaMedium
                }
                onChange={
                  handleChange
                }
              />

              <Input
                label="High SLA"
                type="number"
                name="slaHigh"
                value={
                  form.slaHigh
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <Toggle
              label="Require Resolution Notes"
              name="requireResolutionNote"
              checked={
                form.requireResolutionNote
              }
            />
          </Card>

          {/* NOTIFICATIONS */}
          <Card
            title="Notifications"
            desc="Admin alerts and updates"
            icon={<Bell size={18} />}
          >
            <Toggle
              label="Email Alerts"
              name="emailAlerts"
              checked={
                form.emailAlerts
              }
            />

            <Toggle
              label="New Complaint Alert"
              name="newComplaintAlert"
              checked={
                form.newComplaintAlert
              }
            />

            <Toggle
              label="SLA Breach Alert"
              name="slaBreachAlert"
              checked={
                form.slaBreachAlert
              }
            />

            <Toggle
              label="Daily Summary"
              name="dailySummary"
              checked={
                form.dailySummary
              }
            />
          </Card>

          {/* SECURITY */}
          <Card
            title="Security"
            desc="Authentication and access policies"
            icon={<Lock size={18} />}
          >
            <Input
              label="Minimum Password Length"
              type="number"
              name="minPasswordLength"
              value={
                form.minPasswordLength
              }
              onChange={
                handleChange
              }
            />

            <Input
              label="Session Expiry (Hours)"
              type="number"
              name="sessionExpiryHours"
              value={
                form.sessionExpiryHours
              }
              onChange={
                handleChange
              }
            />

            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 flex items-center gap-2">
              <ShieldCheck size={16} />
              Security best practices enabled.
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default Settings;