import 'styles/style.scss'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next/router'
import HeadGlobal from 'components/HeadGlobal'
// Web3Wrapper deps:
import { getDefaultWallets, RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit'
import { Chain } from '@rainbow-me/rainbowkit'
import { chain, createClient, configureChains, WagmiConfig } from 'wagmi'
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { useTheme } from 'next-themes'
import { app } from 'appConfig'
import { useState, useEffect } from 'react'
import { Provider as AlertProvider } from 'react-alert'

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <HeadGlobal />
      <Web3Wrapper>
        <Component key={router.asPath} {...pageProps} />
      </Web3Wrapper>
    </ThemeProvider>
  )
}
export default App

// Add Custom Chain
const gnosisChain: Chain = {
  id: 100,
  name: 'Gnosis',
  network: 'gnosis',
  iconUrl: 'https://gnosis.io/wp-content/themes/lessrain/images/favicon/apple-touch-icon.png',
  iconBackground: '#000',
  nativeCurrency: {
    decimals: 18,
    name: 'xDai',
    symbol: 'XDAI',
  },
  rpcUrls: {
    default: 'https://gnosischain-rpc.gateway.pokt.network',
  },
  blockExplorers: {
    default: { name: 'BlockScout', url: 'https://blockscout.com/xdai/mainnet' },
  },
  testnet: true,
}

// Web3 Configs
const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum, gnosisChain, chain.rinkeby, chain.ropsten],
  [
    infuraProvider({ infuraId: process.env.NEXT_PUBLIC_INFURA_ID !== '' && process.env.NEXT_PUBLIC_INFURA_ID }),
    jsonRpcProvider({
      rpc: chain => {
        if (chain.id !== gnosisChain.id) return null
        return { http: chain.rpcUrls.default }
      },
    }),
    publicProvider(),
  ]
)
const { connectors } = getDefaultWallets({ appName: app.name, chains })
const wagmiClient = createClient({ autoConnect: true, connectors, provider })

// Web3Wrapper
export function Web3Wrapper({ children }) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        initialChain={1} // Optional, initialChain={1}, initialChain={chain.mainnet}, initialChain={gnosisChain}
        showRecentTransactions={true}
        theme={resolvedTheme === 'dark' ? darkTheme() : lightTheme()}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
