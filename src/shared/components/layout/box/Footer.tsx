import Link from 'next/link';

export default function FooterBoxLayout() {
  return (
    <section className="bg-[#0F171F] py-[50px]">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-3">
            <p className="md:mb-[58px]">
              <a href="#">
                <img src="/assets/images/logo.png" alt="" />
              </a>
            </p>
            <p className="mb-4">
              <a
                href="#"
                className="font-barlow font-medium text-[20px] text-neutral-500"
              >
                #LaMásDura
              </a>
            </p>
            <div className="flex flex-row gap-[13px] items-center mb-4">
              <a
                href="#"
                className="border border-[rgba(125,125,125,0.24)] flex items-center justify-center h-[40px] w-[40px] rounded-full"
              >
                <img
                  src="/assets/images/icons/social/icon-instagram.svg"
                  alt=""
                />
              </a>
              <a
                href="#"
                className="border border-[rgba(125,125,125,0.24)] flex items-center justify-center h-[40px] w-[40px] rounded-full"
              >
                <img
                  src="/assets/images/icons/social/icon-facebook.svg"
                  alt=""
                />
              </a>
              <a
                href="#"
                className="border border-[rgba(125,125,125,0.24)] flex items-center justify-center h-[40px] w-[40px] rounded-full"
              >
                <img
                  src="/assets/images/icons/social/icon-youtube.svg"
                  alt=""
                />
              </a>
              <a
                href="#"
                className="border border-[rgba(125,125,125,0.24)] flex items-center justify-center h-[40px] w-[40px] rounded-full"
              >
                <img src="/assets/images/icons/social/icon-x.svg" alt="" />
              </a>
              <a
                href="#"
                className="border border-[rgba(125,125,125,0.24)] flex items-center justify-center h-[40px] w-[40px] rounded-full"
              >
                <img src="/assets/images/icons/social/icon-tiktok.svg" alt="" />
              </a>
            </div>
          </div>
          <div className="md:col-span-6 lg:col-span-3">
            <div className="mb-4 md:mb-6 lg:mb-8">
              <h4 className="font-barlow font-medium text-[13px] text-neutral-600 text-center md:text-right lg:text-left">
                MENÚ
              </h4>
            </div>
            <ul className="mb-6">
              <li className="text-center md:text-right lg:text-left">
                <a
                  href="#"
                  className="font-special-gothic-condensed-one text-white text-[26px]"
                >
                  Inicio
                </a>
              </li>
              <li className="text-center md:text-right lg:text-left">
                <a
                  href="#"
                  className="font-special-gothic-condensed-one text-white text-[26px]"
                >
                  Calendario
                </a>
              </li>
              <li className="text-center md:text-right lg:text-left">
                <a
                  href="#"
                  className="font-special-gothic-condensed-one text-white text-[26px]"
                >
                  Noticias
                </a>
              </li>
              <li className="text-center md:text-right lg:text-left">
                <a
                  href="#"
                  className="font-special-gothic-condensed-one text-white text-[26px]"
                >
                  Jugadores
                </a>
              </li>
              <li className="text-center md:text-right lg:text-left">
                <a
                  href="#"
                  className="font-special-gothic-condensed-one text-white text-[26px]"
                >
                  Estadísticas
                </a>
              </li>
            </ul>
          </div>
          <div className="md:col-span-12 lg:col-span-6">
            <div className="mb-4 md:mb-6 lg:mb-8">
              <h4 className="font-barlow font-medium text-[13px] text-neutral-600 text-center md:text-left">
                EQUIPOS
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-[6px] mb-6 md:grid-cols-4 lg:grid-cols-6">
              <Link href="/equipos/AGU">
                <div className="bg-[rgba(56,56,56,0.14)] border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                  <div className="flex flex-col justify-center items-center">
                    <img
                      src="/assets/images/teams/Aguada.png"
                      alt=""
                      height="56"
                      width="56"
                    />
                    <p className="font-special-gothic-condensed-one text-sm text-white">
                      Santeros
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/equipos/ARE">
                <div className="bg-[rgba(56,56,56,0.14)] border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                  <div className="flex flex-col justify-center items-center">
                    <img
                      src="/assets/images/teams/Arecibo.png"
                      alt=""
                      height="56"
                      width="56"
                    />
                    <p className="font-special-gothic-condensed-one text-sm text-white">
                      Capitanes
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/equipos/BAY">
                <div className="bg-[rgba(56,56,56,0.14)] border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                  <div className="flex flex-col justify-center items-center">
                    <img
                      src="/assets/images/teams/Bayamon.png"
                      alt=""
                      height="56"
                      width="56"
                    />
                    <p className="font-special-gothic-condensed-one text-sm text-white">
                      Vaqueros
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/equipos/CAG">
                <div className="bg-[rgba(56,56,56,0.14)] border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                  <div className="flex flex-col justify-center items-center">
                    <img
                      src="/assets/images/teams/Caguas.png"
                      alt=""
                      height="56"
                      width="56"
                    />
                    <p className="font-special-gothic-condensed-one text-sm text-white">
                      Criollos
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/equipos/CAR">
                <div className="bg-[rgba(56,56,56,0.14)] border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                  <div className="flex flex-col justify-center items-center">
                    <img
                      src="/assets/images/teams/Carolina.png"
                      alt=""
                      height="56"
                      width="56"
                    />
                    <p className="font-special-gothic-condensed-one text-sm text-white">
                      Gigantes
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/equipos/GUA">
                <div className="bg-[rgba(56,56,56,0.14)] border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                  <div className="flex flex-col justify-center items-center">
                    <img
                      src="/assets/images/teams/Guaynabo.png"
                      alt=""
                      height="56"
                      width="56"
                    />
                    <p className="font-special-gothic-condensed-one text-sm text-white">
                      Mets
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/equipos/MAN">
                <div className="bg-[rgba(56,56,56,0.14)] border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                  <div className="flex flex-col justify-center items-center">
                    <img
                      src="/assets/images/teams/Manati.png"
                      alt=""
                      height="56"
                      width="56"
                    />
                    <p className="font-special-gothic-condensed-one text-sm text-white">
                      Osos
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/equipos/MAY">
                <div className="bg-[rgba(56,56,56,0.14)] border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                  <div className="flex flex-col justify-center items-center">
                    <img
                      src="/assets/images/teams/Mayaguez.png"
                      alt=""
                      height="56"
                      width="56"
                    />
                    <p className="font-special-gothic-condensed-one text-sm text-white">
                      Indios
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/equipos/PON">
                <div className="bg-[rgba(56,56,56,0.14)] border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                  <div className="flex flex-col justify-center items-center">
                    <img
                      src="/assets/images/teams/Ponce.png"
                      alt=""
                      height="56"
                      width="56"
                    />
                    <p className="font-special-gothic-condensed-one text-sm text-white">
                      Leones
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/equipos/QUE">
                <div className="bg-[rgba(56,56,56,0.14)] border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                  <div className="flex flex-col justify-center items-center">
                    <img
                      src="/assets/images/teams/Quebradillas.png"
                      alt=""
                      height="56"
                      width="56"
                    />
                    <p className="font-special-gothic-condensed-one text-sm text-white">
                      Piratas
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/equipos/SGE">
                <div className="bg-[rgba(56,56,56,0.14)] border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                  <div className="flex flex-col justify-center items-center">
                    <img
                      src="/assets/images/teams/San-German.png"
                      alt=""
                      height="56"
                      width="56"
                    />
                    <p className="font-special-gothic-condensed-one text-sm text-white">
                      Atléticos
                    </p>
                  </div>
                </div>
              </Link>
              <Link href="/equipos/SCE">
                <div className="bg-[rgba(56,56,56,0.14)] border border-[rgba(125,125,125,0.13)] flex flex-col rounded-[10px] justify-center items-center p-[10px]">
                  <div className="flex flex-col justify-center items-center">
                    <img
                      src="/assets/images/teams/Santurce.png"
                      alt=""
                      height="56"
                      width="56"
                    />
                    <p className="font-special-gothic-condensed-one text-sm text-white">
                      Cangrejeros
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-t-[rgba(255,255,255,0.12)] my-[20px]" />
        <div className="flex flex-row justify-between items-center">
          <div>
            <p className="font-barlow text-xs text-neutral-500">
              © Baloncesto Superior Nacional 2026. Todos los derechos
              reservados.
            </p>
            <p className="font-barlow text-xs text-neutral-500">
              <a href="#" className="underline">
                Términos y condiciones
              </a>{' '}
              |{' '}
              <a href="#" className="underline">
                Política de privacidad
              </a>
              . Diseñado en Puerto Rico por{' '}
              <a href="#" className="underline">
                Lamonte
              </a>
              .
            </p>
          </div>
          <div className="flex flex-row gap-[10px] items-center">
            <a href="#">
              <img
                src="/assets/images/downlad-appstore.png"
                alt=""
                srcSet="/assets/images/downlad-appstore.png, /assets/images/downlad-appstore@2x.png 2x"
              />
            </a>
            <a href="#">
              <img
                src="/assets/images/download-playstore.png"
                alt=""
                srcSet="/assets/images/download-playstore.png, /assets/images/download-playstore@2x.png 2x"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
