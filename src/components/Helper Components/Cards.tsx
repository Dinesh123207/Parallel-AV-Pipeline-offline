import { Card } from "@/pages/Report/components/card";
import { cardDetails } from "@/utils/constants";

export default function Cards() {
  return (
    <div className="flex w-full overflow-auto gap-4 custom-scrollbar">
      {cardDetails.map((c, idx) => (
        <Card
          key={idx}
          heading={c.heading}
          antivirus={c.antivirus}
          cta={c.cta}
          ram={c.ram}
          storage={c.storage}
        />
      ))}
    </div>
  );
}
