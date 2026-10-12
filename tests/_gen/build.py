# Generate the code-carrying references from the tested fixture apps.
#   python tests/_gen/build.py           rewrite awwwards/references/{engine,astro,nextjs,webgl}.md
#   python tests/_gen/build.py --check   fail if they differ from what the fixtures would generate
import json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
T = os.path.join(ROOT, 'tests')
G = os.path.join(T, '_gen')
R = os.path.join(ROOT, 'awwwards', 'references')
SHARED = ['env.ts', 'scroll.ts', 'reveal.ts', 'loader.ts', 'interactions.ts', 'transition.ts', 'index.ts',
          'gl/index.ts', 'gl/shaders.ts']

def read(*p):
    return open(os.path.join(*p), encoding='utf8').read().replace('\r\n', '\n')

def sub(s, old, new):
    # Fail loudly: a silent no-op would ship fixture wording into the reference and --check
    # would still pass, because the regenerated file becomes the new truth.
    if old not in s:
        sys.exit(f'FAIL build.py: expected text not found, update the replacement: {old[:80]!r}')
    return s.replace(old, new)

def major(app, pkg):
    data = json.loads(read(T, app, 'package.json'))
    spec = {**data.get('dependencies', {}), **data.get('devDependencies', {})}.get(pkg)
    m = re.search(r'\d+', spec or '')
    if not m:
        sys.exit(f'FAIL build.py: no version for {pkg} in {app}/package.json')
    return m.group(0)

def header(src):
    return f'<!-- Generated from {src} by tests/_gen/build.py; edit there, not here. -->\n'

def engine():
    E = os.path.join(T, 'nexttest', 'src', 'engine')
    def code(rel, lang='ts'):
        return f"### `src/engine/{rel}`\n\n```{lang}\n{read(E, rel).rstrip()}\n```\n"
    css = read(T, 'nexttest', 'src', 'app', 'globals.css')
    if '/* Test-only' not in css:
        sys.exit('FAIL build.py: globals.css lost its /* Test-only marker; the fixture frame would ship')
    css = css.split('/* Test-only')[0]
    i = css.index('/* ENGINE + FOUNDATION')
    tokens, engine_css = css[:i].rstrip() + '\n', css[i:].rstrip() + '\n'
    tokens = sub(tokens, "--f-display: var(--font-display), system-ui, sans-serif;", "--f-display: 'Display', system-ui, sans-serif; /* Next: var(--font-display) from next/font */")
    tokens = sub(tokens, "--f-body: var(--font-text), system-ui, sans-serif;", "--f-body: system-ui, sans-serif;")
    tokens = sub(tokens, "/* DESIGN TOKENS: rewrite this whole file per project from the art-direction plan.\n   These neutral values only exist so the engine renders. Shipping them unchanged is a failure. */",
     "/* DESIGN TOKENS: rewrite every value per project from the art-direction plan. The NAMES are the\n   contract the engine CSS uses; the neutral values only exist so the engine renders. */")
    engine_css = sub(engine_css, "/* ENGINE + FOUNDATION. Project look lives in tokens.css and component styles; edit this file\n   only to fix engine behavior. */", "/* ENGINE + FOUNDATION. The project look lives in tokens and component styles; edit this file\n   only to change engine behavior. */")
    return header('tests/nexttest') + read(G, 'engine_head.md') + \
      "\n## Code\n\nCopy each file verbatim, then customize the parts marked as yours (loader look, transition,\neases). Keep the hooks and names: other references assume them.\n\n" + \
      "\n".join(code(f) for f in ['env.ts', 'scroll.ts', 'reveal.ts', 'loader.ts', 'interactions.ts', 'transition.ts']) + \
      "\n" + code('index.ts') + \
      "\n## CSS\n\n### Tokens (`tokens.css`)\n\n```css\n" + tokens + "```\n\n### Engine foundation (`engine.css`)\n\n```css\n" + engine_css + "```\n"

def template(name):
    s = read(G, name + '.tpl.md')
    srcs = sorted({m.split('/')[0] for m in re.findall(r'\{\{file:([^}]+)\}\}', s)})
    s = re.sub(r'\{\{file:([^}]+)\}\}\n', lambda m: read(T, m.group(1)).rstrip() + '\n', s)
    s = re.sub(r'\{\{major:([^/}]+)/([^}]+)\}\}', lambda m: major(m.group(1), m.group(2)), s)
    left = re.findall(r'\{\{(?:file|major):[^}]*\}\}', s)
    if left:
        sys.exit(f'FAIL build.py: unfilled placeholder {left[0]} in {name}.tpl.md ({{{{file:...}}}} needs its own line)')
    return header(' and '.join('tests/' + x for x in srcs)) + s

def main():
    check = '--check' in sys.argv
    bad = []
    # The engine is one codebase copied into both fixtures; they must not diverge.
    for f in SHARED:
        if read(T, 'nexttest', 'src', 'engine', f) != read(T, 'astrotest', 'src', 'engine', f):
            bad.append(f'engine/{f} differs between nexttest and astrotest')
    css = read(T, 'nexttest', 'src', 'app', 'globals.css')
    engine_css = css[css.index('/* ENGINE + FOUNDATION'):css.index('/* Test-only')].rstrip()
    if engine_css not in read(T, 'astrotest', 'src', 'styles', 'base.css'):
        bad.append('engine CSS in nexttest globals.css differs from astrotest styles/base.css')
    out = {'engine': engine(), **{n: template(n) for n in ['astro', 'nextjs', 'webgl']}}
    for name, text in out.items():
        dst = os.path.join(R, name + '.md')
        if check:
            if read(dst) != text:
                bad.append(f'references/{name}.md is out of date (run python tests/_gen/build.py)')
        else:
            open(dst, 'w', encoding='utf8', newline='\n').write(text)
            print(f'wrote references/{name}.md ({len(text.splitlines())} lines)')
    for b in bad:
        print('FAIL', b)
    if bad:
        sys.exit(1)
    if check:
        print('ok: references match the fixtures')

main()
