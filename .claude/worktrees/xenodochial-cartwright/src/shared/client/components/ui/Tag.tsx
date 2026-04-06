type Props = {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
};

export default function Tag({ children, active = false, className = "" }: Props) {
  return (
    <div
      className={`border inline-block rounded-[100px] px-[18px] py-[7px] text-center ${className}`}
      style={{
        backgroundColor: active ? "#0F171F" : "#FFFFFF",
        borderColor: active ? "#0F171F" : "#D5D5D5",
        color: active ? "#FFFFFF" : "rgba(0,0,0,0.65)",
      }}
    >
      {children}
    </div>
  );
}
