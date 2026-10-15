import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createSolidPNG(width, height, r, g, b, isMaskable = false) {
  // Signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type 6: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with scanline filter bytes
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = width * (isMaskable ? 0.35 : 0.44);
  const innerR = outerR * 0.28;
  const buttonR = innerR * 0.45;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background: dark slate navy
      let pr = 15, pg = 23, pb = 42, pa = 255;

      if (dist <= outerR) {
        // Pokeball inner
        if (Math.abs(dy) <= width * 0.035) {
          // Black band
          pr = 15; pg = 23; pb = 42;
        } else if (dy < 0) {
          // Top red
          pr = 239; pg = 68; pb = 68;
        } else {
          // Bottom white
          pr = 241; pg = 245; pb = 249;
        }

        if (dist <= innerR) {
          // Center circle
          if (dist <= buttonR) {
            // Cyan glowing button (active background running)
            pr = 56; pg = 189; pb = 248;
          } else if (dist <= innerR * 0.7) {
            pr = 255; pg = 255; pb = 255;
          } else {
            pr = 15; pg = 23; pb = 42;
          }
        }
      } else if (Math.abs(dist - outerR * 1.15) < width * 0.015) {
        // Cyan pulse ring
        pr = 56; pg = 189; pb = 248;
        pa = 200;
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
      rawData[pxOffset + 3] = pa;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf1, buf2) {
    let c = 0xffffffff;
    for (let i = 0; i < buf1.length; i++) {
      c = crcTable[(c ^ buf1[i]) & 0xff] ^ (c >>> 8);
    }
    for (let i = 0; i < buf2.length; i++) {
      c = crcTable[(c ^ buf2[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const crcVal = crc32(typeBuf, data);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const pub = path.resolve('public');
if (!fs.existsSync(pub)) fs.mkdirSync(pub, { recursive: true });

fs.writeFileSync(path.join(pub, 'pwa-192x192.png'), createSolidPNG(192, 192, 239, 68, 68, false));
fs.writeFileSync(path.join(pub, 'pwa-512x512.png'), createSolidPNG(512, 512, 239, 68, 68, false));
fs.writeFileSync(path.join(pub, 'pwa-maskable-512x512.png'), createSolidPNG(512, 512, 239, 68, 68, true));
fs.writeFileSync(path.join(pub, 'apple-touch-icon.png'), createSolidPNG(180, 180, 239, 68, 68, false));
console.log('PNG icons created successfully!');
