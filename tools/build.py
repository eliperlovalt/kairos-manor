#!/usr/bin/env python3
"""Turn the Estate source (the Claude artifact's index.html) into the phone copy
(eliperlovalt/Eh index.html): one file, three.js bundled, whitespace minified,
PWA tags in the head.

usage: build.py SOURCE_HTML OUT_HTML
"""
import os, re, subprocess, sys, tempfile

TOOLS = os.environ.get('EH_NODE_MODULES', '/home/claude/tools/node_modules')
ESBUILD = os.path.join(TOOLS, '.bin', 'esbuild.cmd' if os.name == 'nt' else 'esbuild')

PWA = '''<meta name="robots" content="noindex,nofollow,noarchive">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Kairos Manor">
<meta name="theme-color" content="#0d0f12">
<link rel="apple-touch-icon" href="icon.png">
<link rel="icon" href="icon.png">
<link rel="manifest" href="manifest.json">
<style>html,body{overscroll-behavior:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}</style>
'''


def build(src, extra=()):
    lines = src.split('\n')
    # head: insert PWA tags after the viewport meta
    vi = next(i for i, l in enumerate(lines) if l.startswith('<meta name="viewport"'))
    # module script
    mi = next(i for i, l in enumerate(lines) if l.startswith('<script type="module">'))
    ii = next(i for i, l in enumerate(lines) if l.startswith('<script type="importmap">'))
    end = next(i for i in range(len(lines) - 1, mi, -1) if lines[i].startswith('</script>'))
    js = '\n'.join(lines[mi + 1:end])
    js = js.replace("require('./props.js')", 'null')
    td = os.path.dirname(TOOLS)
    if True:
        entry = os.path.join(td, 'main.js')
        out = os.path.join(td, 'out.js')
        open(entry, 'w', encoding='utf8', newline='\n').write(js)
        env = dict(os.environ, NODE_PATH=TOOLS)
        subprocess.run([ESBUILD, entry, '--bundle', '--format=iife', '--target=esnext',
                        '--minify-whitespace', '--log-level=error',
                        '--alias:three/addons=three/examples/jsm', '--outfile=' + out, *extra],
                       check=True, env=env, cwd=td)
        bundle = open(out, encoding='utf8').read()
    head = lines[:vi + 1] + [PWA.rstrip('\n')] + lines[vi + 1:ii]
    tail = lines[end + 1:]
    return '\n'.join(head + ['<script>' + bundle + '</script>'] + tail)


if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8', newline='\n').write(build(src))
    print('built', sys.argv[2], os.path.getsize(sys.argv[2]), 'bytes')
    # v1.51: the Catalog reads kits.json from beside the page, so the live copy carries one (it failed on every device without it)
    k = os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), 'kits.json')
    if os.path.exists(k):
        d = os.path.join(os.path.dirname(os.path.abspath(sys.argv[2])), 'kits.json')
        if os.path.abspath(k) != d:
            import shutil; shutil.copyfile(k, d); print('copied kits.json beside', sys.argv[2])
