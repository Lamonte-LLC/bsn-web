import cx from 'classnames';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function CardBody({ children, className }: Props) {
  return <div className={cx('px-[15px] md:px-[20px]', className)}>{children}</div>;
}
