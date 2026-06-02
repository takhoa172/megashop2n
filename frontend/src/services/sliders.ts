import api from "./api"

export interface Slider {
  id: string
  title: string | null
  subtitle: string | null
  image_url: string
  image_public_id: string | null
  link_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export async function getSliders(all = false) {
  const { data } = await api.get("/sliders/", { params: all ? { all: "1" } : {} })
  return data.results || data
}

export async function createSlider(formData: FormData) {
  const { data } = await api.post("/sliders/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function updateSlider(id: string, formData: FormData) {
  const { data } = await api.put(`/sliders/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function deleteSlider(id: string) {
  await api.delete(`/sliders/${id}`)
}
