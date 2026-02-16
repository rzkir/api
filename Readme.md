# API ImageKit

API untuk upload gambar ke ImageKit dengan autentikasi API secret.

## Prasyarat

- Node.js 18+
- Akun [ImageKit](https://imagekit.io/)

## Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd api
npm install
```

### 2. Konfigurasi `.env`

Buat file `.env` di root project:

```env
PORT=3003

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Autentikasi upload
API_SECRET=your_secret_key

# CORS (pisahkan dengan koma)
ALLOWED_ORIGINS=https://example.com,http://localhost:5173
```

**Generate `API_SECRET`**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Menjalankan

**Development**:

```bash
npm run dev
```

**Production**:

```bash
npm run build
npm start
```

**Docker**:

```bash
docker-compose up --build
```

**Vercel**:

```bash
vercel
```

Lihat [Deploy ke Vercel](#deploy-ke-vercel) di bawah.

## Deploy ke Vercel

1. Push project ke Git (GitHub, GitLab, atau Bitbucket).
2. Import project di [Vercel](https://vercel.com) → New Project.
3. Tambahkan Environment Variables di Vercel Dashboard (Settings → Environment Variables):
   - `IMAGEKIT_PUBLIC_KEY`
   - `IMAGEKIT_PRIVATE_KEY`
   - `IMAGEKIT_URL_ENDPOINT`
   - `API_SECRET`
   - `ALLOWED_ORIGINS` (pisahkan dengan koma)
4. Deploy.

Setelah deploy, URL API: `https://your-app.vercel.app` (tetap pakai path `/` dan `/upload`).

**Catatan:** Vercel membatasi ukuran request body sekitar 4.5MB (Hobby). File lebih besar bisa gagal. Untuk Pro ada opsi meningkatkan limit.

## Endpoint

| Method | Path       | Deskripsi                       |
|--------|------------|----------------------------------|
| GET    | `/`        | Cek status API                   |
| POST   | `/upload`  | Upload file ke ImageKit          |

### GET `/`

Contoh:

```bash
curl http://localhost:3003/
```

### POST `/upload`

Upload file via `multipart/form-data` dengan field `file`. Wajib kirim header autentikasi:

- `x-api-secret: <API_SECRET>` atau
- `Authorization: <API_SECRET>`

Contoh `curl`:

```bash
curl -X POST http://localhost:3003/upload \
  -H "x-api-secret: your_secret_key" \
  -F "file=@/path/to/image.jpg"
```

Contoh JavaScript (fetch):

```js
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const res = await fetch("http://localhost:3003/upload", {
  method: "POST",
  headers: {
    "x-api-secret": "your_secret_key",
  },
  body: formData,
});
```

## Response

**Sukses (200)**:

```json
{
  "message": "Upload berhasil",
  "data": {
    "url": "https://ik.imagekit.io/...",
    "fileId": "...",
    "name": "..."
  }
}
```

**Unauthorized (401)**:

```json
{
  "message": "Unauthorized"
}
```

**File tidak ditemukan (400)**:

```json
{
  "message": "File tidak ditemukan"
}
```
