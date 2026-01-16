'use client'

import { useState } from 'react'
import { FaKey, FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { checkBalance } from '../lib/hedera'

export default function BalanceTab() {
  const [privateKey, setPrivateKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [accountInfo, setAccountInfo] = useState(null)

  const handleCheckBalance = async () => {
    if (!privateKey.trim()) {
      toast.error('Private key tidak boleh kosong')
      return
    }

    setLoading(true)
    try {
      const info = await checkBalance(privateKey)
      setAccountInfo(info)
      toast.success('Balance berhasil diperbarui')
    } catch (error) {
      toast.error(error.message || 'Gagal mengambil balance')
      setAccountInfo(null)
    } finally {
      setLoading(false)
    }
  }

  const maskKey = (key) => {
    if (key.length <= 10) return key
    return key.substring(0, 8) + '...' + key.substring(key.length - 8)
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-hedera-purple/10 to-hedera-blue/10 p-4 rounded-lg border border-hedera-purple/20">
        <h3 className="font-semibold text-hedera-purple mb-2">⚠️ Penting!</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Private key Anda tidak pernah dikirim ke server kami. Semua proses enkripsi dan 
          transaksi berjalan di browser Anda secara lokal.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Private Key
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaKey />
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Masukkan private key Anda (format: 302e020100300506032b6570...)"
              className="input-field pl-10 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Format: ECDSA private key dalam bentuk hex
          </p>
        </div>

        <button
          onClick={handleCheckBalance}
          disabled={loading || !privateKey}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="loader"></div>
              Memproses...
            </span>
          ) : (
            'Cek Balance'
          )}
        </button>
      </div>

      {accountInfo && (
        <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Informasi Akun
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alamat Akun</p>
              <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                {accountInfo.accountId}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
                <p className="text-3xl font-bold gradient-text">
                  {accountInfo.balance?.toFixed(8)} HBAR
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">USD (Approx)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${((accountInfo.balance || 0) * 0.07).toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">Private Key (masked)</p>
              <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                {maskKey(privateKey)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}