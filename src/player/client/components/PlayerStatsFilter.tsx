import { useCallback, useState } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import SeasonDropdown from '@/season/client/widgets/SeasonDropdown';
import { SeasonType } from '@/season/types';

type Filters = {
  season: SeasonType | null;
};

type Props = {
  onApply?: (filters: Filters) => void;
}

export default function PlayerStatsFilter({ onApply }: Props) {
  const [selectedSeason, setSelectedSeason] = useState<SeasonType | null>(null);

  const handleClear = useCallback(() => {
    setSelectedSeason(null);
    onApply?.({ season: null });
  }, [onApply]);

  const handleOnApply = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply?.({ season: selectedSeason });
  }, [onApply, selectedSeason]);

  return (
    <div className="flex-1 bg-white border border-[#EAEAEA] rounded-[12px] shadow-[0px_1px_3px_0px_#14181F0A]">
      <Disclosure defaultOpen>
        {({ open }) => (
          <>
            <div className="flex flex-row justify-between items-center px-[20px] py-[10px] lg:pb-0 lg:px-[30px] lg:pt-[24px]">
              <h3 className="text-[16px] text-black lg:text-[24px]">Filtros</h3>
              <DisclosureButton className="md:hidden flex items-center justify-center">
                <img src={`/assets/images/icons/${open ? 'icon-minus-circle' : 'icon-plus-circle'}.svg`} alt="" width="20" />
              </DisclosureButton>
            </div>
            <div className="md:block">
              <DisclosurePanel unmount={false} className="md:!block">
                <div className="p-[20px] pt-0 space-y-5 lg:pt-[20px] lg:px-[30px]">
                  <form
                    onSubmit={handleOnApply}
                    className="space-y-[20px]"
                  >
                    <div className="space-y-[5px]">
                      <label className="block font-barlow font-semibold text-[13px] text-[rgba(94,94,94,0.9)]">
                        Temporada
                      </label>
                      <SeasonDropdown
                        value={selectedSeason?.providerId}
                        onChange={setSelectedSeason}
                      />
                    </div>
                    <div className="flex gap-[10px]">
                      <button
                        type="button"
                        onClick={handleClear}
                        className="flex-1 border border-[#f3f3f3] bg-[#f3f3f3] px-3 py-1 rounded-[100px]"
                      >
                        <span className="text-[15px] text-[#0F171F]">Limpiar</span>
                      </button>
                      <button
                        type="submit"
                        className="flex-1 border border-[rgba(168,168,168,0.35)] bg-white px-3 py-1 rounded-[100px]"
                      >
                        <span className="text-[15px] text-[#0F171F]">Aplicar</span>
                      </button>
                    </div>
                  </form>
                </div>
              </DisclosurePanel>
            </div>
          </>
        )}
      </Disclosure>
    </div>
  );
}
