const BASE = import.meta.env.VITE_API_URL || ''

export async function startGenerate(samples) {
  const res = await fetch(`${BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ samples }),
  })
  if (!res.ok) throw new Error('生成失败，请重试')
  return res.json()
}

export async function getStatus(taskId) {
  const res = await fetch(`${BASE}/api/status/${taskId}`)
  if (!res.ok) throw new Error('查询失败')
  return res.json()
}

export function fontFileUrl(path) {
  return `${BASE}${path}`
}
