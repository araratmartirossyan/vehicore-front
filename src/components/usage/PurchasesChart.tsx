import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn-ui/card'
import type { ChartConfig } from '@/components/shadcn-ui/chart'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/shadcn-ui/chart'

const chartConfig = {
  credits: {
    label: 'Credits',
    color: 'var(--color-primary)',
  },
} satisfies ChartConfig

export function PurchasesChart({
  data,
  totalCredits,
}: {
  data: Array<{ date: string; credits: number }>
  totalCredits: number
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Credits purchased over time</CardTitle>
        <CardDescription>Sum of creditsGranted per day (filtered)</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', { day: 'numeric' })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[170px]"
                  nameKey="credits"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  }
                />
              }
            />
            <Bar dataKey="credits" fill="var(--color-credits)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="border-t">
        <div className="text-sm">
          Total purchased in range:{' '}
          <span className="font-semibold">{totalCredits.toLocaleString()}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

