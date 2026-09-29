export const shipmentStatuses = [
  'Выезжает со склада',
  'Направляется к границе',
  'Проходит проверку',
  'На таможне',
  'В пути',
  'Прибыл в страну',
  'Готов к выдаче',
] as const

export interface PublicShipment {
  statusIndex: number
  statusStartedAt: number
  createdAt: number
  deliveryDays: number
  shippingMethod: 'air' | 'bus'
  isPaused?: boolean
  pausedAt?: number
  pausedMs?: number
  isStopped?: boolean
  stoppedAt?: number
  surcharge?: { amount: number; message: string }
}

export interface Review {
  id: string
  author: string
  rating: number
  text: string
  createdAt: number
  isPublished: boolean
}

// Derive progress from timestamps so the static Pages site needs no server process.
export function getCurrentStatusIndex(shipment: PublicShipment, now = Date.now()) {
  const baseIndex = Math.max(0, Math.min(shipmentStatuses.length - 1, shipment.statusIndex ?? 0))
  if (shipment.isStopped || baseIndex === shipmentStatuses.length - 1) return baseIndex

  const activeUntil = Math.min(
    shipment.isPaused && shipment.pausedAt ? shipment.pausedAt : now,
    shipment.isStopped && shipment.stoppedAt ? shipment.stoppedAt : now,
  )
  const elapsed = Math.max(0, activeUntil - (shipment.statusStartedAt || shipment.createdAt) - (shipment.pausedMs ?? 0))
  const stageDuration = Math.max(1, (shipment.deliveryDays * 24 * 60 * 60 * 1000) / (shipmentStatuses.length - 1))
  return Math.min(shipmentStatuses.length - 1, baseIndex + Math.floor(elapsed / stageDuration))
}