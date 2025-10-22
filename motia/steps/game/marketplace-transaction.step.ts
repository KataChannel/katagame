import { Handlers } from 'motia'

/**
 * Marketplace Transaction Handler
 * - Process buy/sell transactions
 * - Handle marketplace fees (5%)
 * - Update player gold/resources
 * - Track transaction history
 */

export const config = {
  type: 'cron',
  cron: '*/2 * * * *', // Check every 2 minutes
  name: 'MarketplaceTransactionProcessor',
  description:
    'Process marketplace transactions, handle fees, update inventory',
  emits: ['player.gold_changed', 'player.item_received'],
  flows: ['game-flow'],
}

export const handler: Handlers['MarketplaceTransactionProcessor'] = async ({
  logger,
  state,
  emit,
}: any) => {
  try {
    // Get all pending marketplace transactions
    const transactions = await state.getGroup('transaction:pending')

    for (const transaction of transactions) {
      if (!transaction) continue

      const { buyerId, sellerId, listingId, price, timestamp } = transaction

      // Get players
      const buyer = await state.get('player', buyerId)
      const seller = await state.get('player', sellerId)
      const listing = await state.get('listing', listingId)

      if (!buyer || !seller || !listing) {
        logger.warn('Transaction parties not found', {
          buyerId,
          sellerId,
          listingId,
        })
        continue
      }

      // Check buyer has enough gold
      if (!buyer.resources || (buyer.resources.gold || 0) < price) {
        logger.warn('Buyer insufficient funds', { buyerId, price })
        transaction.status = 'failed'
        await state.set('transaction:pending', transaction.id, transaction)
        continue
      }

      // Calculate fees (5%)
      const fee = Math.floor(price * 0.05)
      const sellerEarnings = price - fee

      // Update balances
      buyer.resources.gold = (buyer.resources.gold || 0) - price
      seller.resources.gold = (seller.resources.gold || 0) + sellerEarnings

      // Add item to buyer inventory
      if (!buyer.inventory) buyer.inventory = []
      buyer.inventory.push({
        itemId: listing.item_id,
        name: listing.item_name,
        type: listing.item_type,
        acquiredAt: timestamp,
      })

      // Update states
      await state.set('player', buyerId, buyer)
      await state.set('player', sellerId, seller)

      // Mark listing as sold
      listing.status = 'sold'
      listing.soldAt = timestamp
      listing.buyerId = buyerId
      await state.set('listing', listingId, listing)

      // Emit events
      await emit({
        topic: 'player.gold_changed',
        data: {
          playerId: buyerId,
          goldChange: -price,
          reason: 'marketplace_purchase',
          timestamp,
        },
      })

      await emit({
        topic: 'player.gold_changed',
        data: {
          playerId: sellerId,
          goldChange: sellerEarnings,
          reason: 'marketplace_sale',
          timestamp,
        },
      })

      await emit({
        topic: 'player.item_received',
        data: {
          playerId: buyerId,
          item: listing.item_name,
          itemType: listing.item_type,
          itemId: listing.item_id,
          timestamp,
        },
      })

      // Mark transaction as completed
      transaction.status = 'completed'
      await state.set('transaction:pending', transaction.id, transaction)

      logger.info('Marketplace transaction completed', {
        buyerId,
        sellerId,
        amount: price,
        fee,
        sellerEarnings,
        itemId: listing.item_id,
      })
    }
  } catch (error) {
    logger.error('Error in MarketplaceTransactionProcessor', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
