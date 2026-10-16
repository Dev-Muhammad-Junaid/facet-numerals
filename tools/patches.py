"""Hand fixes applied to the generated drawings before normalizing.

svg/original/ stays exactly as generated. tools/normalize.py applies these edits on top,
so every change is visible here, reproducible, and easy to revert.

Coordinates are in each original file's own units (the 6 is drawn on an 80 x 80 artboard).
A path is matched by the start of its `d` attribute, which is unique within a file.

Each op is one of:
  ('replace', d_start, new_path)   swap the whole <path .../>
  ('remove', d_start)              delete the path
  ('insert_after', d_start, new_path)
  ('sub', d_start, old, new)       replace a substring inside that path
  ('defs', xml)                    add gradient definitions
  ('seal', [d_start, ...])         outline facets in their own colour (0.25 units) so hairline gaps
                                   between neighbouring facets stop showing the background
"""

import re

# Every hole (counter) gets the same dark floor, so all digits read as equally hollow.
# The generator painted counters black; tools/normalize.py recolours those to this.
FLOOR = '#330793'

PATCHES = {
    6: [
        # --- 1. The hole was cut clean through; 0, 4, 8 and 9 have a dark floor. -----------------
        # Add a floor under the counter walls (only the hole area stays visible), in the
        # shared floor colour.
        ('insert_after', 'm20.99 26.5',
         f'<path d="M35.4 53.1 L37.6 50.8 L44.5 50.8 L44.5 57 L42.3 59.4 L37 59.5 L35.4 57.3 Z" fill="{FLOOR}"/>'),

        # --- 2 + 3. Lumpy hook tip and hairline opening. ----------------------------------------
        # Straight edges everywhere, a flat chamfer instead of the rounded curl, and the underside
        # raised 1.2 units so the opening grows from 2.2% to about 4% of the digit's height.
        ('sub', 'm28.98 9.63',
         'm28.98 9.63 15.34-0.61 7.04 0.41 13.39 15.06s-0.22 4.84-1.82 6.83l-1.74 1.3-13.66-0.16s-2.34-1.86-3.21-3.47l',
         'M28.98 9.63 L44.32 9.02 L51.36 9.43 L64.75 24.49 L62.93 30.12 L61.19 31.42 L47.53 31.26 L44.32 28.99 l'),
        # end face: flat, no bulge
        ('replace', 'm56.49 23.97-0.49',
         '<path d="M56.49 23.97 L56 26.56 L62.93 30.12 L64.75 24.49 Z" fill="url(#paint3_linear_3145_56331)"/>'),
        ('replace', 'm56.49 23.97-0.5',
         '<path d="M56.49 23.97 L55.99 26.56 L62.93 30.12" stroke="#6D24B8" stroke-width=".2481"/>'),
        # underside: one blue facet with a straight purple lower strip (was four overlapping curved pieces)
        ('replace', 'm48.23 26.8-0.34',
         '<path d="M48.23 26.8 L55.99 26.56 L62.93 30.12 L61.19 31.42 L47.53 31.26 Z" fill="#0C2ADB"/>'),
        ('replace', 'm48.02 30.22',
         '<path d="M47.81 29.5 L61.72 29.5 L62.93 30.12 L61.19 31.42 L47.53 31.26 Z" fill="#3E0CBA"/>'),
        ('remove', 'm48.23 26.8-0.22'),
        # inner end of the hook: a straight chamfer facet instead of the rounded curl
        ('replace', 'm44.39 29.12',
         '<path d="M44.39 29.12 L48.23 26.8 L47.53 31.26 Z" fill="#0744FF"/>'),

        # --- 4. Gold corner in five fragments (three golds and a pink-violet wedge). ----------------
        # One gold facet, reusing the corner's own gradient; outer edge follows the body outline.
        ('replace', 'm56.69 45.99',
         '<path d="M53.57 34.31 C58.27 36.79 62.88 42.96 64.79 46.75 L56.69 45.99 L50.09 38.33 Z" fill="url(#paint9_linear_3145_56331)"/>'),
        ('remove', 'm58.02 37.76'),
        ('remove', 'm59.07 39.36'),
        ('remove', 'm51.93 36.44-1.84'),
        ('remove', 'm51.93 36.44-1.82'),

        # --- 5. Curved bevel on top of the bowl. ----------------------------------------------------
        ('replace', 'm53.57 34.31',
         '<path d="M53.57 34.31 L35.79 34.47 L29.68 39.18 L50.1 38.33 Z" fill="url(#paint8_linear_3145_56331)"/>'),
        ('replace', 'm29.96 38.98',
         '<path d="M29.96 38.98 L50.2 38.14" stroke="#B7F2FF" stroke-width=".3732"/>'),
        # the pocket walls above it end exactly on the new straight edge (no wedge between them)
        ('replace', 'm29.48 27.94', '<path d="M29.48 27.94 V39.22 L32.51 37 V29.39 Z" fill="#0735EF"/>'),
        ('replace', 'm32.51 29.32v6.8', '<path d="M32.51 29.32 V37 L35.98 34.46 V31.53 Z" fill="#480CA9"/>'),
        # the bodies underneath follow the same edge, so no blue sliver shows above the bevel
        ('sub', 'm15.35 24.46', '-11.29-12.48-6.37-0.58-12.71-0.43-17.76 0.15-1.95 0.92-4.37 2.72-5.99 4.59l-0.3-11.12',
         '-11.29-12.48l-17.76 0.15-5.99 4.59-0.3-11.12'),
        ('sub', 'm20.99 26.5', 'c-7.39-0.22-14.73 0.08-20.42 0.84l-0.19-11.24', 'l-20.42 0.84-0.19-11.24'),

        # --- 6. Lopsided crease under the hole. -----------------------------------------------------
        # The lower band was a 50% overlay plus two more patches on the left only. Make it one solid
        # band shaded left to right, the way the 0 does it.
        ('replace', 'm20.59 60.76',
         '<path d="m20.59 60.76 9.47 10.85 17.13-0.46 9.38-9.94-9.07-2.7-3.95 4.31-10.06 0.19-0.98-5.73-11.92 3.48z" fill="url(#fix6band)"/>'),
        ('remove', 'm30.06 71.61'),
        ('remove', 'm32.46 57.21'),
        ('defs', '<linearGradient id="fix6band" x1="20.6" x2="56.6" y1="64" y2="64" gradientUnits="userSpaceOnUse">'
                 '<stop stop-color="#0B94FF" offset="0"/><stop stop-color="#0B6FFF" offset="1"/></linearGradient>'),
    ],
    1: [('seal', ['m54.05 14.88', 'm45.78 15.07-0.46', 'm36.26 28.27-0.17', 'm32.15 60.12-0.31', 'm45.49 63.69-17.35', 'm22.89 64.03', 'm54.61 59.4', 'm49.22 60.23-3.73', 'm54.33 59.51-4.79', 'm26.75 60.31-3.86', 'm45.49 63.69 2.89'])],  # hairline gaps between facets
    4: [('seal', ['m36.36 7.93 ', 'm36.36 7.93-', 'm23.31 4.51c-2.63', 'm36.82 27.27-3.1', 'm36.73 27.29-3.01'])],  # hairline gaps between facets
    7: [('seal', ['m66.93 18.61c-0.22', 'm43.3 78.57c-1.32', 'm47.32 23.25c-4.86', 'm38.53 30.98c-6.34', 'm21.06 24.09 1', 'm21.06 24.09 2'])],  # hairline gaps between facets
    9: [('seal', ['m51.61 7.75c4.6', 'm28.12 8.21c8.11-0.53', 'm48.62 12.54', 'm16.31 60.93', 'm29.56 68.04-0.78', 'm47.42 67.51', 'm47.53 55.04', 'm51.53 7.75-2.91'])],  # hairline gaps between facets
}


def apply(digit, svg_text):
    """Returns svg_text with the digit's patches applied. Raises if a target path is missing."""
    for op in PATCHES.get(digit, []):
        if op[0] == 'defs':
            svg_text = svg_text.replace('</defs>', op[1] + '</defs>', 1)
        elif op[0] == 'seal':
            for start in op[1]:
                svg_text = _edit(digit, svg_text, ('seal', start))
        else:
            svg_text = _edit(digit, svg_text, op)
    return svg_text


def _edit(digit, svg_text, op):
    kind, start = op[0], op[1]
    hits = [m for m in re.finditer(r'<path [^>]*/>', svg_text) if f'd="{start}' in m.group(0)]
    if len(hits) != 1:
        raise ValueError(f'patch for {digit}: expected one path starting "{start}", found {len(hits)}')
    m = hits[0]
    old = m.group(0)
    if kind == 'replace':
        new = op[2]
    elif kind == 'remove':
        new = ''
    elif kind == 'insert_after':
        new = old + op[2]
    elif kind == 'seal':
        fill = re.search(r'fill="([^"]+)"', old).group(1)
        new = old.replace('<path ', f'<path stroke="{fill}" stroke-width=".25" stroke-linejoin="round" ', 1)
    elif kind == 'sub':
        if op[2] not in old:
            raise ValueError(f'patch for {digit}: "{op[2][:30]}..." not found in path "{start}"')
        new = old.replace(op[2], op[3], 1)
    else:
        raise ValueError(f'unknown patch op {kind}')
    return svg_text[:m.start()] + new + svg_text[m.end():]
