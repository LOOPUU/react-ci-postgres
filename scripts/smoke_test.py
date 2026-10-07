#!/usr/bin/env python3
"""ทดสอบ CRUD กับ API จริงหลัง docker compose up พร้อมตรวจข้อมูลผิดและ 404"""
import json
import os
import urllib.request
import urllib.error
BASE = os.environ.get('API_URL', 'http://localhost:8080/api')

def call(method, path, data=None, expected=200, raw=None):
    payload = raw if raw is not None else (json.dumps(data).encode() if data is not None else None)
    request = urllib.request.Request(BASE + path, data=payload, method=method,
        headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            status, body = response.status, response.read()
    except urllib.error.HTTPError as error:
        status, body = error.code, error.read()
    assert status == expected, (method, path, status, body.decode())
    return json.loads(body)

# ถ้าทดสอบล้มเหลวหลังสร้างสินค้า จะพยายามล้างข้อมูลทดสอบใน finally
item_id = None
try:
    assert call('GET', '/health')['status'] == 'ok'
    created = call('POST', '/products', {'name': 'สินค้าทดสอบ API', 'price': '125.50', 'stock': '3'}, 201)
    item_id = created['data']['id']
    assert call('GET', f'/products/{item_id}')['data']['name'] == 'สินค้าทดสอบ API'
    call('PUT', f'/products/{item_id}', {'name': 'แก้ไขแล้ว', 'price': '200.00', 'stock': '5'})
    updated = call('GET', f'/products/{item_id}')['data']
    assert updated['name'] == 'แก้ไขแล้ว' and int(updated['stock']) == 5
    listing = call('GET', '/products?page=1')
    assert len(listing['data']) <= 10 and listing['total'] >= 1
    call('POST', '/products', {'name': '', 'price': '-1', 'stock': '-2'}, 400)
    call('POST', '/products', {'name': 'ราคาเกินทศนิยม', 'price': '1.234', 'stock': '1'}, 400)
    call('POST', '/products', expected=400, raw=b'{broken')
    call('DELETE', f'/products/{item_id}')
    call('GET', f'/products/{item_id}', expected=404)
    call('PUT', f'/products/{item_id}', {'name': 'ไม่พบ', 'price': '1', 'stock': '1'}, 404)
    call('DELETE', f'/products/{item_id}', expected=404)
    item_id = None
    print('PASS: health, CRUD, pagination, validation, malformed JSON, 404')
finally:
    if item_id is not None:
        try: call('DELETE', f'/products/{item_id}')
        except Exception: pass
