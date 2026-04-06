type Props = {
  titleCard?: string;
  instagramLink?: string;
  facebookLink?: string;
  youtubeLink?: string;
  tiktokLink?: string;
  xLink?: string;
  websiteLink?: string;
  ticketsLink?: string;
};

export default function TeamExternalLinksCard({
  titleCard = 'Enlaces oficiales',
  instagramLink,
  facebookLink,
  youtubeLink,
  tiktokLink,
  xLink,
  websiteLink,
  ticketsLink,
}: Props) {
  return (
    <div className="flex-1 rounded-[12px] md:border md:border-[#EAEAEA] md:bg-white md:shadow-[0px_1px_3px_0px_#14181F0A]">
      <div className="pt-[24px] flex flex-row justify-between items-center md:px-[30px]">
        <div>
          <h3 className="text-[22px] text-black md:text-[24px]">
            {titleCard}
          </h3>
        </div>
      </div>
      <div className="pt-[12px] pb-[24px] md:px-[30px]">
        <ul className="divide-y divide-[rgba(0,0,0,0.07)]">
          {instagramLink && (
            <li className="flex flex-row items-center gap-[12px]">
              <a
                href={instagramLink}
                className="flex-1 flex flex-row items-center justify-between gap-2 py-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex flex-row items-center gap-3">
                  <img
                    src="/assets/images/icons/social/icon-instagram2.svg"
                    alt=""
                  />
                  <p className="font-barlow font-medium text-[15px] text-[rgba(15,23,31,0.9)]">
                    Instagram
                  </p>
                </div>
                <img
                  src="/assets/images/icons/icon-external-link2.svg"
                  alt=""
                />
              </a>
            </li>
          )}
          {facebookLink && (
            <li className="flex flex-row items-center gap-[12px]">
              <a
                href={facebookLink}
                className="flex-1 flex flex-row items-center justify-between gap-2 py-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex flex-row items-center gap-3">
                  <img
                    src="/assets/images/icons/social/icon-facebook2.svg"
                    alt=""
                  />{' '}
                  <p className="font-barlow font-medium text-[15px] text-[rgba(15,23,31,0.9)]">
                    Facebook
                  </p>
                </div>
                <img
                  src="/assets/images/icons/icon-external-link2.svg"
                  alt=""
                />
              </a>
            </li>
          )}
          {youtubeLink && (
            <li className="flex flex-row items-center gap-[12px]">
              <a
                href={youtubeLink}
                className="flex-1 flex flex-row items-center justify-between gap-2 py-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex flex-row items-center gap-3">
                  <img
                    src="/assets/images/icons/social/icon-youtube2.svg"
                    alt=""
                  />{' '}
                  <p className="font-barlow font-medium text-[15px] text-[rgba(15,23,31,0.9)]">
                    YouTube
                  </p>
                </div>
                <img
                  src="/assets/images/icons/icon-external-link2.svg"
                  alt=""
                />
              </a>
            </li>
          )}
          {tiktokLink && (
            <li className="flex flex-row items-center gap-[12px]">
              <a
                href={tiktokLink}
                className="flex-1 flex flex-row items-center justify-between gap-2 py-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex flex-row items-center gap-3">
                  <img
                    src="/assets/images/icons/social/icon-tiktok2.svg"
                    alt=""
                  />{' '}
                  <p className="font-barlow font-medium text-[15px] text-[rgba(15,23,31,0.9)]">
                    TikTok
                  </p>
                </div>
                <img
                  src="/assets/images/icons/icon-external-link2.svg"
                  alt=""
                />
              </a>
            </li>
          )}
          {xLink && (
            <li className="flex flex-row items-center gap-[12px]">
              <a
                href={xLink}
                className="flex-1 flex flex-row items-center justify-between gap-2 py-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex flex-row items-center gap-3">
                  <img src="/assets/images/icons/social/icon-x2.svg" alt="" />{' '}
                  <p className="font-barlow font-medium text-[15px] text-[rgba(15,23,31,0.9)]">
                    X (Twitter)
                  </p>
                </div>
                <img
                  src="/assets/images/icons/icon-external-link2.svg"
                  alt=""
                />
              </a>
            </li>
          )}
          {websiteLink && (
            <li className="flex flex-row items-center gap-[12px]">
              <a
                href={websiteLink}
                className="flex-1 flex flex-row items-center justify-between gap-2 py-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex flex-row items-center gap-3">
                  <img
                    src="/assets/images/icons/social/icon-website2.svg"
                    alt=""
                  />{' '}
                  <p className="font-barlow font-medium text-[15px] text-[rgba(15,23,31,0.9)]">
                    Sitio oficial
                  </p>
                </div>
                <img
                  src="/assets/images/icons/icon-external-link2.svg"
                  alt=""
                />
              </a>
            </li>
          )}
          {ticketsLink && (
            <li className="flex flex-row items-center gap-[12px]">
              <a
                href={ticketsLink}
                className="flex-1 flex flex-row items-center justify-between gap-2 py-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex flex-row items-center gap-3">
                  <img src="/assets/images/icons/icon-ticket2.svg" alt="" />{' '}
                  <p className="font-barlow font-medium text-[15px] text-[rgba(15,23,31,0.9)]">
                    Boletos
                  </p>
                </div>
                <img
                  src="/assets/images/icons/icon-external-link2.svg"
                  alt=""
                />
              </a>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
