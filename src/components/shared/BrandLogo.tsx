import React from 'react'
import Image from 'next/image'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
  subtitle?: string
}

export function BrandLogo({
  size = 'md',
  className = '',
  showText = true,
  subtitle,
}: BrandLogoProps) {
  const dimensions = {
    sm: { width: 28, height: 28, imgClass: 'h-7 w-7' },
    md: { width: 36, height: 36, imgClass: 'h-9 w-9' },
    lg: { width: 44, height: 44, imgClass: 'h-11 w-11' },
  }[size]

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className="relative flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <Image
          src="/brand/risktech-badge.png"
          alt="RiskTech & Advisory Identity Badge"
          width={dimensions.width}
          height={dimensions.height}
          className={`${dimensions.imgClass} object-cover`}
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-slate-900 dark:text-white leading-tight ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg'
          }`}>
            RiskTech &amp; Advisory
          </span>
          {subtitle && (
            <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 tracking-wider uppercase leading-none mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
