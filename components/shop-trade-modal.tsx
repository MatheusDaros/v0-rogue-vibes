"use client"

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { useState } from "react"

interface ShopTradeModalProps {
  open: boolean
  onClose: () => void
  money: number
  onTrade: (cost: number, tokens: number) => void
}

const TRADE_OPTIONS = [
  { cost: 10, tokens: 1 },
  { cost: 45, tokens: 5 },
  { cost: 80, tokens: 10 },
]

export default function ShopTradeModal({ open, onClose, money, onTrade }: ShopTradeModalProps) {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shop Trade</DialogTitle>
          <DialogDescription>
            Exchange your money for tokens. Select an option below:
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          {TRADE_OPTIONS.map((opt, i) => (
            <button
              key={i}
              className={`w-full p-4 rounded-lg border-2 ${selected === i ? 'border-green-500 bg-green-100 dark:bg-green-900' : 'border-gray-300 bg-gray-50 dark:bg-gray-800'} flex justify-between items-center text-lg font-semibold disabled:opacity-50`}
              onClick={() => setSelected(i)}
              disabled={money < opt.cost}
            >
              <span>{opt.tokens} token{opt.tokens > 1 ? 's' : ''}</span>
              <span className="text-yellow-500 font-bold">${opt.cost}</span>
            </button>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <button className="mt-4 px-6 py-2 rounded bg-green-600 text-white font-bold disabled:opacity-50" disabled={selected === null || (selected !== null && money < TRADE_OPTIONS[selected].cost)} onClick={() => {
              if (selected !== null) {
                onTrade(TRADE_OPTIONS[selected].cost, TRADE_OPTIONS[selected].tokens)
              }
            }}>
              Trade
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
