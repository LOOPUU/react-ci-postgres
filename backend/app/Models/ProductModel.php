<?php
namespace App\Models;
use CodeIgniter\Model;
class ProductModel extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    // ป้องกันการส่งฟิลด์อื่น เช่น id มาทับข้อมูลโดยตรง
    protected $allowedFields = ['name', 'price', 'stock'];
    protected $useTimestamps = true;
    protected $dateFormat = 'datetime';
}
