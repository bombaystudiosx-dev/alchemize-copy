import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Paywall removed - all users have full access
export default function Premium() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(createPageUrl('Home'), { replace: true });
  }, [navigate]);

  return null;
}
