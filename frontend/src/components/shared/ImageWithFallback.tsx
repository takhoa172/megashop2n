"use client"

import Image, { ImageProps } from "next/image"
import { useState } from "react"

export function ImageWithFallback(props: ImageProps) {
  const [error, setError] = useState(false)
  return (
    <Image
      {...props}
      src={error ? "/placeholder.svg" : props.src}
      onError={() => setError(true)}
    />
  )
}
