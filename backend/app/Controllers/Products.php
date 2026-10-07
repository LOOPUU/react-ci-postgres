<?php
namespace App\Controllers;
use App\Models\ProductModel;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\HTTP\Exceptions\HTTPException;
class Products extends ResourceController
{
    protected $modelName = ProductModel::class;
    protected $format = 'json';

    public function health()
    {
        // ตรวจทั้ง API และการเชื่อมต่อฐานข้อมูล ใช้เป็น healthcheck ของ Compose
        db_connect()->query('SELECT 1');
        return $this->respond(['status' => 'ok']);
    }
    public function index()
    {
        // จำกัดจำนวนรายการต่อหน้า เพื่อไม่ดึงข้อมูลทั้งหมดเมื่อสินค้ามีจำนวนมาก
        $page = max(1, (int) $this->request->getGet('page'));
        $items = $this->model->orderBy('id', 'DESC')->paginate(10, 'default', $page);
        return $this->respond(['data' => $items, 'page' => $page,
            'per_page' => 10, 'total' => $this->model->pager->getTotal()]);
    }
    public function show($id = null)
    {
        $item = $this->model->find($id);
        return $item ? $this->respond(['data' => $item]) : $this->failNotFound('ไม่พบสินค้า');
    }
    private function productInput(): array
    {
        // รับเฉพาะ JSON object ถ้า JSON ผิดรูปแบบจะตอบ 400 แทนข้อผิดพลาดของเซิร์ฟเวอร์
        try { $data = $this->request->getJSON(true); }
        catch (HTTPException $e) { return ['error' => 'JSON ไม่ถูกต้อง']; }
        if (!is_array($data) || array_is_list($data)) return ['error' => 'กรุณาส่ง JSON object'];
        if (isset($data['name']) && is_string($data['name'])) $data['name'] = trim($data['name']);
        // StrictRules ตรวจชนิดข้อมูลด้วย โดยไม่ยอมรับ array หรือ boolean แทนตัวเลข
        $rules = [
            'name' => 'required|string|max_length[150]',
            'price' => 'required|decimal|greater_than_equal_to[0]|less_than_equal_to[9999999999.99]|regex_match[/^\d+(\.\d{1,2})?$/]',
            'stock' => 'required|integer|greater_than_equal_to[0]|less_than_equal_to[2147483647]',
        ];
        if (!$this->validateData($data, $rules)) return ['errors' => $this->validator->getErrors()];
        return ['data' => array_intersect_key($data, array_flip(['name', 'price', 'stock']))];
    }
    public function create()
    {
        $input = $this->productInput();
        if (isset($input['error'])) return $this->fail($input['error'], 400);
        if (isset($input['errors'])) return $this->failValidationErrors($input['errors']);
        // Model ใช้ query binding จึงไม่ต้องต่อ SQL ด้วยค่าจากผู้ใช้เอง
        $id = $this->model->insert($input['data'], true);
        if ($id === false) return $this->failServerError('บันทึกข้อมูลไม่ได้');
        return $this->respondCreated(['message' => 'เพิ่มสินค้าแล้ว', 'data' => $this->model->find($id)]);
    }
    public function update($id = null)
    {
        if (!$this->model->find($id)) return $this->failNotFound('ไม่พบสินค้า');
        // PUT ต้องส่งชื่อ ราคา และจำนวนครบทั้งสามฟิลด์
        $input = $this->productInput();
        if (isset($input['error'])) return $this->fail($input['error'], 400);
        if (isset($input['errors'])) return $this->failValidationErrors($input['errors']);
        if (!$this->model->update($id, $input['data'])) return $this->failServerError('แก้ไขข้อมูลไม่ได้');
        return $this->respond(['message' => 'แก้ไขสินค้าแล้ว', 'data' => $this->model->find($id)]);
    }
    public function delete($id = null)
    {
        if (!$this->model->find($id)) return $this->failNotFound('ไม่พบสินค้า');
        if (!$this->model->delete($id)) return $this->failServerError('ลบข้อมูลไม่ได้');
        return $this->respond(['message' => 'ลบสินค้าแล้ว']);
    }
}
