"""
Plog 手写字体后端 API
"""
import asyncio
import os
import uuid
from pathlib import Path
from typing import Dict, List, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from stroke_processor import analyze_style
from font_generator import build_font

app = FastAPI(title='Plog Font API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

FONTS_DIR = Path('fonts')
FONTS_DIR.mkdir(exist_ok=True)

# 任务状态存储（生产环境应用 Redis，这里用内存）
tasks: Dict[str, Dict[str, Any]] = {}


class GenerateRequest(BaseModel):
    samples: Dict[str, List[List[Dict[str, float]]]]  # {char: [[{x,y}]]}


class GenerateResponse(BaseModel):
    task_id: str


@app.post('/api/generate', response_model=GenerateResponse)
async def generate_font(req: GenerateRequest):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {'status': 'running', 'step': 1, 'font_url': None, 'message': ''}
    asyncio.create_task(_run_generation(task_id, req.samples))
    return GenerateResponse(task_id=task_id)


async def _run_generation(task_id: str, samples: Dict[str, Any]):
    try:
        def progress(ratio: float, msg: str):
            step = max(1, min(4, int(ratio * 4) + 1))
            tasks[task_id]['step'] = step
            tasks[task_id]['message'] = msg

        tasks[task_id]['step'] = 2
        style = analyze_style(samples)

        tasks[task_id]['step'] = 3
        # 在线程池中运行 CPU 密集型字体生成
        loop = asyncio.get_event_loop()
        font_bytes = await loop.run_in_executor(
            None,
            lambda: build_font(samples, style, progress)
        )

        tasks[task_id]['step'] = 4
        font_path = FONTS_DIR / f'{task_id}.ttf'
        font_path.write_bytes(font_bytes)

        tasks[task_id]['step'] = 5
        tasks[task_id]['status'] = 'done'
        tasks[task_id]['font_url'] = f'/api/fonts/{task_id}.ttf'

    except Exception as e:
        tasks[task_id]['status'] = 'error'
        tasks[task_id]['message'] = str(e)


@app.get('/api/status/{task_id}')
async def get_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail='Task not found')
    t = tasks[task_id]
    return {
        'status': t['status'],
        'step': t['step'],
        'font_url': t.get('font_url'),
        'message': t.get('message', ''),
    }


@app.get('/api/fonts/{filename}')
async def get_font(filename: str):
    path = FONTS_DIR / filename
    if not path.exists() or not filename.endswith('.ttf'):
        raise HTTPException(status_code=404)
    return FileResponse(path, media_type='font/ttf', filename='my-handwriting.ttf')


@app.get('/health')
async def health():
    return {'ok': True}
