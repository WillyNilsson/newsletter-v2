"use client"

import { useState, useEffect, useRef } from "react"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
}

export default function LazyImage({ src, alt, className = "" }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={imgRef} className={`${className} relative bg-gray-200 overflow-hidden`}>
      {isInView && (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
      {(!isInView || !isLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

