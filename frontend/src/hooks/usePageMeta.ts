"use client"

import { useEffect } from "react"

export function usePageMeta(title: string, description?: string, image?: string) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    const setMeta = (property: string, content: string) => {
      const selector = property.startsWith("og:")
        ? `meta[property="${property}"]`
        : `meta[name="${property}"]`
      let el = document.querySelector(selector) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement("meta")
        if (property.startsWith("og:")) {
          el.setAttribute("property", property)
        } else {
          el.setAttribute("name", property)
        }
        document.head.appendChild(el)
      }
      el.setAttribute("content", content)
    }

    const metas: [string, string][] = [
      ["og:title", title],
    ]

    if (description) {
      metas.push(["description", description])
      metas.push(["og:description", description])
    }

    if (image) {
      metas.push(["og:image", image])
    }

    const originals = metas.map(([prop]) => {
      const selector = prop.startsWith("og:")
        ? `meta[property="${prop}"]`
        : `meta[name="${prop}"]`
      const el = document.querySelector(selector) as HTMLMetaElement | null
      return { prop, content: el?.getAttribute("content") || "" }
    })

    metas.forEach(([prop, content]) => setMeta(prop, content))

    return () => {
      document.title = prevTitle
      originals.forEach(({ prop, content }) => {
        if (content) {
          setMeta(prop, content)
        } else {
          const selector = prop.startsWith("og:")
            ? `meta[property="${prop}"]`
            : `meta[name="${prop}"]`
          document.querySelector(selector)?.remove()
        }
      })
    }
  }, [title, description, image])
}
