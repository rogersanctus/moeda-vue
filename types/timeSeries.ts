export type Rate = { readonly [key: string]: number }

export interface RateKeyed {
  readonly [key: string]: Rate
}

interface SuccessResponse {
  success: boolean;
}

export interface TimeSeries extends SuccessResponse {
  base: string
  rates: RateKeyed
  timeseries: boolean
  start_date?: string
  end_date?: string
}

export interface CurrencySymbol {
  description: string
  code: string
}

export interface SymbolsResponse extends SuccessResponse {
  symbols: Record<string, CurrencySymbol>
}

export function voidTimeSeries(): TimeSeries {
  return {
    base: 'USD',
    rates: {},
    success: false,
    timeseries: true,
  }
}
