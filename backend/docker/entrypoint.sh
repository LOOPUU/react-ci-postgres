#!/bin/sh
set -eu
# สร้างตารางจาก migration ก่อนเปิด Apache; ถ้าสร้างไม่ได้ให้หยุดทันที
php spark migrate --all
exec "$@"
