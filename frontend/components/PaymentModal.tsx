import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Wallet, X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { getMockPaymentServer } from '@/lib/mockPaymentServer';
import { useGameStore } from '@/lib/gameStore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemName: string;
  amount: number;
}

type PaymentMethod = 'momo' | 'zalopay' | 'vnpay' | 'card';

export default function PaymentModal({ isOpen, onClose, onSuccess, itemName, amount }: PaymentModalProps) {
  const [step, setStep] = useState<'method' | 'processing' | 'success' | 'failed'>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const { player } = useGameStore();

  const handlePayment = async (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('processing');
    
    const server = getMockPaymentServer();
    const gateway = method === 'card' ? 'credit_card' : method;

    try {
      // Step 1: Create Order on Server
      const { orderId } = await server.createOrder({
        playerId: player.id,
        playerName: player.name,
        itemName,
        amount,
        gateway
      });

      // Step 2: Validate Transaction (Mock Webhook simulation)
      const result = await server.validateTransaction(orderId);

      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1500);
      } else {
        setStep('failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setStep('failed');
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('method');
      setSelectedMethod(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
            <h3 className="text-lg font-bold text-white">Thanh Toán An Toàn</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Item Info */}
            <div className="flex justify-between items-end mb-6 text-sm">
              <div>
                <p className="text-gray-400">Sản phẩm</p>
                <p className="font-semibold text-white text-lg">{itemName}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400">Tổng tiền</p>
                <p className="font-bold text-yellow-400 text-xl">
                  {amount.toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </div>

            {/* Methods Step */}
            {step === 'method' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-2">Chọn phương thức thanh toán:</p>
                
                <button
                  onClick={() => handlePayment('momo')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-pink-900/20 hover:border-pink-500/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded bg-[#D82D8B] flex items-center justify-center text-white">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-white group-hover:text-pink-400 transition-colors">Ví MoMo</p>
                    <p className="text-xs text-gray-500">Giảm 5% cho giao dịch đầu</p>
                  </div>
                </button>

                <button
                  onClick={() => handlePayment('zalopay')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-blue-900/20 hover:border-blue-500/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded bg-[#0068FF] flex items-center justify-center text-white">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">ZaloPay</p>
                    <p className="text-xs text-gray-500">Thanh toán nhanh qua QR</p>
                  </div>
                </button>

                <button
                  onClick={() => handlePayment('vnpay')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-red-900/20 hover:border-red-500/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-red-600">
                    <span className="font-bold text-xs">VNPAY</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-white group-hover:text-red-400 transition-colors">VNPAY-QR</p>
                    <p className="text-xs text-gray-500">Quét mã ngân hàng</p>
                  </div>
                </button>

                <button
                  onClick={() => handlePayment('card')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-700 bg-gray-800 hover:bg-purple-900/20 hover:border-purple-500/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">Thẻ Quốc Tế</p>
                    <p className="text-xs text-gray-500">Visa / Mastercard / JCB</p>
                  </div>
                </button>
              </div>
            )}

            {/* Processing Step */}
            {step === 'processing' && (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full mx-auto mb-4"
                />
                <h4 className="text-xl font-bold text-white mb-2">Đang Xử Lý</h4>
                <p className="text-gray-400">Đang kết nối tới cổng thanh toán...</p>
                <div className="mt-4 text-xs text-gray-500 flex items-center justify-center gap-2">
                  <Shield className="w-3 h-3" /> Giao dịch được bảo mật 100%
                </div>
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-2">Thanh Toán Thành Công!</h4>
                <p className="text-gray-400">Cảm ơn bạn đã ủng hộ KataGame</p>
              </div>
            )}

            {/* Failed Step */}
            {step === 'failed' && (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <AlertCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-2">Thanh Toán Thất Bại</h4>
                <p className="text-gray-400 mb-6">Đã có lỗi xảy ra trong quá trình xử lý.</p>
                <button
                  onClick={() => setStep('method')}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
                >
                  Thử Lại
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-800/50 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              KataGame sử dụng công nghệ mã hóa chuẩn quốc tế SSL/TLS
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Shield(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
    )
}
