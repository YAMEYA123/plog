import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Editor() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const [image, setImage] = useState(null)
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(36)
  const [color, setColor] = useState('#ffffff')
  const [pos, setPos] = useState({ x: 50, y: 85 }) // percent
  const [fontLoaded, setFontLoaded] = useState(false)
  const fontName = 'MyHandwriting'

  const fontUrl = localStorage.getItem('plog_font_url')

  useEffect(() => {
    if (!fontUrl) return
    const font = new FontFace(fontName, `url(${fontUrl})`)
    font.load().then(f => {
      document.fonts.add(f)
      setFontLoaded(true)
    }).catch(() => {
      // 字体加载失败时用系统字体降级
      setFontLoaded(true)
    })
  }, [fontUrl])

  useEffect(() => {
    render()
  }, [image, text, fontSize, color, pos, fontLoaded])

  function render() {
    const canvas = canvasRef.current
    if (!canvas || !image) return
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.src = image
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      if (!text) return
      ctx.font = `${fontSize}px "${fontLoaded ? fontName : 'PingFang SC'}", sans-serif`
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0,0,0,0.4)'
      ctx.shadowBlur = 6
      const x = (pos.x / 100) * canvas.width
      const y = (pos.y / 100) * canvas.height
      // 支持换行
      text.split('\n').forEach((line, i) => {
        ctx.fillText(line, x, y + i * (fontSize * 1.3))
      })
      ctx.shadowBlur = 0
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleExport() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'plog.jpg'
    link.href = canvas.toDataURL('image/jpeg', 0.95)
    link.click()
  }

  if (!fontUrl) {
    return (
      <div className="page" style={{ justifyContent: 'center', gap: 20 }}>
        <p style={{ color: 'var(--text-secondary)' }}>还没有字体，请先完成采集</p>
        <button className="btn btn-primary" onClick={() => navigate('/collect')}>
          去采集手写样本
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>照片编辑器</h1>
        <p>上传照片，添加手写风格文案</p>
      </div>

      {/* 画布预览 */}
      <div style={{
        width: '100%',
        background: '#111',
        borderRadius: 12,
        overflow: 'hidden',
        minHeight: image ? undefined : 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        position: 'relative',
      }}>
        {image
          ? <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />
          : <div ref={canvasRef} style={{ color: '#555', fontSize: 14 }}>照片预览区域</div>
        }
      </div>

      {/* 控制面板 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
        <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
          {image ? '更换照片' : '选择照片'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>文案内容（支持换行）</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="输入你的文案..."
              rows={3}
              style={{
                width: '100%',
                border: '1.5px solid var(--border)',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 15,
                fontFamily: fontLoaded ? `"${fontName}", sans-serif` : 'inherit',
                resize: 'none',
                outline: 'none',
                background: 'var(--bg)',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>字号 {fontSize}px</label>
              <input type="range" min={16} max={120} value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>颜色</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                style={{ width: 44, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              文字位置（左右 {pos.x}% / 上下 {pos.y}%）
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input type="range" min={0} max={100} value={pos.x}
                onChange={e => setPos(p => ({ ...p, x: Number(e.target.value) }))} style={{ width: '100%' }} />
              <input type="range" min={0} max={100} value={pos.y}
                onChange={e => setPos(p => ({ ...p, y: Number(e.target.value) }))} style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleExport} disabled={!image || !text}>
          导出图片
        </button>
        <a
          href={fontUrl}
          download="my-handwriting.ttf"
          className="btn btn-secondary"
          style={{ textDecoration: 'none', textAlign: 'center' }}
        >
          下载 TTF 字体文件
        </a>
      </div>
    </div>
  )
}
