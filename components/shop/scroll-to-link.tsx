'use client'

import Link from 'next/link'
import type { ComponentProps, MouseEvent, ReactNode } from 'react'

type ScrollToLinkProps = Omit<ComponentProps<typeof Link>, 'href' | 'onClick'> & {
  href: string
  scrollTarget?: string
  children: ReactNode
}

export function ScrollToLink({ href, scrollTarget, children, className, ...rest }: ScrollToLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith('#')) return

    const targetId = scrollTarget ?? href.slice(1)
    const target = document.getElementById(targetId) ?? document.querySelector(href)

    if (!target) return

    event.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.pushState(null, '', href)
  }

  return (
    <Link href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  )
}
