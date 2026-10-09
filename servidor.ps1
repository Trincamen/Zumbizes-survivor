$code = @'
using System;using System.Net;using System.Net.Sockets;using System.Text;using System.Threading;using System.IO;using System.Collections.Generic;using System.Security.Cryptography;using System.Text.RegularExpressions;
public class S{
static Dictionary<string,Stream> M=new Dictionary<string,Stream>();
static Stream HS=null;
public static string Dir;
public static void Run(int port){var l=new TcpListener(IPAddress.Any,port);l.Start();
 while(true){var c=l.AcceptTcpClient();c.NoDelay=true;var t=new Thread(()=>H(c));t.IsBackground=true;t.Start();}}
static byte[] R(Stream s,int n){var d=new byte[n];int o=0;while(o<n){int r=s.Read(d,o,n-o);if(r<=0)throw new Exception();o+=r;}return d;}
static void H(TcpClient c){var s=(Stream)c.GetStream();string id=null;
 try{c.SendTimeout=3000;var sb=new StringBuilder();while(!sb.ToString().EndsWith("\r\n\r\n")){int b=s.ReadByte();if(b<0)return;sb.Append((char)b);}
 var h=sb.ToString();var m=Regex.Match(h,"Sec-WebSocket-Key: *(\\S+)",RegexOptions.IgnoreCase);
 if(!m.Success){var first=h.Substring(0,h.IndexOf("\r\n"));
 if(first.StartsWith("OPTIONS")){var oh=Encoding.ASCII.GetBytes("HTTP/1.1 204 No Content\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: *\r\nAccess-Control-Allow-Methods: GET, OPTIONS\r\nAccess-Control-Allow-Private-Network: true\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");s.Write(oh,0,oh.Length);c.Close();return;}
 if(first.StartsWith("GET /info")){int cnt;lock(M){cnt=M.Count;}var jb=Encoding.UTF8.GetBytes("{\"kind\":\"lan\",\"name\":\""+Environment.MachineName+"\",\"n\":"+cnt+"}");var jh=Encoding.ASCII.GetBytes("HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Private-Network: true\r\nConnection: close\r\nContent-Length: "+jb.Length+"\r\n\r\n");s.Write(jh,0,jh.Length);s.Write(jb,0,jb.Length);c.Close();return;}
 var body=File.ReadAllBytes(Path.Combine(Dir,"game.html"));var hd=Encoding.ASCII.GetBytes("HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\nContent-Length: "+body.Length+"\r\n\r\n");s.Write(hd,0,hd.Length);s.Write(body,0,body.Length);c.Close();return;}
 var q=Regex.Match(h,"GET /ws\\?id=(\\w+)(&h=1)?");
 var acc=Convert.ToBase64String(SHA1.Create().ComputeHash(Encoding.ASCII.GetBytes(m.Groups[1].Value+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11")));
 var r2=Encoding.ASCII.GetBytes("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: "+acc+"\r\n\r\n");s.Write(r2,0,r2.Length);
 lock(M){if(q.Success){id=q.Groups[1].Value;M[id]=s;if(q.Groups[2].Success)HS=s;}}
 while(true){var h2=R(s,2);int op=h2[0]&15;long len=h2[1]&127;
  if(len==126){var e=R(s,2);len=e[0]*256+e[1];}else if(len==127){var e=R(s,8);len=0;for(int i=0;i<8;i++)len=len*256+e[i];}
  byte[] k=(h2[1]&128)!=0?R(s,4):null;var p=R(s,(int)len);if(k!=null)for(int i=0;i<p.Length;i++)p[i]^=k[i&3];
  if(op==8)break;if(op==1)Route(s,p);}
 }catch{}
 lock(M){if(id!=null){Stream x;if(M.TryGetValue(id,out x)&&x==s)M.Remove(id);}if(HS==s)HS=null;}try{c.Close();}catch{}}
static void Route(Stream from,byte[] p){
 if(from==HS){
  if(p.Length>0&&p[0]==64){int k=Array.IndexOf(p,(byte)'|');if(k>0){string id=Encoding.ASCII.GetString(p,1,k-1);var b=new byte[p.Length-k-1];Array.Copy(p,k+1,b,0,b.Length);Stream t;lock(M){M.TryGetValue(id,out t);}if(t!=null)W(t,b);}}
  else{Stream[] a;lock(M){a=new Stream[M.Count];M.Values.CopyTo(a,0);}foreach(var o in a)if(o!=from)W(o,p);}
 }else{Stream h=HS;if(h!=null)W(h,p);}}
static void W(Stream o,byte[] p){var f=new List<byte>();f.Add(0x81);
 if(p.Length<126)f.Add((byte)p.Length);else if(p.Length<65536){f.Add(126);f.Add((byte)(p.Length>>8));f.Add((byte)p.Length);}else{f.Add(127);for(int i=7;i>=0;i--)f.Add((byte)((long)p.Length>>(8*i)));}
 f.AddRange(p);var d=f.ToArray();
 lock(o){try{o.Write(d,0,d.Length);}catch{}}}
}
'@
Add-Type -TypeDefinition $code
[S]::Dir = $PSScriptRoot
Write-Host "=== HORDA COOPERATIVA ===" -ForegroundColor Green
Write-Host "Neste PC (HOST): http://localhost:8080"
Write-Host "Nos outros PCs abra (dica: no Edge, Win+R e digite: msedge --app=http://IP:8080 --start-fullscreen):"
[System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | Where-Object { $_.AddressFamily -eq 'InterNetwork' } | ForEach-Object { Write-Host ("   http://" + $_.IPAddressToString + ":8080") -ForegroundColor Yellow }
Write-Host "Se o Windows perguntar sobre Firewall, permita em Rede Privada. Feche esta janela para encerrar."
try{Start-Process msedge "--app=http://localhost:8080 --start-fullscreen"}catch{Start-Process "http://localhost:8080"}
[S]::Run(8080)
