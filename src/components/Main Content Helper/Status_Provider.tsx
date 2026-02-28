import Status from "../Helper Components/Status";

export default function Status_Provider({ status }: { status: string }) {
  return (
    <div className="flex w-full justify-center items-center">
      {status === "active" ? (
        <div className="flex gap-4 items-center justify-between">
          <div>Monitoring</div>
          <Status status={"success"} />
        </div>
      ) : status === "deactivated" ? (
        <div className="flex gap-4 items-center justify-between">
          <div>Deactivated</div>
          <Status status={"error"} />
        </div>
      ) : (
        <div className="flex gap-4 items-center justify-between">
          <div>Scanning</div>
          <Status status={"waiting"} />
        </div>
      )}
    </div>
  );
}
