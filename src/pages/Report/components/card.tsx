import { Button } from "@/components/ui/button";

interface CardProps {
  heading: string;
  antivirus: string;
  ram: string;
  storage: string;
  cta: string;
}

export const Card = ({ heading, antivirus, ram, storage, cta }: CardProps) => {
  return (
    <div className="w-full bg-card text-primary p-4 rounded-xl flex flex-col">
      <h5 className=" text-white">{heading}</h5>
      <p className=" text-white text-sm">{antivirus}</p>
      <p className=" text-white text-sm">{ram}</p>
      <p className=" text-white text-sm">{storage}</p>
      <Button
        size="lg"
        className="w-[150px] h-[40px] text-base mt-4 bg-gradient-to-r from-[#A345E5] to-[#F04242] font-semibold"
      >
        {cta}
      </Button>
    </div>
  );
};
