// ============================================================
// LIB/CLIENT-ZIP.TS
// ============================================================
// Lightweight client-side ZIP creator (STORED mode, no compression).
// No external dependencies — pure TypeScript/browser APIs.
// Tạo file ZIP trực tiếp trên trình duyệt, không qua server →
// tránh giới hạn 4.5MB của Vercel.

function crc32(data: Uint8Array): number {
  const table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })();
  let crc = 0xffffffff;
  for (const byte of data) crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function uint16LE(n: number): Uint8Array {
  return new Uint8Array([n & 0xff, (n >> 8) & 0xff]);
}

function uint32LE(n: number): Uint8Array {
  return new Uint8Array([n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff]);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

export interface ZipEntry {
  name: string;    // path inside zip, e.g. "roadmap.json" or "nodes/intro.md"
  content: string; // UTF-8 text content
}

/**
 * Tạo file ZIP từ danh sách entries (text only, stored mode).
 * Trả về Blob có thể dùng URL.createObjectURL để tải xuống.
 */
export function createZipBlob(entries: ZipEntry[]): Blob {
  const encoder = new TextEncoder();
  const now = new Date();
  const dosDate =
    (((now.getFullYear() - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0xf) << 5) |
    (now.getDate() & 0x1f);
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f);

  const localHeaders: Uint8Array[] = [];
  const centralDirs: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const dataBytes = encoder.encode(entry.content);
    const crc = crc32(dataBytes);
    const size = dataBytes.length;

    // Local file header (signature 0x04034b50)
    const localHeader = concat(
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]), // signature
      uint16LE(20),         // version needed
      uint16LE(0),          // general purpose bit flag
      uint16LE(0),          // compression method (STORED)
      uint16LE(dosTime),
      uint16LE(dosDate),
      uint32LE(crc),
      uint32LE(size),       // compressed size
      uint32LE(size),       // uncompressed size
      uint16LE(nameBytes.length),
      uint16LE(0),          // extra field length
      nameBytes,
      dataBytes,
    );
    localHeaders.push(localHeader);

    // Central directory record (signature 0x02014b50)
    const centralDir = concat(
      new Uint8Array([0x50, 0x4b, 0x01, 0x02]), // signature
      uint16LE(20),         // version made by
      uint16LE(20),         // version needed
      uint16LE(0),
      uint16LE(0),          // compression method STORED
      uint16LE(dosTime),
      uint16LE(dosDate),
      uint32LE(crc),
      uint32LE(size),
      uint32LE(size),
      uint16LE(nameBytes.length),
      uint16LE(0),          // extra field
      uint16LE(0),          // file comment
      uint16LE(0),          // disk start
      uint16LE(0),          // internal attributes
      uint32LE(0),          // external attributes
      uint32LE(offset),     // relative offset of local header
      nameBytes,
    );
    centralDirs.push(centralDir);
    offset += localHeader.length;
  }

  const centralDirData = concat(...centralDirs);
  const totalEntries = entries.length;

  // End of central directory record
  const eocd = concat(
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]), // signature
    uint16LE(0),                    // disk number
    uint16LE(0),                    // disk with central dir
    uint16LE(totalEntries),
    uint16LE(totalEntries),
    uint32LE(centralDirData.length),
    uint32LE(offset),               // offset of central dir
    uint16LE(0),                    // comment length
  );

  const zipData = concat(...localHeaders, centralDirData, eocd);

  return new Blob([zipData.buffer as ArrayBuffer], {
    type: "application/zip",
  });
}

/** Kích hoạt download file trên trình duyệt */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
