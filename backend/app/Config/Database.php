<?php
namespace Config;
use CodeIgniter\Database\Config;
class Database extends Config
{
    public string $filesPath = APPPATH . 'Database' . DIRECTORY_SEPARATOR;
    public string $defaultGroup = 'default';
    // ค่า hostname และรหัสผ่านจะถูกแทนด้วย environment ใน compose.yaml
    // PostgreSQL ใช้ charset utf8 ไม่ใช้ utf8mb4 ของ MySQL
    public array $default = [
        'DSN' => '', 'hostname' => 'db', 'username' => '', 'password' => '',
        'database' => '', 'schema' => 'public', 'DBDriver' => 'Postgre',
        'DBPrefix' => '', 'pConnect' => false, 'DBDebug' => true,
        'charset' => 'utf8', 'swapPre' => '', 'failover' => [], 'port' => 5432,
        'dateFormat' => ['date' => 'Y-m-d', 'datetime' => 'Y-m-d H:i:s', 'time' => 'H:i:s'],
    ];
}
