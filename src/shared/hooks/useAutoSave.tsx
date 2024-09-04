import { useState } from "react";

interface Props {
  timeout?: number;
}
const useAutoSave = (props: Props) => {
  const { timeout = 1000 } = props;
  const [timeoutFunc, setTimeoutFunc] = useState<NodeJS.Timeout | null>(null);

  const autoSave = (callback: () => void) => {
    if (timeoutFunc) clearTimeout(timeoutFunc);
    setTimeoutFunc(setTimeout(callback, timeout));
  };

  return {
    autoSave,
  };
};

export default useAutoSave;
