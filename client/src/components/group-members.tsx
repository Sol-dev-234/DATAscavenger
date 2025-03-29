import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Star } from "lucide-react";

interface GroupMember {
  id: number;
  username: string;
  progress: number;
  completedChallenges: string[];
  completedQuiz: boolean;
  lastQuizQuestion: number;
}

export function GroupMembers() {
  const { isLoading, error, data: members } = useQuery<GroupMember[]>({
    queryKey: ['/api/group-members'],
    queryFn: getQueryFn({ on401: 'throw' }),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const getProgressColorClass = (progress: number) => {
    if (progress >= 80) return "text-neon-green";
    if (progress >= 60) return "text-neon-blue";
    if (progress >= 40) return "text-neon-orange";
    if (progress >= 20) return "text-neon-purple";
    return "text-steel-blue";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-neon-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 font-tech-mono text-sm p-2">
        Error loading group members
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="text-steel-blue font-tech-mono text-sm p-2">
        No group members found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-orbitron text-neon-blue text-sm mb-2">GROUP MEMBERS:</h3>
      
      {members.map(member => (
        <div key={member.id} className="flex items-center justify-between border-b border-neon-blue/20 pb-1 last:border-b-0">
          <div className="flex items-center">
            <User className="h-4 w-4 text-steel-blue mr-2" />
            <span className="font-tech-mono text-sm">{member.username}</span>
          </div>
          <div className="flex items-center">
            <span className={`font-tech-mono text-xs ${getProgressColorClass(member.progress)} mr-2`}>
              {member.progress}%
            </span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  size={12}
                  className={`${
                    member.completedChallenges.length > i 
                      ? "text-neon-green fill-neon-green" 
                      : "text-steel-blue/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
      
      <div className="text-xs text-steel-blue font-tech-mono mt-1 text-center">
        Auto-refreshes every 10 seconds
      </div>
    </div>
  );
}