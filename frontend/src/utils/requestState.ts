type Listener = (count: number) => void

let pendingCount = 0
const listeners = new Set<Listener>()

const emit = () => {
  listeners.forEach((listener) => listener(pendingCount))
}

export const requestState = {
  start() {
    pendingCount += 1
    emit()
  },
  end() {
    pendingCount = Math.max(0, pendingCount - 1)
    emit()
  },
  subscribe(listener: Listener) {
    listeners.add(listener)
    listener(pendingCount)
    return () => {
      listeners.delete(listener)
    }
  },
}
