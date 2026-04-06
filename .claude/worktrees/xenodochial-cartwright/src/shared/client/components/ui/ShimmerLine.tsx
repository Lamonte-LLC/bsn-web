type Props = {
  height?: string;
};

export default function ShimmerLine({ height = '16px' }: Props) {
  return (
    <div
      className="w-full bg-gray-300 rounded-lg animate-pulse"
      style={{ height }}
    />
  );
}
