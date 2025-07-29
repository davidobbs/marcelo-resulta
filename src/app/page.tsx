'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4">
          <div className="w-full h-full bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">⚽</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Club Finance Pilot
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Carregando sistema...
        </p>
        <div className="spinner mx-auto"></div>
      </div>
    </div>
  );
} 