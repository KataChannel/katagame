'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, DollarSign, TrendingUp, Shield, 
  AlertTriangle, Ban, Clock, Eye, Search, Filter,
  CheckCircle, XCircle, Flag, MessageSquare, Activity
} from 'lucide-react';
import { getAnalyticsSystem, PlayerModeration, ABTest, ModActionType } from '@/lib/analyticsSystem';

type AdminTab = 'overview' | 'players' | 'economy' | 'monetization' | 'abtests' | 'moderation';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  
  // Overview state
  const [dau, setDau] = useState(0);
  const [mau, setMau] = useState(0);
  const [retention, setRetention] = useState({ d1: 0, d7: 0, d30: 0 });
  const [engagement, setEngagement] = useState({ avgSessionDuration: 0, avgSessionsPerUser: 0, mostUsedFeatures: [] as any[] });
  
  // Player state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlayerModeration[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerModeration | null>(null);
  
  // Economy state
  const [economyMetrics, setEconomyMetrics] = useState<any>(null);
  
  // Monetization state
  const [monetizationData, setMonetizationData] = useState<any>(null);
  
  // A/B Tests state
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [newTestName, setNewTestName] = useState('');
  const [newTestVariants, setNewTestVariants] = useState(['Control', 'Variant A']);
  
  // Moderation state
  const [modReason, setModReason] = useState('');
  const [modDuration, setModDuration] = useState(86400000); // 1 day
  const [chatLogs, setChatLogs] = useState<any[]>([]);
  
  useEffect(() => {
    const system = getAnalyticsSystem();
    
    const updateData = () => {
      setDau(system.getDAU());
      setMau(system.getMAU());
      
      const today = new Date().setHours(0, 0, 0, 0);
      const retentionMetrics = system.getRetentionMetrics(today);
      if (retentionMetrics) {
        setRetention({
          d1: retentionMetrics.day1Rate,
          d7: retentionMetrics.day7Rate,
          d30: retentionMetrics.day30Rate,
        });
      }
      
      setEngagement(system.getEngagementMetrics());
      setEconomyMetrics(system.getEconomyMetrics(today));
      setMonetizationData(system.getMonetizationMetrics(today));
      setAbTests(system.getAllABTests());
    };
    
    updateData();
    const interval = setInterval(updateData, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleSearch = () => {
    const system = getAnalyticsSystem();
    const results = system.searchPlayers(searchQuery);
    setSearchResults(results);
  };
  
  const handleModAction = (type: ModActionType, playerId: string) => {
    if (!modReason) {
      alert('Vui lòng nhập lý do');
      return;
    }
    
    const system = getAnalyticsSystem();
    system.createModAction(
      playerId,
      'admin',
      type,
      modReason,
      type === 'suspend' ? modDuration : undefined
    );
    
    setModReason('');
    alert(`Đã ${type} player thành công`);
  };
  
  const handleCreateABTest = () => {
    if (!newTestName || newTestVariants.length < 2) {
      alert('Cần tên test và ít nhất 2 variants');
      return;
    }
    
    const system = getAnalyticsSystem();
    system.createABTest(
      newTestName,
      'A/B test created from admin dashboard',
      newTestVariants.map(v => ({ name: v, description: v }))
    );
    
    setNewTestName('');
    setNewTestVariants(['Control', 'Variant A']);
    setAbTests(system.getAllABTests());
  };
  
  const loadChatLogs = (playerId: string) => {
    const system = getAnalyticsSystem();
    const logs = system.getChatLogs(playerId, 50);
    setChatLogs(logs);
  };
  
  return (
    <div className="space-y-6 pb-20">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview' as AdminTab, label: 'Tổng quan', icon: BarChart3 },
          { id: 'players' as AdminTab, label: 'Người chơi', icon: Users },
          { id: 'economy' as AdminTab, label: 'Kinh tế', icon: DollarSign },
          { id: 'monetization' as AdminTab, label: 'Doanh thu', icon: TrendingUp },
          { id: 'abtests' as AdminTab, label: 'A/B Tests', icon: Activity },
          { id: 'moderation' as AdminTab, label: 'Kiểm duyệt', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-200" />
                  <span className="text-xs text-blue-200">DAU</span>
                </div>
                <p className="text-2xl font-bold text-white">{dau.toLocaleString()}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-200" />
                  <span className="text-xs text-green-200">MAU</span>
                </div>
                <p className="text-2xl font-bold text-white">{mau.toLocaleString()}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-200" />
                  <span className="text-xs text-purple-200">D1 Retention</span>
                </div>
                <p className="text-2xl font-bold text-white">{retention.d1.toFixed(1)}%</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-200" />
                  <span className="text-xs text-orange-200">Avg Session</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {Math.floor(engagement.avgSessionDuration / 60000)}m
                </p>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Retention Rates</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">Day 1</span>
                    <span className="text-sm font-medium text-white">{retention.d1.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(retention.d1, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">Day 7</span>
                    <span className="text-sm font-medium text-white">{retention.d7.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(retention.d7, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">Day 30</span>
                    <span className="text-sm font-medium text-white">{retention.d30.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(retention.d30, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Top Features</h3>
              <div className="space-y-2">
                {engagement.mostUsedFeatures.slice(0, 5).map((f: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-200">{f.feature}</span>
                    <span className="text-sm font-medium text-white">{f.count} users</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Players Tab */}
        {activeTab === 'players' && (
          <motion.div
            key="players"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm player..."
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Tìm
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map(result => (
                    <div
                      key={result.playerId}
                      onClick={() => setSelectedPlayer(result)}
                      className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{result.playerName}</p>
                          <p className="text-xs text-gray-400">ID: {result.playerId}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            result.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            result.status === 'banned' ? 'bg-red-500/20 text-red-400' :
                            result.status === 'suspended' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {result.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedPlayer && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedPlayer.playerName}</h3>
                    <p className="text-sm text-gray-400">ID: {selectedPlayer.playerId}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedPlayer.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    selectedPlayer.status === 'banned' ? 'bg-red-500/20 text-red-400' :
                    selectedPlayer.status === 'suspended' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {selectedPlayer.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Total Spent</p>
                    <p className="text-lg font-bold text-white">${selectedPlayer.totalSpent}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Reports</p>
                    <p className="text-lg font-bold text-white">{selectedPlayer.reportCount}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Warnings</p>
                    <p className="text-lg font-bold text-white">{selectedPlayer.warnings.length}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Account Age</p>
                    <p className="text-lg font-bold text-white">
                      {Math.floor((Date.now() - selectedPlayer.accountAge) / 86400000)}d
                    </p>
                  </div>
                </div>
                
                <div>
                  <button
                    onClick={() => loadChatLogs(selectedPlayer.playerId)}
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all flex items-center justify-center gap-2 mb-3"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Xem Chat Logs
                  </button>
                  
                  {chatLogs.length > 0 && (
                    <div className="bg-gray-700 rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                      {chatLogs.map(log => (
                        <div key={log.id} className="text-sm text-gray-300 border-b border-gray-600 pb-2">
                          <span className="text-gray-500">[{log.channel}]</span> {log.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Economy Tab */}
        {activeTab === 'economy' && (
          <motion.div
            key="economy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {economyMetrics && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-yellow-200" />
                      <span className="text-xs text-yellow-200">Gold Generated</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{economyMetrics.goldGenerated.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-red-200" />
                      <span className="text-xs text-red-200">Gold Spent</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{economyMetrics.goldSpent.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-4">Gold Sinks</h3>
                <div className="space-y-2">
                  {(Array.from(economyMetrics.goldSinks.entries()) as [string, number][]).map(([sink, amount]) => (
                      <div key={sink} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-200 capitalize">{sink.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-medium text-white">{amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-4">Gold Sources</h3>
                <div className="space-y-2">
                  {(Array.from(economyMetrics.goldSources.entries()) as [string, number][]).map(([source, amount]) => (
                      <div key={source} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-200 capitalize">{source.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-medium text-white">{amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
        
        {/* Monetization Tab */}
        {activeTab === 'monetization' && (
          <motion.div
            key="monetization"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {monetizationData && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-200" />
                      <span className="text-xs text-green-200">Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-white">${monetizationData.totalRevenue.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-200" />
                      <span className="text-xs text-blue-200">ARPU</span>
                    </div>
                    <p className="text-2xl font-bold text-white">${monetizationData.arpu.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-200" />
                      <span className="text-xs text-purple-200">ARPPU</span>
                    </div>
                    <p className="text-2xl font-bold text-white">${monetizationData.arppu.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-orange-200" />
                      <span className="text-xs text-orange-200">Conversion</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{monetizationData.conversionRate.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-4">Revenue by Source</h3>
                <div className="space-y-2">
                  {(Array.from(monetizationData.revenueBySource.entries()) as [string, number][]).map(([source, revenue]) => (
                      <div key={source} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-200 capitalize">{source.replace(/_/g, ' ')}</span>
                        <span className="text-sm font-medium text-white">${revenue.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-4">Top Spenders</h3>
                  <div className="space-y-2">
                    {monetizationData.topSpenders.slice(0, 10).map((spender: any, i: number) => (
                      <div key={spender.playerId} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400">#{i + 1}</span>
                          <span className="text-sm text-gray-200">{spender.playerId}</span>
                        </div>
                        <span className="text-sm font-medium text-green-400">${spender.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
        
        {/* A/B Tests Tab */}
        {activeTab === 'abtests' && (
          <motion.div
            key="abtests"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Create New A/B Test</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  placeholder="Test name..."
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <div className="space-y-2">
                  {newTestVariants.map((variant, i) => (
                    <input
                      key={i}
                      type="text"
                      value={variant}
                      onChange={(e) => {
                        const updated = [...newTestVariants];
                        updated[i] = e.target.value;
                        setNewTestVariants(updated);
                      }}
                      placeholder={`Variant ${i}...`}
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ))}
                  <button
                    onClick={() => setNewTestVariants([...newTestVariants, ''])}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    + Add variant
                  </button>
                </div>
                
                <button
                  onClick={handleCreateABTest}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all"
                >
                  Create Test
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {abTests.map(test => (
                <div key={test.id} className="bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{test.name}</h3>
                      <p className="text-sm text-gray-400">{test.totalParticipants} participants</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      test.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {test.isActive ? 'Active' : 'Ended'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {test.variants.map(variant => (
                      <div key={variant.id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{variant.name}</span>
                          {test.winningVariant === variant.id && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>Participants: {variant.participants.size}</p>
                          <p>Conversions: {variant.conversions} ({variant.conversionRate.toFixed(1)}%)</p>
                          <p>Revenue: ${variant.revenue.toFixed(2)}</p>
                          <p>ARPU: ${variant.avgRevenuePerUser.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Moderation Tab */}
        {activeTab === 'moderation' && selectedPlayer && (
          <motion.div
            key="moderation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Moderation Actions</h3>
              
              <div className="space-y-4">
                <textarea
                  value={modReason}
                  onChange={(e) => setModReason(e.target.value)}
                  placeholder="Lý do hành động..."
                  rows={3}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">Duration:</span>
                  <select
                    value={modDuration}
                    onChange={(e) => setModDuration(Number(e.target.value))}
                    className="bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={3600000}>1 hour</option>
                    <option value={86400000}>1 day</option>
                    <option value={604800000}>7 days</option>
                    <option value={2592000000}>30 days</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleModAction('warn', selectedPlayer.playerId)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Warn
                  </button>
                  
                  <button
                    onClick={() => handleModAction('mute', selectedPlayer.playerId)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Mute
                  </button>
                  
                  <button
                    onClick={() => handleModAction('suspend', selectedPlayer.playerId)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Suspend
                  </button>
                  
                  <button
                    onClick={() => handleModAction('ban', selectedPlayer.playerId)}
                    className="bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    Ban
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Action History</h3>
              <div className="space-y-2">
                {[...selectedPlayer.warnings, ...selectedPlayer.suspensions, ...selectedPlayer.bans]
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map(action => (
                    <div key={action.id} className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${
                          action.type === 'ban' ? 'text-red-400' :
                          action.type === 'suspend' ? 'text-orange-400' :
                          'text-yellow-400'
                        }`}>
                          {action.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(action.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{action.reason}</p>
                      {action.duration && (
                        <p className="text-xs text-gray-400 mt-1">
                          Duration: {Math.floor(action.duration / 86400000)}d
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
