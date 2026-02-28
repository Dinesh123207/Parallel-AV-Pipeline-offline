import React from 'react';

export const ScanSummary = () => {
  return (
    <div className="p-2.5 px-4 h-[400px] overflow-y-auto text-white">
      <div className='text-[#70ec67]'>
      <p><strong>Detections occurred: 0</strong></p>
      <p><strong>USER:</strong> LAPTOP-8F2IC0GN\POORVA DIWAN</p>
      <p><strong>Date:</strong> 10-09-2024; <strong>Time:</strong> 16:00:11</p>
      <p><strong>Total files scanned:</strong> 47987</p>
      <p><strong>Unreachable files:</strong> 1294</p>
      <p><strong>Total time:</strong> 88s</p>
      <p>Scanning time: 68s</p>
      <p>Reporting Generation time: 20s</p>
      </div>

      <hr className="my-4 border border-white-800" />

      <div className="flex justify-between text-[#c48dea]">
        <p><strong>1. AntiVirus: Windows Defender</strong></p>
        <p><strong>Time taken:</strong> 68s</p>
      </div>
      <p><strong>Total files scanned:</strong> 47987</p>
      <p><strong>Unreachable files:</strong> 844</p>

      <hr className="my-4 border border-white-800" />

      <div className="flex justify-between text-[#c48dea]">
        <p><strong>2. Trend Micro Maximum Security</strong></p>
        <p><strong>Time taken:</strong> 63s</p>
      </div>
      <p><strong>Total files scanned:</strong> 47987</p>
      <p><strong>Unreachable files:</strong> 1294</p>

      <hr className="my-4 border border-white-800" />

      <div className="flex justify-between text-[#c48dea]">
        <p><strong>2. ESET</strong></p>
        <p><strong>Time taken:</strong> 12s</p>
      </div>
      <p><strong>Total files scanned:</strong> 47987</p>
      <p><strong>Unreachable files:</strong> 987</p>
    </div>
  );
};

