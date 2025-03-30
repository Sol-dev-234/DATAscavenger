import { motion } from "framer-motion";
import { CyberpunkPanel } from "@/components/ui/cyberpunk-panel";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { StarRating } from "@/components/star-rating";
import { useEffect, useState } from "react";
import { WebcamCapture } from "@/components/webcam-capture";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Camera, CheckCircle, Users } from "lucide-react";

interface FinalScreenProps {
  onRestart: () => void;
  completionTime?: number;
  groupCode?: string | number;
}

interface GroupProgressData {
  completedQuiz: boolean;
  completionTime: number;
  hasPhoto: boolean;
  allMembersCompleted: boolean;
  groupPhoto?: string;
}

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

function getGroupBgClass(groupCode?: string | number) {
  if (!groupCode) return "bg-neon-blue/20";
  
  switch (groupCode.toString()) {
    case "1": return "bg-neon-blue/20";
    case "2": return "bg-neon-purple/20";
    case "3": return "bg-neon-orange/20";
    case "4": return "bg-neon-pink/20";
    default: return "bg-neon-blue/20";
  }
}

export function FinalScreen({ onRestart, completionTime = 0, groupCode = "1" }: FinalScreenProps) {
  const [showFinalMsg, setShowFinalMsg] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const { user } = useAuth();
  
  // Fetch group progress data
  const { data: groupProgress, isLoading: loadingGroupProgress } = useQuery<GroupProgressData>({
    queryKey: ["/api/group-progress"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/group-progress");
      if (!res.ok) throw new Error("Failed to fetch group progress");
      return res.json();
    }
  });
  
  useEffect(() => {
    // Show the final message after 2 seconds
    const timer = setTimeout(() => {
      setShowFinalMsg(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handlePhotoCaptured = () => {
    setPhotoTaken(true);
  };
  
  const groupTextColor = getGroupTextClass(groupCode);
  const groupBgColor = getGroupBgClass(groupCode);
  
  // Determine which time to show - group time if available, otherwise individual time
  const timeToShow = groupProgress?.completionTime 
    ? Math.floor(groupProgress.completionTime / 1000) 
    : completionTime;
  
  const hasPhoto = photoTaken || (groupProgress?.hasPhoto || false);
  
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center p-4 max-w-4xl w-full mx-auto">
        <motion.h1 
          className="font-orbitron text-4xl md:text-6xl text-neon-green mb-6 animate-pulse-slow"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          MISSION ACCOMPLISHED
        </motion.h1>
        
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="results" className="text-lg">
              <CheckCircle className="mr-2 h-4 w-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="photo" className="text-lg">
              <Camera className="mr-2 h-4 w-4" />
              Group Photo
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="results">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <CyberpunkPanel className="p-6 mb-8" glow>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Users className="h-6 w-6 text-white" />
                  <p className="font-orbitron text-xl text-white">
                    Group <span className={groupTextColor}>{groupCode}</span> Results
                  </p>
                </div>
                
                <p className="font-tech-mono text-xl text-steel-blue mb-4">All challenges completed successfully!</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className={`p-4 rounded-lg ${groupBgColor}`}>
                    <p className="font-tech-mono text-steel-blue mb-2">
                      Final Score: <span className={`${groupTextColor} text-2xl`}>100%</span>
                    </p>
                    
                    <div className="flex justify-center my-3">
                      <StarRating totalStars={5} activeStar={5} />
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${groupBgColor}`}>
                    {loadingGroupProgress ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <p className="font-tech-mono text-steel-blue">
                          Quiz Completed: 
                          <span className={`${groupProgress?.completedQuiz ? 'text-neon-green' : 'text-red-500'} ml-2`}>
                            {groupProgress?.completedQuiz ? 'YES' : 'NO'}
                          </span>
                        </p>
                        
                        {timeToShow > 0 && (
                          <p className="font-tech-mono text-steel-blue mt-2">
                            Completion Time: <span className="text-neon-green text-xl font-bold tabular-nums">{formatTime(timeToShow)}</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                {showFinalMsg && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mt-4 p-3 border border-neon-green/30 bg-cyber-black/50 rounded"
                  >
                    <p className="font-orbitron text-neon-green text-lg mb-2 animate-pulse">
                      QUICKLY TELL YOUR HOSTS!
                    </p>
                    <p className="font-tech-mono text-steel-blue text-sm mb-2">
                      Congratulations, Group {groupCode}! All team members have completed the challenges!
                    </p>
                    <p className="font-tech-mono text-steel-blue text-xs">
                      Thank you for playing our game
                      <span className={`${groupTextColor} mx-1`}>[Sol & Andrei]</span>
                    </p>
                    
                    {/* Stars animation for final celebration */}
                    <div className="mt-3">
                      <StarRating totalStars={5} activeStar={5} className="scale-125" />
                    </div>
                  </motion.div>
                )}
              </CyberpunkPanel>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="photo">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <CyberpunkPanel className="p-6 mb-8" glow>
                {hasPhoto ? (
                  <div className="text-center">
                    <p className="font-tech-mono text-neon-green text-xl mb-6">Group Photo Saved!</p>
                    <div className="bg-black/50 p-4 rounded-lg border border-gray-700 flex items-center justify-center">
                      {groupProgress?.groupPhoto ? (
                        <img 
                          src={groupProgress.groupPhoto} 
                          alt="Group Photo" 
                          className="max-w-full rounded shadow-lg border border-gray-700"
                          style={{ maxHeight: '50vh' }}
                        />
                      ) : (
                        <div className="flex flex-col items-center p-8">
                          <CheckCircle className="h-16 w-16 text-neon-green mb-3" />
                          <p className="font-tech-mono text-steel-blue">
                            Photo saved successfully!
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="font-tech-mono text-gray-400 mt-4">
                      Your group achievement has been recorded!
                    </p>
                    <p className="font-tech-mono text-neon-green text-sm mt-2">
                      Congratulations on completing all challenges as a team!
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="font-orbitron text-neon-green text-xl mb-3">Take a Group Photo</p>
                    <p className="font-tech-mono text-steel-blue mb-6">
                      Celebrate your achievement! Take a picture together with your group.
                    </p>
                    <WebcamCapture onPhotoCaptured={handlePhotoCaptured} />
                  </>
                )}
              </CyberpunkPanel>
            </motion.div>
          </TabsContent>
        </Tabs>
        
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mb-8"
        >
          <CyberpunkButton onClick={onRestart}>
            RESTART SIMULATION
          </CyberpunkButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
