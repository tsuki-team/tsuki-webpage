#!/usr/bin/env python3
import curses, sys, os, time

FILE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "play.txt")
FPS  = float(sys.argv[2]) if len(sys.argv) > 2 else 24.0

LIGHT = set(' .\'`,')

def convert(frame, half_cols):
    out = []
    for line in frame.strip('\n').splitlines():
        sampled = line[::2][:half_cols]
        row = ''.join('月' if c not in LIGHT else ' ' for c in sampled)
        out.append(row)
    return out

def main(stdscr):
    global FPS
    curses.curs_set(0)
    curses.use_default_colors()
    curses.init_pair(1, curses.COLOR_CYAN, -1)

    with open(FILE, encoding='utf-8') as f:
        content = f.read()

    raw_frames = content.split('SPLIT')
    total   = len(raw_frames)
    idx     = 0
    playing = True
    spf     = 1.0 / FPS
    last_t  = time.monotonic()
    cache   = {}

    stdscr.nodelay(True)

    while True:
        rows, cols = stdscr.getmaxyx()
        half = cols // 2
        now  = time.monotonic()

        if playing and (now - last_t) >= spf:
            idx    = (idx + 1) % total
            last_t = now

        if (idx, half) not in cache:
            cache[(idx, half)] = convert(raw_frames[idx], half)
        frame_lines = cache[(idx, half)]

        stdscr.erase()
        for r, line in enumerate(frame_lines):
            if r >= rows - 2:
                break
            try:
                stdscr.addstr(r, 0, line)
            except curses.error:
                pass

        state  = ">" if playing else "||"
        status = f" {state} {idx+1}/{total}  {FPS:.0f}fps  space=play/pause  arrows=frame  +/-=fps  q=salir "
        try:
            stdscr.attron(curses.color_pair(1) | curses.A_REVERSE)
            stdscr.addnstr(rows - 1, 0, status.ljust(cols - 1), cols - 1)
            stdscr.attroff(curses.color_pair(1) | curses.A_REVERSE)
        except curses.error:
            pass

        stdscr.refresh()

        key = stdscr.getch()
        if key in (ord('q'), ord('Q')):
            break
        elif key == ord(' '):
            playing = not playing
            last_t  = time.monotonic()
        elif key == curses.KEY_RIGHT:
            idx    = (idx + 1) % total
            last_t = time.monotonic()
        elif key == curses.KEY_LEFT:
            idx    = (idx - 1) % total
            last_t = time.monotonic()
        elif key in (ord('+'), ord('=')):
            FPS = min(FPS + 1, 60)
            spf = 1.0 / FPS
        elif key == ord('-'):
            FPS = max(FPS - 1, 1)
            spf = 1.0 / FPS

        elapsed = time.monotonic() - now
        sleep   = min(spf, 0.016) - elapsed
        if sleep > 0:
            time.sleep(sleep)

if __name__ == '__main__':
    if not os.path.exists(FILE):
        print(f'No encuentro: {FILE}')
        sys.exit(1)
    curses.wrapper(main)

