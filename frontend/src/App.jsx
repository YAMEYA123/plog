import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Collect from './pages/Collect'
import Generate from './pages/Generate'
import Editor from './pages/Editor'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collect" element={<Collect />} />
      <Route path="/generate" element={<Generate />} />
      <Route path="/editor" element={<Editor />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
