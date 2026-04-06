import Link from 'next/link';

export default function HeaderBoxLayout() {
  return (
    <div className="bg-[#0F171F] py-[16px]">
      <div className="container">
        <div className="flex flex-row justify-between items-center">
          <div>
            <Link href="/">
              <img src="/assets/images/logo.png" alt="BSN" width="113" />
            </Link>
          </div>
          <div>
            <ul className="flex flex-row gap-[30px]">
              <li>
                <Link href="/calendario" className="text-[20px] text-white">
                  Calendario
                </Link>
              </li>
              <li>
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
                <span className="text-[20px] text-white">Equipos</span>
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
              <li>
                <Link href="/jugadores" className="text-[20px] text-white">
                  Jugadores
                </Link>
              </li>
              <li>
                <Link href="/estadisticas" className="text-[20px] text-white">
                  Estadísticas
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <ul className="flex flex-row">
              <li className="flex items-center justify-center h-[40px] w-[40px]">
                <a href="#">
                  <img
                    src="/assets/images/icons/social/icon-instagram.svg"
                    alt=""
                  />
                </a>
              </li>
              <li className="flex items-center justify-center h-[40px] w-[40px]">
                <a href="#">
                  <img
                    src="/assets/images/icons/social/icon-facebook.svg"
                    alt=""
                  />
                </a>
              </li>
              <li className="flex items-center justify-center h-[40px] w-[40px]">
                <a href="#">
                  <img src="/assets/images/icons/social/icon-x.svg" alt="" />
                </a>
              </li>
              <li className="flex items-center justify-center h-[40px] w-[40px]">
                <a href="#">
                  <img
                    src="/assets/images/icons/social/icon-tiktok.svg"
                    alt=""
                  />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
