'use client';

import { SeasonType } from '@/season/types';
import { useSeasonConnection } from '../hooks/season';

type Props = {
  value?: string;
  onChange: (season: SeasonType | null) => void;
  placeholder?: string;
};

export default function SeasonDropdown({ value, onChange, placeholder }: Props) {
  const { seasons, loading } = useSeasonConnection();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const season = seasons.find((s) => s.providerId === e.target.value);
    onChange(season || null);
  };

  return (
    <select
      value={value ?? ''}
      onChange={handleChange}
      disabled={loading}
      className="border border-[#D4D4D4] bg-[#fafafa] h-[40px] px-[20px] py-1.5 rounded-[6px] text-sm text-[rgba(0,0,0,0.8)] disabled:opacity-50 w-full"
    >
      {loading ? (
        <option value="">Cargando...</option>
      ) : (
        <option value="">{placeholder ?? 'Seleccionar temporada'}</option>
      )}
      {seasons.map((season) => (
        <option key={season.providerId} value={season.providerId}>
          {season.name}
        </option>
      ))}
    </select>
  );
}
