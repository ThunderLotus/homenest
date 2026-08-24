export function targetValue(e: Event): string {
  return (e.target as HTMLInputElement).value
}

export function targetChecked(e: Event): boolean {
  return (e.target as HTMLInputElement).checked
}

export function targetNumber(e: Event): number {
  return Number((e.target as HTMLInputElement).value)
}
