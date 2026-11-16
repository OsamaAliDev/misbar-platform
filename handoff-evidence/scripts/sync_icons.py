#!/usr/bin/env python3
"""Collect every Material Symbols icon name used in src/ and sync the
`icon_names=` subset in index.html (alphabetical).

Sources of icon names:
  <Icon name="x" ...>, <Icon name={cond ? 'a' : 'b'} ...>
  object keys:  icon: 'x', badgeIcon: 'x', eyebrowIcon="x"
"""
import pathlib
import re
import sys

ROOT = pathlib.Path('/home/ubuntu/misbar')
names = set()

for path in (ROOT / 'src').rglob('*'):
    if path.suffix not in {'.js', '.jsx'}:
        continue
    text = path.read_text(encoding='utf-8')
    # <Icon ... name=... > : grab all quoted identifiers in the name attribute.
    for match in re.finditer(r'<Icon\b[^>]*?\bname=(\{[^}]*\}|"[^"]*"|\'[^\']*\')', text, re.S):
        names.update(re.findall(r"['\"]([a-z][a-z0-9_]*)['\"]", match.group(1)))
    # data keys
    for match in re.finditer(r"\b(?:icon|badgeIcon|eyebrowIcon|categoryIcon)\s*[:=]\s*['\"]([a-z][a-z0-9_]*)['\"]", text):
        names.add(match.group(1))

names.discard('icon')
ordered = sorted(names)
index = ROOT / 'index.html'
html = index.read_text(encoding='utf-8')
new_html, count = re.subn(r'icon_names=[a-z0-9_,]+', 'icon_names=' + ','.join(ordered), html)
if count != 1:
    sys.exit('icon_names parameter not found exactly once in index.html')
index.write_text(new_html, encoding='utf-8')
print(len(ordered), 'icons:', ','.join(ordered))
