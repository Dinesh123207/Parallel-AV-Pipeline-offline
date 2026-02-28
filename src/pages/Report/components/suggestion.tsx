export enum Status {
  NONE = "NONE",
  SUGGESTION = "SUGGESTION",
  DISABLED = "DISABLED",
  ENABLED = "ENABLED",
  OK = "OK",
}

interface SuggestionProps {
  text: string;
  status: Status;
}

export const Suggestion = ({ text, status }: SuggestionProps) => {
  const color =
    (status === Status.ENABLED || status === Status.OK)
      ? "#16a34a"
      : status === Status.SUGGESTION
      ? "#FF0"
      : status === Status.NONE
      ? "#FFFFFF"
      : "#F00";
  return (
    <p className="font-semibold text-primary-foreground flex justify-between px-2">
      <span> - {text}</span>
      <span className="flex gap-x-2">
        [<span style={{ color: color }}>{status}</span>]
      </span>
    </p>
  );
};
