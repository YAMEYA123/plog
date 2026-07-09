import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const hasSavedFont = !!localStorage.getItem('plog_font_url')

  return (
    <div className="page" style={{ justifyContent: 'center', gap: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>✍️</div>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>手写字体</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
          手写 30 个字，生成专属手写字体<br />用于给你的 plog 添加文案
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        <button className="btn btn-primary" onClick={() => navigate('/collect')}>
          开始采集手写样本
        </button>
        {hasSavedFont && (
          <button className="btn btn-secondary" onClick={() => navigate('/editor')}>
            去照片编辑器
          </button>
        )}
      </div>

      <div className="card" style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '✏️', title: '手写采集', desc: '逐字手写 30 个样本字，约 10 分钟' },
            { icon: '🤖', title: 'AI 生成字体', desc: '模型学习你的笔迹风格，生成完整字符集' },
            { icon: '🖼️', title: '给照片加文案', desc: '用手写字体在照片上添加文字，导出分享' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
