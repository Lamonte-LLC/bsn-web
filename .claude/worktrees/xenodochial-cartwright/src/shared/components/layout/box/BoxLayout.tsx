import Footer from "./Footer";
import Header from "./Header";

type Props = {
  children: React.ReactNode;
};

export default function BoxLayout({ children }: Props) {
  return (
    <div>
      <Header />
      <main className="container">
        {children}
      </main>
      <Footer />
    </div>
  );
}
