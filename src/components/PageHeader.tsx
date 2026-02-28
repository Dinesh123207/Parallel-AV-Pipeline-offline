import React from "react";
import { Button } from "./ui/button";
import { BiLeftArrow } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import BackButton from "./BackButton";
import { HiOutlineInformationCircle } from "react-icons/hi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type Props = {
  title: string;
  hoverContent?: string;
};

const PageHeader = (props: Props) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <>
      <div className="main-section py-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <BackButton
              className="bg-gradient-to-r from-[#A345E5] to-[#F04242] max-w-[60px] max-h-[40px] text-4xl py-0 hover:bg-primary/50"
              onClick={handleBack}
            />
            <h1 className="text-2xl pl-2 font-bold">{props.title}</h1>
            <TooltipProvider>
              <Tooltip delayDuration={20}>
                <TooltipTrigger className="flex-1 text-white w-[50px]">
                  {" "}
                  <HiOutlineInformationCircle size={35} />
                </TooltipTrigger>
                {props.hoverContent && (
                  <TooltipContent className="content-tooltip max-w-[400px]">
                    {props.hoverContent}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageHeader;
