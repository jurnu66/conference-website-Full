# วิธีรันเว็บ Mini-Conference

ใช้ได้ทั้ง macOS และ Windows ไม่ต้องลงแพ็กเกจเพิ่ม (ไม่ต้องรัน `npm install`)

## ก่อนเริ่ม

1. ติดตั้ง **Node.js** (เวอร์ชัน 18 ขึ้นไป) จาก https://nodejs.org
   เช็กว่าติดตั้งแล้วด้วยคำสั่ง `node -v`
2. คัดลอกโฟลเดอร์ `conference-website` ทั้งโฟลเดอร์ไปไว้ที่ไหนก็ได้ในเครื่อง
3. เปิด Terminal (macOS) หรือ Command Prompt / PowerShell (Windows)
   แล้วเข้าไปที่โฟลเดอร์ `app` ที่อยู่ข้างใน

   ```bash
   cd conference-website/app
   ```

   > ทางลัด: macOS คลิกขวาที่โฟลเดอร์ `app` → **New Terminal at Folder**
   > Windows เปิดโฟลเดอร์ `app` แล้วพิมพ์ `cmd` ในช่อง address bar แล้วกด Enter

คำสั่งทุกคำสั่งด้านล่างให้รัน **ในโฟลเดอร์ `app`**

## เปิดเว็บ (ใช้บ่อยสุด)

```bash
npm run dev
```

แล้วเปิด **http://127.0.0.1:8080** ในเบราว์เซอร์
หน้าภาษาอังกฤษอยู่ที่ http://127.0.0.1:8080/en/ หรือกดปุ่ม **EN** ที่มุมขวาบน

คำสั่งนี้ build เว็บใหม่ แล้วเปิดเซิร์ฟเวอร์ให้ในคำสั่งเดียว
หยุดเซิร์ฟเวอร์: กด `Ctrl + C` ใน Terminal

## แก้เนื้อหา

1. แก้ไฟล์ `app/src/data/conference-data.js` (ข้อมูลทุกหน้าอยู่ไฟล์นี้ไฟล์เดียว)
   ข้อความส่วนใหญ่เขียนเป็น `{ th: "ภาษาไทย", en: "English" }` ให้แก้ทั้งสองภาษา
2. เปิด Terminal อีกหน้าต่างในโฟลเดอร์ `app` แล้วรัน

   ```bash
   npm run build
   ```

3. Refresh หน้าเว็บ

## คำสั่งทั้งหมด

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | build แล้วเปิดเซิร์ฟเวอร์ |
| `npm run build` | สร้างไฟล์เว็บใหม่ลงโฟลเดอร์ `dist/` |
| `npm start` | เปิดเซิร์ฟเวอร์อย่างเดียว (ไม่ build) |

## พอร์ต 8080 ถูกใช้อยู่

ถ้าขึ้น error `EADDRINUSE` ให้เปลี่ยนเป็นพอร์ตอื่น เช่น 8081

macOS / Linux:

```bash
PORT=8081 npm start
```

Windows (PowerShell):

```powershell
$env:PORT=8081; npm start
```

Windows (Command Prompt):

```bat
set PORT=8081 && npm start
```

แล้วเปิด http://127.0.0.1:8081

## ไม่อยากใช้เซิร์ฟเวอร์

ดับเบิลคลิกไฟล์ `app/dist/index.html` เปิดในเบราว์เซอร์ได้เลย ลิงก์ทุกหน้าใช้ได้
(ถ้ายังไม่มีโฟลเดอร์ `dist` ให้รัน `npm run build` ก่อน 1 ครั้ง)

## เว็บออนไลน์ (Netlify)

เว็บอยู่ที่ **https://cpe-seminar-2026.netlify.app** (ภาษาอังกฤษ: `/en/`)

อัปเดตเว็บออนไลน์หลังแก้เนื้อหา เลือกทางใดทางหนึ่ง:

- **ลากวาง:** รัน `npm run build` → เปิดหน้า Deploys ของโปรเจกต์ใน Netlify → ลากโฟลเดอร์ `app/dist` ไปวาง
- **ให้ Claude อัปให้:** ถ้าเชื่อม Netlify กับ Claude ไว้แล้ว สั่งว่า "deploy เว็บขึ้น cpe-seminar-2026" ได้เลย
  (Netlify จะ build เองตามไฟล์ `app/netlify.toml`)

ลิงก์เดิมใช้ได้ตลอด ไม่ต้องส่งลิงก์ใหม่ให้เพื่อน

## ไฟล์ที่ควรรู้

| ไฟล์ | คืออะไร |
|---|---|
| `app/src/data/conference-data.js` | เนื้อหาทั้งหมด ทั้งไทยและอังกฤษ (ชื่องาน วันที่ ทีม หัวข้อ ฯลฯ) |
| `app/src/css/style.css` | สีและหน้าตา |
| `app/src/img/` | รูปประกอบและโลโก้ |
| `app/build.js` | ตัวสร้างหน้าเว็บ |
| `app/serve.js` | เซิร์ฟเวอร์สำหรับเปิดดูในเครื่อง |
| `app/dist/` | ไฟล์เว็บที่ build แล้ว (อย่าแก้ตรงนี้ จะโดนเขียนทับ) |
| `backend/Code.gs` | หลังบ้าน Google Apps Script (Drive + Sheets) ดูวิธีตั้งค่าใน `backend/SETUP.md` |
| `app/src/js/config.js` | ใส่ URL ของหลังบ้านและ Google Client ID |
| `DESIGN.md` | กฎเรื่องสี ฟอนต์ ภาษา และโครงสร้าง |
