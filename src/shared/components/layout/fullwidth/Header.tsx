'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CloseButton,
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverPanel,
} from '@headlessui/react';
import { useState, useRef, useEffect } from 'react';

export default function HeaderBoxLayout() {
  const [isOpen, setIsOpen] = useState(false);
  const equiposButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <div
        className="py-[10px] sm:py-[20px]"
      >
        <div className="container">
          <div className="flex flex-row justify-between items-center">
            <div>
              <Link href="/">
                <img
                  src="/assets/images/bsn-logo.svg"
                  alt="BSN"
                  width="113"
                  className="w-[68px] md:w-[113px]"
                />
              </Link>
            </div>
            <div className="md:hidden">
              <button
                className="w-[42px] h-[42px] flex justify-center items-center rounded-full cursor-pointer"
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow:
                    '0 0 1.5px rgba(0, 0, 0, 0.1), 0 1px 6px rgba(0, 0, 0, 0.15), inset 0 0.5px 0.5px rgba(255, 255, 255, 0.06)',
                  borderRadius: '100px',
                }}
              >
                <img
                  src="/assets/images/icons/icon-bars.svg"
                  alt="Menu"
                  width="18"
                  height="14"
                />
              </button>
            </div>
            <div className="hidden md:block">
              <ul className="flex flex-row gap-[20px] lg:gap-[30px]">
                <li>
                  <Link href="/calendario" className="text-[20px] text-white">
                    Calendario
                  </Link>
                </li>
                <li className="hidden">
                  <Link href="/playoffs" className="text-[20px] text-white">
                    Playoffs
                  </Link>
                </li>
                <li>
                  <Link href="/noticias" className="text-[20px] text-white">
                    Noticias
                  </Link>
                </li>
                <li>
                  <Popover>
                    {({ open, close }) => (
                    <div
                      onMouseEnter={() => { if (!open) equiposButtonRef.current?.click(); }}
                      onMouseLeave={() => close()}
                    >
                    <PopoverButton ref={equiposButtonRef} className="flex items-center gap-1.5 cursor-pointer text-[20px] text-white focus-visible:outline-none data-open:border-b-1 data-open:border-white data-open:text-[rgba(255,255,255,0.7)]">
                      Equipos
                      <img
                        src="/assets/images/icons/chevron-mobile-menu.svg"
                        alt=""
                        className="w-[10px] opacity-70 rotate-180"
                      />
                    </PopoverButton>
                    <PopoverPanel
                      transition
                      anchor="bottom"
                      className="bg-white border border-[#E2E2E2] mt-4 rounded-[12px] shadow-[0px_1px_15px_0px_#5858581A] transition duration-200 ease-in-out data-closed:-translate-y-1 data-closed:opacity-0 z-[999]"
                    >
                      <div className="grid grid-cols-3 gap-[10px] p-[20px] min-w-[348px]">
                        <Link href="/equipos/AGU">
                          <div className="bg-white border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px] hover:border-[rgba(47,47,47,1)]">
                            <div className="flex flex-col justify-center items-center gap-0.5">
                              <img
                                src="/assets/images/teams/Aguada.png"
                                alt=""
                                height="46"
                                width="46"
                              />
                              <p className="text-sm text-[#0F171F]">Santeros</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/equipos/ARE">
                          <div className="bg-white border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px] hover:border-[rgba(47,47,47,1)]">
                            <div className="flex flex-col justify-center items-center gap-0.5">
                              <img
                                src="/assets/images/teams/Arecibo.png"
                                alt=""
                                height="46"
                                width="46"
                              />
                              <p className="text-sm text-[#0F171F]">
                                Capitanes
                              </p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/equipos/BAY">
                          <div className="bg-white border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px] hover:border-[rgba(47,47,47,1)]">
                            <div className="flex flex-col justify-center items-center gap-0.5">
                              <img
                                src="/assets/images/teams/Bayamon.png"
                                alt=""
                                height="46"
                                width="46"
                              />
                              <p className="text-sm text-[#0F171F]">Vaqueros</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/equipos/CAG">
                          <div className="bg-white border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px] hover:border-[rgba(47,47,47,1)]">
                            <div className="flex flex-col justify-center items-center gap-0.5">
                              <img
                                src="/assets/images/teams/Caguas.png"
                                alt=""
                                height="46"
                                width="46"
                              />
                              <p className="text-sm text-[#0F171F]">Criollos</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/equipos/CAR">
                          <div className="bg-white border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px] hover:border-[rgba(47,47,47,1)]">
                            <div className="flex flex-col justify-center items-center gap-0.5">
                              <img
                                src="/assets/images/teams/Carolina.png"
                                alt=""
                                height="46"
                                width="46"
                              />
                              <p className="text-sm text-[#0F171F]">Gigantes</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/equipos/GBO">
                          <div className="bg-white border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px] hover:border-[rgba(47,47,47,1)]">
                            <div className="flex flex-col justify-center items-center gap-0.5">
                              <img
                                src="/assets/images/teams/Guaynabo.png"
                                alt=""
                                height="46"
                                width="46"
                              />
                              <p className="text-sm text-[#0F171F]">Mets</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/equipos/MAN">
                          <div className="bg-white border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px] hover:border-[rgba(47,47,47,1)]">
                            <div className="flex flex-col justify-center items-center gap-0.5">
                              <img
                                src="/assets/images/teams/Manati.png"
                                alt=""
                                height="46"
                                width="46"
                              />
                              <p className="text-sm text-[#0F171F]">Osos</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/equipos/MAY">
                          <div className="bg-white border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px] hover:border-[rgba(47,47,47,1)]">
                            <div className="flex flex-col justify-center items-center gap-0.5">
                              <img
                                src="/assets/images/teams/Mayaguez.png"
                                alt=""
                                height="46"
                                width="46"
                              />
                              <p className="text-sm text-[#0F171F]">Indios</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/equipos/PON">
                          <div className="bg-white border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px] hover:border-[rgba(47,47,47,1)]">
                            <div className="flex flex-col justify-center items-center gap-0.5">
                              <img
                                src="/assets/images/teams/Ponce.png"
                                alt=""
                                height="46"
                                width="46"
                              />
                              <p className="text-sm text-[#0F171F]">Leones</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/equipos/QUE">
                          <div className="bg-white border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px] hover:border-[rgba(47,47,47,1)]">
                            <div className="flex flex-col justify-center items-center gap-0.5">
                              <img
                                src="/assets/images/teams/Quebradillas.png"
                                alt=""
                                height="46"
                                width="46"
                              />
                              <p className="text-sm text-[#0F171F]">Piratas</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/equipos/SGE">
                          <div className="bg-white border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px] hover:border-[rgba(47,47,47,1)]">
                            <div className="flex flex-col justify-center items-center gap-0.5">
                              <img
                                src="/assets/images/teams/San-German.png"
                                alt=""
                                height="46"
                                width="46"
                              />
                              <p className="text-sm text-[#0F171F]">
                                Atléticos
                              </p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/equipos/SCE">
                          <div className="bg-white border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px] hover:border-[rgba(47,47,47,1)]">
                            <div className="flex flex-col justify-center items-center gap-0.5">
                              <img
                                src="/assets/images/teams/Santurce.png"
                                alt=""
                                height="46"
                                width="46"
                              />
                              <p className="text-sm text-[#0F171F]">
                                Cangrejeros
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </PopoverPanel>
                    </div>
                    )}
                  </Popover>
                  {/* <ul>
                    <li>
                      <Link
                        href="/equipos/agu"
                        className="text-[20px] text-white"
                      >
                        Criollos
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/equipos/sce"
                        className="text-[20px] text-white"
                      >
                        Cangrejeros
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/equipos/bay"
                        className="text-[20px] text-white"
                      >
                        Vaqueros
                      </Link>
                    </li>
                  </ul> */}
                </li>
                <li className="hidden">
                  <Link href="/jugadores" className="text-[20px] text-white">
                    Jugadores
                  </Link>
                </li>
                <li className="hidden">
                  <Link href="/estadisticas" className="text-[20px] text-white">
                    Estadísticas
                  </Link>
                </li>
              </ul>
            </div>
            <div className="hidden lg:block">
              <ul className="flex flex-row">
                <li className="flex items-center justify-center h-[40px] w-[40px]">
                  <a
                    href="https://www.instagram.com/bsnpr/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="/assets/images/icons/social/icon-instagram.svg"
                      alt=""
                    />
                  </a>
                </li>
                <li className="flex items-center justify-center h-[40px] w-[40px]">
                  <a
                    href="https://www.facebook.com/bsnpr/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="/assets/images/icons/social/icon-facebook.svg"
                      alt=""
                    />
                  </a>
                </li>
                <li className="flex items-center justify-center h-[40px] w-[40px]">
                  <a
                    href="https://x.com/bsnpr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src="/assets/images/icons/social/icon-x.svg" alt="" />
                  </a>
                </li>
                <li className="flex items-center justify-center h-[40px] w-[40px]">
                  <a
                    href="https://www.tiktok.com/@bsnpr?lang=en"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="/assets/images/icons/social/icon-tiktok.svg"
                      alt=""
                    />
                  </a>
                </li>
                <li className="flex items-center justify-center h-[40px] w-[40px]">
                  <a
                    href="https://www.youtube.com/@BaloncestoSuperiorNacionalPR"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="/assets/images/icons/social/icon-youtube.svg"
                      alt=""
                    />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/*
        Mount Dialog only while open so Headless UI cannot leave a stale full-screen
        layer after close/hydration (fixes mobile web: content flashes then dark overlay).
      */}
      {isOpen ? (
        <Dialog
          open
          onClose={() => setIsOpen(false)}
          className="relative z-50"
        >
        <div className="fixed inset-0 flex h-screen w-screen">
          <DialogPanel className="bg-[#171819] w-full py-[10px]">
            <div className="container">
              <div className="flex justify-end">
                <CloseButton
                  onClick={() => setIsOpen(false)}
                  className="bg-[#252933] cursor-pointer rounded-full w-[42px] h-[42px] flex justify-center items-center"
                >
                  <img src="/assets/images/icons/icon-close.svg" alt="Close" />
                </CloseButton>
              </div>
            </div>
            <ul className="divide-y divide-[rgba(255,255,255,0.05)]">
              <li className="px-[30px]">
                <Link href="/" className="block py-[8px]">
                  <span className="text-[36px] text-white">Inicio</span>
                </Link>
              </li>
              <li className="px-[30px]">
                <Link href="/calendario" className="block py-[8px]">
                  <span className="text-[36px] text-white">Calendario</span>
                </Link>
              </li>
              <li className="px-[30px]">
                <Link href="/noticias" className="block py-[8px]">
                  <span className="text-[36px] text-white">Noticias</span>
                </Link>
              </li>
              <li className="px-[30px] hidden">
                <Link href="/jugadores" className="block py-[8px]">
                  <span className="text-[36px] text-white">Jugadores</span>
                </Link>
              </li>
              <li className="px-[30px]">
                <div className="py-[8px]">
                  <Disclosure>
                    {({ open }) => (
                      <>
                        <DisclosureButton className="cursor-pointer text-[36px] text-left text-white w-full flex items-center justify-between">
                          <span>Equipos</span>
                          <img
                            src="/assets/images/icons/chevron-mobile-menu.svg"
                            alt=""
                            className={`w-[18px] transition-transform duration-150 ${
                              open ? 'rotate-0' : 'rotate-180'
                            }`}
                          />
                        </DisclosureButton>
                        <DisclosurePanel>
                    <div className="grid grid-cols-4 gap-[12px] pb-[24px] pt-[12px]">
                      <Link href="/equipos/AGU">
                        <div className="bg-[rgba(54,54,54,0.1)] border border-[rgba(174,174,174,0.21)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                          <div className="flex flex-col justify-center items-center gap-0.5">
                            <img
                              src="/assets/images/teams/Aguada.png"
                              alt=""
                              height="48"
                              width="48"
                            />
                          </div>
                        </div>
                      </Link>
                      <Link href="/equipos/ARE">
                        <div className="bg-[rgba(54,54,54,0.1)] border border-[rgba(174,174,174,0.21)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                          <div className="flex flex-col justify-center items-center gap-0.5">
                            <img
                              src="/assets/images/teams/Arecibo.png"
                              alt=""
                              height="48"
                              width="48"
                            />
                          </div>
                        </div>
                      </Link>
                      <Link href="/equipos/BAY">
                        <div className="bg-[rgba(54,54,54,0.1)] border border-[rgba(174,174,174,0.21)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                          <div className="flex flex-col justify-center items-center gap-0.5">
                            <img
                              src="/assets/images/teams/Bayamon.png"
                              alt=""
                              height="48"
                              width="48"
                            />
                          </div>
                        </div>
                      </Link>
                      <Link href="/equipos/CAG">
                        <div className="bg-[rgba(54,54,54,0.1)] border border-[rgba(174,174,174,0.21)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                          <div className="flex flex-col justify-center items-center gap-0.5">
                            <img
                              src="/assets/images/teams/Caguas.png"
                              alt=""
                              height="48"
                              width="48"
                            />
                          </div>
                        </div>
                      </Link>
                      <Link href="/equipos/CAR">
                        <div className="bg-[rgba(54,54,54,0.1)] border border-[rgba(174,174,174,0.21)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                          <div className="flex flex-col justify-center items-center gap-0.5">
                            <img
                              src="/assets/images/teams/Carolina.png"
                              alt=""
                              height="48"
                              width="48"
                            />
                          </div>
                        </div>
                      </Link>
                      <Link href="/equipos/GBO">
                        <div className="bg-[rgba(54,54,54,0.1)] border border-[rgba(174,174,174,0.21)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                          <div className="flex flex-col justify-center items-center gap-0.5">
                            <img
                              src="/assets/images/teams/Guaynabo.png"
                              alt=""
                              height="48"
                              width="48"
                            />
                          </div>
                        </div>
                      </Link>
                      <Link href="/equipos/MAN">
                        <div className="bg-[rgba(54,54,54,0.1)] border border-[rgba(174,174,174,0.21)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                          <div className="flex flex-col justify-center items-center gap-0.5">
                            <img
                              src="/assets/images/teams/Manati.png"
                              alt=""
                              height="48"
                              width="48"
                            />
                          </div>
                        </div>
                      </Link>
                      <Link href="/equipos/MAY">
                        <div className="bg-[rgba(54,54,54,0.1)] border border-[rgba(174,174,174,0.21)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                          <div className="flex flex-col justify-center items-center gap-0.5">
                            <img
                              src="/assets/images/teams/Mayaguez.png"
                              alt=""
                              height="48"
                              width="48"
                            />
                          </div>
                        </div>
                      </Link>
                      <Link href="/equipos/PON">
                        <div className="bg-[rgba(54,54,54,0.1)] border border-[rgba(174,174,174,0.21)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                          <div className="flex flex-col justify-center items-center gap-0.5">
                            <img
                              src="/assets/images/teams/Ponce.png"
                              alt=""
                              height="48"
                              width="48"
                            />
                          </div>
                        </div>
                      </Link>
                      <Link href="/equipos/QUE">
                        <div className="bg-[rgba(54,54,54,0.1)] border border-[rgba(174,174,174,0.21)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                          <div className="flex flex-col justify-center items-center gap-0.5">
                            <img
                              src="/assets/images/teams/Quebradillas.png"
                              alt=""
                              height="48"
                              width="48"
                            />
                          </div>
                        </div>
                      </Link>
                      <Link href="/equipos/SGE">
                        <div className="bg-[rgba(54,54,54,0.1)] border border-[rgba(174,174,174,0.21)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                          <div className="flex flex-col justify-center items-center gap-0.5">
                            <img
                              src="/assets/images/teams/San-German.png"
                              alt=""
                              height="48"
                              width="48"
                            />
                          </div>
                        </div>
                      </Link>
                      <Link href="/equipos/SCE">
                        <div className="bg-[rgba(54,54,54,0.1)] border border-[rgba(174,174,174,0.21)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                          <div className="flex flex-col justify-center items-center gap-0.5">
                            <img
                              src="/assets/images/teams/Santurce.png"
                              alt=""
                              height="48"
                              width="48"
                            />
                          </div>
                        </div>
                      </Link>
                    </div>
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>
                </div>
              </li>
              <li className="px-[30px] hidden">
                <Link href="/estadisticas" className="block py-[8px]">
                  <span className="text-[36px] text-white">Estadísticas</span>
                </Link>
              </li>
            </ul>
          </DialogPanel>
        </div>
        </Dialog>
      ) : null}
    </>
  );
}
