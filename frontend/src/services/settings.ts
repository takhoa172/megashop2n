import api from "./api"

export interface FooterSettings {
  id: string
  company_name: string
  address: string | null
  phone: string | null
  email: string | null
  facebook: string | null
  youtube: string | null
  twitter: string | null
  instagram: string | null
  copyright_text: string | null
  description: string | null
}

export async function getFooter() {
  const { data } = await api.get("/settings/footer")
  return data
}

export async function updateFooter(
  footerData: Partial<FooterSettings>
) {
  const { data } = await api.put("/settings/footer", footerData)
  return data
}
