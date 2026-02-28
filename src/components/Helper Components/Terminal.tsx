import React, { useEffect, useRef, useState } from "react";

export default function Terminal({
  paths,
  progress,
}: {
  paths: string[];
  progress: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [output, setOutput] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    // if (currentIndex >= paths.length) {
    //   setIsComplete(true);
    //   return;
    // }

    if (progress >= 100 && currentIndex === paths.length - 1) {
      setIsComplete(true);
      return;
    }

    const speed = paths.length > 100 ? 50 : 500; // Adjust speed based on array size

    const timer = setTimeout(() => {
      const maxIndex = Math.floor((progress / 100) * paths.length); // Determine max index based on progress
      if (currentIndex < maxIndex) {
        if (currentIndex === -1) {
          setOutput(["Creating VM", "Starting Antivirus", "Scanning started..."]);
        } else {
          setOutput((prev) => [...prev, `Scanning: ${paths[currentIndex]}`]);
        }
        setCurrentIndex((prev) => prev + 1);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, progress, paths.length]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="w-full h-full p-4 max-h-80 bg-secondary_bg-2 text-slate-200 font-mono overflow-hidden">
      <pre
        ref={containerRef}
        className="h-full w-full overflow-y-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-green-500 custom-scrollbar scrollbar-track-black"
      >
        {output.map((line, index) => (
          <React.Fragment key={index}>
            {"> "}
            {line}
            <br />
          </React.Fragment>
        ))}
        <hr />
        {isComplete && "> Scanning Complete"}
      </pre>
    </div>
  );
}
