import React from "react";

type Props = {};

const MautInfo = (props: Props) => {
  return (
    <div className=" w-full">
      <div className="text-2xl mt-6 font-bold text-white w-full flex flex-col pb-4">
        What is MAUT (Multi Antivirus Utility Tool)?
      </div>
      <div className="text-base">
        MAUT is a comprehensive, all-in-one solution for thoroughly scanning
        your system. Instead of relying on a single antivirus, MAUT utilizes
        three —{" "}
        <b className="text-medium text-[#c48dea]">
          Windows Defender, Trend Micro Maximum Security, and ESET
        </b>{" "}
        —to perform an in-depth scan. A detailed report is generated upon
        completion.
      </div>

      <div className="text-base">
        Simply select the target folder and click{" "}
        <b className="text-medium text-[#c48dea]">"Start Scan"</b> to begin the
        process.
      </div>
    </div>
  );
};

export default MautInfo;
