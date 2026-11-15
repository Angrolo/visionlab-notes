#!/usr/bin/env python3
"""Validate article metadata and content schemas. Standard library only."""
import datetime as dt
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / 'content' / 'index.json'
ARTICLES = ROOT / 'content' / 'articles'
SLUG = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
CAT_ID = re.compile(r'^[a-z]+$')
TONES = {'purple', 'teal', 'blue', 'amber'}
LEVELS = {'入門', '實作', '進階'}
SECTIONS = {
    'heading': {'type', 'text'},
    'paragraph': {'type', 'text'},
    'list': {'type', 'items'},
    'checklist': {'type', 'items'},
    'callout': {'type', 'title', 'text'},
    'code': {'type', 'language', 'code'},
}
errors = []


def err(msg):
    errors.append(msg)


def load_json(path):
    try:
        with path.open('r', encoding='utf-8') as file:
            return json.load(file)
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        err(f'{path.relative_to(ROOT)}: 無法讀取 JSON：{exc}')
        return None


def nonempty_str(val):
    return isinstance(val, str) and bool(val.strip())


def validate():
    data = load_json(INDEX)
    if not isinstance(data, dict):
        return
    cats, articles = data.get('categories'), data.get('articles')
    if not isinstance(cats, list) or not isinstance(articles, list):
        err('content/index.json 必須有 categories 與 articles 陣列')
        return
    cat_ids = set()
    for i, c in enumerate(cats):
        if not isinstance(c, dict) or set(c) != {'id', 'label', 'icon', 'tone'}:
            err(f'categories[{i}]: 必須只有 id,label,icon,tone 四欄')
            continue
        if not nonempty_str(c['id']) or not CAT_ID.fullmatch(c['id']):
            err(f'categories[{i}]: id 格式錯誤')
        if c['id'] in cat_ids:
            err(f'categories[{i}]: 重複的分類 {c["id"]}')
        cat_ids.add(c['id'])
        if c['tone'] not in TONES or not nonempty_str(c['label']) or not nonempty_str(c['icon']):
            err(f'categories[{i}]: label/icon/tone 不合法')
    slugs = set()
    mandatory = {'slug', 'title', 'category', 'summary', 'minutes', 'level', 'updated'}
    for i, a in enumerate(articles):
        prefix = f'articles[{i}]'
        if not isinstance(a, dict) or set(a) != mandatory:
            err(f'{prefix}: 必填欄位為 {sorted(mandatory)}')
            continue
        s = a['slug']
        if not isinstance(s, str) or not SLUG.fullmatch(s):
            err(f'{prefix}: slug 格式錯誤')
            continue
        if s in slugs:
            err(f'{prefix}: 重複的 slug {s}')
        slugs.add(s)
        if a['category'] not in cat_ids:
            err(f'{prefix}: 不存在的 category {a["category"]}')
        if any(not nonempty_str(a[k]) for k in ('title', 'summary')):
            err(f'{prefix}: title/summary 不能空白')
        if type(a['minutes']) is not int or not 1 <= a['minutes'] <= 120:
            err(f'{prefix}: minutes 必須在 1～120')
        if a['level'] not in LEVELS:
            err(f'{prefix}: level 不合法')
        try:
            if not isinstance(a['updated'], str) or dt.date.fromisoformat(a['updated']).isoformat() != a['updated']:
                raise ValueError()
        except ValueError:
            err(f'{prefix}: 日期應為 YYYY-MM-DD')
        path = ARTICLES / f'{s}.json'
        doc = load_json(path)
        if not isinstance(doc, dict):
            continue
        if set(doc) != {'slug', 'sections'} or doc.get('slug') != s:
            err(f'{path.name}: 僅接受 slug/sections，且 slug 必須與檔名相同')
            continue
        sections = doc['sections']
        if not isinstance(sections, list):
            err(f'{path.name}: sections 必須是陣列')
            continue
        kinds = []
        for j, section in enumerate(sections):
            label = f'{path.name} sections[{j}]'
            if not isinstance(section, dict) or section.get('type') not in SECTIONS:
                err(f'{label}: 未支援的區塊型別')
                continue
            kind = section['type']
            kinds.append(kind)
            if set(section) != SECTIONS[kind]:
                err(f'{label}: 需要欄位 {sorted(SECTIONS[kind])}')
                continue
            for k in SECTIONS[kind] - {'type', 'items'}:
                if not nonempty_str(section[k]):
                    err(f'{label}: {k} 不能空白')
            if 'items' in section and (not isinstance(section['items'], list) or not section['items'] or any(not nonempty_str(x) for x in section['items'])):
                err(f'{label}: items 必須是非空文字陣列')
        if kinds.count('heading') < 2 or 'paragraph' not in kinds or 'checklist' not in kinds:
            err(f'{path.name}: 至少 2 個 heading、1 個 paragraph、1 個 checklist')
    actual = {p.stem for p in ARTICLES.glob('*.json')}
    for orphan in sorted(actual - slugs):
        err(f'content/articles/{orphan}.json: 未列在 index.json 的孤兒文章')
    print(f'已檢查 {len(cats)} 個分類與 {len(articles)} 篇文章。')


if __name__ == '__main__':
    validate()
    if errors:
        for error in errors:
            print('✗', error)
        print(f'驗證失敗：{len(errors)} 個問題。')
        sys.exit(1)
    print('✓ 內容驗證通過。')
