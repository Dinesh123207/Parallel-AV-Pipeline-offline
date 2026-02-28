import * as React from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";

interface RadioProps {
  onValueChange?: (value: string) => void;
  value?: string;
}

const Radio: React.FC<RadioProps> = ({ onValueChange, value = "default" }) => {
  return (
    <RadioGroup.Root
      className="flex flex-col gap-2.5"
      value={value}
      onValueChange={(newValue) => {
        if (onValueChange) {
          onValueChange(newValue);
        }
      }}
      aria-label="Select system type"
    >
      <div className="flex items-center py-1">
        <RadioGroup.Item
          className="bg-white w-[22px] h-[22px] rounded-full shadow-blackA4 hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-primary outline-none cursor-pointer"
          value="default"
          id="r1"
        >
          <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-[11px] after:h-[11px] after:rounded-[50%] after:bg-primary" />
        </RadioGroup.Item>
        <label
          className="text-white text-[15px] leading-none pl-[15px]"
          htmlFor="r1"
        >
          System
        </label>
      </div>
      <div className="flex items-center">
        <RadioGroup.Item
          className="bg-white w-[22px] h-[22px] rounded-full shadow-blackA4 hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-primary outline-none cursor-pointer"
          value="comfortable"
          id="r2"
        >
          <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-[11px] after:h-[11px] after:rounded-[50%] after:bg-primary" />
        </RadioGroup.Item>
        <label
          className="text-white text-[15px] leading-none pl-[15px]"
          htmlFor="r2"
        >
          Remote System
        </label>
      </div>
    </RadioGroup.Root>
  );
};

export default Radio;
