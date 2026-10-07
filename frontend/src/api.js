// รวมการเรียก API ไว้จุดเดียว เพื่อไม่เขียน fetch ซ้ำทุกหน้า
export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const errors = result?.messages;
    const message = typeof errors === 'object' && errors !== null
      ? Object.values(errors).join(' / ')
      : errors || result?.message || `เกิดข้อผิดพลาด (${response.status})`;
    throw new Error(message);
  }
  if (!result) throw new Error('API ไม่ได้ส่งข้อมูล JSON กลับมา');
  return result;
}
