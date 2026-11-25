# Potong video ASET (1 atau 3 sudut per frame) jadi aset per sudut di public/aset/{tokoh}/{gerakan}-{view}.mp4/.png
# Pakai: python scripts/aset/potong.py [tokoh/gerakan ...]   (tanpa argumen = semua; ali/salam butuh salam.py dulu)
import subprocess, sys, numpy as np, os
from pathlib import Path
from salam import SRC, WORK

DST = Path(__file__).resolve().parents[2] / 'public' / 'aset'
# (file, tokoh, gerakan, sudut-sudut kiri→kanan, detik frame diam)
JOBS = [
    ('Takbir Pria.mp4', 'ali', 'takbir', 'front side back', 2.0),
    ('Takbir Wanita.mp4', 'aisyah', 'takbir', 'front side back', 2.0),
    ('Rukuk Pria.mp4', 'ali', 'rukuk', 'front side back', 4.0),
    ('I;tidak Pria.mp4', 'ali', 'itidal', 'front side back', 2.0),
    ("I'tidak Wanita.mp4", 'aisyah', 'itidal', 'front side back', 2.0),
    ('Sujut Pria.mp4', 'ali', 'sujud', 'front side back', 4.0),
    ('Sujut Wanita.mp4', 'aisyah', 'sujud', 'front side back', 4.0),
    ('Duduk duaa sujud Pria.mp4', 'ali', 'duduk', 'front side back', 4.0),
    ('Duduk dua sujut Wanita.mp4', 'aisyah', 'duduk', 'front side back', 4.0),
    # salam: hasil salam.py (kepala menoleh kanan-kiri, tubuh diam), still saat menoleh kanan
    (str(WORK / 'salam-front.mp4'), 'ali', 'salam', 'front', 1.9),
    (str(WORK / 'salam-side.mp4'), 'ali', 'salam', 'side', 1.9),
    (str(WORK / 'salam-back.mp4'), 'ali', 'salam', 'back', 1.9),
    # sapaan di beranda (melambai), still saat tangan terangkat
    ('Halo Pria.mp4', 'ali', 'sapa', 'front', 2.5),
    ('Halo Wanita.mp4', 'aisyah', 'sapa', 'front', 2.5),
    # salam Aisyah: depan dari sprite sheet (salam_wanita.py); samping/belakang belum ada → duduk diam (pose sama, tanpa menoleh)
    (str(WORK / 'salam-wanita-front.mp4'), 'aisyah', 'salam', 'front', 1.4),
    ('Duduk dua sujut Wanita.mp4', 'aisyah', 'salam', '- side back', 4.0, (3.0, 6.0)),
    # gerakan tanpa video sendiri: potongan frame dari video lain (detik mulai, selesai), diputar maju-mundur
    ('Takbir Pria.mp4', 'ali', 'niat', 'front side back', 0.3, (0, 0.9)),
    ('Takbir Wanita.mp4', 'aisyah', 'niat', 'front side back', 0.3, (0, 0.9)),
    ('Takbir Pria.mp4', 'ali', 'sedekap', 'front side back', 5.0, (4.0, 5.97)),
    ('Takbir Wanita.mp4', 'aisyah', 'sedekap', 'front side back', 5.0, (4.0, 5.97)),
    ("I'tidak Wanita.mp4", 'aisyah', 'rukuk', 'front side back', 0.4, (0, 0.9)),
]
ONLY = sys.argv[1:]  # mis. ali/niat aisyah/rukuk → hanya proses itu
W = 320  # lebar analisis
LEVELS = 'colorlevels=rimax=0.9:gimax=0.9:bimax=0.9'  # latar abu muda → putih, supaya mix-blend-multiply menghilangkannya


def probe(f):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', f], text=True)
    return map(int, out.strip().split(','))


def occupied(f, w, h):
    hh = round(h * W / w)
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'fps=4,scale={W}:{hh},format=gray', '-f', 'rawvideo', '-'])
    fr = np.frombuffer(raw, np.uint8).reshape(-1, hh, W)
    return (fr < 170).sum(axis=(0, 1))  # banyaknya piksel gelap (tokoh/sajadah) per kolom


for name, who, pose, views, t, *seg in JOBS:
    if ONLY and f'{who}/{pose}' not in ONLY: continue
    f = name if os.path.isabs(name) else f'{SRC}/{name}'
    w, h = probe(f)
    views = views.split()
    prof = occupied(f, w, h)
    n = len(views)
    # potong di kolom paling kosong dekat k/n lebar (tokoh bisa berdempetan, jadi tak selalu ada celah bersih)
    cuts = [0] + [int(k * W / n - W / 8 + prof[int(k * W / n - W / 8):int(k * W / n + W / 8)].argmin()) for k in range(1, n)] + [W]
    sc = w / W
    os.makedirs(f'{DST}/{who}', exist_ok=True)
    for v, lo, hi in zip(views, cuts, cuts[1:]):
        if v == '-': continue  # panel dilewati
        idx = [i for i in range(lo, hi) if prof[i] > 0]
        s, e = idx[0], idx[-1] + 1
        pad = (e - s) * 0.12
        x0 = max(lo, s - pad); x1 = min(hi, e + pad)
        x, cw = int(x0 * sc) // 2 * 2, int((x1 - x0) * sc) // 2 * 2
        vf = f'crop={cw}:{h}:{x}:0,{LEVELS},scale=-2:'
        out = f'{DST}/{who}/{pose}-{v}'
        fc = f'[0:v]{vf}{min(h, 720)}[o]'
        if seg:
            a, b = seg[0]
            fc = f'[0:v]trim={a}:{b},setpts=PTS-STARTPTS,{vf}{min(h, 720)},split[f][r];[r]reverse[rv];[f][rv]concat=n=2:v=1[o]'
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', f, '-an', '-filter_complex', fc, '-map', '[o]', '-c:v', 'libx264', '-crf', '26', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out + '.mp4'])
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', f, '-frames:v', '1', '-vf', vf + str(min(h, 480)), out + '.png'])
        print(out, cw, 'px')
