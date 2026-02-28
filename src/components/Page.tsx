import React from "react";

type Props = {
  children: React.ReactNode;
};

const Page = (props: Props) => {
  return <section className="w-6/7 mx-auto">{props.children}</section>;
};

export default Page;
