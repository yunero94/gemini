
import { Badge } from '../types';

export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
    { 
        id: 'FIRST_STEP', 
        name: 'First Step', 
        description: 'Complete your first task.', 
        icon: 'Zap' 
    },
    { 
        id: 'DAY_ONE_DONE', 
        name: 'Day One Done', 
        description: 'Complete 100% of tasks on Day 1.', 
        icon: 'Flag' 
    },
    { 
        id: 'HIGH_PERFORMER', 
        name: 'High Performer', 
        description: 'Complete 3 High Priority tasks.', 
        icon: 'Crown' 
    },
    { 
        id: 'WEEK_WARRIOR', 
        name: 'Week Warrior', 
        description: 'Complete 7 days of training.', 
        icon: 'Trophy' 
    },
    { 
        id: 'IRON_WILL', 
        name: 'Iron Will', 
        description: 'Reach Level 5.', 
        icon: 'Dumbbell' 
    },
    { 
        id: 'UNSTOPPABLE', 
        name: 'Unstoppable', 
        description: 'Reach 1000 XP.', 
        icon: 'Flame' 
    },
];
