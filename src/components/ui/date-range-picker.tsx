import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/shadcn-ui/button'
import { Calendar } from '@/components/shadcn-ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn-ui/popover'

type DateRangeValue = { from: string; to: string }

function parseDateOnly(value: string): Date | undefined {
  if (!value) return undefined
  const parts = value.split('-').map((p) => parseInt(p, 10))
  const y = parts[0]
  const m = parts[1]
  const d = parts[2]
  if (y == null || m == null || d == null) return undefined
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return undefined
  return new Date(y, m - 1, d)
}

function toDateOnlyValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: {
  value: DateRangeValue
  onChange: (next: DateRangeValue) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>(() => {
    const from = parseDateOnly(value.from)
    const to = parseDateOnly(value.to)
    if (!from) return undefined
    return { from, to: to || from }
  })

  const label = useMemo(() => {
    const from = parseDateOnly(value.from)
    const to = parseDateOnly(value.to)
    if (!from || !to) return 'Pick a date range'
    return `${format(from, 'MMM d, yyyy')} – ${format(to, 'MMM d, yyyy')}`
  }, [value.from, value.to])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={draft}
          onSelect={setDraft}
          showOutsideDays
          fixedWeeks
        />
        <div className="flex justify-end gap-2 border-t p-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              const from = parseDateOnly(value.from)
              const to = parseDateOnly(value.to)
              setDraft(from ? { from, to: to || from } : undefined)
              setOpen(false)
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (!draft?.from) return
              const nextFrom = toDateOnlyValue(draft.from)
              const nextTo = toDateOnlyValue(draft.to || draft.from)
              onChange({ from: nextFrom, to: nextTo })
              setOpen(false)
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

