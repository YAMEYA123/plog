import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DrawingCanvas from '../components/DrawingCanvas'

// 30 个采样字（覆盖常见偏旁）+ 英文字母 + 数字
const SAMPLE_CHARS = [
  // 汉字
  '永','字','人','大','山','口','日','月','木','水',
  '火','土','金','手','心','言','走','食','衣','女',
  '我','你','他','的','是','在','了','不','一','中',
  // 大写字母
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  // 小写字母
  'a','b','c','d','e','f','g','h','i','j','k','l','m',
  'n','o','p','q','r','s','t','u','v','w','x','y','z',
  // 数字
  '0','1','2','3','4','5','6','7','8','9',
]

export default function Collect() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [collected, setCollected] = useState({}) // char -> strokes

  const char = SAMPLE_CHARS[index]
  const total = SAMPLE_CHARS.length
  const progress = index / total

  function handleNext() {
    if (canvasRef.current?.isEmpty()) return
    const strokes = canvasRef.current.getStrokes()
    const updated = { ...collected, [char]: strokes }
    setCollected(updated)

    if (index + 1 >= total) {
      localStorage.setItem('plog_samples', JSON.stringify(updated))
      navigate('/generate')
    } else {
      setIndex(i => i + 1)
      canvasRef.current.clear()
    }
  }

  function handleSkip() {
    if (index + 1 >= total) {
      localStorage.setItem('plog_samples', JSON.stringify(collected))
      navigate('/generate')
    } else {
      setIndex(i => i + 1)
      canvasRef.current?.clear()
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>手写采集</h1>
        <p>请在格子里手写下方的字</p>
      </div>

      {/* 进度 */}
      <div style={{ width: '100%', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
          <span>进度 {index + 1} / {total}</span>
          <span>已采集 {Object.keys(collected).length} 个</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      {/* 目标字 */}
      <div style={{
        fontSize: 72,
        fontWeight: 400,
        lineHeight: 1,
        marginBottom: 20,
        color: 'var(--text)',
        userSelect: 'none',
      }}>
        {char}
      </div>

      {/* 画布 */}
      <div style={{ width: '100%', position: 'relative' }}>
        {/* 田字格辅助线 */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: '50% 50%',
          borderRadius: 12,
          pointerEvents: 'none',
          zIndex: 1,
        }} />
        <DrawingCanvas ref={canvasRef} size={320} />
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 20 }}>
        <button className="btn btn-primary" onClick={handleNext}>
          {index + 1 >= total ? '完成并生成字体' : '写好了，下一个'}
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => canvasRef.current?.clear()}>
            重写
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleSkip}>
            跳过
          </button>
        </div>
      </div>

      {/* 提示 */}
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 16, textAlign: 'center' }}>
        可以跳过，但采集越多字体效果越好<br />中文至少写 10 个字以上
      </p>
    </div>
  )
}
