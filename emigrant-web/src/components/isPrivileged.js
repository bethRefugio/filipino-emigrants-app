import { useState, useEffect } from 'react';

/**
 * useUserRole - simple hook that exposes the current user (from localStorage)
 * and a reusable isPrivileged(role) helper.
 *
 * Usage:
 *   const { user, isPrivileged } = useUserRole();
 *   if (isPrivileged(user?.role)) { ... }
 */
export default function useUserRole() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const isPrivileged = (role) => {
    if (!role) return false;
    const r = String(role).toLowerCase();
    if (r === 'admin' || r.includes('admin')) return true;
    if (r.includes('government') || r.includes('official')) return true;
    return false;
  };

  return { user, isPrivileged };
}