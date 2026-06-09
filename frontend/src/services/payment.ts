import api from "./api"

export async function initPayment(
  orderId: string,
  method: string
): Promise<{ payment_url: string }> {
  const res = await api.post(`/orders/${orderId}/init-payment/`)
  return res.data
}
