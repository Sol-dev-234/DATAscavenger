import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { CyberpunkProgress } from "./ui/cyberpunk-progress";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, Clock, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GroupProgressData {
  groupCode: string;
  completedQuiz: boolean;
  completionTime: number;
  hasPhoto: boolean;
  allMembersCompleted: boolean;
  totalMembers: number;
  completedMembers: number;
  completedAt?: string;
}

type AllGroupsProgress = {
  [key: string]: GroupProgressData;
}

function getGroupTextClass(groupCode: string) {
  switch (groupCode) {
    case "1": return "text-neon-blue";
    case "2": return "text-neon-purple";
    case "3": return "text-neon-orange";
    case "4": return "text-neon-pink";
    default: return "text-neon-blue";
  }
}

function getGroupBgClass(groupCode: string) {
  switch (groupCode) {
    case "1": return "from-neon-blue/5 to-neon-blue/10";
    case "2": return "from-neon-purple/5 to-neon-purple/10";
    case "3": return "from-neon-orange/5 to-neon-orange/10";
    case "4": return "from-neon-pink/5 to-neon-pink/10";
    default: return "from-neon-blue/5 to-neon-blue/10";
  }
}

export function GroupProgressTracker() {
  const [completedMessages, setCompletedMessages] = useState<string[]>([]);
  const { user } = useAuth();
  const userGroupCode = user?.groupCode;
  
  // Fetch all groups progress
  const { data: allGroupsProgress, isLoading } = useQuery<AllGroupsProgress>({
    queryKey: ['/api/all-groups-progress'],
    queryFn: getQueryFn({ on401: 'throw' }),
    refetchInterval: 5000 // Refetch every 5 seconds to keep data fresh
  });
  
  // Check for newly completed groups and show notification
  useEffect(() => {
    if (!allGroupsProgress) return;
    
    Object.entries(allGroupsProgress).forEach(([groupCode, progress]) => {
      // Skip user's own group
      if (groupCode === userGroupCode) return;
      
      // Show message when a group completes all challenges
      if (progress.allMembersCompleted && !completedMessages.includes(groupCode)) {
        setCompletedMessages(prev => [...prev, groupCode]);
        
        // Auto dismiss the message after 10 seconds
        setTimeout(() => {
          setCompletedMessages(prev => prev.filter(code => code !== groupCode));
        }, 10000);
      }
    });
  }, [allGroupsProgress, userGroupCode, completedMessages]);
  
  // Format time as mm:ss
  const formatTime = (milliseconds: number | null): string => {
    if (!milliseconds) return "00:00";
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (isLoading) {
    return (
      <div className="p-4 border border-neon-blue/30 rounded-sm bg-gradient-to-b from-cyber-black/50 to-cyber-black/30 backdrop-blur-sm font-tech-mono">
        <h3 className="font-orbitron text-neon-blue text-sm mb-4">OTHER GROUPS PROGRESS</h3>
        <div className="flex items-center justify-center h-32">
          <div className="h-5 w-5 border-t-2 border-r-2 border-neon-blue animate-spin rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (!allGroupsProgress || Object.keys(allGroupsProgress).length === 0) {
    return (
      <div className="p-4 border border-neon-blue/30 rounded-sm bg-gradient-to-b from-cyber-black/50 to-cyber-black/30 backdrop-blur-sm font-tech-mono">
        <h3 className="font-orbitron text-neon-blue text-sm mb-4">OTHER GROUPS PROGRESS</h3>
        <p className="text-steel-blue text-center py-4">No group data available.</p>
      </div>
    );
  }
  
  return (
    <div className="relative p-4 border border-neon-blue/30 rounded-sm bg-gradient-to-b from-cyber-black/50 to-cyber-black/30 backdrop-blur-sm font-tech-mono overflow-hidden">
      {/* Completion messages - now above the title */}
      <AnimatePresence>
        {completedMessages.map(groupCode => (
          <motion.div
            key={`completed-${groupCode}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`relative w-full mb-4 p-2 rounded-sm bg-gradient-to-r shadow-lg ${getGroupBgClass(groupCode)} border border-neon-green/30`}
          >
            <p className={`${getGroupTextClass(groupCode)} flex items-center gap-1`}>
              <CheckCircle className="h-4 w-4 text-neon-green" />
              <span>Group {groupCode} has completed their tasks!</span>
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
      
      <h3 className="font-orbitron text-neon-blue text-sm mb-4">OTHER GROUPS PROGRESS</h3>
      
      <div className="space-y-3 sm:space-y-5">
        {Object.entries(allGroupsProgress)
          .filter(([groupCode]) => groupCode !== userGroupCode) // Filter out user's own group
          .sort(([codeA], [codeB]) => codeA.localeCompare(codeB)) // Sort by group code
          .map(([groupCode, progress]) => {
            const progressPercentage = progress.completedMembers > 0 && progress.totalMembers > 0
              ? Math.floor((progress.completedMembers / progress.totalMembers) * 100)
              : 0;
              
            return (
              <div
                key={groupCode}
                className={`p-3 border border-neon-blue/30 rounded-sm bg-gradient-to-r ${getGroupBgClass(groupCode)}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className={`font-orbitron ${getGroupTextClass(groupCode)}`}>
                    GROUP {groupCode}
                  </h4>
                  
                  {progress.allMembersCompleted && (
                    <span className="bg-neon-green/20 text-neon-green px-2 py-1 rounded-sm text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> COMPLETED
                    </span>
                  )}
                </div>
                
                <CyberpunkProgress 
                  value={progressPercentage}
                  max={100}
                  showPercentage
                  color={progress.allMembersCompleted ? 'neon-green' : getGroupTextClass(groupCode).replace('text-', '')}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-steel-blue">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>Members: {progress.completedMembers}/{progress.totalMembers}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 justify-end">
                    <Clock className="h-3 w-3" />
                    <span>Time: {formatTime(progress.completionTime)}</span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}