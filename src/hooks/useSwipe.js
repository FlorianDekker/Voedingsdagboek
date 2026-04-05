import { useRef, useCallback } from 'react'

const MIN_SWIPE_DISTANCE = 50

export function useSwipe(onSwipeLeft, onSwipeRight) {
  const touchStart = useRef(null)
  const touchEnd = useRef(null)

  const onTouchStart = useCallback((e) => {
    touchEnd.current = null
    touchStart.current = e.targetTouches[0].clientX
  }, [])

  const onTouchMove = useCallback((e) => {
    touchEnd.current = e.targetTouches[0].clientX
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return
    const distance = touchStart.current - touchEnd.current
    if (Math.abs(distance) >= MIN_SWIPE_DISTANCE) {
      if (distance > 0) {
        onSwipeLeft()
      } else {
        onSwipeRight()
      }
    }
    touchStart.current = null
    touchEnd.current = null
  }, [onSwipeLeft, onSwipeRight])

  return { onTouchStart, onTouchMove, onTouchEnd }
}
