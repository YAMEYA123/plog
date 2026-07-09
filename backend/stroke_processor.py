"""
将前端传来的笔迹数据（点序列）处理为 SVG 路径和字体字形所需的轮廓。
"""
import math
from typing import List, Dict, Tuple


Point = Dict[str, float]
Stroke = List[Point]


def smooth_stroke(stroke: Stroke, window: int = 3) -> Stroke:
    """对笔迹做移动平均平滑"""
    if len(stroke) <= window:
        return stroke
    result = []
    for i in range(len(stroke)):
        lo = max(0, i - window // 2)
        hi = min(len(stroke), i + window // 2 + 1)
        x = sum(p['x'] for p in stroke[lo:hi]) / (hi - lo)
        y = sum(p['y'] for p in stroke[lo:hi]) / (hi - lo)
        result.append({'x': x, 'y': y})
    return result


def stroke_to_svg_path(stroke: Stroke) -> str:
    """将一条笔迹转换为 SVG path d 属性"""
    if not stroke:
        return ''
    pts = smooth_stroke(stroke)
    d = f'M {pts[0]["x"]:.1f} {pts[0]["y"]:.1f}'
    if len(pts) == 1:
        return d
    for i in range(1, len(pts) - 1):
        cx = (pts[i]['x'] + pts[i + 1]['x']) / 2
        cy = (pts[i]['y'] + pts[i + 1]['y']) / 2
        d += f' Q {pts[i]["x"]:.1f} {pts[i]["y"]:.1f} {cx:.1f} {cy:.1f}'
    last = pts[-1]
    d += f' L {last["x"]:.1f} {last["y"]:.1f}'
    return d


def strokes_to_svg(strokes: List[Stroke], canvas_size: int = 320, glyph_size: int = 1000) -> str:
    """
    将笔迹列表转为一个完整的 SVG 字符串。
    坐标从 canvas_size 缩放到 glyph_size（UPM 坐标系）。
    """
    scale = glyph_size / canvas_size
    paths = []
    for stroke in strokes:
        scaled = [{'x': p['x'] * scale, 'y': p['y'] * scale} for p in stroke]
        paths.append(stroke_to_svg_path(scaled))

    path_elements = '\n'.join(
        f'  <path d="{d}" stroke="black" stroke-width="60" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
        for d in paths if d
    )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {glyph_size} {glyph_size}">
{path_elements}
</svg>'''


def analyze_style(samples: Dict[str, List[Stroke]]) -> Dict:
    """
    从样本笔迹中提取风格参数：
    - stroke_width: 平均笔画粗细（归一化）
    - slant: 书写倾斜角度（度）
    - char_width_ratio: 字宽/字高比
    """
    if not samples:
        return {'stroke_width': 60, 'slant': 0.0, 'width_ratio': 0.9}

    all_strokes: List[Stroke] = []
    for strokes in samples.values():
        all_strokes.extend(strokes)

    # 估算平均行进角度（倾斜度）
    angles = []
    for stroke in all_strokes:
        if len(stroke) >= 2:
            dx = stroke[-1]['x'] - stroke[0]['x']
            dy = stroke[-1]['y'] - stroke[0]['y']
            if abs(dx) > 5:
                angles.append(math.degrees(math.atan2(dy, dx)))

    slant = sum(angles) / len(angles) if angles else 0.0

    # 估算笔画长度（用于推断粗细）
    lengths = []
    for stroke in all_strokes:
        length = sum(
            math.hypot(stroke[i+1]['x'] - stroke[i]['x'], stroke[i+1]['y'] - stroke[i]['y'])
            for i in range(len(stroke) - 1)
        )
        lengths.append(length)
    avg_length = sum(lengths) / len(lengths) if lengths else 100
    stroke_width = max(30, min(100, int(avg_length * 0.06)))

    return {
        'stroke_width': stroke_width,
        'slant': slant,
        'width_ratio': 0.9,
    }
