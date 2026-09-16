import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  CheckSquare,
  Square,
  ShieldCheck,
  Key,
  Edit2,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  ExternalLink,
  ChevronDown,
  UserCheck,
  UserX,
  X,
  Save,
} from 'lucide-react';
import { User } from '../../types';

interface AdminUserManagementProps {
  usersList: User[];
  token: string | null;
  onRefreshUsers: () => Promise<void>;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  usersList,
  token,
  onRefreshUsers,
}) => {
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'facilitator' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'graduated' | 'pending'>('all');

  // Multi-selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'facilitator' | 'student'>('student');
  const [editDept, setEditDept] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended' | 'graduated' | 'pending'>('active');
  const [editTrack, setEditTrack] = useState('');
  const [editLevel, setEditLevel] = useState(100);
  const [savingEdit, setSavingEdit] = useState(false);

  // Reset Credentials Modal
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [newPinVal, setNewPinVal] = useState('');
  const [resettingCreds, setResettingCreds] = useState(false);

  // Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'facilitator' | 'student'>('student');
  const [newUserDept, setNewUserDept] = useState('School of Technology');
  const [newUserLevel, setNewUserLevel] = useState(100);
  const [newUserTrack, setNewUserTrack] = useState('Computer Fundamentals & IT Tools');
  const [creatingUser, setCreatingUser] = useState(false);

  // Safe Users List
  const safeUsers = Array.isArray(usersList) ? usersList : [];

  // Filtered Users
  const filteredUsers = safeUsers.filter((u) => {
    if (!u) return false;
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const idNum = (u.idNumber || '').toLowerCase();
    const dept = (u.department || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      name.includes(query) ||
      email.includes(query) ||
      idNum.includes(query) ||
      dept.includes(query);

    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ? true : u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Toggle selection
  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u._id));
    }
  };

  const handleToggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Bulk Status Update (Activate / Suspend)
  const handleBulkStatusChange = async (targetStatus: 'active' | 'suspended') => {
    if (selectedUserIds.length === 0) return;
    setBulkActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/users/bulk-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userIds: selectedUserIds,
          status: targetStatus,
        }),
      });

      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: `Successfully updated ${selectedUserIds.length} user(s) to ${targetStatus}!`,
        });
        setSelectedUserIds([]);
        await onRefreshUsers();
      } else {
        const d = await res.json();
        setStatusMessage({ type: 'error', text: d.error || 'Failed bulk update.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error occurred.' });
    } finally {
      setBulkActionLoading(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // CSV Export
  const handleExportCSV = (selectedOnly = false) => {
    const listToExport = selectedOnly
      ? safeUsers.filter((u) => selectedUserIds.includes(u._id))
      : filteredUsers;

    if (listToExport.length === 0) {
      alert('No user records to export.');
      return;
    }

    const headers = ['User ID', 'Full Name', 'Email', 'Role', 'Department', 'Program Level', 'Status', 'Issue Date'];
    const rows = listToExport.map((u) => [
      `"${u.idNumber}"`,
      `"${u.fullName || u.name}"`,
      `"${u.email}"`,
      `"${u.role.toUpperCase()}"`,
      `"${u.department || 'N/A'}"`,
      `"${u.programLevel || 100}"`,
      `"${u.status.toUpperCase()}"`,
      `"${u.issueDate || 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StartSmart_User_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Single User Status Toggle
  const handleToggleSingleStatus = async (targetUser: User) => {
    const nextStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await fetch(`/api/users/${targetUser._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        await onRefreshUsers();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Edit User Details
  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditFullName(user.fullName || user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditDept(user.department || 'School of Technology');
    setEditStatus((user.status as any) || 'active');
    setEditTrack(user.programTrack || 'Computer Fundamentals & IT Tools');
    setEditLevel(user.programLevel || 100);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: editName,
          fullName: editFullName,
          email: editEmail,
          role: editRole,
          department: editDept,
          status: editStatus,
          programTrack: editTrack,
          programLevel: editLevel,
        }),
      });
      if (res.ok) {
        setEditingUser(null);
        await onRefreshUsers();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update user.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Reset Credentials Submit
  const handleResetCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;

    if (!newPasswordVal && !newPinVal) {
      alert('Please enter a new password or a new 5-digit PIN.');
      return;
    }

    if (newPinVal && !/^\d{5}$/.test(newPinVal.trim())) {
      alert('Security PIN must be exactly 5 numeric digits.');
      return;
    }

    setResettingCreds(true);
    try {
      const res = await fetch(`/api/users/${resetTargetUser._id}/reset-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          newPassword: newPasswordVal.trim() || undefined,
          newPin: newPinVal.trim() || undefined,
        }),
      });

      if (res.ok) {
        alert(`Security credentials updated for ${resetTargetUser.name}!`);
        setResetTargetUser(null);
        setNewPasswordVal('');
        setNewPinVal('');
        await onRefreshUsers();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to reset credentials.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    } finally {
      setResettingCreds(false);
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) {
      alert('Name and Email are required.');
      return;
    }
    setCreatingUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newUserName,
          fullName: newUserName,
          email: newUserEmail,
          role: newUserRole,
          department: newUserDept,
          programLevel: newUserLevel,
          programTrack: newUserTrack,
        }),
      });
      if (res.ok) {
        setShowAddUserModal(false);
        setNewUserName('');
        setNewUserEmail('');
        await onRefreshUsers();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to create user.');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred.');
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Notification Alert */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
          }`}
        >
          <span className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {statusMessage.text}
          </span>
          <button type="button" onClick={() => setStatusMessage(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Controls Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
        {/* Header with Add & Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Institutional User Directory & Role-Based Access Control (RBAC)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage student accounts, instructors, and executive admins. Total records: {safeUsers.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportCSV(false)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Download entire directory as CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Filter Controls: Role Tabs + Status Dropdown + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Role Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl">
            {(['all', 'student', 'facilitator', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  roleFilter === r
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r === 'all' ? 'All Roles' : `${r}s`}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
              <option value="graduated">Graduated Only</option>
              <option value="pending">Pending Review</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, SST-ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Sticky Bulk Action Banner if rows selected */}
        {selectedUserIds.length > 0 && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-xs font-bold">
                {selectedUserIds.length} Selected
              </span>
              <span className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
                Bulk administrative actions available for selected accounts:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={bulkActionLoading}
                onClick={() => handleBulkStatusChange('active')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Activate</span>
              </button>
              <button
                type="button"
                disabled={bulkActionLoading}
                onClick={() => handleBulkStatusChange('suspended')}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Suspend</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportCSV(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
              >
                Export Selected (.CSV)
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserIds([])}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white px-1 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Users Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">User & Identity</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">ID Number</th>
                <th className="py-3 px-3">Department & Track</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                    No users match the selected query and filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUserIds.includes(u._id);
                  return (
                    <tr
                      key={u._id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${
                        isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectUser(u._id)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatarUrl || 'https://i.imgur.com/J1pnjB4.png'}
                            alt={u.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://i.imgur.com/J1pnjB4.png';
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs leading-tight">
                              {u.fullName || u.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            u.role === 'admin'
                              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                              : u.role === 'facilitator'
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                              : 'bg-blue-100 dark:bg-sky-500/20 text-blue-700 dark:text-sky-300 border-blue-200 dark:border-sky-500/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-700 dark:text-amber-400 text-xs">
                        {u.idNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 text-xs">
                        <p className="font-medium">{u.department || 'School of Technology'}</p>
                        {u.programTrack && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                            {u.programTrack} {u.programLevel ? `(L${u.programLevel})` : ''}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {u.status === 'suspended' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Suspended
                          </span>
                        ) : u.status === 'graduated' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Graduated
                          </span>
                        ) : u.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                            title="Edit User Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setResetTargetUser(u);
                              setNewPasswordVal('');
                              setNewPinVal('');
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                            title="Reset Security Password & 5-Digit PIN"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleSingleStatus(u)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${
                              u.status === 'suspended'
                                ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                            }`}
                          >
                            {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Edit User Profile: {editingUser.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  ID: {editingUser.idNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="student">Student</option>
                    <option value="facilitator">Facilitator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="graduated">Graduated</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Level
                  </label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value={100}>Level 100</option>
                    <option value={200}>Level 200</option>
                    <option value={300}>Level 300</option>
                    <option value={400}>Level 400</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Program Track
                </label>
                <input
                  type="text"
                  value={editTrack}
                  onChange={(e) => setEditTrack(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingEdit ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Credentials Modal */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Reset Credentials: {resetTargetUser.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  ID: {resetTargetUser.idNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetTargetUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetCredentialsSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password (Optional if only resetting PIN)
                </label>
                <input
                  type="text"
                  placeholder="Enter new alphanumeric password"
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    New 5-Digit Security PIN (Optional if only resetting Pass)
                  </label>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold">
                    {newPinVal.length}/5
                  </span>
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="e.g. 58291"
                  value={newPinVal}
                  onChange={(e) => {
                    const nums = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setNewPinVal(nums);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono tracking-widest text-center"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resettingCreds || (!newPasswordVal && !newPinVal)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  {resettingCreds ? 'Updating...' : 'Save New Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Register New Academic User
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Provision an official student or faculty credential
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john.doe@startsmart.tech"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="student">Student</option>
                    <option value="facilitator">Facilitator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Level
                  </label>
                  <select
                    value={newUserLevel}
                    onChange={(e) => setNewUserLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value={100}>100 Foundation</option>
                    <option value={200}>200 Intermediate</option>
                    <option value={300}>300 Advanced</option>
                    <option value={400}>400 Capstone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
                >
                  {creatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
