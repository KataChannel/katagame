import { getDatabase } from '../database.service'

/**
 * Marketplace Listing Data Model
 */
export interface MarketplaceListing {
  id: string
  seller_id: string
  item_type: string
  item_id: string
  item_name: string
  price: number
  status: 'active' | 'sold' | 'expired'
  auction_end: Date
  created_at: Date
}

/**
 * MarketplaceService
 * Handles all marketplace operations
 */
export class MarketplaceService {
  private db = getDatabase()

  /**
   * Create a new listing
   */
  async createListing(
    sellerId: string,
    itemType: string,
    itemId: string,
    itemName: string,
    price: number,
    auctionDurationMinutes: number = 1440 // Default 24 hours
  ): Promise<MarketplaceListing> {
    const auctionEnd = new Date(
      Date.now() + auctionDurationMinutes * 60 * 1000
    )

    return await this.db.insert<MarketplaceListing>(
      'marketplace_listings',
      {
        seller_id: sellerId,
        item_type: itemType,
        item_id: itemId,
        item_name: itemName,
        price,
        status: 'active',
        auction_end: auctionEnd,
        created_at: new Date(),
      }
    )
  }

  /**
   * Get listing by ID
   */
  async getListing(listingId: string): Promise<MarketplaceListing | null> {
    return await this.db.getById<MarketplaceListing>(
      'marketplace_listings',
      listingId
    )
  }

  /**
   * Get active listings (paginated)
   */
  async getActiveListings(
    limit: number = 50,
    offset: number = 0
  ): Promise<MarketplaceListing[]> {
    return await this.db.raw<MarketplaceListing>(
      `
        SELECT * FROM marketplace_listings
        WHERE status = 'active' AND auction_end > NOW()
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    )
  }

  /**
   * Get listings by seller
   */
  async getListingsBySeller(
    sellerId: string,
    status?: string
  ): Promise<MarketplaceListing[]> {
    let query = `SELECT * FROM marketplace_listings WHERE seller_id = $1`
    const params: any[] = [sellerId]

    if (status) {
      query += ` AND status = $2`
      params.push(status)
    }

    query += ` ORDER BY created_at DESC`

    return await this.db.raw<MarketplaceListing>(query, params)
  }

  /**
   * Search listings by item name
   */
  async searchListings(
    query: string,
    limit: number = 50
  ): Promise<MarketplaceListing[]> {
    return await this.db.raw<MarketplaceListing>(
      `
        SELECT * FROM marketplace_listings
        WHERE status = 'active' 
          AND auction_end > NOW()
          AND item_name ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [`%${query}%`, limit]
    )
  }

  /**
   * Get listings by item type
   */
  async getListingsByType(
    itemType: string,
    limit: number = 50
  ): Promise<MarketplaceListing[]> {
    return await this.db.raw<MarketplaceListing>(
      `
        SELECT * FROM marketplace_listings
        WHERE status = 'active' 
          AND auction_end > NOW()
          AND item_type = $1
        ORDER BY price ASC
        LIMIT $2
      `,
      [itemType, limit]
    )
  }

  /**
   * Update listing status
   */
  async updateListingStatus(
    listingId: string,
    status: 'active' | 'sold' | 'expired'
  ): Promise<MarketplaceListing> {
    return await this.db.update<MarketplaceListing>(
      'marketplace_listings',
      listingId,
      { status }
    )
  }

  /**
   * Mark listing as sold
   */
  async markAsSold(listingId: string): Promise<MarketplaceListing> {
    return await this.updateListingStatus(listingId, 'sold')
  }

  /**
   * Get expired listings
   */
  async getExpiredListings(): Promise<MarketplaceListing[]> {
    return await this.db.raw<MarketplaceListing>(
      `
        SELECT * FROM marketplace_listings
        WHERE status = 'active' AND auction_end <= NOW()
      `
    )
  }

  /**
   * Expire old listings
   */
  async expireListings(): Promise<number> {
    const result = await this.db.query(
      `
        UPDATE marketplace_listings
        SET status = 'expired'
        WHERE status = 'active' AND auction_end <= NOW()
      `
    )
    return result.rowCount || 0
  }

  /**
   * Get marketplace stats
   */
  async getStats(): Promise<{
    total_listings: number
    active_listings: number
    total_sold: number
    average_price: number
  }> {
    const results = await this.db.raw<any>(
      `
        SELECT
          COUNT(*) as total_listings,
          COUNT(CASE WHEN status = 'active' AND auction_end > NOW() THEN 1 END) as active_listings,
          COUNT(CASE WHEN status = 'sold' THEN 1 END) as total_sold,
          COALESCE(AVG(price), 0) as average_price
        FROM marketplace_listings
      `
    )

    const row = results[0]
    return {
      total_listings: parseInt(row.total_listings),
      active_listings: parseInt(row.active_listings),
      total_sold: parseInt(row.total_sold),
      average_price: parseFloat(row.average_price),
    }
  }

  /**
   * Get price history for item type
   */
  async getPriceHistory(
    itemType: string,
    limit: number = 50
  ): Promise<Array<{ price: number; count: number }>> {
    return await this.db.raw<{ price: number; count: number }>(
      `
        SELECT price, COUNT(*) as count
        FROM marketplace_listings
        WHERE item_type = $1 AND status = 'sold'
        GROUP BY price
        ORDER BY count DESC
        LIMIT $2
      `,
      [itemType, limit]
    )
  }
}

// Export singleton
let marketplaceService: MarketplaceService | null = null

export function getMarketplaceService(): MarketplaceService {
  if (!marketplaceService) {
    marketplaceService = new MarketplaceService()
  }
  return marketplaceService
}
