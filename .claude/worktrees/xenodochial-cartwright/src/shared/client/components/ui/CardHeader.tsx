import cx from 'classnames';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function CardHeader({ children, className }: Props) {
  return (
    <div
      className={cx(
        className,
      )}
    >
      {children}
    </div>
  );
}
