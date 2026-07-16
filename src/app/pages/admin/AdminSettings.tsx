import { useState } from 'react';
import { KeyRound, Lock, RefreshCw, ShieldCheck, Trash2, UserPlus, Users, X } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { getStoredAdminToken } from '../../utils/adminAuth';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'admin' | 'customer';
  isSuperAdmin?: boolean;
}

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const emptyAdminForm = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function requireAdminToken() {
  const token = getStoredAdminToken();

  if (!token) {
    throw new Error('Your admin session has expired. Sign in again.');
  }

  return token;
}

export function AdminSettings() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isAdminSaving, setIsAdminSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAdmins = async (password = superAdminPassword) => {
    try {
      setIsLoadingAdmins(true);
      const token = requireAdminToken();
      const result = await apiRequest<AdminUser[]>('/admin/users', {
        auth: true,
        token,
        headers: { 'X-Super-Admin-Password': password },
      });
      setAdmins(result.filter((user) => user.role === 'admin'));
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Unable to load admin users.');
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  const handleUnlockSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setUnlockError('');
    setAdminError('');

    const password = unlockPassword.trim();

    if (!password) {
      setUnlockError('Enter the super admin password to open settings.');
      return;
    }

    try {
      setIsUnlocking(true);
      const token = requireAdminToken();
      await apiRequest<{ success: boolean }>('/admin/super-admin/verify', {
        method: 'POST',
        auth: true,
        token,
        body: { password },
      });
      setSuperAdminPassword(password);
      setUnlockPassword('');
      setIsUnlocked(true);
      await loadAdmins(password);
    } catch (error) {
      setUnlockError(error instanceof Error ? error.message : 'Unable to verify super admin password.');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    try {
      setIsPasswordSaving(true);
      const token = requireAdminToken();
      const isChangingSuperAdminPassword = passwordForm.currentPassword === superAdminPassword;
      await apiRequest<{ success: boolean }>('/admin/password', {
        method: 'PATCH',
        auth: true,
        token,
        body: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      });
      if (isChangingSuperAdminPassword) {
        setSuperAdminPassword(passwordForm.newPassword);
      }
      setPasswordForm(emptyPasswordForm);
      setPasswordMessage('Admin password updated successfully.');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Unable to update password.');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handleAdminSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAdminMessage('');
    setAdminError('');
    setDeleteMessage('');

    if (adminForm.password !== adminForm.confirmPassword) {
      setAdminError('Admin passwords do not match.');
      return;
    }

    if (adminForm.password.length < 8) {
      setAdminError('Admin password must be at least 8 characters.');
      return;
    }

    try {
      setIsAdminSaving(true);
      const token = requireAdminToken();
      const createdAdmin = await apiRequest<AdminUser>('/admin/users', {
        method: 'POST',
        auth: true,
        token,
        body: {
          firstName: adminForm.firstName,
          lastName: adminForm.lastName,
          username: adminForm.username,
          email: adminForm.email,
          password: adminForm.password,
          superAdminPassword,
        },
      });
      setAdmins((current) => [createdAdmin, ...current.filter((admin) => admin.id !== createdAdmin.id)]);
      setAdminForm(emptyAdminForm);
      setAdminMessage(`${createdAdmin.firstName} ${createdAdmin.lastName} can now sign in as an admin.`);
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Unable to create admin user.');
    } finally {
      setIsAdminSaving(false);
    }
  };

  const handleDeleteSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setDeleteError('');
    setDeleteMessage('');

    if (!adminToDelete) return;

    const password = deletePassword.trim();

    if (!password) {
      setDeleteError('Enter the super admin password before removing this admin.');
      return;
    }

    try {
      setIsDeleting(true);
      const token = requireAdminToken();
      await apiRequest<{ success: boolean }>(`/admin/users/${adminToDelete.id}`, {
        method: 'DELETE',
        auth: true,
        token,
        body: { superAdminPassword: password },
      });
      setAdmins((current) => current.filter((admin) => admin.id !== adminToDelete.id));
      setDeleteMessage(`${adminToDelete.firstName} ${adminToDelete.lastName} was removed from admin access.`);
      setAdminToDelete(null);
      setDeletePassword('');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Unable to remove admin user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const lockSettings = () => {
    setIsUnlocked(false);
    setSuperAdminPassword('');
    setUnlockPassword('');
    setAdmins([]);
    setAdminError('');
    setAdminMessage('');
    setPasswordError('');
    setPasswordMessage('');
    setDeleteError('');
    setDeleteMessage('');
    setAdminToDelete(null);
    setDeletePassword('');
  };

  if (!isUnlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
        <section className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Verification</h1>
              <p className="text-sm text-gray-600">Enter the super admin password to open admin settings.</p>
            </div>
          </div>

          {unlockError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{unlockError}</div>}

          <form className="space-y-4" onSubmit={handleUnlockSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Super Admin Password</label>
              <input
                type="password"
                value={unlockPassword}
                onChange={(event) => setUnlockPassword(event.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                autoFocus
                required
              />
            </div>
            <button
              type="submit"
              disabled={isUnlocking}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <KeyRound className="h-4 w-4" />
              {isUnlocking ? 'Verifying...' : 'Unlock Settings'}
            </button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
            <ShieldCheck className="h-4 w-4" />
            Super Admin Approved
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="mt-2 text-gray-600">Manage admin passwords and create or remove admin accounts with super admin approval.</p>
        </div>
        <button
          type="button"
          onClick={lockSettings}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
        >
          <Lock className="h-4 w-4" />
          Lock Settings
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Change Admin Password</h2>
              <p className="text-sm text-gray-600">Update the password for the admin account currently signed in.</p>
            </div>
          </div>

          {passwordMessage && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{passwordMessage}</div>}
          {passwordError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{passwordError}</div>}

          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                minLength={8}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isPasswordSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
            >
              <KeyRound className="h-4 w-4" />
              {isPasswordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Admin</h2>
              <p className="text-sm text-gray-600">Create another admin after super admin approval.</p>
            </div>
          </div>

          {adminMessage && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{adminMessage}</div>}
          {adminError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{adminError}</div>}

          <form className="space-y-4" onSubmit={handleAdminSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">First Name</label>
                <input
                  value={adminForm.firstName}
                  onChange={(event) => setAdminForm((current) => ({ ...current, firstName: event.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Last Name</label>
                <input
                  value={adminForm.lastName}
                  onChange={(event) => setAdminForm((current) => ({ ...current, lastName: event.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Username</label>
                <input
                  value={adminForm.username}
                  onChange={(event) => setAdminForm((current) => ({ ...current, username: event.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Email</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(event) => setAdminForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Password</label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(event) => setAdminForm((current) => ({ ...current, password: event.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Confirm Password</label>
                <input
                  type="password"
                  value={adminForm.confirmPassword}
                  onChange={(event) => setAdminForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none"
                  minLength={8}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isAdminSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
            >
              <UserPlus className="h-4 w-4" />
              {isAdminSaving ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-100 p-3 text-gray-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Current Admins</h2>
              <p className="text-sm text-gray-600">{admins.length} admin account{admins.length === 1 ? '' : 's'} can manage the website.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadAdmins()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingAdmins ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {deleteMessage && <div className="mx-5 mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 sm:mx-6">{deleteMessage}</div>}

        <div className="divide-y divide-gray-200">
          {isLoadingAdmins && <div className="p-6 text-gray-500">Loading admin accounts...</div>}
          {!isLoadingAdmins && admins.length === 0 && <div className="p-6 text-gray-500">No admin accounts found.</div>}
          {!isLoadingAdmins && admins.map((admin) => (
            <div key={admin.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="font-semibold text-gray-900">{admin.firstName} {admin.lastName}</div>
                <div className="text-sm text-gray-500">{admin.email}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">{admin.username}</span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">{admin.isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminToDelete(admin);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  disabled={admin.isSuperAdmin}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {adminToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/50 p-4">
          <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Remove Admin Access</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Enter the super admin password to remove {adminToDelete.firstName} {adminToDelete.lastName}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdminToDelete(null);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close remove admin dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {deleteError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</div>}

            <form className="space-y-4" onSubmit={handleDeleteSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Super Admin Password</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-red-500 focus:outline-none"
                  autoFocus
                  required
                />
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAdminToDelete(null);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? 'Removing...' : 'Remove Admin'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
