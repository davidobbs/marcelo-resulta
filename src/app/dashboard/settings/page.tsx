'use client';

import React from 'react';
import { Globe, Palette, Bell } from 'lucide-react';
import { countryProfiles } from '@/lib/country-data';
import { useCountry } from '@/stores/useAppStore';

function CountrySelector() {
  const { selectedCountryCode, setCountry } = useCountry();

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(event.target.value);
  };

  return (
                  <div className="form-group">
      <label htmlFor="country-selector" className="form-label">
        País de Operação
                      </label>
                    <select
        id="country-selector"
                      className="form-select"
        value={selectedCountryCode}
        onChange={handleCountryChange}
      >
        {Object.values(countryProfiles).map((profile) => (
          <option key={profile.code} value={profile.code}>
            {profile.name} ({profile.currency.symbol})
          </option>
        ))}
                    </select>
      <p className="form-help-text">
        A seleção do país ajustará automaticamente os impostos, taxas e leis trabalhistas aplicáveis.
                    </p>
                  </div>
  );
}


export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Configurações</h1>

      <div className="space-y-10">
        <div className="card">
          <div className="card-header">
            <Globe className="w-6 h-6 mr-3 text-blue-600" />
            <h2 className="text-xl font-semibold">Internacionalização</h2>
                    </div>
          <div className="card-body">
            <CountrySelector />
                  </div>
                </div>

        <div className="card">
          <div className="card-header">
            <Palette className="w-6 h-6 mr-3 text-purple-600" />
            <h2 className="text-xl font-semibold">Aparência</h2>
          </div>
          <div className="card-body">
            <p className="text-gray-500">Em breve: Opções de tema (claro/escuro) e personalização de cores.</p>
                    </div>
                  </div>

        <div className="card">
          <div className="card-header">
            <Bell className="w-6 h-6 mr-3 text-orange-600" />
            <h2 className="text-xl font-semibold">Notificações</h2>
                  </div>
          <div className="card-body">
            <p className="text-gray-500">Em breve: Configurações de alerta e notificações por e-mail.</p>
            </div>
        </div>
      </div>
    </div>
  );
} 
