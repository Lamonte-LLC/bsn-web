type Props = {
  coverUrl: string;
};

export default function MatchVideoCover({ coverUrl }: Props) {
  return (
    <div className="relative">
      <img
        src={coverUrl}
        className="aspect-16/9 border border-[rgba(125,125,125,0.45)] rounded-lg w-full"
      />
      <img
        src="/assets/images/icons/icon-play.png"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translateX(-21px) translateY(-21px)',
          width: 42,
          height: 42,
        }}
      />
    </div>
  );
}
