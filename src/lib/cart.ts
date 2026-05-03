export interface CartItem {
  id: string
  productId: string
  productName: string
  optionId?: string
  optionName?: string
  playerTypeId?: string
  playerTypeName?: string
  playerMac?: string
  playerDeviceKey?: string
  quantity: number
  price: number
}

export interface Cart {
  items: CartItem[]
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0)
}
