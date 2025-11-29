'use client';

import { use } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Crown,
  AlertCircle,
  Loader2
} from 'lucide-react';
import HeroLevelCard from '@/components/hero/HeroLevelCard';
import PetCard from '@/components/pet/PetCard';
import { 
  MY_HERO_WITH_STATS,
  MY_PETS,
  ASSIGN_PET_TO_HERO,
  UNASSIGN_PET_FROM_HERO,
  GRANT_EXP_TO_HERO
} from '@/lib/graphql/queries';
import { PlayerHeroWithStats, PetWithBonuses } from '@/lib/types/mvp1.types';
import { useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Hero Detail Page - MVP2 Sprint 3
 * Display hero stats, level, exp and pet management
 */
export default function HeroDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // Query hero with stats
  const { data: heroData, loading: heroLoading, error: heroError, refetch: refetchHero } = useQuery(
    MY_HERO_WITH_STATS,
    {
      variables: { heroId: resolvedParams.id },
      skip: !resolvedParams.id,
    }
  );

  // Query player pets
  const { data: petsData, loading: petsLoading, refetch: refetchPets } = useQuery(MY_PETS);

  // Mutations
  const [assignPet, { loading: assigning }] = useMutation(ASSIGN_PET_TO_HERO, {
    onCompleted: () => {
      refetchHero();
      refetchPets();
      setSelectedPetId(null);
    },
  });

  const [unassignPet, { loading: unassigning }] = useMutation(UNASSIGN_PET_FROM_HERO, {
    onCompleted: () => {
      refetchHero();
      refetchPets();
    },
  });

  const [grantExp, { loading: grantingExp }] = useMutation(GRANT_EXP_TO_HERO, {
    onCompleted: () => {
      refetchHero();
    },
  });

  // Handlers
  const handleAssignPet = async (petId: string) => {
    try {
      await assignPet({
        variables: {
          petId,
          heroId: resolvedParams.id,
        },
      });
    } catch (error) {
      console.error('Failed to assign pet:', error);
    }
  };

  const handleUnassignPet = async () => {
    try {
      await unassignPet({
        variables: {
          heroId: resolvedParams.id,
        },
      });
    } catch (error) {
      console.error('Failed to unassign pet:', error);
    }
  };

  const handleLevelUp = async () => {
    // Grant enough exp to level up (simplified - in real game would cost resources)
    const hero: PlayerHeroWithStats = heroData?.myHeroWithStats;
    if (!hero) return;

    const expNeeded = hero.expForNextLevel - hero.expProgress;
    
    try {
      await grantExp({
        variables: {
          heroId: resolvedParams.id,
          expAmount: expNeeded,
        },
      });
    } catch (error) {
      console.error('Failed to grant exp:', error);
    }
  };

  // Loading state
  if (heroLoading || petsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin anh hùng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (heroError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Lỗi tải dữ liệu</p>
          <p className="text-sm">{heroError.message}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  const hero: PlayerHeroWithStats = heroData?.myHeroWithStats;
  const pets: PetWithBonuses[] = petsData?.myPets || [];

  if (!hero) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy anh hùng</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  const canLevelUp = hero.expProgress >= hero.expForNextLevel && hero.level < 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-purple-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-5xl">
              {hero.hero?.era === 'ancient' && '👑'}
              {hero.hero?.era === 'medieval' && '⚔️'}
              {hero.hero?.era === 'modern' && '🎖️'}
              {!hero.hero?.era && '🦸'}
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Crown className="w-8 h-8" />
                {hero.hero?.nameVietnamese || 'Anh Hùng'}
              </h1>
              {hero.hero?.nameEnglish && (
                <p className="text-purple-100 text-sm">{hero.hero.nameEnglish}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-sm">
                {hero.hero?.era && (
                  <span className="bg-purple-700 px-3 py-1 rounded-full">
                    {hero.hero.era}
                  </span>
                )}
                {hero.hero?.rarity && (
                  <span className={`
                    px-3 py-1 rounded-full font-semibold capitalize
                    ${hero.hero.rarity === 'legendary' ? 'bg-yellow-500 text-yellow-900' : ''}
                    ${hero.hero.rarity === 'epic' ? 'bg-purple-500 text-white' : ''}
                    ${hero.hero.rarity === 'rare' ? 'bg-blue-500 text-white' : ''}
                    ${hero.hero.rarity === 'common' ? 'bg-gray-500 text-white' : ''}
                  `}>
                    {hero.hero.rarity}
                  </span>
                )}
                {hero.hero?.role && (
                  <span className="bg-purple-700 px-3 py-1 rounded-full">
                    {hero.hero.role}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Hero Level & Stats Card */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-600" />
            Cấp Độ & Chỉ Số
          </h2>
          <HeroLevelCard
            hero={hero}
            canLevelUp={canLevelUp}
            onLevelUp={handleLevelUp}
          />
        </section>

        {/* Pet Management Section */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            Quản Lý Pet
          </h2>

          {/* Show loading during pet operations */}
          {(assigning || unassigning) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 bg-blue-100 border border-blue-300 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-blue-800 font-semibold">
                  {assigning ? 'Đang gắn pet...' : 'Đang gỡ pet...'}
                </span>
              </div>
            </motion.div>
          )}

          {/* No pets message */}
          {pets.length === 0 && (
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <span className="text-4xl mb-3 block">🐾</span>
              <p className="text-gray-600">Bạn chưa có pet nào</p>
              <p className="text-sm text-gray-500 mt-1">
                Thu thập pet để tăng sức mạnh cho anh hùng
              </p>
            </div>
          )}

          {/* Pet Grid */}
          {pets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pets.map((pet) => {
                const isAssigned = false; // TODO: Check if pet is assigned to this hero
                const isPetAssignedToOther = false; // TODO: Check if pet is assigned to another hero

                return (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    heroName={isAssigned ? hero.hero?.nameVietnamese : undefined}
                    isAssigned={isAssigned}
                    onAssign={!isPetAssignedToOther ? () => handleAssignPet(pet.id) : undefined}
                    onUnassign={isAssigned ? handleUnassignPet : undefined}
                    canLevelUp={false} // TODO: Check resources
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="bg-purple-100 rounded-lg p-6">
          <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Hướng Dẫn
          </h3>
          <ul className="text-sm text-purple-800 space-y-2">
            <li>• <strong>Cấp Độ:</strong> Anh hùng có thể lên đến cấp 5, mỗi cấp tăng 20% chỉ số</li>
            <li>• <strong>Kinh Nghiệm:</strong> Hoàn thành nhiệm vụ và trắc nghiệm để nhận exp</li>
            <li>• <strong>Pet:</strong> Gắn pet để nhận chỉ số cộng thêm dựa trên loại pet</li>
            <li>• <strong>Nâng Cấp:</strong> Pet có thể lên đến cấp 10 với chi phí tài nguyên</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
