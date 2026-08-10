'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import TeamPickerGrid from './TeamPickerGrid';
import { MAX_COMPARE_TEAMS, MIN_COMPARE_TEAMS } from './teams';

type Props = {
  open: boolean;
  onClose: () => void;
  selected: string[];
  onToggle: (code: string) => void;
};

export default function CompareTeamPickerDialog({
  open,
  onClose,
  selected,
  onToggle,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[999]">
      <div
        className="fixed inset-0 bg-[rgba(15,23,31,0.6)] transition-opacity duration-150"
        aria-hidden
      />
      <div className="fixed inset-0 flex items-end justify-center overflow-y-auto p-0 md:items-center md:p-4">
        <DialogPanel className="w-full max-w-[560px] rounded-t-[16px] border border-[#E2E2E2] bg-white p-[18px] shadow-[0px_2px_14px_rgba(14,20,32,0.08)] md:rounded-[16px] md:p-[24px]">
          <div className="mb-[14px] flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-[20px] text-[#0F171F] md:text-[24px]">
                Escoge los equipos
              </DialogTitle>
              <p className="mt-[4px] font-barlow font-medium text-[12px] text-[rgba(15,23,31,0.5)] md:text-[13px]">
                De {MIN_COMPARE_TEAMS} a {MAX_COMPARE_TEAMS} equipos. Toca uno
                seleccionado para quitarlo.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex h-[32px] w-[32px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#EAEAEA] transition-colors hover:border-[rgba(47,47,47,1)]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="#0F171F"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <TeamPickerGrid selected={selected} onToggle={onToggle} compact />

          <div className="mt-[16px] flex items-center justify-between gap-4">
            <span className="font-barlow font-medium text-[11px] text-[rgba(15,23,31,0.45)] md:text-[12px]">
              {selected.length} de {MAX_COMPARE_TEAMS} seleccionados
            </span>
            <button
              type="button"
              onClick={onClose}
              disabled={selected.length < MIN_COMPARE_TEAMS}
              className="cursor-pointer rounded-[100px] bg-[#0F171F] px-[18px] py-[7px] text-[15px] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ver comparación
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
