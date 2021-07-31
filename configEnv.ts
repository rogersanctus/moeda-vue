import { loadEnv } from 'vite'
import fetch from 'cross-fetch'

const env = loadEnv('test', process.cwd())
process.env = { ...env }

global.fetch = fetch
