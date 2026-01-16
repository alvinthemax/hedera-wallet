import {
  Client,
  PrivateKey,
  AccountBalanceQuery,
  AccountInfoQuery,
  TransferTransaction,
  Hbar,
  TransactionId,
  TransactionReceiptQuery,
  AccountCreateTransaction,
  AccountRecordsQuery,
  TransactionRecordQuery,
  AccountId,
} from "@hashgraph/sdk";

/**
 * Utility untuk mendapatkan client Hedera berdasarkan environment
 */
export const getHederaClient = () => {
  const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet';
  
  console.log(`Initializing Hedera client for: ${network}`);
  
  switch (network.toLowerCase()) {
    case 'testnet':
      return Client.forTestnet();
    case 'previewnet':
      return Client.forPreviewnet();
    case 'mainnet':
    default:
      return Client.forMainnet();
  }
};

/**
 * Initialize client dengan operator account jika ada
 */
export const initializeClient = () => {
  const client = getHederaClient();
  
  // Set operator dari environment jika tersedia
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;
  
  if (operatorId && operatorKey) {
    try {
      client.setOperator(
        AccountId.fromString(operatorId),
        PrivateKey.fromString(operatorKey)
      );
      console.log('Client initialized with operator account');
    } catch (error) {
      console.warn('Failed to set operator account:', error.message);
    }
  }
  
  return client;
};

/**
 * Validasi format private key
 */
export const validatePrivateKey = (privateKeyString) => {
  try {
    if (!privateKeyString || typeof privateKeyString !== 'string') {
      return { valid: false, error: 'Private key harus berupa string' };
    }
    
    // Coba parse private key
    const privateKey = PrivateKey.fromString(privateKeyString);
    
    // Validasi panjang dan format
    const keyString = privateKey.toString();
    if (!keyString.startsWith('302')) {
      return { valid: false, error: 'Format private key tidak valid' };
    }
    
    return { valid: true, privateKey };
  } catch (error) {
    console.error('Private key validation error:', error);
    return { 
      valid: false, 
      error: error.message.includes('bad key format') 
        ? 'Format private key tidak valid' 
        : 'Private key tidak valid'
    };
  }
};

/**
 * Dapatkan account ID dari private key
 */
export const getAccountIdFromPrivateKey = (privateKeyString) => {
  try {
    const validation = validatePrivateKey(privateKeyString);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    const privateKey = validation.privateKey;
    const publicKey = privateKey.publicKey;
    
    // Di Hedera, kita perlu account ID, bukan generate dari public key
    // Untuk wallet sederhana, kita bisa menggunakan pendekatan alternatif
    // atau meminta user memasukkan account ID juga
    
    // Catatan: Di implementasi nyata, Anda perlu:
    // 1. Menyimpan mapping antara public key dan account ID
    // 2. Meminta user memasukkan account ID-nya
    // 3. Menggunakan account recovery services
    
    // Untuk demo, kita buat account ID dummy
    // Di production, Anda HARUS mendapatkan account ID dengan benar
    const dummyAccountId = publicKey.toAccountId(0, 0);
    
    return {
      success: true,
      accountId: dummyAccountId.toString(),
      publicKey: publicKey.toString(),
      privateKey: maskPrivateKey(privateKeyString)
    };
  } catch (error) {
    console.error('Error getting account ID:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cek balance dari private key
 */
export const checkBalance = async (privateKeyString) => {
  try {
    const client = initializeClient();
    
    // Validasi private key
    const validation = validatePrivateKey(privateKeyString);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    const privateKey = validation.privateKey;
    const publicKey = privateKey.publicKey;
    
    // Generate account ID (untuk demo)
    // Catatan: Di production, Anda perlu account ID yang sebenarnya
    const accountId = publicKey.toAccountId(0, 0);
    
    console.log(`Checking balance for account: ${accountId}`);
    
    // Query account info untuk mendapatkan account ID yang sebenarnya
    let actualAccountId = accountId;
    try {
      const accountInfo = await new AccountInfoQuery()
        .setAccountId(accountId)
        .execute(client);
      
      actualAccountId = accountInfo.accountId;
    } catch (error) {
      console.warn('Account not found, using generated ID:', error.message);
      // Lanjutkan dengan generated ID untuk demo
    }
    
    // Query balance
    const balanceQuery = new AccountBalanceQuery()
      .setAccountId(actualAccountId);
    
    const balance = await balanceQuery.execute(client);
    
    // Konversi tinybars ke HBAR
    const hbarBalance = balance.hbars.toBigNumber().dividedBy(100000000).toNumber();
    
    // Dapatkan transaction records (opsional)
    let recentTransactions = [];
    try {
      const recordsQuery = new AccountRecordsQuery()
        .setAccountId(actualAccountId);
      
      const records = await recordsQuery.execute(client);
      recentTransactions = records.slice(0, 5).map(record => ({
        id: record.transactionId.toString(),
        type: record.transactionRecord.transfers ? 'TRANSFER' : 'UNKNOWN',
        amount: Math.abs(record.transactionRecord.transfers?.list[0]?.amount || 0) / 100000000,
        timestamp: record.consensusTimestamp?.toDate() || new Date()
      }));
    } catch (error) {
      console.warn('Could not fetch transaction records:', error.message);
    }
    
    return {
      success: true,
      accountId: actualAccountId.toString(),
      balance: hbarBalance,
      tinybarBalance: balance.hbars.toString(),
      publicKey: publicKey.toString(),
      recentTransactions,
      timestamp: new Date().toISOString(),
      network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet'
    };
  } catch (error) {
    console.error('Error checking balance:', error);
    
    // Handle specific errors
    let userMessage = 'Gagal mengambil balance';
    
    if (error.message.includes('INVALID_ACCOUNT_ID')) {
      userMessage = 'Account tidak ditemukan. Pastikan private key benar atau account sudah dibuat.';
    } else if (error.message.includes('INVALID_TRANSACTION')) {
      userMessage = 'Transaksi tidak valid. Periksa konfigurasi network.';
    } else if (error.message.includes('NETWORK_ERROR')) {
      userMessage = 'Koneksi jaringan gagal. Periksa koneksi internet Anda.';
    } else if (error.message.includes('UNAUTHORIZED')) {
      userMessage = 'Private key tidak valid atau tidak memiliki akses.';
    }
    
    return {
      success: false,
      error: userMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
};

/**
 * Kirim HBAR ke address tujuan
 */
export const sendHBAR = async (senderPrivateKey, recipientAddress, amount, memo = '') => {
  try {
    // Validasi input
    if (!senderPrivateKey || !recipientAddress || !amount) {
      throw new Error('Semua field harus diisi');
    }
    
    if (amount <= 0) {
      throw new Error('Jumlah harus lebih dari 0');
    }
    
    // Validasi recipient address format
    if (!recipientAddress.match(/^\d+\.\d+\.\d+$/)) {
      throw new Error('Format alamat penerima tidak valid. Gunakan format: 0.0.1234567');
    }
    
    // Validasi memo length
    if (memo && memo.length > 100) {
      throw new Error('Memo tidak boleh lebih dari 100 karakter');
    }
    
    const client = initializeClient();
    
    // Validasi private key pengirim
    const validation = validatePrivateKey(senderPrivateKey);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    const senderPrivateKeyObj = validation.privateKey;
    const senderPublicKey = senderPrivateKeyObj.publicKey;
    const senderAccountId = senderPublicKey.toAccountId(0, 0);
    
    console.log(`Sending ${amount} HBAR from ${senderAccountId} to ${recipientAddress}`);
    
    // Buat transfer transaction
    const transferTx = new TransferTransaction()
      .addHbarTransfer(senderAccountId, Hbar.fromTinybars(-amount * 100000000))
      .addHbarTransfer(recipientAddress, Hbar.fromTinybars(amount * 100000000))
      .setTransactionMemo(memo.substring(0, 100))
      .setTransactionId(TransactionId.generate(senderAccountId))
      .freezeWith(client);
    
    // Sign transaction dengan private key pengirim
    const signedTx = await transferTx.sign(senderPrivateKeyObj);
    
    // Eksekusi transaction
    const txResponse = await signedTx.execute(client);
    console.log('Transaction executed:', txResponse.transactionId.toString());
    
    // Tunggu receipt untuk konfirmasi
    const receipt = await new TransactionReceiptQuery()
      .setTransactionId(txResponse.transactionId)
      .execute(client);
    
    console.log('Transaction receipt status:', receipt.status.toString());
    
    // Dapatkan transaction record untuk detail lebih lanjut
    let transactionRecord;
    try {
      transactionRecord = await new TransactionRecordQuery()
        .setTransactionId(txResponse.transactionId)
        .execute(client);
    } catch (error) {
      console.warn('Could not fetch transaction record:', error.message);
    }
    
    // Hitung fee transaksi
    const transactionFee = transactionRecord 
      ? transactionRecord.transactionFee.toBigNumber().dividedBy(100000000).toNumber()
      : 0.0001; // Default estimate
    
    // Format response
    const result = {
      success: true,
      transactionId: txResponse.transactionId.toString(),
      status: receipt.status.toString(),
      statusCode: receipt.status._code,
      sender: senderAccountId.toString(),
      recipient: recipientAddress,
      amount: amount,
      memo: memo || '',
      transactionFee: transactionFee,
      totalCost: amount + transactionFee,
      consensusTimestamp: receipt.consensusTimestamp?.toString(),
      network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'mainnet',
      timestamp: new Date().toISOString()
    };
    
    // Tambahkan explorer URL jika tersedia
    if (process.env.NEXT_PUBLIC_HEDERA_NETWORK) {
      const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK.toLowerCase();
      const explorerBase = {
        mainnet: 'https://hashscan.io/mainnet/transaction/',
        testnet: 'https://hashscan.io/testnet/transaction/',
        previewnet: 'https://hashscan.io/previewnet/transaction/'
      }[network];
      
      if (explorerBase) {
        result.explorerUrl = explorerBase + txResponse.transactionId.toString();
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error sending HBAR:', error);
    
    // Handle specific Hedera errors
    let userMessage = 'Gagal mengirim transaksi';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error.message.includes('INSUFFICIENT_ACCOUNT_BALANCE')) {
      userMessage = 'Balance tidak mencukupi untuk transaksi dan fee';
      errorCode = 'INSUFFICIENT_BALANCE';
    } else if (error.message.includes('INVALID_ACCOUNT_ID')) {
      userMessage = 'Alamat pengirim atau penerima tidak valid';
      errorCode = 'INVALID_ACCOUNT';
    } else if (error.message.includes('ACCOUNT_DELETED')) {
      userMessage = 'Account pengirim atau penerima sudah dihapus';
      errorCode = 'ACCOUNT_DELETED';
    } else if (error.message.includes('INVALID_SIGNATURE')) {
      userMessage = 'Signature tidak valid. Private key mungkin salah.';
      errorCode = 'INVALID_SIGNATURE';
    } else if (error.message.includes('TRANSACTION_EXPIRED')) {
      userMessage = 'Transaksi sudah kadaluarsa. Coba lagi.';
      errorCode = 'TRANSACTION_EXPIRED';
    } else if (error.message.includes('NETWORK_ERROR') || error.message.includes('timeout')) {
      userMessage = 'Koneksi jaringan gagal. Periksa koneksi internet Anda.';
      errorCode = 'NETWORK_ERROR';
    } else if (error.message.includes('UNAUTHORIZED')) {
      userMessage = 'Tidak memiliki izin untuk transaksi ini';
      errorCode = 'UNAUTHORIZED';
    }
    
    return {
      success: false,
      error: userMessage,
      errorCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Cek status transaksi berdasarkan transaction ID
 */
export const checkTransactionStatus = async (transactionId) => {
  try {
    if (!transactionId) {
      throw new Error('Transaction ID diperlukan');
    }
    
    const client = initializeClient();
    
    // Parse transaction ID
    const txId = TransactionId.fromString(transactionId);
    
    // Query receipt
    const receipt = await new TransactionReceiptQuery()
      .setTransactionId(txId)
      .execute(client);
    
    // Query record untuk detail lebih lanjut
    let record;
    try {
      record = await new TransactionRecordQuery()
        .setTransactionId(txId)
        .execute(client);
    } catch (error) {
      console.warn('Could not fetch transaction record:', error.message);
    }
    
    return {
      success: true,
      transactionId: transactionId,
      status: receipt.status.toString(),
      statusCode: receipt.status._code,
      consensusTimestamp: receipt.consensusTimestamp?.toString(),
      transactionFee: record?.transactionFee 
        ? record.transactionFee.toBigNumber().dividedBy(100000000).toNumber()
        : null,
      memo: record?.transactionMemo || '',
      transfers: record?.transfers?.list?.map(transfer => ({
        accountId: transfer.accountId.toString(),
        amount: transfer.amount.toBigNumber().dividedBy(100000000).toNumber()
      })) || []
    };
  } catch (error) {
    console.error('Error checking transaction status:', error);
    
    return {
      success: false,
      error: error.message.includes('NOT_FOUND') 
        ? 'Transaksi tidak ditemukan' 
        : 'Gagal memeriksa status transaksi',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
};

/**
 * Utility function untuk masking private key
 */
export const maskPrivateKey = (privateKey, visibleChars = 4) => {
  if (!privateKey || privateKey.length <= visibleChars * 2) {
    return privateKey;
  }
  
  const firstPart = privateKey.substring(0, visibleChars);
  const lastPart = privateKey.substring(privateKey.length - visibleChars);
  const middle = '...';
  
  return `${firstPart}${middle}${lastPart}`;
};

/**
 * Estimasi fee transaksi
 */
export const estimateTransactionFee = async (senderPrivateKey, amount) => {
  try {
    // Validasi private key
    const validation = validatePrivateKey(senderPrivateKey);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Estimasi fee berdasarkan amount (sederhana)
    // Di production, Anda bisa query network untuk fee yang lebih akurat
    const baseFee = 0.0001; // 0.0001 HBAR base fee
    const amountFee = Math.max(amount * 0.0001, 0.00005); // 0.01% dari amount, min 0.00005
    
    const estimatedFee = baseFee + amountFee;
    
    return {
      success: true,
      estimatedFee: estimatedFee,
      minFee: baseFee,
      totalRequired: amount + estimatedFee,
      breakdown: {
        baseFee: baseFee,
        amountFee: amountFee,
        networkFee: 0.00001 // Small network fee
      }
    };
  } catch (error) {
    console.error('Error estimating fee:', error);
    return {
      success: false,
      error: 'Gagal mengestimasi fee transaksi',
      estimatedFee: 0.0002 // Fallback estimate
    };
  }
};

/**
 * Validasi account ID format
 */
export const validateAccountIdFormat = (accountId) => {
  if (!accountId || typeof accountId !== 'string') {
    return { valid: false, error: 'Account ID harus berupa string' };
  }
  
  // Regex untuk format Hedera account ID: shard.realm.number
  const regex = /^(\d+)\.(\d+)\.(\d+)$/;
  const match = accountId.match(regex);
  
  if (!match) {
    return { valid: false, error: 'Format Account ID tidak valid. Gunakan format: 0.0.1234567' };
  }
  
  const [, shard, realm, num] = match;
  
  // Validasi angka
  if (parseInt(shard) < 0 || parseInt(realm) < 0 || parseInt(num) < 0) {
    return { valid: false, error: 'Account ID tidak boleh mengandung angka negatif' };
  }
  
  // Validasi panjang (nomor account biasanya 5-10 digit)
  if (parseInt(num) > 9999999999) {
    return { valid: false, error: 'Account number terlalu besar' };
  }
  
  return { valid: true, shard, realm, num };
};

/**
 * Cek apakah account ada
 */
export const checkAccountExists = async (accountId) => {
  try {
    const client = initializeClient();
    
    const validation = validateAccountIdFormat(accountId);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    // Coba query account info
    const accountInfo = await new AccountInfoQuery()
      .setAccountId(accountId)
      .execute(client);
    
    return {
      success: true,
      exists: true,
      accountId: accountInfo.accountId.toString(),
      balance: accountInfo.balance.toBigNumber().dividedBy(100000000).toNumber(),
      isDeleted: accountInfo.isDeleted || false,
      alias: accountInfo.alias?.toString(),
      key: accountInfo.key?.toString()
    };
  } catch (error) {
    if (error.message.includes('INVALID_ACCOUNT_ID') || 
        error.message.includes('ACCOUNT_DELETED') ||
        error.message.includes('NOT_FOUND')) {
      return {
        success: true,
        exists: false,
        accountId: accountId,
        error: 'Account tidak ditemukan atau sudah dihapus'
      };
    }
    
    console.error('Error checking account:', error);
    return {
      success: false,
      error: 'Gagal memeriksa account',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
};

// Export semua fungsi
export default {
  getHederaClient,
  initializeClient,
  validatePrivateKey,
  getAccountIdFromPrivateKey,
  checkBalance,
  sendHBAR,
  checkTransactionStatus,
  maskPrivateKey,
  estimateTransactionFee,
  validateAccountIdFormat,
  checkAccountExists
};