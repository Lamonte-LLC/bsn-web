import cx from 'classnames';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function CardFooter({ children, className }: Props) {
  return (
    <div
      className={cx(
        'bg-[rgba(76,76,76,0.2)] rounded-b-xl px-5 py-3',
        className,
      )}
    >
      {children}
    </div>
  );
}
