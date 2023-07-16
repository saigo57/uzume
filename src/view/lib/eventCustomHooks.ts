import { useState } from 'react'
import { RecoilState, useRecoilState } from 'recoil'

export type Event = {
  triggerNum: number
  data: string | null
}

// eventStateが変化していたらイベントが発火している
export const useEvent = (onRaise: (() => void) | null): [Event, (data: string | null) => void] => {
  const [eventState, setEventState] = useState({ triggerNum: 0 } as Event)

  const raiseEvent = (data: string | null) => {
    if (onRaise) onRaise()
    setEventState(prev => ({ triggerNum: prev.triggerNum + 1, data: data } as Event))
  }

  return [eventState, raiseEvent]
}

export const useRecoilEvent = (
  event: RecoilState<Event>,
  onRaise: (() => void) | null
): [Event, (data: string | null) => void] => {
  const [eventState, setEventState] = useRecoilState(event)

  const raiseEvent = (data: string | null) => {
    if (onRaise) onRaise()
    setEventState(prev => ({ triggerNum: prev.triggerNum + 1, data: data } as Event))
  }

  return [eventState, raiseEvent]
}
