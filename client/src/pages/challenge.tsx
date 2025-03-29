import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { CyberpunkPanel } from "@/components/ui/cyberpunk-panel";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { CyberpunkInput } from "@/components/ui/cyberpunk-input";
import { DecoderTools } from "@/components/decoder-tools";
import { SuccessModal } from "@/components/success-modal";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Challenge as ChallengeType } from "@shared/schema";

// Helper functions for group-specific styling
function getGroupBorderClass(groupCode?: string | number) {
  switch(groupCode?.toString()) {
    case "1": return "border-neon-blue/50";
    case "2": return "border-neon-purple/50";
    case "3": return "border-neon-green/50";
    case "4": return "border-yellow-500/50";
    default: return "border-neon-purple/30";
  }
}

function getGroupTextClass(groupCode?: string | number) {
  switch(groupCode?.toString()) {
    case "1": return "text-neon-blue";
    case "2": return "text-neon-purple";
    case "3": return "text-neon-green";
    case "4": return "text-yellow-500";
    default: return "text-neon-purple";
  }
}

// Group-specific hints based on challenge ID and group
function getGroupSpecificHint(challengeId: number, groupCode?: string | number) {
  const group = groupCode?.toString() || "1";
  const hints: Record<string, Record<number, string>> = {
    "1": {
      1: "Look for hidden QR codes in blue marked areas. Binary might be useful.",
      2: "The Caesar Cipher key for your group is 3. Shift letters forward.",
      3: "Your binary sequence is hidden in the network diagram. Convert to ASCII.",
      4: "Check near the computer lab entrance for your QR code.",
      5: "Focus on networking and infrastructure questions in your quiz."
    },
    "2": {
      1: "Search for clues in purple marked zones. Morse code could be helpful.",
      2: "Your group's Caesar Cipher key is 5. Count forward in the alphabet.",
      3: "Binary sequences for Group 2 are hidden on the bulletin board.",
      4: "Your QR code is near the faculty room.",
      5: "Database and storage questions will be prominent in your quiz."
    },
    "3": {
      1: "Green areas contain your clues. Check for patterns in the text.",
      2: "Group 3 uses Caesar Cipher key 7. Count seven letters ahead.",
      3: "Binary code is hidden in the classroom projector screen.",
      4: "Your QR code can be found near the library entrance.",
      5: "Security and encryption topics will be your focus."
    },
    "4": {
      1: "Yellow markers show where to search. Numbers may have significance.",
      2: "Your Caesar Cipher key is 9. Shift nine positions forward.",
      3: "Look for binary sequences posted near the canteen.",
      4: "Find your QR code around the student lounge area.",
      5: "Artificial Intelligence and programming questions await your group."
    }
  };
  
  return hints[group]?.[challengeId] || "Use the decoder tools below to help solve this challenge. Each challenge may require different tools.";
}

export default function Challenge() {
  const params = useParams<{ id: string }>();
  const challengeId = parseInt(params.id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [answer, setAnswer] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Fetch challenge details
  const {
    data: challenge,
    isLoading,
    error,
  } = useQuery<ChallengeType>({
    queryKey: [`/api/challenges/${challengeId}`],
    enabled: !!challengeId && !isNaN(challengeId),
  });
  
  // Mutation for verifying answers
  const verifyMutation = useMutation({
    mutationFn: async (answer: string) => {
      const res = await apiRequest("POST", `/api/challenges/${challengeId}/verify`, { answer });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.correct) {
        setSuccessMessage(data.message);
        setSuccessOpen(true);
        
        // Invalidate queries to update the UI
        queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
        queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      } else {
        // Wrong answer handling could be enhanced here
      }
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      verifyMutation.mutate(answer);
    }
  };
  
  const handleSuccessClose = () => {
    setSuccessOpen(false);
    navigate("/");
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cyber-black">
        <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
      </div>
    );
  }
  
  if (error || !challenge) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cyber-black">
        <CyberpunkPanel className="p-6 max-w-md">
          <h2 className="font-orbitron text-xl text-neon-blue mb-4">ERROR</h2>
          <p className="font-tech-mono text-steel-blue mb-6">
            Challenge data could not be loaded. Please try again.
          </p>
          <CyberpunkButton onClick={() => navigate("/")}>
            RETURN TO DASHBOARD
          </CyberpunkButton>
        </CyberpunkPanel>
      </div>
    );
  }
  
  return (
    <div className="flex-col flex-1 flex">
      <header className="border-b border-neon-blue/30 bg-cyber-black/80 py-3 px-4">
        <div className="flex justify-between items-center">
          <h1 className="font-orbitron text-neon-blue text-xl cursor-pointer" onClick={() => navigate("/")}>
            CYBER<span className="text-neon-purple">CHALLENGE</span> MAINFRAME
          </h1>
          <div className="flex items-center">
            <div className="flex flex-col items-end mr-3">
              <span className="font-tech-mono text-steel-blue">
                {user?.username.toUpperCase()}
              </span>
              <span className="font-tech-mono text-xs text-neon-purple">
                GROUP {user?.groupCode}
              </span>
            </div>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green"></span>
            </span>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        <CyberpunkPanel className="flex-1 flex flex-col">
          {/* Challenge content */}
          <div className="p-4 flex-1 overflow-auto">
            <h2 className="font-orbitron text-2xl text-neon-blue mb-4">
              {challenge.codeName}
            </h2>
            
            <div className="terminal-output mb-4 font-tech-mono bg-cyber-black/80 border border-neon-blue/30 rounded-sm text-steel-blue p-4">
              <p>$ SYSTEM BOOT SEQUENCE INITIATED</p>
              <p>$ LOADING CORE SYSTEMS...</p>
              <p>$ INITIALIZING NEURAL INTERFACE...</p>
              <p>$ WARNING: SECURITY PROTOCOL REQUIRES AUTHENTICATION</p>
              <p>$ ENTER ACCESS CODE TO PROCEED</p>
            </div>
            
            <p className="font-tech-mono text-steel-blue mb-4">
              {challenge.description}
            </p>
            
            <form onSubmit={handleSubmit} className="mb-6">
              <label htmlFor="challenge-input" className="block font-tech-mono text-steel-blue mb-2">
                ACCESS CODE:
              </label>
              <div className="flex">
                <CyberpunkInput
                  id="challenge-input"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="flex-1 mr-2"
                  placeholder="ENTER CODE"
                />
                <CyberpunkButton 
                  type="submit"
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? "VERIFYING..." : "VERIFY"}
                </CyberpunkButton>
              </div>
              
              {verifyMutation.isError && (
                <p className="mt-2 text-red-500 font-tech-mono text-sm">
                  Error: Could not verify answer. Please try again.
                </p>
              )}
              
              {verifyMutation.data && !verifyMutation.data.correct && (
                <p className="mt-2 text-red-500 font-tech-mono text-sm">
                  {verifyMutation.data.message}
                </p>
              )}
            </form>
            
            <div className={`mt-6 p-3 border ${getGroupBorderClass(user?.groupCode)} rounded-sm`}>
              <h3 className={`font-orbitron ${getGroupTextClass(user?.groupCode)} mb-2 text-sm`}>GROUP {user?.groupCode} HINT:</h3>
              <p className="font-tech-mono text-sm text-steel-blue">
                {getGroupSpecificHint(challengeId, user?.groupCode)}
              </p>
            </div>
          </div>
          
          {/* Tools Panel */}
          <DecoderTools />
        </CyberpunkPanel>
      </div>
      
      <SuccessModal 
        isOpen={successOpen}
        message={successMessage}
        onClose={handleSuccessClose}
      />
    </div>
  );
}
