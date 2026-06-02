import { useState } from "react";
import { controller } from "../lib/controller";

export function useController() {
  const [account, setAccount] = useState<any>(null);

  const connect = async () => {
    const acc = await controller.connect();
    setAccount(acc);
  };

  return { account, connect };
}