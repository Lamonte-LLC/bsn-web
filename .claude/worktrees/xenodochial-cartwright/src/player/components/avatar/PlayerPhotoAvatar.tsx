type Props = {
  photoUrl: string;
  name?: string;
  size?: number;
  rounded?: boolean;
};

export default function PlayerPhotoAvatar({
  photoUrl,
  name,
  size = 50,
}: Props) {
  return (
    <div className="flex items-center justify-center">
      <img
        src={photoUrl || '/assets/images/players/default.png'}
        alt={name}
        className="rounded-full"
        style={{
          width: size,
          height: size,
        }}
      />
    </div>
  );
}
