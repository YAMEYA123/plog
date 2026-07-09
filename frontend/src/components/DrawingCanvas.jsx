import { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react'

const DrawingCanvas = forwardRef(function DrawingCanvas({ size = 300 }, ref) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const strokes = useRef([])   // array of stroke arrays, each stroke = [{x,y},...]
  const currentStroke = useRef([])

  useImperativeHandle(ref, () => ({
    clear() {
      strokes.current = []
      currentStroke.current = []
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, size, size)
    },
    getStrokes() {
      return strokes.current
    },
    isEmpty() {
      return strokes.current.length === 0
    },
    toDataURL() {
      return canvasRef.current.toDataURL('image/png')
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = 3.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#1a1a1a'

    function getPos(e) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const src = e.touches ? e.touches[0] : e
      return {
        x: (src.clientX - rect.left) * scaleX,
        y: (src.clientY - rect.top) * scaleY,
      }
    }

    function start(e) {
      e.preventDefault()
      drawing.current = true
      currentStroke.current = []
      const pos = getPos(e)
      currentStroke.current.push(pos)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }

    function move(e) {
      e.preventDefault()
      if (!drawing.current) return
      const pos = getPos(e)
      currentStroke.current.push(pos)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }

    function end(e) {
      e.preventDefault()
      if (!drawing.current) return
      drawing.current = false
      if (currentStroke.current.length > 1) {
        strokes.current.push([...currentStroke.current])
      }
      currentStroke.current = []
    }

    canvas.addEventListener('mousedown', start)
    canvas.addEventListener('mousemove', move)
    canvas.addEventListener('mouseup', end)
    canvas.addEventListener('mouseleave', end)
    canvas.addEventListener('touchstart', start, { passive: false })
    canvas.addEventListener('touchmove', move, { passive: false })
    canvas.addEventListener('touchend', end, { passive: false })

    return () => {
      canvas.removeEventListener('mousedown', start)
      canvas.removeEventListener('mousemove', move)
      canvas.removeEventListener('mouseup', end)
      canvas.removeEventListener('mouseleave', end)
      canvas.removeEventListener('touchstart', start)
      canvas.removeEventListener('touchmove', move)
      canvas.removeEventListener('touchend', end)
    }
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        width: '100%',
        maxWidth: size,
        aspectRatio: '1',
        background: '#fff',
        borderRadius: 12,
        border: '1.5px solid var(--border)',
        touchAction: 'none',
        cursor: 'crosshair',
      }}
    />
  )
})

export default DrawingCanvas
