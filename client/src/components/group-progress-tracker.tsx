import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";

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
  if (!groupCode) return "text-neon-blue";
  
  switch (groupCode) {
    case "1": return "text-neon-blue";
    case "2": return "text-neon-purple";
    case "3": return "text-neon-orange";
    case "4": return "text-neon-pink";
    default: return "text-neon-blue";
  }
}

function getGroupBgClass(groupCode: string) {
  if (!groupCode) return "bg-neon-blue/20";
  
  switch (groupCode) {
    case "1": return "bg-neon-blue/20";
    case "2": return "bg-neon-purple/20";
    case "3": return "bg-neon-orange/20";
    case "4": return "bg-neon-pink/20";
    default: return "bg-neon-blue/20";
  }
}

export function GroupProgressTracker() {
  const { user } = useAuth();
  const { data: allGroupsProgress, isLoading, error } = useQuery<AllGroupsProgress>({
    queryKey: ['/api/all-groups-progress'],
    queryFn: getQueryFn({ on401: 'throw' }),
    refetchInterval: 5000 // Refresh every 5 seconds
  });

  const sortedGroups = useMemo(() => {
    if (!allGroupsProgress) return [];
    
    // Convert object to array and then sort
    return Object.entries(allGroupsProgress)
      .map(([code, data]) => ({ ...data }))
      .sort((a, b) => {
        // First by completion status
        if (a.allMembersCompleted && !b.allMembersCompleted) return -1;
        if (!a.allMembersCompleted && b.allMembersCompleted) return 1;
        
        // Then by time if both completed
        if (a.allMembersCompleted && b.allMembersCompleted) {
          return a.completionTime - b.completionTime;
        }
        
        // Then by member completion percentage
        const aPercentage = a.totalMembers > 0 ? (a.completedMembers / a.totalMembers) : 0;
        const bPercentage = b.totalMembers > 0 ? (b.completedMembers / b.totalMembers) : 0;
        return bPercentage - aPercentage;
      });
  }, [allGroupsProgress]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-neon-blue" />
      </div>
    );
  }

  if (error || !allGroupsProgress) {
    return (
      <div className="text-red-500 text-center py-4 text-sm">
        Error loading group progress
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-orbitron text-neon-blue text-sm">GROUP COMPETITION STATUS:</h3>
      
      <div className="space-y-3">
        {sortedGroups.map((group) => {
          const isUserGroup = user?.groupCode === group.groupCode;
          const textClass = getGroupTextClass(group.groupCode);
          const bgClass = getGroupBgClass(group.groupCode);
          const progressPercentage = group.totalMembers > 0 
            ? Math.round((group.completedMembers / group.totalMembers) * 100) 
            : 0;
            
          return (
            <div 
              key={group.groupCode} 
              className={`p-2 border ${isUserGroup ? 'border-neon-green' : 'border-neon-blue/30'} rounded-sm`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className={`font-tech-mono ${textClass} flex items-center`}>
                  <span className="font-bold mr-1">GROUP {group.groupCode}</span>
                  {isUserGroup && <span className="text-xs text-neon-green ml-1">(YOUR TEAM)</span>}
                </div>
                
                {group.allMembersCompleted && (
                  <div className="text-neon-green text-xs font-tech-mono animate-pulse">
                    MISSION COMPLETE
                  </div>
                )}
              </div>
              
              <Progress 
                value={group.allMembersCompleted ? 100 : progressPercentage} 
                className={`h-2 ${group.allMembersCompleted ? "bg-neon-green/30" : bgClass}`}
              />
              <div className="text-xs font-tech-mono text-right mt-1">
                {group.allMembersCompleted ? 100 : progressPercentage}%
              </div>
              
              {group.allMembersCompleted && (
                <div className="mt-1 text-xs font-tech-mono text-right text-steel-blue">
                  Completion time: {Math.floor(group.completionTime / 1000)}s
                </div>
              )}
              
              {group.allMembersCompleted && !isUserGroup && (
                <div className="mt-1 text-neon-green text-xs font-tech-mono">
                  Group {group.groupCode} has completed all challenges!
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}