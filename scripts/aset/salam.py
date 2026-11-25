# Gerakan salam dari video Tahiyat (yang kameranya berputar):
# tubuh = 1 frame diam, kepala = diambil dari frame lain yang sudut kameranya bergeser
# (kamera berputar mengelilingi kepala ≈ kepala menoleh di depan kamera diam). Toleh kiri = cermin toleh kanan.
# Pakai: python scripts/aset/salam.py [front side back]  → lalu: python scripts/aset/potong.py ali/salam
import subprocess, sys, tempfile, numpy as np
from pathlib import Path

SRC = Path(__file__).resolve().parents[3] / 'ASET'  # folder ASET di sebelah folder proyek
WORK = Path(tempfile.gettempdir()) / 'sholat-ceria-salam'  # hasil antara (640x360), dipotong lagi oleh potong.py
FPS = 24
RX, RY, RYB = 1.0, 0.7, 0.75 # jari-jari elips kepala (× lebar topi); lebar supaya tepi peralihan jatuh di latar, bukan di pipi


def frames(name, t0, t1, n):
    """n frame merata dari detik t0→t1 (t1 < t0 = mundur), RGB float."""
    out = []
    for t in np.linspace(t0, t1, n):
        raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', f'{SRC}/{name}', '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])
        out.append(np.frombuffer(raw, np.uint8).reshape(360, 640, 3).astype(np.float32))
    return out


def hat(img):
    """(cx, top, lebar) topi/rambut hitam di separuh atas."""
    m = img.mean(2)[:180] < 40
    ys, xs = np.nonzero(m)
    return xs.mean(), ys.min(), xs.max() - xs.min()


def paste(base, src, mirror=False):
    if mirror: src = src[:, ::-1]
    bx, bt, bw = hat(base)
    sx, st, sw = hat(src)
    # geser sumber supaya topinya sejajar topi tubuh (skala sama: framing video identik)
    dx, dy = int(round(sx - bx)), int(round(st - bt))
    sh = np.roll(np.roll(src, -dy, 0), -dx, 1)
    H, W = base.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]
    cy = bt + 0.55 * bw
    ry = np.where(yy > cy, RYB, RY)
    d = ((xx - bx) / (RX * bw)) ** 2 + ((yy - cy) / (ry * bw)) ** 2
    e = np.clip((1.0 - d) / 0.15, 0, 1)  # elips area kepala, tepi dihaluskan
    # di dalam elips: piksel kepala sumber menimpa; wajah asli yang tak tertutup diganti warna latar;
    # sisanya (kerah/latar tubuh) tetap dari tubuh → kerah frame sumber tidak ikut tertempel
    hs = soft(headmask(sh))
    hb = blur((blur(headmask(base), 3) > 0.04).astype(np.float32), 2)  # diperlebar: tepi samar kepala lama ikut terhapus
    a_src = hs * e
    a_bg = hb * (1 - hs) * e
    # warna latar per baris: interpolasi piksel tepat di luar elips kiri & kanan
    xl, xr = int(max(0, bx - 1.05 * RX * bw)), int(min(W - 1, bx + 1.05 * RX * bw))
    t = np.clip((xx - xl) / (xr - xl), 0, 1)[..., None]
    bg = base[:, xl:xl + 1] * (1 - t) + base[:, xr:xr + 1] * t
    return base * (1 - a_src - a_bg)[..., None] + sh * a_src[..., None] + bg * a_bg[..., None]


def headmask(img):
    """kulit/rambut/topi = gelap atau berwarna; latar & baju putih = terang dan pucat."""
    mx, mn = img.max(2), img.min(2)
    return ((mx < 150) | ((mx - mn) / (mx + 1) > 0.15)).astype(np.float32)


def blur(m, r):
    for ax in (0, 1):
        c = np.cumsum(np.pad(m, [(r + 1, r) if a == ax else (0, 0) for a in (0, 1)], mode='edge'), ax)
        m = (np.take(c, range(2 * r + 1, c.shape[ax]), ax) - np.take(c, range(0, c.shape[ax] - 2 * r - 1), ax)) / (2 * r + 1)
    return m


def soft(m):
    return blur((blur(m, 3) > 0.35).astype(np.float32), 1)  # tutup lubang kecil (putih mata), tepi halus


def ease(n):
    return (1 - np.cos(np.linspace(0, np.pi, n))) / 2


def salam(base, right, left):
    """right/left = (urutan kepala netral → menoleh penuh, cermin?). Toleh kanan dulu, lalu kiri."""
    seq = []
    def go(turn, mirror):
        idx = [round(e * (len(turn) - 1)) for e in ease(int(0.7 * FPS))]
        seq.extend(paste(base, turn[i], mirror) for i in idx)          # menoleh
        seq.extend([paste(base, turn[-1], mirror)] * int(0.9 * FPS))    # tahan
        seq.extend(paste(base, turn[i], mirror) for i in idx[::-1])    # kembali
    seq.extend([base] * int(0.8 * FPS))
    go(*right)
    seq.extend([base] * int(0.4 * FPS))
    go(*left)
    seq.extend([base] * int(0.6 * FPS))
    return seq


D, S_, B = 'Tahiyah Akhir Pria Depan.mp4', 'Tahiyat Ahir Samping.mp4', 'Tahiyat Akhir Belakang Belakang.mp4'
# Video Belakang detik 6,8→8,2: kamera menyapu belakang-samping → profil → depan-samping (kepala tetap di titik layar yang sama).
# Kamera bergerak ke sisi kiri Ali = kepala menoleh ke kanan (di sudut depan) / ke kiri (di sudut belakang).
VIEWS = {
    'front': ((D, 7.0), (B, 8.2, 7.7, False), (B, 8.2, 7.7, True)),
    'side': ((S_, 3.0), (B, 7.7, 6.9, False), (B, 7.7, 8.2, False)),  # kanan = menjauhi kamera, kiri = ke arah kamera
    'back': ((B, 4.5), (B, 6.0, 7.45, True), (B, 6.0, 7.45, False)),
}

if __name__ == '__main__':
    WORK.mkdir(exist_ok=True)
    for v in sys.argv[1:] or VIEWS:
        (bn, bt), *turns = VIEWS[v]
        base = frames(bn, bt, bt, 1)[0]
        seq = salam(base, *[(frames(n, t0, t1, 16), m) for n, t0, t1, m in turns])
        p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '640x360', '-r', str(FPS), '-i', '-',
                              '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', str(WORK / f'salam-{v}.mp4')], stdin=subprocess.PIPE)
        for f in seq: p.stdin.write(np.clip(f, 0, 255).astype(np.uint8).tobytes())
        p.stdin.close(); p.wait()
        print(v, len(seq) / FPS, 'dtk')
