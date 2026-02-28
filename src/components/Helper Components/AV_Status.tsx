import Status from "./Status";

export default function AV_Status() {
  return (
    <div className="grid gap-2">
      <div className="text-xl font-medium">AntiVirus Status</div>
      <div className="flex rounded-lg bg-secondary_bg-2 text-lg border-2 border-primary-1/40 overflow-hidden">
        <div className="flex w-full justify-between items-center">
          <div className="flex-1 border-r-2 border-primary-1/40 px-5 py-1 flex justify-between items-center">
            <div>ESET Internet Security</div>
            <Status status={"success"} />
          </div>
          <div className="flex-1 border-r-2 border-primary-1/40 px-5 py-1 flex justify-between items-center">
            <div>ClamAV AntiVirus</div>
            <Status status={"success"} />
          </div>
          <div className="flex-1 px-5 py-1 flex justify-between items-center">
            <div>Windows Defender</div>
            <Status status={"success"} />
          </div>
        </div>
      </div>
    </div>
  );
}
