'use client';

type Props = {
  title: string;
};

export default function ShareButton({ title }: Props) {
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title,
        url: window.location.href,
      });
    }
  };

  return (
    <button
      onClick={handleShare}
      className="border border-[#D9D3D3] rounded-[12px] px-[30px] py-[12px] inline-flex items-center w-full justify-center"
    >
      <span className="text-base text-black">Compartir esta noticia</span>
    </button>
  );
}
