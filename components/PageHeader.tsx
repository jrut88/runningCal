import Link from 'next/link'

interface Props {
  title: string
  backHref?: string
  right?: React.ReactNode
}

export function PageHeader({ title, backHref, right }: Props) {
  return (
    <header className="bg-green-600 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      {backHref && (
        <Link href={backHref} className="text-white text-xl leading-none">←</Link>
      )}
      <h1 className="flex-1 font-bold text-lg truncate">{title}</h1>
      {right}
    </header>
  )
}
