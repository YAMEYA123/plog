import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startGenerate, getStatus, fontFileUrl } from '../api'

const STEPS = [
  '分析笔迹特征...',
  '提取笔画风格参数...',
  '生成汉字字形（这需要几分钟）...',
  '生成英文字母...',
  '打包 TTF 字体文件...',
  '完成！',
]

export default function Generate() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState(null)
  const [fontUrl, setFontUrl] = useState(null)
  const [taskId, setTaskId] = useState(null)

  useEffect(() => {
    const samples = JSON.parse(localStorage.getItem('plog_samples') || '{}')
    if (Object.keys(samples).length === 0) {
      navigate('/collect')
      return
    }
    startGeneration(samples)
  }, [])

  async function startGeneration(samples) {
    try {
      setStep(1)
      const data = await startGenerate(samples)
      setTaskId(data.task_id)
      pollStatus(data.task_id)
    } catch (e) {
      setError(e.message)
    }
  }

  async function pollStatus(id) {
    const interval = setInterval(async () => {
      try {
        const data = await getStatus(id)
        setStep(Math.min(data.step || 1, STEPS.length - 1))
        if (data.status === 'done') {
          clearInterval(interval)
          const url = fontFileUrl(data.font_url)
          setFontUrl(url)
          localStorage.setItem('plog_font_url', url)
          setStep(STEPS.length - 1)
        } else if (data.status === 'error') {
          clearInterval(interval)
          setError(data.message || '生成失败，请重试')
        }
      } catch {
        // 网络波动，继续轮询
      }
    }, 2000)
  }

  if (error) {
    return (
      <div className="page" style={{ justifyContent: 'center', gap: 20 }}>
        <div style={{ fontSize: 48 }}>😞</div>
        <h2 style={{ fontSize: 20 }}>生成失败</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/collect')}>
          重新采集
        </button>
      </div>
    )
  }

  if (fontUrl) {
    return (
      <div className="page" style={{ justifyContent: 'center', gap: 24 }}>
        <div style={{ fontSize: 56 }}>🎉</div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 22 }}>字体生成成功！</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>你的专属手写字体已就绪</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <button className="btn btn-primary" onClick={() => navigate('/editor')}>
            去给照片加文案
          </button>
          <a
            href={fontUrl}
            download="my-handwriting.ttf"
            className="btn btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            下载 TTF 字体文件
          </a>
        </div>
      </div>
    )
  }

  const progress = step / (STEPS.length - 1)

  return (
    <div className="page" style={{ justifyContent: 'center', gap: 28 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
        <h2 style={{ fontSize: 20 }}>正在生成你的专属字体</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
          大约需要 2～5 分钟，请不要关闭页面
        </p>
      </div>

      <div style={{ width: '100%' }}>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 14, color: 'var(--text-secondary)', minHeight: 20 }}>
          {STEPS[step]}
        </p>
      </div>

      <div className="card">
        {STEPS.slice(0, -1).map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 0',
            borderBottom: i < STEPS.length - 2 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ fontSize: 16 }}>
              {i < step ? '✅' : i === step ? '⏳' : '⬜'}
            </span>
            <span style={{
              fontSize: 14,
              color: i < step ? 'var(--accent)' : i === step ? 'var(--text)' : 'var(--text-secondary)',
            }}>
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
