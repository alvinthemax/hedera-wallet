'use client'

import { useState } from 'react'
import { FaKey, FaUser, FaCoins, FaStickyNote } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { sendHBAR } from '../lib/hedera'

export default function SendTab() {
  const [formData, setFormData] = useState({
    privateKey: '',
    recipient: '',
    amount: '',
    memo: '',
  })
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transactionResult, setTransactionResult] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (!formData.privateKey.trim()) {
      toast.error('Private key tidak boleh kosong')
      return false
    }

    if (!formData.recipient.trim()) {
      toast.error('Alamat penerima tidak boleh kosong')
      return false
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Jumlah HBAR harus lebih dari 0')
      return false
    }

    if (formData.memo.length > 100) {
      toast.error('Memo tidak boleh lebih dari 100 karakter')
      return false
    }

    return true
  }

  const handleSend = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const result = await sendHBAR(
        formData.privateKey,
        formData.recipient,
        parseFloat(formData.amount),
        formData.memo
      )
      
      setTransactionResult(result)
      toast.success('Transaksi berhasil dikirim!')
      
      // Reset form
      setFormData({
        privateKey: formData.privateKey, // Keep private key for convenience
        recipient: '',
        amount: '',
        memo: '',
      })
    } catch (error) {
      toast.error(error.message || 'Gagal mengirim transaksi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">🚨 Peringatan!</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Transaksi di jaringan Mainnet tidak dapat dibatalkan. Pastikan semua informasi benar 
          sebelum mengirim.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Private Key Pengirim
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaKey />
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              name="privateKey"
              value={formData.privateKey}
              onChange={handleChange}
              placeholder="Masukkan private key Anda"
              className="input-field pl-10 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alamat Penerima
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaUser />
            </div>
            <input
              type="text"
              name="recipient"
              value={formData.recipient}
              onChange={handleChange}
              placeholder="0.0.1234567"
              className="input-field pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Jumlah HBAR
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaCoins />
            </div>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="10.5"
              step="0.00000001"
              min="0.00000001"
              className="input-field pl-10"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-gray-500 font-medium">HBAR</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Memo (Opsional)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400">
              <FaStickyNote />
            </div>
            <textarea
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              placeholder="Pesan untuk transaksi (maks 100 karakter)"
              className="input-field pl-10 min-h-[100px]"
              maxLength={100}
            />
            <div className="absolute right-3 bottom-2 text-xs text-gray-500">
              {formData.memo.length}/100
            </div>
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="loader"></div>
              Mengirim...
            </span>
          ) : (
            'Kirim HBAR'
          )}
        </button>
      </div>

      {transactionResult && (
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Transaksi Berhasil!
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
              <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                {transactionResult.transactionId}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {transactionResult.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Dari</p>
                <p className="font-mono text-sm">{transactionResult.sender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ke</p>
                <p className="font-mono text-sm">{transactionResult.recipient}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jumlah</p>
              <p className="text-xl font-bold gradient-text">
                {transactionResult.amount} HBAR
              </p>
            </div>
            {transactionResult.memo && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Memo</p>
                <p className="text-gray-900 dark:text-white">{transactionResult.memo}</p>
              </div>
            )}
            {transactionResult.explorerUrl && (
              <div>
                <a
                  href={transactionResult.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-hedera-blue hover:underline"
                >
                  Lihat di Explorer →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}