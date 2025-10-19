// Trading & Marketplace System
// Features: Auction house, Buy now, Bidding, Trade history, Price charts, Escrow

export type ItemCategory = 
  | 'hero' 
  | 'equipment' 
  | 'resource' 
  | 'cosmetic' 
  | 'consumable' 
  | 'material';

export type ListingType = 'auction' | 'buyout' | 'both';
export type ListingStatus = 'active' | 'sold' | 'expired' | 'cancelled';
export type TradeStatus = 'pending' | 'accepted' | 'cancelled' | 'completed';

export interface MarketplaceItem {
  itemId: string;
  itemName: string;
  category: ItemCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  level?: number;
  stats?: Record<string, number>;
  description: string;
  iconUrl?: string;
}

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  sellerName: string;
  item: MarketplaceItem;
  quantity: number;
  listingType: ListingType;
  startingPrice?: number; // For auctions
  buyoutPrice?: number; // Instant purchase price
  currentBid?: number;
  currentBidderId?: string;
  currentBidderName?: string;
  bids: Bid[];
  createdAt: number;
  expiresAt: number;
  status: ListingStatus;
  featured: boolean; // Paid promotion
  views: number;
}

export interface Bid {
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: number;
  isAutoBid: boolean;
}

export interface DirectTrade {
  id: string;
  initiatorId: string;
  initiatorName: string;
  recipientId: string;
  recipientName: string;
  initiatorItems: MarketplaceItem[];
  initiatorGold: number;
  recipientItems: MarketplaceItem[];
  recipientGold: number;
  status: TradeStatus;
  createdAt: number;
  expiresAt: number;
  initiatorAccepted: boolean;
  recipientAccepted: boolean;
}

export interface TradeHistory {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  item: MarketplaceItem;
  quantity: number;
  finalPrice: number;
  marketplaceFee: number;
  timestamp: number;
  tradeType: 'auction' | 'buyout' | 'direct';
}

export interface PriceHistory {
  itemId: string;
  itemName: string;
  prices: {
    price: number;
    quantity: number;
    timestamp: number;
  }[];
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  totalVolume: number;
}

export interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  totalTrades: number;
  totalVolume: number;
  averagePrice: number;
  topSellingItems: {
    itemId: string;
    itemName: string;
    sales: number;
    volume: number;
  }[];
}

export interface UserMarketplaceStats {
  userId: string;
  totalSales: number;
  totalPurchases: number;
  totalRevenue: number;
  totalSpent: number;
  successRate: number; // % of listings that sold
  averageSaleTime: number; // milliseconds
  reputation: number; // 0-100
}

// Marketplace configuration
export const MARKETPLACE_CONFIG = {
  FEE_PERCENTAGE: 5, // 5% marketplace fee
  FEATURED_LISTING_COST: 1000, // Gold cost to feature
  FEATURED_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  MIN_LISTING_DURATION: 1 * 60 * 60 * 1000, // 1 hour
  MAX_LISTING_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
  DEFAULT_LISTING_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  MIN_BID_INCREMENT: 100, // Minimum bid increase
  AUTO_BID_MAX_LIMIT: 1000000, // Max auto-bid amount
  TRADE_EXPIRY_DURATION: 5 * 60 * 1000, // 5 minutes for direct trades
  MAX_ACTIVE_LISTINGS: 20, // Per user
  PREMIUM_MAX_LISTINGS: 50, // For premium users
  SEARCH_RESULTS_PER_PAGE: 20,
};

class TradingSystem {
  private listings: Map<string, MarketplaceListing> = new Map();
  private directTrades: Map<string, DirectTrade> = new Map();
  private tradeHistory: TradeHistory[] = [];
  private priceHistory: Map<string, PriceHistory> = new Map();
  private userStats: Map<string, UserMarketplaceStats> = new Map();
  private watchlists: Map<string, string[]> = new Map(); // userId -> listingIds[]

  constructor() {
    this.startExpiryChecker();
    this.startAutoBidProcessor();
  }

  // ==================== LISTING MANAGEMENT ====================

  createListing(
    sellerId: string,
    sellerName: string,
    item: MarketplaceItem,
    quantity: number,
    listingType: ListingType,
    startingPrice?: number,
    buyoutPrice?: number,
    duration: number = MARKETPLACE_CONFIG.DEFAULT_LISTING_DURATION,
    featured: boolean = false
  ): { success: boolean; listing?: MarketplaceListing; error?: string } {
    // Validate inputs
    if (quantity < 1) {
      return { success: false, error: 'Quantity must be at least 1' };
    }

    if (listingType === 'auction' && !startingPrice) {
      return { success: false, error: 'Starting price required for auctions' };
    }

    if (listingType === 'buyout' && !buyoutPrice) {
      return { success: false, error: 'Buyout price required' };
    }

    if (duration < MARKETPLACE_CONFIG.MIN_LISTING_DURATION) {
      return { success: false, error: 'Listing duration too short' };
    }

    if (duration > MARKETPLACE_CONFIG.MAX_LISTING_DURATION) {
      return { success: false, error: 'Listing duration too long' };
    }

    // Check active listings limit
    const userListings = this.getUserActiveListings(sellerId);
    const maxListings = MARKETPLACE_CONFIG.MAX_ACTIVE_LISTINGS; // TODO: Check premium status
    
    if (userListings.length >= maxListings) {
      return { 
        success: false, 
        error: `Maximum ${maxListings} active listings reached` 
      };
    }

    // Create listing
    const listing: MarketplaceListing = {
      id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sellerId,
      sellerName,
      item,
      quantity,
      listingType,
      startingPrice,
      buyoutPrice,
      currentBid: startingPrice,
      bids: [],
      createdAt: Date.now(),
      expiresAt: Date.now() + duration,
      status: 'active',
      featured,
      views: 0,
    };

    this.listings.set(listing.id, listing);

    return { success: true, listing };
  }

  cancelListing(
    listingId: string,
    userId: string
  ): { success: boolean; error?: string } {
    const listing = this.listings.get(listingId);

    if (!listing) {
      return { success: false, error: 'Listing not found' };
    }

    if (listing.sellerId !== userId) {
      return { success: false, error: 'Not your listing' };
    }

    if (listing.status !== 'active') {
      return { success: false, error: 'Listing not active' };
    }

    // Can't cancel if there are bids
    if (listing.bids.length > 0) {
      return { 
        success: false, 
        error: 'Cannot cancel listing with existing bids' 
      };
    }

    listing.status = 'cancelled';

    return { success: true };
  }

  featureListing(
    listingId: string,
    userId: string
  ): { success: boolean; cost?: number; error?: string } {
    const listing = this.listings.get(listingId);

    if (!listing) {
      return { success: false, error: 'Listing not found' };
    }

    if (listing.sellerId !== userId) {
      return { success: false, error: 'Not your listing' };
    }

    if (listing.featured) {
      return { success: false, error: 'Already featured' };
    }

    listing.featured = true;

    return { 
      success: true, 
      cost: MARKETPLACE_CONFIG.FEATURED_LISTING_COST 
    };
  }

  // ==================== BIDDING SYSTEM ====================

  placeBid(
    listingId: string,
    bidderId: string,
    bidderName: string,
    amount: number,
    isAutoBid: boolean = false
  ): { success: boolean; listing?: MarketplaceListing; error?: string } {
    const listing = this.listings.get(listingId);

    if (!listing) {
      return { success: false, error: 'Listing not found' };
    }

    if (listing.status !== 'active') {
      return { success: false, error: 'Listing not active' };
    }

    if (Date.now() > listing.expiresAt) {
      return { success: false, error: 'Listing expired' };
    }

    if (listing.sellerId === bidderId) {
      return { success: false, error: 'Cannot bid on your own listing' };
    }

    if (listing.listingType === 'buyout') {
      return { success: false, error: 'This is a buyout-only listing' };
    }

    // Validate bid amount
    const minBid = (listing.currentBid || listing.startingPrice || 0) + 
                   MARKETPLACE_CONFIG.MIN_BID_INCREMENT;

    if (amount < minBid) {
      return { 
        success: false, 
        error: `Minimum bid is ${minBid}` 
      };
    }

    // Check if this is a buyout bid
    if (listing.buyoutPrice && amount >= listing.buyoutPrice) {
      return this.buyoutListing(listingId, bidderId, bidderName);
    }

    // Place bid
    const bid: Bid = {
      bidderId,
      bidderName,
      amount,
      timestamp: Date.now(),
      isAutoBid,
    };

    listing.bids.push(bid);
    listing.currentBid = amount;
    listing.currentBidderId = bidderId;
    listing.currentBidderName = bidderName;

    return { success: true, listing };
  }

  buyoutListing(
    listingId: string,
    buyerId: string,
    buyerName: string
  ): { success: boolean; trade?: TradeHistory; error?: string } {
    const listing = this.listings.get(listingId);

    if (!listing) {
      return { success: false, error: 'Listing not found' };
    }

    if (listing.status !== 'active') {
      return { success: false, error: 'Listing not active' };
    }

    if (Date.now() > listing.expiresAt) {
      return { success: false, error: 'Listing expired' };
    }

    if (listing.sellerId === buyerId) {
      return { success: false, error: 'Cannot buy your own listing' };
    }

    if (!listing.buyoutPrice) {
      return { success: false, error: 'No buyout price set' };
    }

    // Complete the sale
    const finalPrice = listing.buyoutPrice;
    const marketplaceFee = Math.floor(finalPrice * MARKETPLACE_CONFIG.FEE_PERCENTAGE / 100);

    const trade: TradeHistory = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      buyerId,
      buyerName,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      item: listing.item,
      quantity: listing.quantity,
      finalPrice,
      marketplaceFee,
      timestamp: Date.now(),
      tradeType: 'buyout',
    };

    // Update listing status
    listing.status = 'sold';

    // Add to trade history
    this.tradeHistory.unshift(trade);

    // Keep last 1000 trades
    if (this.tradeHistory.length > 1000) {
      this.tradeHistory.pop();
    }

    // Update price history
    this.updatePriceHistory(listing.item.itemId, listing.item.itemName, finalPrice, listing.quantity);

    // Update user stats
    this.updateUserStats(listing.sellerId, 'sell', finalPrice);
    this.updateUserStats(buyerId, 'buy', finalPrice);

    return { success: true, trade };
  }

  // ==================== DIRECT TRADING ====================

  initiateTrade(
    initiatorId: string,
    initiatorName: string,
    recipientId: string,
    recipientName: string,
    initiatorItems: MarketplaceItem[],
    initiatorGold: number
  ): { success: boolean; trade?: DirectTrade; error?: string } {
    if (initiatorId === recipientId) {
      return { success: false, error: 'Cannot trade with yourself' };
    }

    // Check for existing pending trade
    for (const trade of this.directTrades.values()) {
      if (
        trade.status === 'pending' &&
        ((trade.initiatorId === initiatorId && trade.recipientId === recipientId) ||
         (trade.initiatorId === recipientId && trade.recipientId === initiatorId))
      ) {
        return { success: false, error: 'Trade already pending with this user' };
      }
    }

    const trade: DirectTrade = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      initiatorId,
      initiatorName,
      recipientId,
      recipientName,
      initiatorItems,
      initiatorGold,
      recipientItems: [],
      recipientGold: 0,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + MARKETPLACE_CONFIG.TRADE_EXPIRY_DURATION,
      initiatorAccepted: false,
      recipientAccepted: false,
    };

    this.directTrades.set(trade.id, trade);

    return { success: true, trade };
  }

  updateTradeOffer(
    tradeId: string,
    userId: string,
    items: MarketplaceItem[],
    gold: number
  ): { success: boolean; trade?: DirectTrade; error?: string } {
    const trade = this.directTrades.get(tradeId);

    if (!trade) {
      return { success: false, error: 'Trade not found' };
    }

    if (trade.status !== 'pending') {
      return { success: false, error: 'Trade not pending' };
    }

    if (Date.now() > trade.expiresAt) {
      trade.status = 'cancelled';
      return { success: false, error: 'Trade expired' };
    }

    // Update the appropriate side
    if (userId === trade.initiatorId) {
      trade.initiatorItems = items;
      trade.initiatorGold = gold;
      trade.initiatorAccepted = false; // Reset acceptance
      trade.recipientAccepted = false;
    } else if (userId === trade.recipientId) {
      trade.recipientItems = items;
      trade.recipientGold = gold;
      trade.initiatorAccepted = false;
      trade.recipientAccepted = false;
    } else {
      return { success: false, error: 'Not part of this trade' };
    }

    return { success: true, trade };
  }

  acceptTrade(
    tradeId: string,
    userId: string
  ): { success: boolean; trade?: DirectTrade; completed?: boolean; error?: string } {
    const trade = this.directTrades.get(tradeId);

    if (!trade) {
      return { success: false, error: 'Trade not found' };
    }

    if (trade.status !== 'pending') {
      return { success: false, error: 'Trade not pending' };
    }

    if (Date.now() > trade.expiresAt) {
      trade.status = 'cancelled';
      return { success: false, error: 'Trade expired' };
    }

    // Mark as accepted
    if (userId === trade.initiatorId) {
      trade.initiatorAccepted = true;
    } else if (userId === trade.recipientId) {
      trade.recipientAccepted = true;
    } else {
      return { success: false, error: 'Not part of this trade' };
    }

    // Check if both accepted
    if (trade.initiatorAccepted && trade.recipientAccepted) {
      trade.status = 'completed';

      // Record in trade history for both items exchanged
      const allItems = [...trade.initiatorItems, ...trade.recipientItems];
      allItems.forEach(item => {
        const tradeRecord: TradeHistory = {
          id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          buyerId: trade.recipientId,
          buyerName: trade.recipientName,
          sellerId: trade.initiatorId,
          sellerName: trade.initiatorName,
          item,
          quantity: 1,
          finalPrice: 0, // Direct trade, no price
          marketplaceFee: 0,
          timestamp: Date.now(),
          tradeType: 'direct',
        };
        this.tradeHistory.unshift(tradeRecord);
      });

      return { success: true, trade, completed: true };
    }

    return { success: true, trade, completed: false };
  }

  cancelTrade(
    tradeId: string,
    userId: string
  ): { success: boolean; error?: string } {
    const trade = this.directTrades.get(tradeId);

    if (!trade) {
      return { success: false, error: 'Trade not found' };
    }

    if (trade.status !== 'pending') {
      return { success: false, error: 'Trade not pending' };
    }

    if (userId !== trade.initiatorId && userId !== trade.recipientId) {
      return { success: false, error: 'Not part of this trade' };
    }

    trade.status = 'cancelled';

    return { success: true };
  }

  // ==================== SEARCH & BROWSE ====================

  searchListings(filters: {
    category?: ItemCategory;
    rarity?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerName?: string;
    itemName?: string;
    featuredOnly?: boolean;
    sortBy?: 'price_asc' | 'price_desc' | 'time_asc' | 'time_desc' | 'popular';
    page?: number;
  }): {
    listings: MarketplaceListing[];
    totalResults: number;
    totalPages: number;
  } {
    let results = Array.from(this.listings.values()).filter(
      listing => listing.status === 'active' && Date.now() < listing.expiresAt
    );

    // Apply filters
    if (filters.category) {
      results = results.filter(l => l.item.category === filters.category);
    }

    if (filters.rarity) {
      results = results.filter(l => l.item.rarity === filters.rarity);
    }

    if (filters.minPrice !== undefined) {
      results = results.filter(l => 
        (l.buyoutPrice || l.currentBid || l.startingPrice || 0) >= filters.minPrice!
      );
    }

    if (filters.maxPrice !== undefined) {
      results = results.filter(l =>
        (l.buyoutPrice || l.currentBid || l.startingPrice || 0) <= filters.maxPrice!
      );
    }

    if (filters.sellerName) {
      results = results.filter(l =>
        l.sellerName.toLowerCase().includes(filters.sellerName!.toLowerCase())
      );
    }

    if (filters.itemName) {
      results = results.filter(l =>
        l.item.itemName.toLowerCase().includes(filters.itemName!.toLowerCase())
      );
    }

    if (filters.featuredOnly) {
      results = results.filter(l => l.featured);
    }

    // Sort results
    const sortBy = filters.sortBy || 'time_desc';
    results.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.buyoutPrice || a.currentBid || a.startingPrice || 0) -
                 (b.buyoutPrice || b.currentBid || b.startingPrice || 0);
        case 'price_desc':
          return (b.buyoutPrice || b.currentBid || b.startingPrice || 0) -
                 (a.buyoutPrice || a.currentBid || a.startingPrice || 0);
        case 'time_asc':
          return a.createdAt - b.createdAt;
        case 'time_desc':
          return b.createdAt - a.createdAt;
        case 'popular':
          return b.views - a.views;
        default:
          return b.createdAt - a.createdAt;
      }
    });

    // Pagination
    const page = filters.page || 1;
    const perPage = MARKETPLACE_CONFIG.SEARCH_RESULTS_PER_PAGE;
    const start = (page - 1) * perPage;
    const end = start + perPage;

    return {
      listings: results.slice(start, end),
      totalResults: results.length,
      totalPages: Math.ceil(results.length / perPage),
    };
  }

  getListing(listingId: string): MarketplaceListing | null {
    const listing = this.listings.get(listingId);
    if (listing) {
      listing.views++;
    }
    return listing || null;
  }

  getUserActiveListings(userId: string): MarketplaceListing[] {
    return Array.from(this.listings.values()).filter(
      listing => listing.sellerId === userId && listing.status === 'active'
    );
  }

  getUserBids(userId: string): MarketplaceListing[] {
    return Array.from(this.listings.values()).filter(
      listing => 
        listing.status === 'active' &&
        listing.bids.some(bid => bid.bidderId === userId)
    );
  }

  getUserPendingTrades(userId: string): DirectTrade[] {
    return Array.from(this.directTrades.values()).filter(
      trade =>
        trade.status === 'pending' &&
        (trade.initiatorId === userId || trade.recipientId === userId)
    );
  }

  // ==================== WATCHLIST ====================

  addToWatchlist(userId: string, listingId: string): { success: boolean } {
    const watchlist = this.watchlists.get(userId) || [];
    
    if (!watchlist.includes(listingId)) {
      watchlist.push(listingId);
      this.watchlists.set(userId, watchlist);
    }

    return { success: true };
  }

  removeFromWatchlist(userId: string, listingId: string): { success: boolean } {
    const watchlist = this.watchlists.get(userId) || [];
    const index = watchlist.indexOf(listingId);
    
    if (index !== -1) {
      watchlist.splice(index, 1);
      this.watchlists.set(userId, watchlist);
    }

    return { success: true };
  }

  getWatchlist(userId: string): MarketplaceListing[] {
    const watchlist = this.watchlists.get(userId) || [];
    return watchlist
      .map(id => this.listings.get(id))
      .filter((listing): listing is MarketplaceListing => 
        listing !== undefined && listing.status === 'active'
      );
  }

  // ==================== PRICE HISTORY & ANALYTICS ====================

  private updatePriceHistory(
    itemId: string,
    itemName: string,
    price: number,
    quantity: number
  ): void {
    let history = this.priceHistory.get(itemId);

    if (!history) {
      history = {
        itemId,
        itemName,
        prices: [],
        averagePrice: 0,
        lowestPrice: price,
        highestPrice: price,
        totalVolume: 0,
      };
      this.priceHistory.set(itemId, history);
    }

    history.prices.push({ price, quantity, timestamp: Date.now() });

    // Keep last 100 price points
    if (history.prices.length > 100) {
      history.prices.shift();
    }

    // Recalculate stats
    const totalValue = history.prices.reduce((sum, p) => sum + p.price * p.quantity, 0);
    history.totalVolume = history.prices.reduce((sum, p) => sum + p.quantity, 0);
    history.averagePrice = Math.floor(totalValue / history.totalVolume);
    history.lowestPrice = Math.min(...history.prices.map(p => p.price));
    history.highestPrice = Math.max(...history.prices.map(p => p.price));
  }

  getPriceHistory(itemId: string): PriceHistory | null {
    return this.priceHistory.get(itemId) || null;
  }

  getTradeHistory(userId?: string, limit: number = 50): TradeHistory[] {
    let history = this.tradeHistory;

    if (userId) {
      history = history.filter(
        t => t.buyerId === userId || t.sellerId === userId
      );
    }

    return history.slice(0, limit);
  }

  getMarketplaceStats(): MarketplaceStats {
    const activeListings = Array.from(this.listings.values()).filter(
      l => l.status === 'active'
    );

    const totalVolume = this.tradeHistory.reduce(
      (sum, t) => sum + t.finalPrice,
      0
    );

    const averagePrice = this.tradeHistory.length > 0
      ? totalVolume / this.tradeHistory.length
      : 0;

    // Calculate top selling items
    const itemSales = new Map<string, { name: string; sales: number; volume: number }>();
    
    this.tradeHistory.forEach(trade => {
      const key = trade.item.itemId;
      const existing = itemSales.get(key);
      
      if (existing) {
        existing.sales++;
        existing.volume += trade.finalPrice;
      } else {
        itemSales.set(key, {
          name: trade.item.itemName,
          sales: 1,
          volume: trade.finalPrice,
        });
      }
    });

    const topSellingItems = Array.from(itemSales.entries())
      .map(([itemId, data]) => ({
        itemId,
        itemName: data.name,
        sales: data.sales,
        volume: data.volume,
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);

    return {
      totalListings: this.listings.size,
      activeListings: activeListings.length,
      totalTrades: this.tradeHistory.length,
      totalVolume,
      averagePrice,
      topSellingItems,
    };
  }

  private updateUserStats(userId: string, type: 'buy' | 'sell', amount: number): void {
    let stats = this.userStats.get(userId);

    if (!stats) {
      stats = {
        userId,
        totalSales: 0,
        totalPurchases: 0,
        totalRevenue: 0,
        totalSpent: 0,
        successRate: 0,
        averageSaleTime: 0,
        reputation: 50, // Start at 50/100
      };
      this.userStats.set(userId, stats);
    }

    if (type === 'sell') {
      stats.totalSales++;
      stats.totalRevenue += amount;
      stats.reputation = Math.min(100, stats.reputation + 1); // Increase rep
    } else {
      stats.totalPurchases++;
      stats.totalSpent += amount;
    }

    // Calculate success rate
    const userListings = Array.from(this.listings.values()).filter(
      l => l.sellerId === userId
    );
    const soldListings = userListings.filter(l => l.status === 'sold').length;
    stats.successRate = userListings.length > 0
      ? (soldListings / userListings.length) * 100
      : 0;
  }

  getUserStats(userId: string): UserMarketplaceStats | null {
    return this.userStats.get(userId) || null;
  }

  // ==================== BACKGROUND PROCESSES ====================

  private startExpiryChecker(): void {
    // Check for expired listings every minute
    setInterval(() => {
      const now = Date.now();

      for (const listing of this.listings.values()) {
        if (listing.status === 'active' && now > listing.expiresAt) {
          // Check if there are bids
          if (listing.bids.length > 0 && listing.currentBidderId) {
            // Award to highest bidder
            const finalPrice = listing.currentBid!;
            const marketplaceFee = Math.floor(
              finalPrice * MARKETPLACE_CONFIG.FEE_PERCENTAGE / 100
            );

            const trade: TradeHistory = {
              id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              buyerId: listing.currentBidderId,
              buyerName: listing.currentBidderName!,
              sellerId: listing.sellerId,
              sellerName: listing.sellerName,
              item: listing.item,
              quantity: listing.quantity,
              finalPrice,
              marketplaceFee,
              timestamp: now,
              tradeType: 'auction',
            };

            listing.status = 'sold';
            this.tradeHistory.unshift(trade);
            this.updatePriceHistory(
              listing.item.itemId,
              listing.item.itemName,
              finalPrice,
              listing.quantity
            );
            this.updateUserStats(listing.sellerId, 'sell', finalPrice);
            this.updateUserStats(listing.currentBidderId, 'buy', finalPrice);
          } else {
            // No bids, mark as expired
            listing.status = 'expired';
          }
        }
      }

      // Expire old direct trades
      for (const trade of this.directTrades.values()) {
        if (trade.status === 'pending' && now > trade.expiresAt) {
          trade.status = 'cancelled';
        }
      }
    }, 60000); // 1 minute
  }

  private startAutoBidProcessor(): void {
    // Process auto-bids every 10 seconds
    setInterval(() => {
      // TODO: Implement auto-bidding logic
      // This would automatically place bids for users who set up auto-bid limits
    }, 10000);
  }
}

// Singleton instance
let tradingSystemInstance: TradingSystem | null = null;

export const getTradingSystem = (): TradingSystem => {
  if (!tradingSystemInstance) {
    tradingSystemInstance = new TradingSystem();
  }
  return tradingSystemInstance;
};

export default TradingSystem;
