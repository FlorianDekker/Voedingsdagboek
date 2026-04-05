import { useRef, useCallback } from 'react'

const MIN_SWIPE_DISTANCE = 60
const MAX_VERTICAL_RATIO = 0.75 // horizontal distance must be at least 1.33x vertical

export function useSwipe(onSwipeLeft, onSwipeRight) {
  const startX = useRef(null)
  const startY = useRef(null)
  const endX = useRef(null)
  const endY = useRef(null)

  const onTouchStart = useCallback((e) => {
    const touch = e.targetTouches[0]
    startX.current = touch.clientX
    startY.current = touch.clientY
    endX.current = null
    endY.current = null
  }, [])

  const onTouchMove = useCallback((e) => {
    const touch = e.targetTouches[0]
    endX.current = touch.clientX
    endY.current = touch.clientY
  }, [])

  const onTouchEnd = useCallback(() => {
    if (startX.current == null || endX.current == null) return

    const dx = startX.current - endX.current
    const dy = Math.abs(startY.current - endY.current)
    const adx = Math.abs(dx)

    // Only trigger if horizontal movement is dominant and far enough
    if (adx >= MIN_SWIPE_DISTANCE && dy < adx * MAX_VERTICAL_RATIO) {
      if (dx > 0) {
        onSwipeLeft()
      } else {
        onSwipeRight()
      }
    }

    startX.current = null
    startY.current = null
  }, [onSwipeLeft, onSwipeRight])

  return { onTouchStart, onTouchMove, onTouchEnd }
}
