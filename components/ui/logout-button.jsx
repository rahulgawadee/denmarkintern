'use client';

import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton({ variant = 'ghost', size = 'default', className = '' }) {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const locale = params?.locale || 'da';

  const handleLogout = () => {
    dispatch(logout());
    router.push(`/${locale}/auth/login`);
  };

  const copy = locale === 'da' ? {
    logout: 'Log ud',
  } : {
    logout: 'Logout',
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {copy.logout}
    </Button>
  );
}
