import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CyberpunkProgress } from "@/components/ui/cyberpunk-progress";
import { StarRating } from "@/components/star-rating";
import { Loader2 } from "lucide-react";

interface Quiz {
  id: number;
  groupCode: string;
  question: string;
  options: string[];
  quizIndex: number;
}

interface QuizAnswerResponse {
  correct: boolean;
  message: string;
  completed: boolean;
  nextIndex: number;
}

interface QuizGameProps {
  onComplete: () => void;
}

export function QuizGame({ onComplete }: QuizGameProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentQuizIndex, setCurrentQuizIndex] = useState(1);
  const [coins, setCoins] = useState(3);
  const [showStars, setShowStars] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  
  // Fetch quiz questions for the user's group
  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ["/api/quiz"],
    queryFn: getQuizFn
  });
  
  // Fetch the current quiz question
  const { data: currentQuiz, isLoading: loadingCurrentQuiz } = useQuery<Quiz>({
    queryKey: ["/api/quiz", currentQuizIndex],
    queryFn: () => getQuizByIndexFn(currentQuizIndex),
    enabled: !!user
  });
  
  // Submit an answer for the current quiz question
  const answerMutation = useMutation({
    mutationFn: async ({ index, selectedOption }: { index: number; selectedOption: number }) => {
      const res = await apiRequest("POST", `/api/quiz/${index}/answer`, { selectedOption });
      return res.json() as Promise<QuizAnswerResponse>;
    },
    onSuccess: (data) => {
      // Show success/error animation
      setAnsweredCorrectly(data.correct);
      setShowStars(true);
      
      if (data.correct) {
        toast({
          title: "Correct!",
          description: "Good job on answering correctly!",
        });
        
        // If the quiz is completed, call the onComplete callback
        if (data.completed) {
          setTimeout(() => {
            onComplete();
          }, 1500);
        } else {
          // Move to the next question after a delay
          setTimeout(() => {
            setCurrentQuizIndex(data.nextIndex);
            setSelectedOption(null);
            setShowStars(false);
          }, 1500);
        }
      } else {
        // Reduce coins for wrong answer
        setCoins(prev => Math.max(0, prev - 1));
        
        toast({
          title: "Incorrect!",
          description: "You lost a coin! Try again.",
          variant: "destructive"
        });
        
        // Clear selection after a delay
        setTimeout(() => {
          setSelectedOption(null);
          setShowStars(false);
        }, 1500);
        
        // If all coins are lost, reset to first question after delay
        if (coins <= 1) {
          setTimeout(() => {
            toast({
              title: "Out of coins!",
              description: "Starting over from the beginning.",
              variant: "destructive"
            });
            setCurrentQuizIndex(1);
            setCoins(3);
          }, 1500);
        }
      }
      
      // Invalidate the progress query
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit answer",
        variant: "destructive"
      });
    }
  });
  
  // Initialize using the user's last quiz question
  useEffect(() => {
    if (user?.lastQuizQuestion) {
      setCurrentQuizIndex(user.lastQuizQuestion);
    }
  }, [user]);
  
  // Handle option selection and submit answer
  const handleOptionSelect = (optionIndex: number) => {
    if (answerMutation.isPending || showStars) return;
    
    setSelectedOption(optionIndex);
    answerMutation.mutate({ 
      index: currentQuizIndex, 
      selectedOption: optionIndex 
    });
  };
  
  // Helper to get the appropriate button color based on group
  const getGroupButtonClass = (groupCode?: string) => {
    const group = groupCode || "1";
    const groupColorMap: Record<string, string> = {
      "1": "bg-blue-600 hover:bg-blue-700",
      "2": "bg-purple-600 hover:bg-purple-700",
      "3": "bg-orange-600 hover:bg-orange-700",
      "4": "bg-pink-600 hover:bg-pink-700"
    };
    return groupColorMap[group] || groupColorMap["1"];
  };
  
  if (loadingQuizzes || loadingCurrentQuiz) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-center font-mono">Loading quiz questions...</p>
      </div>
    );
  }
  
  if (!currentQuiz) {
    return (
      <div className="text-center p-8">
        <p className="font-mono text-red-500">No quiz questions found for your group!</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 flex flex-col items-center space-y-6 w-full max-w-3xl mx-auto">
      {/* Quiz progress */}
      <div className="w-full flex flex-col items-center space-y-2">
        <p className="font-mono text-md mb-2">
          Question {currentQuizIndex} of 3
        </p>
        <CyberpunkProgress 
          value={currentQuizIndex} 
          max={3} 
          showPercentage={false}
        />
      </div>
      
      {/* Coins display */}
      <div className="flex items-center justify-center space-x-2">
        <p className="font-mono">Coins:</p>
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <span 
              key={i} 
              className={`inline-block w-5 h-5 rounded-full ${i < coins ? 'bg-yellow-400' : 'bg-gray-700'}`}
            />
          ))}
        </div>
      </div>
      
      {/* Quiz question */}
      <Card className="w-full p-6 border border-gray-700 bg-black/30 backdrop-blur-sm">
        <h3 className="text-xl font-orbitron mb-6">{currentQuiz.question}</h3>
        
        <div className="flex flex-col space-y-3">
          {currentQuiz.options.map((option, index) => (
            <Button
              key={index}
              className={`relative font-mono justify-start text-left py-5 ${
                selectedOption === index
                  ? answeredCorrectly
                    ? 'bg-green-600 hover:bg-green-600'
                    : 'bg-red-600 hover:bg-red-600'
                  : getGroupButtonClass(user?.groupCode)
              } ${showStars && selectedOption === index ? 'overflow-visible' : 'overflow-hidden'}`}
              onClick={() => handleOptionSelect(index)}
              disabled={answerMutation.isPending || showStars}
            >
              <span className="mr-3">{String.fromCharCode(65 + index)}.</span>
              {option}
              
              {/* Star animation */}
              {showStars && selectedOption === index && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <StarRating 
                    totalStars={5} 
                    activeStar={answeredCorrectly ? 5 : 0} 
                    className="scale-150"
                  />
                </div>
              )}
            </Button>
          ))}
        </div>
      </Card>
      
      {/* Instructions */}
      <div className="text-center mt-4 text-sm font-mono text-gray-400">
        <p>Answer all questions correctly to complete the quiz!</p>
        <p>Be careful! Wrong answers will cost you a coin.</p>
      </div>
    </div>
  );
}

async function getQuizFn() {
  const res = await apiRequest("GET", "/api/quiz");
  if (!res.ok) throw new Error("Failed to fetch quiz questions");
  return res.json();
}

async function getQuizByIndexFn(index: number) {
  const res = await apiRequest("GET", `/api/quiz/${index}`);
  if (!res.ok) throw new Error("Failed to fetch quiz question");
  return res.json();
}