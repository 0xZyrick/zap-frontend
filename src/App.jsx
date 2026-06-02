import { createElement } from 'react'
import Zap from './Zap'
import { StarknetProvider } from './lib/starknetConfig'

export default function App() {
  return createElement(StarknetProvider, null, createElement(Zap))
}
