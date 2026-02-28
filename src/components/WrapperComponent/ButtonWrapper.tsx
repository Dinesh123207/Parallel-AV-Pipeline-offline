import { ButtonWrapperProps } from "@/utils/types";

const ButtonWrapper: React.FC<ButtonWrapperProps> = ({
  buttonText,
  onclick,
}) => (
  <button
    className="border font-semibold px-4 py-0.5 rounded-md flex items-center justify-center bg-primary-1 text-slate-800 hover:bg-primary-2 hover:shadow transition"
    onClick={onclick}
  >
    {buttonText}
  </button>
);

export default ButtonWrapper;
