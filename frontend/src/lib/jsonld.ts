export function injectJsonLd(data: Record<string, unknown>): () => void {
  const script = document.createElement("script")
  script.type = "application/ld+json"
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
  return () => script.remove()
}
