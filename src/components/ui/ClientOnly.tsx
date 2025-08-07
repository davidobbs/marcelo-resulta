'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ClientOnly: React.FC<ClientOnlyProps> = ({ 
  children, 
  fallback = null 
}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface ClientTimeProps {
  date: Date;
  options?: Intl.DateTimeFormatOptions;
  locale?: string;
  fallback?: string;
}

export const ClientTime: React.FC<ClientTimeProps> = ({ 
  date, 
  options = {}, 
  locale = 'pt-BR',
  fallback = '--:--:--'
}) => {
  return (
    <ClientOnly fallback={<span>{fallback}</span>}>
      <span>{date.toLocaleTimeString(locale, options)}</span>
    </ClientOnly>
  );
};

export const ClientDate: React.FC<ClientTimeProps> = ({ 
  date, 
  options = {}, 
  locale = 'pt-BR',
  fallback = '--/--/----'
}) => {
  return (
    <ClientOnly fallback={<span>{fallback}</span>}>
      <span>{date.toLocaleDateString(locale, options)}</span>
    </ClientOnly>
  );
};

export default ClientOnly;