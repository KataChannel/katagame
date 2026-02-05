/**
 * Mock Payment Server to simulate backend webhook and transaction validation (MVP4)
 */

export interface TransactionRecord {
  id: string;
  playerId: string;
  playerName: string;
  itemName: string;
  amount: number;
  currency: string;
  gateway: 'momo' | 'zalopay' | 'vnpay' | 'credit_card';
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  signature: string;
}

class MockPaymentServer {
  private transactions: TransactionRecord[] = [];

  /**
   * Simulates the creation of a payment order on the server
   */
  async createOrder(data: {
    playerId: string;
    playerName: string;
    itemName: string;
    amount: number;
    gateway: TransactionRecord['gateway'];
  }): Promise<{ orderId: string; paymentUrl: string }> {
    const orderId = `order_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newTransaction: TransactionRecord = {
      id: orderId,
      playerId: data.playerId,
      playerName: data.playerName,
      itemName: data.itemName,
      amount: data.amount,
      currency: 'VND',
      gateway: data.gateway,
      status: 'pending',
      timestamp: Date.now(),
      signature: btoa(`${orderId}:${data.amount}:SECRET_KEY`),
    };

    this.transactions.push(newTransaction);
    
    return {
      orderId,
      paymentUrl: `https://mock.gateway.vn/pay/${orderId}`
    };
  }

  /**
   * Simulates the Webhook callback from the payment gateway to the server
   */
  async validateTransaction(orderId: string): Promise<{ success: boolean; transaction?: TransactionRecord }> {
    // Simulate network delay for verification
    await new Promise(resolve => setTimeout(resolve, 1200));

    const index = this.transactions.findIndex(t => t.id === orderId);
    if (index === -1) return { success: false };

    // 95% success rate for the simulation
    const isSuccessful = Math.random() > 0.05;

    if (isSuccessful) {
      this.transactions[index].status = 'completed';
      return { success: true, transaction: this.transactions[index] };
    } else {
      this.transactions[index].status = 'failed';
      return { success: false };
    }
  }

  /**
   * Returns all transactions for the Admin Dashboard
   */
  getTransactions(): TransactionRecord[] {
    return [...this.transactions].sort((a, b) => b.timestamp - a.timestamp);
  }
}

let serverInstance: MockPaymentServer | null = null;

export const getMockPaymentServer = () => {
  if (!serverInstance) {
    serverInstance = new MockPaymentServer();
  }
  return serverInstance;
};
