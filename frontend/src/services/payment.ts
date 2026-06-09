import api from "./api"

export async function initPayment(
  orderId: string,
  method: string
): Promise<{ payment_url: string }> {
  const res = await api.post("/payment/init/", { order_id: orderId, method })
  return res.data
}
