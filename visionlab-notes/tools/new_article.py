#!/usr/bin/env python3
"""Create a new article in VisionLab Notes. Standard library only."""
import argparse
import datetime as dt
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'content' / 'index.json'
ARTICLES = ROOT / 'content' / 'articles'
SLUG_RE = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
LEVELS = {'入門', '實作', '進階'}


def main():
    parser = argparse.ArgumentParser(description='新增 VisionLab Notes 文章草稿並更新索引')
    parser.add_argument('--slug', required=True, help='例如 confusion-matrix')
    parser.add_argument('--title', required=True)
    parser.add_argument('--category', required=True)
    parser.add_argument('--summary', required=True)
    parser.add_argument('--minutes', type=int, default=5)
    parser.add_argument('--level', default='入門', choices=sorted(LEVELS))
    args = parser.parse_args()

    with INDEX.open('r', encoding='utf-8') as f:
        index = json.load(f)

    if not SLUG_RE.fullmatch(args.slug):
        parser.error('slug 只能包含小寫英數與單字間連字號，例如 confusion-matrix')
    if args.category not in {c['id'] for c in index['categories']}:
        parser.error(f'分類不存在；可用：{", ".join(c["id"] for c in index["categories"])}')
    if args.minutes < 1 or args.minutes > 120:
        parser.error('minutes 請填 1～120 的正整數')
    if not args.title.strip() or not args.summary.strip():
        parser.error('標題與摘要不可為空')
    if args.slug in {a['slug'] for a in index['articles']} or (ARTICLES / f'{args.slug}.json').exists():
        parser.error(f'文章 {args.slug} 已存在，不可覆寫')

    today = dt.date.today().isoformat()
    metadata = {
        'slug': args.slug,
        'title': args.title.strip(),
        'category': args.category,
        'summary': args.summary.strip(),
        'minutes': args.minutes,
        'level': args.level,
        'updated': today,
    }
    draft = {
        'slug': args.slug,
        'sections': [
            {'type': 'heading', 'text': '01 / 核心概念'},
            {'type': 'paragraph', 'text': '請在此撰寫第一段教學內容。'},
            {'type': 'heading', 'text': '02 / 實作與重點'},
            {'type': 'paragraph', 'text': '請補充可實際理解或操作的內容。'},
            {'type': 'checklist', 'items': ['確認重點一', '確認重點二']},
        ],
    }
    ARTICLES.mkdir(parents=True, exist_ok=True)
    path = ARTICLES / f'{args.slug}.json'
    # Exclusive creation prevents accidental replacement of existing notes.
    with path.open('x', encoding='utf-8') as f:
        json.dump(draft, f, ensure_ascii=False, indent=2)
        f.write('\n')
    try:
        index['articles'].append(metadata)
        INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    except Exception:
        path.unlink(missing_ok=True)
        raise

    print(f'已建立：{path.relative_to(ROOT)}')
    print('已更新：content/index.json')
    print('下一步：填寫草稿內容，執行 python tools/validate_content.py')


if __name__ == '__main__':
    main()
