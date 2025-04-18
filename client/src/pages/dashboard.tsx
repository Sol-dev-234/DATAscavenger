import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Challenge, User, GroupProgress } from "@shared/schema";

interface ProgressData {
  currentChallenge: number;
  completedChallenges: string[];
  progress: number;
  completedQuiz: boolean;
  lastQuizQuestion: number;
  groupProgress?: {
    allMembersCompleted?: boolean;
    completedQuiz?: boolean;
    hasPhoto?: boolean;
    completionTime?: number;
  };
}

// Components
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { CyberpunkPanel } from "@/components/ui/cyberpunk-panel";
import { CyberpunkProgress } from "@/components/ui/cyberpunk-progress";
import { StarRating } from "@/components/star-rating";
import { FinalScreen } from "@/components/final-screen";
import { CreditScreen } from "@/components/credit-screen";
import { GroupMembers } from "@/components/group-members";
import { CongratulationsPopup } from "@/components/congratulations-popup";
import { CelebrationModal } from "@/components/celebration-modal";
import { GroupProgressTracker } from "@/components/group-progress-tracker";

function getGroupTextClass(groupCode?: string | number) {
  if (!groupCode) return "text-neon-blue";
  
  switch (groupCode.toString()) {
    case "1": return "text-neon-blue";
    case "2": return "text-neon-purple";
    case "3": return "text-neon-orange";
    case "4": return "text-neon-pink";
    default: return "text-neon-blue";
  }
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [showVictory, setShowVictory] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Fetch user progress
  const { data: progress, isLoading, error } = useQuery<ProgressData>({
    queryKey: ['/api/progress'],
    queryFn: getQueryFn({ on401: 'throw' }),
    refetchInterval: 5000 // Refetch every 5 seconds
  });

  // Fetch available challenges
  const { data: challenges } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges'],
    queryFn: getQueryFn({ on401: 'throw' })
  });

  // Check if all members of the group have completed their challenges
  useEffect(() => {
    if (progress?.groupProgress?.allMembersCompleted && progress?.completedQuiz) {
      // All members of the group have completed all challenges and the quiz
      setShowCelebration(true);
      
      // Store this in localStorage so it persists between sessions
      localStorage.setItem('celebration-shown', 'true');
      localStorage.setItem('user-group-code', user?.groupCode || '');
    }
  }, [progress?.groupProgress?.allMembersCompleted, progress?.completedQuiz, user?.groupCode]);

  // Check localStorage on mount to see if we should show the celebration
  useEffect(() => {
    const celebrationShown = localStorage.getItem('celebration-shown') === 'true';
    const userGroupCode = localStorage.getItem('user-group-code');
    
    if (celebrationShown && userGroupCode === user?.groupCode && progress?.completedQuiz) {
      setShowCelebration(true);
    }
  }, [user?.groupCode, progress?.completedQuiz]);

  // Start timer if user has started but not completed challenges
  useEffect(() => {
    if (progress?.completedChallenges && progress?.completedChallenges.length > 0 && progress?.progress < 100) {
      setTimerStarted(true);
    }
    
    // Auto-show victory screen when all challenges are completed
    if (progress?.progress === 100 && progress?.completedQuiz && progress?.groupProgress?.allMembersCompleted) {
      setShowVictory(true);
    }
  }, [progress?.completedChallenges, progress?.progress, progress?.completedQuiz, progress?.groupProgress?.allMembersCompleted]);
  
  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Timer logic
  useEffect(() => {
    if (!timerStarted || progress?.progress === 100) return;
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [progress?.completedChallenges, progress?.progress, timerStarted]);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleChallengeClick = (challengeId: number) => {
    navigate(`/challenge/${challengeId}`);
  };

  const handleRestart = () => {
    setShowVictory(false);
    navigate("/");
  };

  const handleCreditsComplete = () => {
    setShowCredits(false);
  };
  
  const handleCloseCelebration = () => {
    setShowCelebration(false);
  };

  if (showVictory) {
    return <FinalScreen 
      onRestart={handleRestart} 
      completionTime={elapsedTime}
      groupCode={user?.groupCode} 
    />;
  }

  if (showCredits) {
    return <CreditScreen onComplete={handleCreditsComplete} />;
  }

  return (
    <div className="flex-col flex-1 flex">
      <header className="border-b border-neon-blue/30 bg-cyber-black/80 py-3 px-4">
        <div className="flex justify-between items-center">
          <h1 className="font-orbitron text-neon-blue text-xl">
            CYBER<span className="text-neon-purple">CHALLENGE</span> MAINFRAME
          </h1>
          <div className="flex items-center">
            <div className="flex flex-col items-end mr-3">
              <span className="font-tech-mono text-steel-blue">
                {user?.username.toUpperCase()}
              </span>
              <span className={`font-tech-mono text-xs ${getGroupTextClass(user?.groupCode)}`}>
                GROUP {user?.groupCode}
              </span>
            </div>

            {user?.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="text-neon-green hover:text-neon-green-bright mr-3 text-sm font-tech-mono"
              >
                ADMIN
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="text-neon-blue hover:text-neon-red mr-3 text-sm font-tech-mono"
            >
              LOGOUT
            </button>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green"></span>
            </span>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        {/* Left Panel: Challenge Navigation */}
        <CyberpunkPanel className="md:w-1/3 p-4 space-y-4">
          <h2 className="font-orbitron text-neon-purple text-xl mb-4">MISSION OBJECTIVES</h2>
          
          <div className="space-y-3">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 w-full bg-gray-800 animate-pulse rounded-sm"></div>
              ))
            ) : error ? (
              <p className="text-red-500 font-tech-mono">Error loading challenges</p>
            ) : (
              challenges?.map((challenge, i) => {
                const isActive = (progress?.currentChallenge || 0) >= challenge.id;
                const isCompleted = progress?.completedChallenges?.includes(challenge.id.toString()) || false;
                
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                  >
                    <CyberpunkButton 
                      variant={isCompleted ? "accent" : "default"}
                      active={isActive}
                      fullWidth
                      className="text-left px-4 py-3 flex justify-between items-center"
                      onClick={() => isActive && handleChallengeClick(challenge.id)}
                    >
                      <span>{challenge.codeName}</span>
                      <span className={isCompleted ? "progress-star bg-neon-green shadow-[0_0_10px_#39ff14]" : "progress-star bg-steel-blue/30"}
                        style={{
                          clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                          width: "25px",
                          height: "25px",
                          display: "inline-block"
                        }}
                      ></span>
                    </CyberpunkButton>
                  </motion.div>
                );
              })
            )}
          </div>
          
          <div className="mt-6">
            <h3 className="font-tech-mono text-steel-blue mb-2">SYSTEM STATUS:</h3>
            <CyberpunkProgress 
              value={progress?.progress || 0} 
              max={100} 
              showPercentage
            />
          </div>
          
          <div className="pt-4">
            <StarRating 
              totalStars={5}
              activeStar={progress?.completedChallenges?.length || 0}
            />
          </div>
          
          {/* Quiz Status */}
          <div className="mt-4 p-3 border border-neon-blue/30 rounded-sm">
            <h3 className="font-orbitron text-neon-blue text-sm mb-2">QUIZ STATUS:</h3>
            <div className="flex justify-between items-center">
              <span className="font-tech-mono text-steel-blue">Personal:</span>
              <span className={`font-tech-mono ${progress?.completedQuiz ? 'text-neon-green' : 'text-steel-blue'}`}>
                {progress?.completedQuiz ? 'COMPLETED' : 
                 (progress?.lastQuizQuestion && progress?.lastQuizQuestion > 1) ? `QUESTION ${progress?.lastQuizQuestion}/3` : 'NOT STARTED'}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="font-tech-mono text-steel-blue">Group:</span>
              <span className={`font-tech-mono ${progress?.groupProgress?.completedQuiz ? 'text-neon-green' : 'text-steel-blue'}`}>
                {progress?.groupProgress?.completedQuiz ? 'COMPLETED' : 'IN PROGRESS'}
              </span>
            </div>
            
            {/* Notice when quiz is completed but waiting for group members */}
            {progress?.progress === 100 && !progress?.groupProgress?.allMembersCompleted && (
              <div className="mt-2 border-t border-neon-blue/20 pt-2">
                <p className="font-tech-mono text-neon-orange text-sm animate-pulse">
                  Waiting for all group members to complete challenges...
                </p>
              </div>
            )}
          </div>
          
          {/* Group Photo Status */}
          {progress?.groupProgress && (
            <div className="mt-4 p-3 border border-neon-blue/30 rounded-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-orbitron text-neon-blue text-sm">GROUP PHOTO:</h3>
                <span className={`font-tech-mono ${progress?.groupProgress?.hasPhoto ? 'text-neon-green' : 'text-steel-blue'}`}>
                  {progress?.groupProgress?.hasPhoto ? 'SAVED' : 'NOT TAKEN'}
                </span>
              </div>
            </div>
          )}
          
          {/* Group Members */}
          <div className="mt-4 p-3 border border-neon-blue/30 rounded-sm">
            <GroupMembers />
          </div>

          {/* Show congratulations when all group members complete */}
          {progress?.groupProgress?.allMembersCompleted && (
            <CongratulationsPopup groupCode={user?.groupCode || ""} />
          )}
          
          {/* Timer */}
          {timerStarted && (
            <div className="mt-4 p-3 border border-neon-blue/30 rounded-sm">
              <div className="flex justify-between items-center">
                <h3 className="font-orbitron text-neon-blue text-sm">MISSION TIME:</h3>
                <span className="font-tech-mono text-neon-green text-xl tabular-nums">
                  {formatTime(progress?.groupProgress?.completionTime ? 
                    Math.floor(progress?.groupProgress?.completionTime / 1000) : 
                    elapsedTime)}
                </span>
              </div>
            </div>
          )}
        </CyberpunkPanel>
        
        {/* Right Panel: Welcome Screen and Group Progress */}
        <CyberpunkPanel className="md:w-2/3 flex flex-col p-4">
          {/* Top section with welcome message */}
          <div className="p-4 flex-1 flex flex-col">
            <h2 className="font-orbitron text-2xl text-neon-blue mb-6 text-center">WELCOME TO THE CYBER CHALLENGE</h2>
            
            <div className="terminal-output mb-6 w-full font-tech-mono bg-cyber-black/80 border border-neon-blue/30 rounded-sm text-steel-blue p-4 text-left">
              <p>$ SYSTEM BOOT SEQUENCE INITIATED</p>
              <p>$ LOADING CORE SYSTEMS...</p>
              <p>$ INITIALIZING NEURAL INTERFACE...</p>
              <p>$ MISSION BRIEFING: COMPLETE THE SEQUENCE OF CHALLENGES</p>
              <p>$ OBJECTIVE: DEMONSTRATE YOUR CYBERSECURITY AND IT KNOWLEDGE</p>
              <p>$ SELECT A CHALLENGE FROM THE MISSION PANEL TO BEGIN</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col justify-between">
                <p className="font-tech-mono text-steel-blue mb-8">
                  Each challenge will test different aspects of your IT knowledge. Complete all challenges to prove your skills and earn your rank as a cyber specialist.
                </p>
                
                <div className="flex justify-center">
                  <CyberpunkButton
                    onClick={() => handleChallengeClick(progress?.currentChallenge || 1)}
                  >
                    BEGIN CURRENT CHALLENGE
                  </CyberpunkButton>
                </div>
              </div>
              
              {/* Group Progress Tracker */}
              <div>
                <GroupProgressTracker />
              </div>
            </div>
          </div>
        </CyberpunkPanel>
      </div>
      
      {/* Celebration Modal */}
      <CelebrationModal 
        isOpen={showCelebration}
        onClose={handleCloseCelebration}
        groupCode={user?.groupCode || "1"}
      />
    </div>
  );
}