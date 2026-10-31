#!/usr/bin/env python3
"""Corta um MP3 (MPEG-1 Layer III) em quadros inteiros, sem recodificar.
Uso: cortar_mp3.py entrada.mp3 saida.mp3 inicio_s [fim_s]
Imprime o instante REAL do primeiro quadro mantido (multiplo de 1152/sr) e o numero de quadros."""
import sys, struct
BR={1:[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0]}  # MPEG1 L3 (index 1 = bitrates)
SR=[44100,48000,32000,0]
def parse(b):
    i=0
    if b[:3]==b'ID3':
        sz=(b[6]<<21)|(b[7]<<14)|(b[8]<<7)|b[9]; i=10+sz
    fr=[]
    while i+4<=len(b):
        h=struct.unpack('>I',b[i:i+4])[0]
        if (h>>21)&0x7FF!=0x7FF: i+=1; continue
        ver=(h>>19)&3; lay=(h>>17)&3; bri=(h>>12)&15; sri=(h>>10)&3; pad=(h>>9)&1
        if ver!=3 or lay!=1 or bri in (0,15) or sri==3: i+=1; continue
        br=BR[1][bri]*1000; sr=SR[sri]; ln=144*br//sr+pad
        if i+ln>len(b): break
        fr.append((i,ln,sr)); i+=ln
    return fr
def main():
    src,dst,t0=sys.argv[1],sys.argv[2],float(sys.argv[3]); t1=float(sys.argv[4]) if len(sys.argv)>4 else 1e9
    b=open(src,'rb').read(); fr=parse(b)
    if not fr: sys.exit('nenhum quadro MPEG1 Layer III encontrado')
    sr=fr[0][2]; dt=1152/sr
    # descarta o quadro de cabecalho Xing/Info (primeiro quadro) se existir
    first=fr[0]; body=b[first[0]+4:first[0]+4+first[1]]
    if b'Xing' in body[:60] or b'Info' in body[:60]: fr=fr[1:]
    a=max(0,int(t0/dt)); z=min(len(fr),int(t1/dt)+1)
    sel=fr[a:z]
    out=b''.join(b[o:o+l] for o,l,_ in sel)
    open(dst,'wb').write(out)
    print('quadros total=%d  mantidos=%d  inicio_real=%.5f s  duracao=%.3f s  bytes=%d  sr=%d'%(len(fr),len(sel),a*dt,len(sel)*dt,len(out),sr))
main()
