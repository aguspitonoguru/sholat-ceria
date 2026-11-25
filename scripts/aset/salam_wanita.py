# Salam Aisyah tampak depan dari sprite sheet "ASET/Salam Wanita Framee.jpg" (12 kolom x 6 baris frame).
# Urutan di sheet: diam → toleh kiri → diam → toleh kanan → diam. Dicerminkan supaya toleh KANAN dulu.
# Pakai: python scripts/aset/salam_wanita.py  → lalu: python scripts/aset/potong.py aisyah/salam
import subprocess, numpy as np
from salam import SRC, WORK

SHEET = SRC / 'Salam Wanita Framee.jpg'
COLS = [19, 132, 246, 359, 472, 585, 699, 812, 925, 1039, 1152, 1265]  # x kiri tiap kolom
ROWS = [25, 151, 273, 397, 517, 638]  # y atas tiap baris (label teks di bawah baris terakhir tidak ikut)
CW, CH, PAD = 113, 120, 10
FPS, UP = 10, 3


def cells():
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(SHEET), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])
    img = np.frombuffer(raw, np.uint8).reshape(768, 1376, 3)
    img = np.pad(img, ((PAD, PAD), (PAD, PAD), (0, 0)), constant_values=255)
    return [[img[y + PAD - 12:y + PAD - 12 + CH, x + PAD - 10:x + PAD - 10 + CW] for x in COLS] for y in ROWS]


def align(fs):
    """Sejajarkan frame: tengah & tepi bawah sajadah (hijau) disamakan ke median semua frame."""
    def mat(f):
        f = f.astype(int)
        ys, xs = np.nonzero(f[..., 1] - f[..., 0] > 30)
        return xs.mean(), ys.max()
    pos = np.array([mat(f) for f in fs])
    mx, my = np.median(pos, 0)
    out = []
    for f, (x, y) in zip(fs, pos):
        dx, dy = int(round(mx - x)), int(round(my - y))
        g = np.pad(f, ((PAD, PAD), (PAD, PAD), (0, 0)), constant_values=255)
        out.append(np.roll(np.roll(g, dy, 0), dx, 1)[PAD:-PAD, PAD:-PAD])
    return out


if __name__ == '__main__':
    r = cells()
    # baris 2 = toleh pertama (puncak di kolom 6, ditahan); baris 4-5 = toleh kedua (sudah ada jeda di puncaknya)
    seq = r[0][:6] + r[1][:7] + [r[1][6]] * 6 + r[1][7:] + r[2][:6] + r[3] + r[4] + r[5][:6]
    seq = [f[:, ::-1] for f in align(seq)]  # cermin: toleh kanan dulu
    WORK.mkdir(exist_ok=True)
    out = WORK / 'salam-wanita-front.mp4'
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{CW}x{CH}', '-r', str(FPS), '-i', '-',
                          '-vf', f'scale={CW * UP // 2 * 2}:{CH * UP}:flags=lanczos', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', str(out)],
                         stdin=subprocess.PIPE)
    for f in seq: p.stdin.write(np.ascontiguousarray(f).tobytes())
    p.stdin.close(); p.wait()
    print(out, len(seq) / FPS, 'dtk')
