import { headers } from 'next/headers';
import { userAgent } from 'next/server';
import Footer from './Footer';
import Header from './Header';

type Props = {
  children: React.ReactNode;
  subheader?: React.ReactNode;
  divider?: boolean;
};

export default async function FullWidthLayout({
  children,
  subheader,
  divider = false,
}: Props) {
  const { device } = userAgent({ headers: await headers() });

  return (
    <div className="min-h-screen bg-[#fdfdfd]">
      <header className="bg-bsn">
        <div
          className="border-b"
          style={{
            borderColor: divider ? 'rgba(55, 55, 55, 0.5)' : 'transparent',
          }}
        >
          <Header />
        </div>
        {subheader}
      </header>
      <main>{children}</main>
      <Footer hideStoreAppLinks={['mobile', 'tablet'].includes(device.type ?? '')} />
    </div>
  );
}
