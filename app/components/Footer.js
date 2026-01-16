import { FaGithub, FaLock, FaHeart } from 'react-icons/fa'

export default function Footer() {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <FaLock />
          <span className="text-sm">Private key tidak disimpan di server</span>
        </div>
        
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-hedera-purple transition-colors"
          >
            <FaGithub />
            <span className="text-sm">GitHub</span>
          </a>
          
          <a
            href="https://hedera.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-hedera-purple hover:underline"
          >
            Hedera Docs
          </a>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          Made with <FaHeart className="text-red-500" /> for Hedera Community
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
        <p className="text-xs text-gray-500">
          Wallet ini adalah alat open-source. Gunakan dengan risiko Anda sendiri.
          Selalu verifikasi transaksi dan simpan private key dengan aman.
        </p>
      </div>
    </div>
  )
}