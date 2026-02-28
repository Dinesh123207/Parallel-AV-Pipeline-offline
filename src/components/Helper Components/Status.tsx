export default function Status({ status }: { status: string }) {
  if (status === "error")
    return (
      <div className="w-2 h-2 rounded-full bg-error_signal border-3 border-error_signal shadow-md animate-infuse-error"></div>
    );

  if (status === "waiting")
    return (
      <div className="w-2 h-2 rounded-full bg-waiting_signal border-3 border-waiting_signal shadow-md animate-infuse-waiting"></div>
    );

  return (
    <div className="w-2 h-2 rounded-full bg-success_signal border-3 border-success_signal shadow-md animate-infuse-success"></div>
  );
}
