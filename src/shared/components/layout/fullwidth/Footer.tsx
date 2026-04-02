import TeamLinkCard from '@/team/components/card/TeamLinkCard';
import Link from 'next/link';

export default function FooterBoxLayout() {
  return (
    <footer className="bg-[#0F171F] pt-[50px] pb-[34px]">
      <div className="container">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-3">
            <p className="mb-4 text-center md:mb-[58px] md:text-left">
              <Link href="/" className="inline-block">
                <img
                  src="/assets/images/bsn-logo.svg"
                  alt=""
                  className="w-[100px] md:w-auto"
                />
              </Link>
            </p>
            <p className="hidden mb-4 md:block">
              <a
                href="#"
                className="font-barlow font-medium text-[20px] text-neutral-500"
              >
                #LaMásDura
              </a>
            </p>
            <div className="flex flex-row gap-[8px] justify-center items-center mb-4 md:justify-start xl:gap-[12px]">
              <a
                href="https://www.instagram.com/bsnpr/"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[rgba(125,125,125,0.24)] flex items-center justify-center h-[40px] w-[40px] rounded-full"
              >
                <img
                  src="/assets/images/icons/social/icon-instagram.svg"
                  alt=""
                />
              </a>
              <a
                href="https://www.facebook.com/bsnpr/"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[rgba(125,125,125,0.24)] flex items-center justify-center h-[40px] w-[40px] rounded-full"
              >
                <img
                  src="/assets/images/icons/social/icon-facebook.svg"
                  alt=""
                />
              </a>
              <a
                href="https://www.youtube.com/@BaloncestoSuperiorNacionalPR"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[rgba(125,125,125,0.24)] flex items-center justify-center h-[40px] w-[40px] rounded-full"
              >
                <img
                  src="/assets/images/icons/social/icon-youtube.svg"
                  alt=""
                />
              </a>
              <a
                href="https://x.com/bsnpr"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[rgba(125,125,125,0.24)] flex items-center justify-center h-[40px] w-[40px] rounded-full"
              >
                <img src="/assets/images/icons/social/icon-x.svg" alt="" />
              </a>
              <a
                href="https://www.tiktok.com/@bsnpr?lang=en"
                target="_blank"
                rel="noopener noreferrer"
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
            <ul className="mb-6 space-y-1">
              <li className="text-center md:text-right lg:text-left">
                <Link
                  href="/calendario"
                  className="font-special-gothic-condensed-one text-white text-[26px]"
                >
                  Calendario
                </Link>
              </li>
              <li className="text-center md:text-right lg:text-left">
                <Link
                  href="/noticias"
                  className="font-special-gothic-condensed-one text-white text-[26px]"
                >
                  Noticias
                </Link>
              </li>
              <li className="text-center md:text-right lg:text-left hidden">
                <a
                  href="#"
                  className="font-special-gothic-condensed-one text-white text-[26px]"
                >
                  Jugadores
                </a>
              </li>
              <li className="text-center md:text-right lg:text-left hidden">
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
              <TeamLinkCard teamCode="AGU" teamName="Santeros" avatarSize={45} />
              <TeamLinkCard teamCode="ARE" teamName="Capitanes" avatarSize={45} />
              <TeamLinkCard teamCode="BAY" teamName="Vaqueros" avatarSize={45} />
              <TeamLinkCard teamCode="CAG" teamName="Criollos" avatarSize={45} />
              <TeamLinkCard teamCode="CAR" teamName="Gigantes" avatarSize={45} />
              <TeamLinkCard teamCode="GBO" teamName="Mets" avatarSize={45} />
              <TeamLinkCard teamCode="MAN" teamName="Osos" avatarSize={45} />
              <TeamLinkCard teamCode="MAY" teamName="Indios" avatarSize={45} />
              <TeamLinkCard teamCode="PON" teamName="Leones" avatarSize={45} />
              <TeamLinkCard teamCode="QUE" teamName="Piratas" avatarSize={45} />
              <TeamLinkCard teamCode="SGE" teamName="Atléticos" avatarSize={45} />
              <TeamLinkCard teamCode="SCE" teamName="Cangrejeros" avatarSize={45} />
            </div>
          </div>
        </div>
        <div className="border-t border-t-[rgba(255,255,255,0.12)] my-[20px]" />
        <div className="flex flex-col gap-4 justify-between items-center md:flex-row">
          <div className="order-last text-center md:order-first md:text-left">
            <p className="font-barlow text-xs text-neutral-500">
              © Baloncesto Superior Nacional 2026. Todos los derechos
              reservados.
            </p>
            <p className="font-barlow text-xs text-neutral-500">
              <a href="https://wp.bsnpr.com/terminos-y-condiciones/" target="_blank" rel="noopener noreferrer" className="underline">
                Términos y condiciones
              </a>{' '}
              |{' '}
              <a href="https://wp.bsnpr.com/politica-de-privacidad/" target="_blank" rel="noopener noreferrer" className="underline">
                Política de privacidad
              </a>
              . Diseñado en Puerto Rico por{' '}
              <a href="https://lamonte.studio/" target="_blank" rel="noopener noreferrer" className="underline">
                Lamonte
              </a>
              .
            </p>
          </div>
          <div className="flex flex-row gap-[10px] items-center">
            <a href="https://apps.apple.com/us/app/baloncesto-superior-nacional/id6479825880" target="_blank" rel="noopener noreferrer">
              <img
                src="/assets/images/downlad-appstore.png"
                alt=""
                srcSet="/assets/images/downlad-appstore.png, /assets/images/downlad-appstore@2x.png 2x"
                width={120}
              />
            </a>
            <a href="https://play.google.com/store/apps/details?id=io.genius.bsnpr&hl=en" target="_blank" rel="noopener noreferrer">
              <img
                src="/assets/images/download-playstore.png"
                alt=""
                srcSet="/assets/images/download-playstore.png, /assets/images/download-playstore@2x.png 2x"
                width={120}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
