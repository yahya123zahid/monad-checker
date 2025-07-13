import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Head from 'next/head';

export default function Home() {
  const [address, setAddress] = useState('');
  const [isEligible, setIsEligible] = useState(null);
  const [txCount, setTxCount] = useState(null);
  const [reward, setReward] = useState(null);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  const MIN_TXS = 50;

  const mockFetchTxCount = async (wallet) => {
    await new Promise((r) => setTimeout(r, 1000));
    if (wallet.toLowerCase() === '0x0000000000000000000000000000000000000000') return null;
    return Math.floor(Math.random() * 200);
  };

  const checkEligibility = async () => {
    setError(null);
    setIsEligible(null);
    setTxCount(null);
    setReward(null);
    setChecking(true);

    try {
      if (!ethers.isAddress(address)) throw new Error('Invalid address');

      const txs = await mockFetchTxCount(address);
      if (txs === null) {
        setIsEligible('not_found');
      } else {
        setTxCount(txs);
        if (txs >= MIN_TXS) {
          setIsEligible(true);
          setReward(`${(Math.random() * 10).toFixed(2)} MONAD`);
        } else {
          setIsEligible(false);
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setChecking(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) return setError('MetaMask not found');
    try {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(account);
    } catch (e) {
      setError('Wallet connection rejected');
    }
  };

  return (
    <>
      <Head>
        <title>Monad Airdrop Checker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
          <h1 className="text-xl font-bold mb-4 text-center">Monad Airdrop Checker</h1>

          <input
            type="text"
            placeholder="Paste your wallet address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl mb-3"
          />

          <button
            onClick={checkEligibility}
            disabled={checking}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
          >
            {checking ? 'Checking...' : 'Check Eligibility'}
          </button>

          <button
            onClick={connectWallet}
            className="w-full bg-gray-200 text-black py-2 rounded-xl hover:bg-gray-300 mt-2"
          >
            Connect Wallet
          </button>

          {error && <p className="text-red-600 mt-4 text-sm">⚠️ {error}</p>}

          {isEligible !== null && (
            <div className="mt-4 text-center">
              {isEligible === 'not_found' ? (
                <p className="text-yellow-600">⚠️ Address not found</p>
              ) : isEligible ? (
                <p className="text-green-600 font-bold">✅ Eligible</p>
              ) : (
                <p className="text-red-600 font-bold">❌ Not Eligible</p>
              )}
              {txCount !== null && <p>Total Transactions: {txCount}</p>}
              {reward && <p>Airdrop Reward: {reward}</p>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}