// // import { WagmiProvider, createConfig, http } from "wagmi";
// // import { mainnet } from "wagmi/chains";
// // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// // import { ConnectKitProvider, getDefaultConfig } from "connectkit";

// // const config = createConfig(
// //   getDefaultConfig({
// //     // Your dApps chains
// //     chains: [mainnet],
// //     transports: {
// //       // RPC URL for each chain
// //       [mainnet.id]: http(
// //         `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
// //       ),
// //     },

// //     // Required API Keys
// //     walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,

// //     // Required App Info
// //     appName: "Your App Name",

// //     // Optional App Info
// //     appDescription: "Your App Description",
// //     appUrl: "https://family.co", // your app's url
// //     appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
// //   }),
// // );

// // const queryClient = new QueryClient();

// // export const Web3Provider = ({ children }) => {
// //   return (
// //     <WagmiProvider config={config}>
// //       <QueryClientProvider client={queryClient}>
// //         <ConnectKitProvider>{children}</ConnectKitProvider>
// //       </QueryClientProvider>
// //     </WagmiProvider>
// //   );
// // };



// import { createAppKit } from '@reown/appkit/react'

// import { WagmiProvider } from 'wagmi'
// import { bscTestnet, sepolia } from '@reown/appkit/networks'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
// import { ReactNode } from 'react'

// // 0. Setup queryClient
// const queryClient = new QueryClient()

// // 1. Get projectId from https://cloud.reown.com
// const projectId = 'aef07496ac7554dee112fc0189e60ac0'

// // 2. Create a metadata object - optional
// const metadata = {
//     name: 'wallet',
//     description: 'AppKit Example',
//     url: 'https://reown.com/appkit', // origin must match your domain & subdomain
//     icons: ['https://assets.reown.com/reown-profile-pic.png']
// }

// // 3. Set the networks
// const networks = [bscTestnet, sepolia]

// // 4. Create Wagmi Adapter
// const wagmiAdapter = new WagmiAdapter({
//     networks,
//     projectId,
//     ssr: true
// });

// // 5. Create modal
// createAppKit({
//     adapters: [wagmiAdapter],
//     networks,
//     projectId,
//     metadata,
//     features: {
//         analytics: true // Optional - defaults to your Cloud configuration
//     }
// })

// export function Web3Provider({ children }) {
//     return (
//         <WagmiProvider config={wagmiAdapter.wagmiConfig}>
//             <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
//         </WagmiProvider>
//     )
// }


import { WagmiProvider, createConfig } from "wagmi";
import { sepolia,bscTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
// import { Header } from "./components/Headers";

const config = createConfig(
    getDefaultConfig({
      chains: [sepolia,bscTestnet],
      walletConnectProjectId:'aef07496ac7554dee112fc0189e60ac0',
      appName: "BridgeUSDT",
      appDescription: "BridgeUSDT",
      appUrl: "https://family.co",
      appIcon: "https://family.co/logo.png",
    }),
  );


const queryClient = new QueryClient();

export const Web3Provider = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider>
                    {/* <Header /> */}
                    {children}
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};
