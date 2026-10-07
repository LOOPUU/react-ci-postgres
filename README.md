# โปรเจกต์ React + CodeIgniter 4 + PostgreSQL

ตัวอย่างระบบจัดการสินค้า เพิ่ม อ่าน แก้ไข และลบข้อมูล (CRUD) ผ่าน REST API
โค้ดที่เขียนเพิ่มสำหรับโปรเจกต์นี้มีคอมเมนต์ภาษาไทย ส่วนไฟล์มาตรฐานของ CodeIgniter มีคอมเมนต์เดิมจาก framework

## เทคโนโลยี

- React 19 + Vite: หน้าเว็บและฟอร์ม
- PHP 8.3 + CodeIgniter 4.7.4 + Apache: API
- PostgreSQL 16: ฐานข้อมูล (ชื่อที่ถูกต้องของ “progress sql”)
- Docker Compose: เริ่มทั้งสาม service พร้อมกัน

## เริ่มใช้งาน

ติดตั้งและเปิด Docker Desktop ให้เรียบร้อย ไม่ต้องเปิด XAMPP และไม่ต้องติดตั้ง PHP, Node.js หรือ PostgreSQL ในเครื่องเอง
การ build ครั้งแรกต้องใช้อินเทอร์เน็ตเพื่อดาวน์โหลด images และ dependencies

เปิด Terminal ในโฟลเดอร์โปรเจกต์แล้วรัน:

```bash
cp .env.example .env
docker compose up -d --build
```

Windows PowerShell ใช้ `Copy-Item .env.example .env` แทน `cp` ได้

เปิดหน้าเว็บ **http://localhost:5173**
API อยู่ที่ **http://localhost:8080/api/products**
ตรวจความพร้อมที่ **http://localhost:8080/api/health**

ตารางสินค้าเกิดขึ้นอัตโนมัติจาก migration ตอน backend เริ่มทำงาน ไม่ต้อง import SQL ด้วย phpMyAdmin
ตารางเริ่มต้นว่าง ให้เพิ่มสินค้าในฟอร์มบนหน้าเว็บ

```bash
docker compose ps
docker compose logs -f backend
docker compose down
```

`down` ปิดระบบแต่เก็บข้อมูลไว้ใน volume หากใช้ `docker compose down -v` จะลบข้อมูลฐานข้อมูลทั้งหมด
รหัสผ่านตัวอย่างใช้เฉพาะการพัฒนาในเครื่อง ระบบนี้ยังไม่มี login และใช้ development server
ก่อนนำไปเปิดใช้งานจริงต้องเพิ่ม authentication, สิทธิ์ผู้ใช้ และการตั้งค่า production

## โครงสร้างที่ควรอ่าน

| ไฟล์ | หน้าที่ |
| --- | --- |
| `compose.yaml` | เชื่อม frontend, backend, db และกำหนดลำดับเริ่มระบบ |
| `frontend/src/App.jsx` | หน้าแสดงสินค้า ฟอร์ม และปุ่มเพิ่ม/แก้ไข/ลบ |
| `frontend/src/api.js` | ส่ง HTTP request และแปลง API error เป็นข้อความ |
| `frontend/vite.config.js` | proxy `/api` ไป backend |
| `backend/app/Config/Routes.php` | จับคู่ URL กับเมธอดของ controller |
| `backend/app/Controllers/Products.php` | รับ JSON ตรวจข้อมูล และตอบกลับ JSON |
| `backend/app/Models/ProductModel.php` | ติดต่อฐานข้อมูลและกำหนดฟิลด์ที่เขียนได้ |
| `backend/app/Config/Database.php` | เลือก PostgreSQL และอ่านค่าจาก environment |
| `backend/app/Database/Migrations/2026-10-07-000001_CreateProducts.php` | สร้างตารางสินค้า |
| `backend/docker/entrypoint.sh` | รัน migration ก่อนเริ่ม Apache |
| `scripts/smoke_test.py` | ทดสอบ API จริงหลังเปิดระบบ |

## อธิบายการทำงาน

### 1. React เก็บข้อมูลไว้ใน state

`items` คือสินค้าที่แสดงในตาราง ส่วน `form` คือค่าที่กรอกในฟอร์ม
`editingId` เป็น `null` ตอนเพิ่มใหม่ และเป็น ID ของสินค้าเมื่อกดแก้ไข
เมื่อเปลี่ยนหน้า `useEffect` จะเรียก GET `/api/products?page=...` แล้วอัปเดต `items`

### 2. ปุ่มบันทึกเลือก POST หรือ PUT

`save()` เรียก `event.preventDefault()` เพื่อไม่ให้ browser reload หน้า
ถ้า `editingId` มีค่า จะใช้ PUT `/api/products/{id}` หากไม่มีค่า จะใช้ POST `/api/products`
`JSON.stringify()` แปลงข้อมูลฟอร์มเป็น JSON ส่งให้ backend
เมื่อบันทึกสำเร็จจะล้างฟอร์มและโหลดรายการใหม่

### 3. Vite ส่ง request ไป backend

React เรียก `/api/products` บน origin เดียวกับหน้าเว็บ
Vite proxy ส่งต่อไป `http://backend:80` ภายในเครือข่าย Docker
จึงไม่ต้องเปิด CORS แบบอนุญาตทุกเว็บไซต์
ชื่อ `backend` และ `db` เป็นชื่อ service ที่ Docker ใช้ค้นหากัน
`localhost` ภายใน container หมายถึง container ตัวนั้นเอง

### 4. Controller ตรวจข้อมูลก่อนบันทึก

Routes ส่ง POST ไป `Products::create()` และ PUT ไป `Products::update()`
`productInput()` ตรวจว่าชื่อไม่ว่าง ราคาไม่ติดลบและมีทศนิยมไม่เกินสองตำแหน่ง
จำนวนต้องเป็นจำนวนเต็มไม่ติดลบ และค่าต้องไม่เกินขนาดที่ฐานข้อมูลรองรับ
PUT ต้องส่งข้อมูลครบทั้งสามฟิลด์ หากข้อมูลผิดจะตอบ HTTP 400

### 5. Model บันทึกใน PostgreSQL

`insert()` เพิ่มข้อมูล, `find()` อ่านตาม ID, `update()` แก้ไข และ `delete()` ลบ
`allowedFields` ยอมให้เขียนเฉพาะ name, price, stock
`useTimestamps` ให้ CodeIgniter ใส่ created_at และ updated_at อัตโนมัติ
ราคาใช้ NUMERIC(12,2) เพื่อเก็บทศนิยมแน่นอน โดย API อาจคืนราคาเป็น string

### 6. Migration สร้างตารางครั้งแรก

backend รอ db ผ่าน healthcheck แล้วรัน `php spark migrate --all`
CodeIgniter บันทึก migration ที่ทำแล้ว จึงไม่สร้างตารางเดิมซ้ำทุกครั้งที่ restart
ข้อมูลอยู่ใน named volume `postgres_data`

## API

| Method | URL | การทำงาน | สำเร็จ |
| --- | --- | --- | --- |
| GET | `/api/health` | ตรวจ API และฐานข้อมูล | 200 |
| GET | `/api/products?page=1` | อ่านสินค้า หน้าละ 10 รายการ | 200 |
| GET | `/api/products/1` | อ่านสินค้าตาม ID | 200 |
| POST | `/api/products` | เพิ่มสินค้า | 201 |
| PUT | `/api/products/1` | แก้ไขสินค้าทั้งสามฟิลด์ | 200 |
| DELETE | `/api/products/1` | ลบสินค้า | 200 |

ไม่พบ ID ตอบ 404, JSON ผิดรูปแบบหรือข้อมูลไม่ผ่านเงื่อนไขตอบ 400

ตัวอย่าง body สำหรับ POST และ PUT:

```json
{"name": "กาแฟอาราบิก้า", "price": "125.50", "stock": 10}
```

ตัวอย่างเรียกจาก Terminal (macOS/Linux):

```bash
curl -X POST http://localhost:8080/api/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"กาแฟอาราบิก้า","price":"125.50","stock":10}'
```

## แก้โค้ด

โฟลเดอร์ `frontend/src` และ `backend/app` mount เข้า container อยู่แล้ว
แก้ React แล้วหน้าเว็บเปลี่ยนผ่าน hot reload ส่วน PHP ใช้โค้ดใหม่ใน request ถัดไป
ถ้าแก้ dependencies, Dockerfile หรือ Vite config ให้รัน `docker compose up -d --build` อีกครั้ง
หากเพิ่ม migration ระหว่างระบบทำงาน ใช้ `docker compose exec backend php spark migrate --all`

## เปิดดูฐานข้อมูล

phpMyAdmin ใช้กับ MySQL/MariaDB สำหรับ PostgreSQL ใช้ DBeaver, pgAdmin หรือ psql
ตัวอย่างเข้า psql โดยไม่ต้องติดตั้งโปรแกรมเพิ่ม:

```bash
docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

จากนั้นใช้ `SELECT * FROM products;` และ `\q` เพื่อออก
ฐานข้อมูลไม่ได้เปิดพอร์ตบนเครื่อง host; backend ติดต่อผ่านเครือข่าย Docker
หากเปลี่ยน user/password ใน `.env` หลังสร้าง volume แล้ว ค่าในฐานข้อมูลเดิมไม่ได้เปลี่ยนอัตโนมัติ

## ทดสอบ

หลัง container พร้อมแล้ว ถ้าเครื่องมี Python 3:

```bash
python3 scripts/smoke_test.py
```

ทดสอบสร้าง อ่าน แก้ไข ลบ แบ่งหน้า ข้อมูลผิด JSON ผิดรูปแบบ และ ID ที่ไม่มี
สคริปต์ลบเฉพาะรายการที่ตัวเองสร้างเพื่อทดสอบ

ตรวจ build หน้าเว็บผ่าน Docker:

```bash
docker compose exec frontend npm run build
```

สถานะการตรวจจากเครื่องที่จัดทำ: ดู `VERIFICATION.md`

## ปัญหาที่พบบ่อย

- เปิดเว็บไม่ได้: ดู `docker compose ps` และ `docker compose logs backend frontend`
- พอร์ตถูกใช้แล้ว: เปลี่ยนเลขด้านซ้ายของ ports ใน compose เช่น `5174:5173` แล้วเปิด localhost:5174
- build ติดขัด: ตรวจว่า Docker Desktop เปิดอยู่และเชื่อมต่ออินเทอร์เน็ตได้
- ไม่เห็นข้อมูลเดิม: ตรวจว่ารันจากโฟลเดอร์เดิมและไม่ได้ลบ volume

## เอกสารต้นทาง

- https://codeigniter.com/user_guide/database/configuration.html
- https://codeigniter.com/user_guide/restful.html
- https://vite.dev/config/server-options
