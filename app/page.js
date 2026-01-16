'use client'

import { useState } from 'react'
import Header from './components/Header'
import BalanceTab from './components/BalanceTab'
import SendTab from './components/SendTab'
import Footer from './components/Footer'
import { FaWallet, FaPaperPlane } from 'react-icons/fa'

export default function Home() {
  const [activeTab, setActiveTab] = useState('balance')

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="wallet-card overflow-hidden">
          <Header />
          
          <div className="p-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => setActiveTab('balance')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-all ${
                  activeTab === 'balance'
                    ? 'border-hedera-blue text-hedera-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <FaWallet />
                Cek Balance
              </button>
              <button
                onClick={() => setActiveTab('send')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-all ${
                  activeTab === 'send'
                    ? 'border-hedera-blue text-hedera-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <FaPaperPlane />
                Kirim HBAR
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'balance' ? <BalanceTab /> : <SendTab />}
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </main>
  )
}