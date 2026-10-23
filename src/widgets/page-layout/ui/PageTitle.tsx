interface PageTitleProps {
  children: React.ReactNode;
}

export const PageTitle = ({ children }: PageTitleProps) => (
  <h1 className="text-xl font-semibold tracking-tight">{children}</h1>
);
