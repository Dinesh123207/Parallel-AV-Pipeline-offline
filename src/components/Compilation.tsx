import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type CompilationReportProps = {
  setCompiling: React.Dispatch<React.SetStateAction<boolean>>;
};

const Compilation = ({ setCompiling }: CompilationReportProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    "Merging VM 1 report...",
    "Merging VM 2 report...",
    "Merging VM 3 report...",
    "Identifying infected files...",
    "Infected files are being moved to the Infected Folder...",
  ];

  useEffect(() => {
    const randomDelay = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prevStep) => prevStep + 1);
      }, randomDelay); // 2 seconds delay for each step
      return () => clearTimeout(timer);
    } else {
      navigate("/report"); // Once all steps are done, set compiling to false
    }
  }, [currentStep, setCompiling]);

  return (
    <div className="flex flex-col gap-2 w-full">
      {steps.slice(0, currentStep + 1).map((step, index) => (
        <div>
          <div
            key={index}
            className={`flex items-center gap-4 px-2 py-1 mb-2 rounded-md shadow-lg ${
              index < 3
                ? "bg-card text-lg text-white p-4"
                : "bg-card text-lg text-white p-4"
            }`}
          >
            {/* Icon or Status Indicator */}
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                index < 3 ? "bg-blue-200" : "bg-red-200"
              }`}
            >
              {index < 3 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.707-7.707a1 1 0 011.414 0l3-3a1 1 0 10-1.414-1.414L9 8.586 7.707 7.293a1 1 0 00-1.414 1.414l2 2z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11V5a1 1 0 00-2 0v2a1 1 0 000 2v6a1 1 0 001 1 1 1 0 001-1v-6a1 1 0 000-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            {/* Text Content */}
            <div className="flex-grow">
              <div className="font-semibold text-lg">{step}</div>
              <div className="text-sm opacity-80 font-semibold">
                {index < 3
                  ? "Process Running Smoothly"
                  : "Caution: Handling Threats"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Compilation;
