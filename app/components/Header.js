import { FaWallet, FaShieldAlt } from 'react-icons/fa'

export default function Header() {
  return (
    <div className="bg-gradient-to-r from-hedera-purple to-hedera-blue text-white p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <FaWallet className="text-3xl" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Hedera Mainnet Wallet</h1>
            <p className="text-white/80 mt-1">Kirim HBAR dan cek balance dengan aman</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
          <FaShieldAlt />
          <span className="text-sm font-semibold">Mainnet</span>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm opacity-90">🔒 Semua proses berjalan di browser Anda</p>
            <p className="text-sm opacity-90">🔑 Private key tidak dikirim ke server mana pun</p>
          </div>
          <div className="text-sm">
            <span className="px-3 py-1 bg-white/20 rounded-full">Jaringan: Hedera Mainnet</span>
          </div>
        </div>
      </div>
    </div>
  )
}