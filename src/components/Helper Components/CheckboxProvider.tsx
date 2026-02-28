import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";

export default function CheckboxProvider({
  updateStatus,
}: {
  updateStatus: boolean;
}) {
  if (updateStatus) {
    return (
      <div className="border rounded-md flex items-center justify-center w-5 h-5 bg-green-500/50">
        <TiTick fontSize={20} color="#33F471" />
      </div>
    );
  }
  return (
    <div className="border rounded-md flex items-center justify-center w-5 h-5 bg-red-300/50">
      <ImCross fontSize={10} color="#E71802" />
    </div>
  );
}
