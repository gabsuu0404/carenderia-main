import { useState } from "react";

export function usePasswordToggle() {
  const [visible, setVisible] = useState(false);

  const toggle = () => setVisible((prev) => !prev);

  return { visible, toggle };
}
