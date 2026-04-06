import cx from 'classnames';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className }: Props) {
  return (
    <div
      className={cx(
        'glass-match-card border border-[rgba(125,125,125,0.13)] rounded-[12px]',
        className,
      )}
    >
      {children}
    </div>
  );
}
