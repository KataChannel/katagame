'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  TrendingUp,
  Search,
  Filter,
  Heart,
  Clock,
  DollarSign,
  Users,
  Star,
  AlertCircle,
  Eye,
  Gavel,
  Package,
  History,
  BarChart2,
  X,
  Check,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Crown,
  Shield,
  Zap,
} from 'lucide-react';
import {
  getTradingSystem,
  MarketplaceListing,
  DirectTrade,
  TradeHistory,
  PriceHistory,
  MarketplaceStats,
  ItemCategory,
  MARKETPLACE_CONFIG,
} from '@/lib/tradingSystem';
import { useGameStore } from '@/lib/gameStore';

type MarketplaceTab = 'browse' | 'my-listings' | 'my-bids' | 'watchlist' | 'trades' | 'history' | 'analytics';

export default function MarketplaceTab() {
  const { player } = useGameStore();
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'time_asc' | 'time_desc' | 'popular'>('time_desc');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [myListings, setMyListings] = useState<MarketplaceListing[]>([]);
  const [myBids, setMyBids] = useState<MarketplaceListing[]>([]);
  const [watchlist, setWatchlist] = useState<MarketplaceListing[]>([]);
  const [pendingTrades, setPendingTrades] = useState<DirectTrade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [marketStats, setMarketStats] = useState<MarketplaceStats | null>(null);
  
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const tradingSystem = getTradingSystem();

  useEffect(() => {
    refreshData();
    
    // Refresh every 5 seconds
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [player, activeTab, searchTerm, selectedCategory, selectedRarity, priceRange, sortBy, currentPage]);

  const refreshData = () => {
    if (!player) return;

    // Browse listings
    const searchResults = tradingSystem.searchListings({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      rarity: selectedRarity === 'all' ? undefined : selectedRarity,
      minPrice: priceRange.min || undefined,
      maxPrice: priceRange.max || undefined,
      itemName: searchTerm || undefined,
      sortBy,
      page: currentPage,
    });

    setListings(searchResults.listings);
    setTotalResults(searchResults.totalResults);
    setTotalPages(searchResults.totalPages);

    // My listings
    setMyListings(tradingSystem.getUserActiveListings(player.id));

    // My bids
    setMyBids(tradingSystem.getUserBids(player.id));

    // Watchlist
    setWatchlist(tradingSystem.getWatchlist(player.id));

    // Pending trades
    setPendingTrades(tradingSystem.getUserPendingTrades(player.id));

    // Trade history
    setTradeHistory(tradingSystem.getTradeHistory(player.id, 20));

    // Market stats
    setMarketStats(tradingSystem.getMarketplaceStats());
  };

  const handlePlaceBid = (listingId: string) => {
    if (!player) return;

    const result = tradingSystem.placeBid(
      listingId,
      player.id,
      player.name || 'Player',
      bidAmount
    );

    if (result.success) {
      alert('Bid placed successfully!');
      setBidAmount(0);
      setSelectedListing(null);
      refreshData();
    } else {
      alert(result.error);
    }
  };

  const handleBuyout = (listingId: string) => {
    if (!player) return;

    if (!confirm('Confirm purchase?')) return;

    const result = tradingSystem.buyoutListing(
      listingId,
      player.id,
      player.name || 'Player'
    );

    if (result.success) {
      alert('Purchase successful!');
      setSelectedListing(null);
      refreshData();
    } else {
      alert(result.error);
    }
  };

  const handleCancelListing = (listingId: string) => {
    if (!player) return;

    if (!confirm('Cancel this listing?')) return;

    const result = tradingSystem.cancelListing(listingId, player.id);

    if (result.success) {
      alert('Listing cancelled');
      refreshData();
    } else {
      alert(result.error);
    }
  };

  const handleAddToWatchlist = (listingId: string) => {
    if (!player) return;
    tradingSystem.addToWatchlist(player.id, listingId);
    refreshData();
  };

  const handleRemoveFromWatchlist = (listingId: string) => {
    if (!player) return;
    tradingSystem.removeFromWatchlist(player.id, listingId);
    refreshData();
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-orange-400';
      case 'mythic': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20';
      case 'rare': return 'bg-blue-500/20';
      case 'epic': return 'bg-purple-500/20';
      case 'legendary': return 'bg-orange-500/20';
      case 'mythic': return 'bg-red-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  const getCategoryIcon = (category: ItemCategory) => {
    switch (category) {
      case 'hero': return Users;
      case 'equipment': return Shield;
      case 'resource': return Package;
      case 'cosmetic': return Sparkles;
      case 'consumable': return Zap;
      case 'material': return Crown;
      default: return Package;
    }
  };

  const formatTimeRemaining = (expiresAt: number) => {
    const remaining = expiresAt - Date.now();
    if (remaining < 0) return 'Expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const ListingCard = ({ listing }: { listing: MarketplaceListing }) => {
    const CategoryIcon = getCategoryIcon(listing.item.category);
    const isWatched = watchlist.some(w => w.id === listing.id);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${getRarityBg(listing.item.rarity)} rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all ${
          listing.featured ? 'ring-2 ring-yellow-500' : ''
        }`}
        onClick={() => setSelectedListing(listing)}
      >
        {listing.featured && (
          <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold mb-2">
            <Star className="w-3 h-3 fill-current" />
            FEATURED
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="w-16 h-16 bg-black/30 rounded-lg flex items-center justify-center">
            <CategoryIcon className="w-8 h-8 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-bold ${getRarityColor(listing.item.rarity)}`}>
                {listing.item.itemName}
              </h3>
              {listing.quantity > 1 && (
                <span className="text-gray-300 text-sm">x{listing.quantity}</span>
              )}
            </div>

            <p className="text-gray-300 text-xs mb-2">{listing.item.description}</p>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>Seller: {listing.sellerName}</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {listing.views}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isWatched) {
                handleRemoveFromWatchlist(listing.id);
              } else {
                handleAddToWatchlist(listing.id);
              }
            }}
            className="p-2 hover:bg-black/30 rounded-lg"
          >
            <Heart className={`w-5 h-5 ${isWatched ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            {listing.listingType === 'auction' && (
              <div>
                <div className="text-gray-400 text-xs">Current Bid</div>
                <div className="text-yellow-400 font-bold">
                  💰 {listing.currentBid?.toLocaleString() || listing.startingPrice?.toLocaleString()}
                </div>
              </div>
            )}
            {listing.buyoutPrice && (
              <div>
                <div className="text-gray-400 text-xs">Buy Now</div>
                <div className="text-green-400 font-bold">
                  💰 {listing.buyoutPrice.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock className="w-3 h-3" />
              {formatTimeRemaining(listing.expiresAt)}
            </div>
            {listing.bids.length > 0 && (
              <div className="text-blue-400 text-xs mt-1">
                {listing.bids.length} bid{listing.bids.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Marketplace</h1>
              <p className="text-purple-100 text-sm">Trade với người chơi khác</p>
            </div>
          </div>

          {marketStats && (
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {marketStats.activeListings}
                </div>
                <div className="text-purple-100 text-xs">Listings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {marketStats.totalTrades}
                </div>
                <div className="text-purple-100 text-xs">Trades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  💰 {Math.floor(marketStats.totalVolume / 1000)}K
                </div>
                <div className="text-purple-100 text-xs">Volume</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'browse', label: 'Duyệt', icon: Search },
          { id: 'my-listings', label: 'Của tôi', icon: Package },
          { id: 'my-bids', label: 'Đấu giá', icon: Gavel },
          { id: 'watchlist', label: 'Theo dõi', icon: Heart },
          { id: 'trades', label: 'Giao dịch', icon: Users },
          { id: 'history', label: 'Lịch sử', icon: History },
          { id: 'analytics', label: 'Thống kê', icon: BarChart2 },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MarketplaceTab)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* BROWSE TAB */}
        {activeTab === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Search & Filters */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm item..."
                    className="w-full bg-black/30 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value as ItemCategory | 'all')}
                        className="w-full bg-black/30 text-white px-3 py-2 rounded-lg"
                      >
                        <option value="all">All</option>
                        <option value="hero">Heroes</option>
                        <option value="equipment">Equipment</option>
                        <option value="resource">Resources</option>
                        <option value="cosmetic">Cosmetics</option>
                        <option value="consumable">Consumables</option>
                        <option value="material">Materials</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">Rarity</label>
                      <select
                        value={selectedRarity}
                        onChange={e => setSelectedRarity(e.target.value)}
                        className="w-full bg-black/30 text-white px-3 py-2 rounded-lg"
                      >
                        <option value="all">All</option>
                        <option value="common">Common</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Epic</option>
                        <option value="legendary">Legendary</option>
                        <option value="mythic">Mythic</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-gray-300 text-sm mb-2 block">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="w-full bg-black/30 text-white px-3 py-2 rounded-lg"
                      >
                        <option value="time_desc">Newest First</option>
                        <option value="time_asc">Oldest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="popular">Most Popular</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}

              {listings.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Không tìm thấy listing nào</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg text-white"
                >
                  Previous
                </button>
                <span className="text-white px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg text-white"
                >
                  Next
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* MY LISTINGS TAB */}
        {activeTab === 'my-listings' && (
          <motion.div
            key="my-listings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Listings của tôi ({myListings.length}/{MARKETPLACE_CONFIG.MAX_ACTIVE_LISTINGS})
                </h2>
                <button
                  onClick={() => setShowCreateListing(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Tạo Listing
                </button>
              </div>

              <div className="grid gap-4">
                {myListings.map(listing => (
                  <div key={listing.id} className="bg-black/30 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-bold ${getRarityColor(listing.item.rarity)}`}>
                          {listing.item.itemName} x{listing.quantity}
                        </h3>
                        <div className="text-gray-300 text-sm mt-1">
                          {listing.listingType === 'auction' && (
                            <span>Current Bid: 💰 {listing.currentBid?.toLocaleString()}</span>
                          )}
                          {listing.buyoutPrice && (
                            <span> • Buyout: 💰 {listing.buyoutPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="text-gray-400 text-xs mt-2">
                          {listing.bids.length} bids • {listing.views} views • 
                          Expires in {formatTimeRemaining(listing.expiresAt)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelListing(listing.id)}
                        disabled={listing.bids.length > 0}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}

                {myListings.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Bạn chưa có listing nào</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* MY BIDS TAB */}
        {activeTab === 'my-bids' && (
          <motion.div
            key="my-bids"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Đấu giá của tôi ({myBids.length})
            </h2>

            <div className="grid gap-4">
              {myBids.map(listing => {
                const myBid = listing.bids.filter(b => b.bidderId === player?.id).pop();
                const isWinning = listing.currentBidderId === player?.id;

                return (
                  <div key={listing.id} className={`rounded-lg p-4 ${
                    isWinning ? 'bg-green-500/20 border-2 border-green-500' : 'bg-black/30'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold ${getRarityColor(listing.item.rarity)}`}>
                            {listing.item.itemName}
                          </h3>
                          {isWinning && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                              WINNING
                            </span>
                          )}
                        </div>
                        <div className="text-gray-300 text-sm mt-1">
                          Your Bid: 💰 {myBid?.amount.toLocaleString()}
                        </div>
                        <div className="text-gray-300 text-sm">
                          Current Bid: 💰 {listing.currentBid?.toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-xs mt-2">
                          {formatTimeRemaining(listing.expiresAt)} remaining
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedListing(listing);
                          setBidAmount((listing.currentBid || 0) + MARKETPLACE_CONFIG.MIN_BID_INCREMENT);
                        }}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
                      >
                        Raise Bid
                      </button>
                    </div>
                  </div>
                );
              })}

              {myBids.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Gavel className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Bạn chưa đấu giá item nào</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* WATCHLIST TAB */}
        {activeTab === 'watchlist' && (
          <motion.div
            key="watchlist"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Watchlist ({watchlist.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {watchlist.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}

                {watchlist.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Watchlist trống</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TRADE HISTORY TAB */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Lịch sử giao dịch ({tradeHistory.length})
            </h2>

            <div className="space-y-3">
              {tradeHistory.map(trade => (
                <div key={trade.id} className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-bold ${getRarityColor(trade.item.rarity)}`}>
                        {trade.item.itemName} x{trade.quantity}
                      </h3>
                      <div className="text-gray-300 text-sm mt-1">
                        {player?.id === trade.sellerId ? (
                          <span>Sold to {trade.buyerName}</span>
                        ) : (
                          <span>Bought from {trade.sellerName}</span>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {new Date(trade.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">
                        💰 {trade.finalPrice.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-xs">
                        Fee: -{trade.marketplaceFee.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {tradeHistory.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Chưa có giao dịch nào</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && marketStats && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="grid gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Market Overview</h2>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Total Listings</div>
                    <div className="text-3xl font-bold text-white">{marketStats.totalListings}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Active Listings</div>
                    <div className="text-3xl font-bold text-green-400">{marketStats.activeListings}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Total Trades</div>
                    <div className="text-3xl font-bold text-blue-400">{marketStats.totalTrades}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Trading Volume</div>
                    <div className="text-3xl font-bold text-yellow-400">
                      💰 {Math.floor(marketStats.totalVolume / 1000)}K
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Top Selling Items</h2>
                
                <div className="space-y-3">
                  {marketStats.topSellingItems.map((item, index) => (
                    <div key={item.itemId} className="bg-black/30 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-bold">{item.itemName}</div>
                          <div className="text-gray-400 text-sm">{item.sales} sales</div>
                        </div>
                      </div>
                      <div className="text-yellow-400 font-bold">
                        💰 {Math.floor(item.volume / 1000)}K
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listing Detail Modal */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedListing(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-6 max-w-2xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className={`text-2xl font-bold ${getRarityColor(selectedListing.item.rarity)}`}>
                  {selectedListing.item.itemName}
                </h2>
                <button
                  onClick={() => setSelectedListing(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <p className="text-gray-300">{selectedListing.item.description}</p>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="text-gray-400">Seller: {selectedListing.sellerName}</span>
                  <span className="text-gray-400">Quantity: {selectedListing.quantity}</span>
                  <span className="text-gray-400">{selectedListing.views} views</span>
                </div>
              </div>

              {selectedListing.listingType !== 'buyout' && (
                <div className="bg-black/30 rounded-lg p-4 mb-4">
                  <h3 className="text-white font-bold mb-2">
                    Bid History ({selectedListing.bids.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedListing.bids.slice().reverse().slice(0, 5).map((bid, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{bid.bidderName}</span>
                        <span className="text-yellow-400 font-bold">
                          💰 {bid.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedListing.listingType !== 'buyout' && (
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Your Bid</label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={e => setBidAmount(Number(e.target.value))}
                      className="w-full bg-black/30 text-white px-4 py-3 rounded-lg mb-2"
                      placeholder="Enter bid amount..."
                    />
                    <button
                      onClick={() => handlePlaceBid(selectedListing.id)}
                      disabled={player?.id === selectedListing.sellerId}
                      className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white py-3 rounded-lg font-bold"
                    >
                      Place Bid
                    </button>
                  </div>
                )}

                {selectedListing.buyoutPrice && (
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Buyout Price</label>
                    <div className="bg-black/30 text-green-400 font-bold text-2xl px-4 py-3 rounded-lg mb-2 text-center">
                      💰 {selectedListing.buyoutPrice.toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleBuyout(selectedListing.id)}
                      disabled={player?.id === selectedListing.sellerId}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white py-3 rounded-lg font-bold"
                    >
                      Buy Now
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 text-center text-gray-400 text-sm">
                Expires in {formatTimeRemaining(selectedListing.expiresAt)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
