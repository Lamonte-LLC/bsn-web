import Footer from './Footer';
import Header from './Header';

type Props = {
  children: React.ReactNode;
  subheader?: React.ReactNode;
  divider?: boolean;
  hideStoreAppLinks?: boolean;
};

export default async function FullWidthLayout({
  children,
  subheader,
  divider = false,
  hideStoreAppLinks = false,
}: Props) {
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
      <Footer hideStoreAppLinks={hideStoreAppLinks} />
    </div>
  );
}
