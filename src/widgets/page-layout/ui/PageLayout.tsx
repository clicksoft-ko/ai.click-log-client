import React from "react";
import { PageTitle } from "./PageTitle";

interface PageLayoutProps extends React.PropsWithChildren {
  title: React.ReactNode;
}

export const PageLayout = ({ children, title }: PageLayoutProps) => {
  return (
    <div className="flex min-w-[64rem] flex-col gap-3 px-6 pb-6 pt-5">
      <PageTitle>{title}</PageTitle>
      {children}
    </div>
  );
};
