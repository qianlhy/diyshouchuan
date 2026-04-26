/**
 * Icon Generator - Run with: node static/generate-icons.js
 * Generates simple PNG tabBar icons and saves them to static/tabbar/
 * Requires: Node.js (no external packages needed)
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const outDir = path.join(__dirname, 'static', 'tabbar');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// CRC32 table
const crcTable = (function() {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return c ^ 0xFFFFFFFF;
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type);
    const crc = crc32(Buffer.concat([typeB, data]));
    const crcB = Buffer.from([(crc>>>24)&255,(crc>>>16)&255,(crc>>>8)&255,crc&255]);
    return Buffer.concat([len, typeB, data, crcB]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      raw[dst]=rgba[src]; raw[dst+1]=rgba[src+1]; raw[dst+2]=rgba[src+2]; raw[dst+3]=rgba[src+3];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

// ---------- Home icon ----------
function drawHome(size, strokeColor, fillColor) {
  const px = new Uint8Array(size * size * 4);
  function sp(x,y,c){if(x<0||y<0||x>=size||y>=size)return;const i=(y*size+x)*4;px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];px[i+3]=c[3];}
  function fillCircle(cx,cy,r,col){for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(dx*dx+dy*dy<=r*r)sp(Math.round(cx+dx),Math.round(cy+dy),col);}
  function fillRect(x1,y1,x2,y2,col){for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)sp(x,y,col);}
  function fillPoly(pts,col){
    const ys=pts.map(p=>p[1]);
    const minY=Math.min(...ys),maxY=Math.max(...ys);
    for(let y=minY;y<=maxY;y++){
      const xs=[];
      for(let i=0;i<pts.length;i++){
        const[x0,y0]=pts[i],[x1,y1]=pts[(i+1)%pts.length];
        if((y0<=y&&y<y1)||(y1<=y&&y<y0))xs.push(x0+(x1-x0)*(y-y0)/(y1-y0));
      }
      xs.sort((a,b)=>a-b);
      for(let i=0;i<xs.length;i+=2)for(let x=Math.ceil(xs[i]);x<=Math.floor(xs[i+1]);x++)sp(x,y,col);
    }
  }
  function fillEllipse(cx,cy,rx,ry,col){
    for(let dy=-ry;dy<=ry;dy++)for(let dx=-rx;dx<=rx;dx++)if(dx*dx/(rx*rx)+dy*dy/(ry*ry)<=1)sp(Math.round(cx+dx),Math.round(cy+dy),col);
  }
  // House filled body
  fillPoly([[size*0.1,size*0.38],[size*0.5,size*0.06],[size*0.9,size*0.38]],fillColor);
  fillRect(Math.round(size*0.1),Math.round(size*0.38),Math.round(size*0.9),Math.round(size*0.75),fillColor);
  // Door
  const dw=size*0.22,dh=size*0.28,cx=size*0.5;
  fillRect(Math.round(cx-dw/2),Math.round(size*0.75-dh),Math.round(cx+dw/2),Math.round(size*0.75),[255,255,255,255]);
  // Stroke outline
  fillCircle(cx,size*0.06,size*0.045,strokeColor);
  // Roof line
  for(let i=0;i<3;i++){const y=size*0.38-i;fillPoly([[size*0.1,y],[size*0.5,size*0.06-i],[size*0.9,y]],strokeColor);}
  // Body outline
  for(let i=0;i<3;i++){fillRect(Math.round(size*0.1)-i,Math.round(size*0.38),Math.round(size*0.9)+i,Math.round(size*0.75),strokeColor);}
  // Door outline
  for(let i=0;i<2;i++){fillRect(Math.round(cx-dw/2)-i,Math.round(size*0.75-dh),Math.round(cx+dw/2)+i,Math.round(size*0.75),strokeColor);}
  return Buffer.from(px);
}

// ---------- Design (circle) icon ----------
function drawDesign(size, strokeColor, fillColor) {
  const px = new Uint8Array(size * size * 4);
  function sp(x,y,c){if(x<0||y<0||x>=size||y>=size)return;const i=(y*size+x)*4;px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];px[i+3]=c[3];}
  function fillCircle(cx,cy,r,col){for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(dx*dx+dy*dy<=r*r)sp(Math.round(cx+dx),Math.round(cy+dy),col);}
  const cx=size/2,cy=size/2;
  fillCircle(cx,cy,Math.round(size*0.42),fillColor);
  for(let t=-2;t<=2;t++)fillCircle(cx,cy,Math.round(size*0.42+t),strokeColor);
  fillCircle(cx,cy,Math.round(size*0.17),[255,255,255,255]);
  return Buffer.from(px);
}

// ---------- Cart icon ----------
function drawCart(size, strokeColor, fillColor) {
  const px = new Uint8Array(size * size * 4);
  function sp(x,y,c){if(x<0||y<0||x>=size||y>=size)return;const i=(y*size+x)*4;px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];px[i+3]=c[3];}
  function fillCircle(cx,cy,r,col){for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(dx*dx+dy*dy<=r*r)sp(Math.round(cx+dx),Math.round(cy+dy),col);}
  function fillRect(x1,y1,x2,y2,col){for(let y=Math.round(y1);y<=Math.round(y2);y++)for(let x=Math.round(x1);x<=Math.round(x2);x++)sp(x,y,col);}
  const th=size*0.07;
  // Body trapezoid fill
  const pts=[[size*0.28,size*0.2],[size*0.35,size*0.78],[size*0.82,size*0.78],[size*0.78,size*0.2]];
  // Fill inside cart body
  for(let y=size*0.2;y<=size*0.78;y++){
    const t=(y-size*0.2)/(size*0.58);
    const x1=size*0.28+(size*0.35-size*0.28)*t;
    const x2=size*0.78+(size*0.82-size*0.78)*t;
    fillRect(x1,y,x2,y,fillColor);
  }
  // Handle and top lines
  for(let t=-th/2;t<=th/2;t+=0.5){
    sp(Math.round(size*0.28+t),Math.round(size*0.2),strokeColor);
    sp(Math.round(size*0.28+t),Math.round(size*0.2-1),strokeColor);
    sp(Math.round(size*0.35+t),Math.round(size*0.78),strokeColor);
    sp(Math.round(size*0.35+t),Math.round(size*0.78+1),strokeColor);
    sp(Math.round(size*0.78+t),Math.round(size*0.78),strokeColor);
    sp(Math.round(size*0.78+t),Math.round(size*0.78+1),strokeColor);
    sp(Math.round(size*0.82+t),Math.round(size*0.78),strokeColor);
    sp(Math.round(size*0.82+t),Math.round(size*0.78+1),strokeColor);
    sp(Math.round(size*0.78+t),Math.round(size*0.2),strokeColor);
    sp(Math.round(size*0.78+t),Math.round(size*0.2-1),strokeColor);
  }
  // Diagonal handle
  for(let i=0;i<=100;i++){
    const t=i/100;
    const x=size*(0.28+(0.35-0.28)*t),y=size*(0.2+(0.78-0.2)*t);
    for(let d=-th/2;d<=th/2;d+=0.5)sp(Math.round(x+d),Math.round(y),strokeColor);
  }
  // Wheels
  fillCircle(size*0.4,size*0.84,Math.round(size*0.1),strokeColor);
  fillCircle(size*0.7,size*0.84,Math.round(size*0.1),strokeColor);
  return Buffer.from(px);
}

// ---------- Mine (person) icon ----------
function drawMine(size, strokeColor, fillColor) {
  const px = new Uint8Array(size * size * 4);
  function sp(x,y,c){if(x<0||y<0||x>=size||y>=size)return;const i=(y*size+x)*4;px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];px[i+3]=c[3];}
  function fillCircle(cx,cy,r,col){for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(dx*dx+dy*dy<=r*r)sp(Math.round(cx+dx),Math.round(cy+dy),col);}
  function fillEllipse(cx,cy,rx,ry,col){for(let dy=-ry;dy<=ry;dy++)for(let dx=-rx;dx<=rx;dx++)if(dx*dx/(rx*rx)+dy*dy/(ry*ry)<=1)sp(Math.round(cx+dx),Math.round(cy+dy),col);}
  // Body (shoulders ellipse)
  fillEllipse(size*0.5,size*0.68,size*0.32,size*0.22,fillColor);
  // Head circle
  fillCircle(size*0.5,size*0.3,Math.round(size*0.2),fillColor);
  return Buffer.from(px);
}

// Generate all icons
const S = 81;
const gray = '#9CA3AF';
const gold = '#C9A86C';

const icons = [
  { name: 'home.png',           fn: () => drawHome(S, hexToRgb(gray), [0,0,0,0]) },
  { name: 'home_selected.png',  fn: () => drawHome(S, hexToRgb(gold), hexToRgb(gold)) },
  { name: 'design.png',         fn: () => drawDesign(S, hexToRgb(gray), [0,0,0,0]) },
  { name: 'design_selected.png',fn: () => drawDesign(S, hexToRgb(gold), hexToRgb(gold)) },
  { name: 'cart.png',          fn: () => drawCart(S, hexToRgb(gray), [0,0,0,0]) },
  { name: 'cart_selected.png',  fn: () => drawCart(S, hexToRgb(gold), hexToRgb(gold)) },
  { name: 'mine.png',          fn: () => drawMine(S, hexToRgb(gray), [0,0,0,0]) },
  { name: 'mine_selected.png', fn: () => drawMine(S, hexToRgb(gold), hexToRgb(gold)) },
];

console.log('Generating tabBar icons...');
for (const icon of icons) {
  const rgba = icon.fn();
  const png = encodePNG(S, S, rgba);
  const outPath = path.join(outDir, icon.name);
  fs.writeFileSync(outPath, png);
  console.log(`  Created: ${icon.name}`);
}

console.log('\nAll tabBar icons generated!');
console.log('\nNote: You still need to provide:');
console.log('  static/logo/final_logo.jpg        - Logo for design page');
console.log('  static/CustomerService/qr.jpg     - Customer service QR code');
console.log('  static/images/empty.png            - Empty state image');
