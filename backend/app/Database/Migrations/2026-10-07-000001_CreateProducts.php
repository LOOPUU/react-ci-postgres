<?php
namespace App\Database\Migrations;
use CodeIgniter\Database\Migration;
class CreateProducts extends Migration
{
    public function up()
    {
        // ใช้ NUMERIC เก็บราคาแบบทศนิยมแน่นอน ไม่ใช้ float ในฐานข้อมูล
        $this->db->query("CREATE TABLE products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL CHECK (char_length(trim(name)) > 0),
            price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
            stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        )");
    }
    public function down()
    {
        // เรียกเมื่อ rollback migration ซึ่งจะลบตารางและข้อมูลสินค้า
        $this->forge->dropTable('products');
    }
}
