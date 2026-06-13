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

export interface SiteSettings {
  id: string
  site_name: string
  site_logo_url: string
  nav_links: { href: string; label: string }[]
  meta_description: string
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

export async function getSiteSettings() {
  const { data } = await api.get("/settings/site")
  return data
}

export async function updateSiteSettings(
  siteData: Partial<SiteSettings>
) {
  const { data } = await api.put("/settings/site", siteData)
  return data
}

export async function uploadSiteLogo(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  const { data } = await api.post("/settings/site/upload-logo", formData)
  return data as { url: string }
}
