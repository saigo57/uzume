import { useState } from "react";

// eventStateが変化していたらイベントが発火している
export const useEvent = (onRaise: (() => void) | null): [number, () => void] =>  {
  const [eventState, setEventState] = useState(0);

  const raiseEvent = () => {
    if ( onRaise ) onRaise();
    setEventState(prev => prev + 1);
  };

  return [eventState, raiseEvent];
}
