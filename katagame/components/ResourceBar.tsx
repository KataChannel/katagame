import { Coins, Wheat, TreePine, Mountain, Scroll } from 'lucide-react';
import { motion } from 'framer-motion';
import { Resource } from '@/lib/types';

interface ResourceBarProps {
  resources: Resource;
}

const ResourceBar = ({ resources }: ResourceBarProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  const resourceItems = [
    { key: 'gold' as keyof Resource, icon: Coins, color: 'text-yellow-500', label: 'Vàng' },
    { key: 'rice' as keyof Resource, icon: Wheat, color: 'text-green-500', label: 'Lúa' },
    { key: 'lumber' as keyof Resource, icon: TreePine, color: 'text-amber-600', label: 'Gỗ' },
    { key: 'stone' as keyof Resource, icon: Mountain, color: 'text-gray-500', label: 'Đá' },
    { key: 'culture' as keyof Resource, icon: Scroll, color: 'text-purple-500', label: 'Văn Hóa' },
  ];

  return (
    <div className="bg-gradient-to-r from-red-600 to-yellow-500 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center space-x-6">
        {resourceItems.map(({ key, icon: Icon, color, label }, index) => (
          <motion.div 
            key={key} 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 bg-black/20 rounded-lg px-3 py-2 cursor-default"
          >
            <Icon className={`h-5 w-5 ${color}`} />
            <div className="text-white">
              <div className="text-xs opacity-80">{label}</div>
              <motion.div 
                key={resources[key]}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="font-bold"
              >
                {formatNumber(resources[key])}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ResourceBar;