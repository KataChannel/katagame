'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGuild } from '@/lib/useMVP1Data';
import { Users, Crown, Shield, UserPlus, LogOut, TrendingUp, Trophy, Coins } from 'lucide-react';

export default function MyGuildTab() {
  const { guild, isLoading, error, createGuild, joinGuild, leaveGuild, refreshGuild } = useGuild();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [guildName, setGuildName] = useState('');
  const [guildDescription, setGuildDescription] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-6">
        <div className="text-center">
          <Users className="w-16 h-16 text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin guild...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Lỗi: {error}</p>
          <button
            onClick={refreshGuild}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const handleCreateGuild = async () => {
    if (guildName.trim().length < 3) {
      alert('Tên guild phải có ít nhất 3 ký tự');
      return;
    }
    const success = await createGuild(guildName, guildDescription);
    if (success) {
      setShowCreateForm(false);
      setGuildName('');
      setGuildDescription('');
    }
  };

  const handleLeaveGuild = async () => {
    if (confirm('Bạn có chắc chắn muốn rời guild?')) {
      await leaveGuild();
    }
  };

  if (!guild) {
    return (
      <div className="min-h-screen pb-24 md:pb-6 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Users className="w-8 h-8" />
            Guild
          </h1>
          <p className="text-purple-100">Tham gia hoặc tạo guild của riêng bạn</p>
        </div>

        {!showCreateForm ? (
          <div className="text-center py-12">
            <Shield className="w-24 h-24 mx-auto mb-6 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bạn chưa có Guild</h2>
            <p className="text-gray-600 mb-6">Tạo guild mới hoặc tham gia guild hiện có</p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:from-purple-600 hover:to-indigo-700 shadow-lg"
              >
                <UserPlus className="w-5 h-5 inline mr-2" />
                Tạo Guild Mới
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tạo Guild Mới</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên Guild *
                </label>
                <input
                  type="text"
                  value={guildName}
                  onChange={(e) => setGuildName(e.target.value)}
                  placeholder="Nhập tên guild (tối thiểu 3 ký tự)"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={guildDescription}
                  onChange={(e) => setGuildDescription(e.target.value)}
                  placeholder="Mô tả về guild của bạn"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  rows={3}
                  maxLength={200}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateGuild}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-lg font-bold hover:from-purple-600 hover:to-indigo-700"
                >
                  Tạo Guild
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const members = guild.members || [];
  const memberCount = guild.member_count || members.length || 0;
  const maxMembers = guild.max_members || 50;
  const level = guild.level || 1;
  const treasury = guild.treasury || 0;

  return (
    <div className="min-h-screen pb-24 md:pb-6 bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold">{guild.name}</h1>
              <p className="text-purple-100">{guild.description || 'Một guild mạnh mẽ'}</p>
            </div>
          </div>
          <Crown className="w-10 h-10 text-yellow-300" />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{level}</div>
            <div className="text-xs text-purple-100">Cấp độ</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <Users className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{memberCount}/{maxMembers}</div>
            <div className="text-xs text-purple-100">Thành viên</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <Coins className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{treasury.toLocaleString()}</div>
            <div className="text-xs text-purple-100">Kho bạc</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {members && members.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Thành viên ({memberCount})
            </h3>
            
            <div className="space-y-3">
              {members.slice(0, 10).map((member: any, index: number) => (
                <div key={member.id || index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {member.name?.[0] || 'M'}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{member.name || 'Thành viên'}</div>
                    <div className="text-xs text-gray-600">
                      {member.role === 'leader' ? 'Hội trưởng' : member.role === 'officer' ? 'Quản lý' : 'Thành viên'}
                    </div>
                  </div>
                  {member.contribution && (
                    <div className="text-xs text-gray-600">
                      <Trophy className="w-4 h-4 inline text-yellow-500" />
                      {member.contribution.toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
              {memberCount > 10 && (
                <div className="text-center text-sm text-gray-500">
                  Và {memberCount - 10} thành viên khác...
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Thao tác Guild</h3>
          
          <button
            onClick={handleLeaveGuild}
            className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white py-3 rounded-lg font-bold hover:from-red-600 hover:to-orange-700 shadow-md"
          >
            <LogOut className="w-5 h-5 inline mr-2" />
            Rời Guild
          </button>
        </div>
      </div>
    </div>
  );
}
