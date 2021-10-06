import { TimeSeries, SymbolsResponse } from '@t/timeSeries'

const EXCHANGE_RATE_API = process.env.VITE_EXCHANGE_RATE_API
const TIME_SERIES = 'timeseries'
const SYMBOLS = 'symbols'

function formatDate(date: Date) {
  if (isNaN(date.valueOf())) {
    return undefined
  }

  return (
    String(date.getFullYear()).padStart(4, '0') +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0')
  )
}

function buildTimeSeriesQuery(
  fromDate: Date,
  toDate: Date
): string | undefined {
  if (isNaN(fromDate.valueOf()) || isNaN(toDate.valueOf())) {
    return undefined
  }

  return (
    'start_date=' + formatDate(fromDate) + '&end_date=' + formatDate(toDate)
  )
}

export async function fetchSymbols(): Promise<SymbolsResponse> {
  return new Promise((resolve, reject) => {
    if (!EXCHANGE_RATE_API || !SYMBOLS) {
      reject(new Error('Request URL is empty or NULL for fetchSymbols'))
    }

    fetch(EXCHANGE_RATE_API + '/' + SYMBOLS, {
      method: 'GET'
    })
      .then((resp) => {
        resp.json().then((data) => resolve(data))
      })
      .catch((error) => reject(error))
  })
}

export async function fetchSeries(
  fromDate: Date,
  toDate: Date,
  base: string,
  cmp?: string
): Promise<TimeSeries> {
  return new Promise((resolve, reject) => {
    const timeQueryString = buildTimeSeriesQuery(fromDate, toDate)

    if (!timeQueryString) {
      reject(
        new Error(
          'Invalid date intervals. ' +
            JSON.stringify({ start_date: fromDate, end_date: toDate })
        )
      )
    }

    if (!EXCHANGE_RATE_API || !TIME_SERIES) {
      reject(new Error('Request URL is empty or NULL for fetchSeries'))
    }

    fetch(
      EXCHANGE_RATE_API +
        '/' +
        TIME_SERIES +
        '?' +
        timeQueryString +
        '&base=' +
        base +
        (cmp ? '&symbols=' + cmp : ''),
      {
        method: 'GET'
      }
    )
      .then((resp) => {
        resp.json().then((data) => resolve(data))
      })
      .catch((error) => reject(error))
  })
}
