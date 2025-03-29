import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit, Trash, Plus, X, Check, Group, ListChecks, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertChallengeSchema, insertQuizSchema } from "../../../shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Challenge = {
  id: number;
  title: string;
  description: string;
  answer: string;
  codeName: string;
  order: number;
};

type Quiz = {
  id: number;
  groupCode: string;
  question: string;
  options: string[];
  correctOption: number;
  quizIndex: number;
};

type GroupProgress = {
  completedQuiz: boolean;
  completionTime: number;
  hasPhoto: boolean;
};

type User = {
  id: number;
  username: string;
  groupCode: string;
  progress: number;
  currentChallenge: number;
  completedChallenges: string[];
  completedQuiz: boolean;
  lastQuizQuestion: number;
  isAdmin: boolean;
};

// Tabs for different admin sections
function AdminTabs() {
  return (
    <Tabs defaultValue="challenges" className="w-full">
      <TabsList className="grid grid-cols-3">
        <TabsTrigger value="challenges">
          <ListChecks className="mr-2 h-4 w-4" />
          Challenges
        </TabsTrigger>
        <TabsTrigger value="quizzes">
          <Group className="mr-2 h-4 w-4" />
          Quizzes
        </TabsTrigger>
        <TabsTrigger value="users">
          <Users className="mr-2 h-4 w-4" />
          Users
        </TabsTrigger>
      </TabsList>
      <TabsContent value="challenges">
        <ChallengesManager />
      </TabsContent>
      <TabsContent value="quizzes">
        <QuizzesManager />
      </TabsContent>
      <TabsContent value="users">
        <UsersManager />
      </TabsContent>
    </Tabs>
  );
}

// Challenge management component
function ChallengesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const { isLoading, data: challenges } = useQuery<Challenge[]>({
    queryKey: ['/api/admin/challenges'],
    queryFn: getQueryFn({ on401: 'throw' })
  });

  const createMutation = useMutation({
    mutationFn: async (challenge: z.infer<typeof insertChallengeSchema>) => {
      const res = await apiRequest('POST', '/api/admin/challenges', challenge);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge created",
        description: "The challenge was created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/challenges'] });
      setIsAdding(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create challenge",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Challenge editing and deletion disabled
  // Challenges contain prewritten passwords that must remain unchanged

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Challenges</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Challenge
        </Button>
      </div>

      {isAdding && (
        <ChallengeForm 
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setIsAdding(false)}
          isSubmitting={createMutation.isPending}
        />
      )}

      {/* Challenge editing is disabled as per requirements */}

      <div className="grid gap-4">
        {challenges?.map((challenge) => (
          <Card key={challenge.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <CardTitle>Challenge {challenge.id}</CardTitle>
                  <CardDescription>{challenge.codeName}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <span className="text-yellow-400 bg-yellow-900/20 px-3 py-1 rounded-full text-xs font-tech-mono">
                    Password protected - Cannot be modified
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">{challenge.description}</p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-amber-500 border-amber-500">Order: {challenge.order}</Badge>
                  <p><span className="font-semibold">Answer:</span> {challenge.answer}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Challenge form for adding/editing
function ChallengeForm({ 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: { 
  onSubmit: (data: z.infer<typeof insertChallengeSchema>) => void,
  onCancel: () => void,
  isSubmitting: boolean
}) {
  const form = useForm<z.infer<typeof insertChallengeSchema>>({
    resolver: zodResolver(insertChallengeSchema),
    defaultValues: {
      title: "",
      description: "",
      answer: "",
      codeName: "",
      order: 1
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Challenge</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Challenge title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="codeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Challenge code name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Challenge description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <Input placeholder="Challenge answer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Challenge order" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Quiz management component
function QuizzesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("1");

  type GroupedQuizzes = {
    group1: Quiz[];
    group2: Quiz[];
    group3: Quiz[];
    group4: Quiz[];
  };

  const { isLoading, data: quizzesByGroup } = useQuery<GroupedQuizzes>({
    queryKey: ['/api/admin/quizzes'],
    queryFn: getQueryFn({ on401: 'throw' })
  });

  const createMutation = useMutation({
    mutationFn: async (quiz: z.infer<typeof insertQuizSchema>) => {
      const res = await apiRequest('POST', '/api/admin/quizzes', quiz);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz created",
        description: "The quiz question was created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quizzes'] });
      setIsAdding(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create quiz",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, quiz }: { id: number, quiz: Partial<Quiz> }) => {
      const res = await apiRequest('PUT', `/api/admin/quizzes/${id}`, quiz);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz updated",
        description: "The quiz question was updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quizzes'] });
      setEditingQuiz(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update quiz",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/quizzes/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quiz deleted",
        description: "The quiz question was deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quizzes'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete quiz",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getGroupQuizzes = () => {
    if (!quizzesByGroup) return [];
    
    switch (selectedGroup) {
      case "1": return quizzesByGroup.group1;
      case "2": return quizzesByGroup.group2;
      case "3": return quizzesByGroup.group3;
      case "4": return quizzesByGroup.group4;
      default: return [];
    }
  };

  const getGroupName = (groupCode: string) => {
    switch (groupCode) {
      case "1": return "Group 1 (Programming)";
      case "2": return "Group 2 (Networking)";
      case "3": return "Group 3 (Database)";
      case "4": return "Group 4 (Cybersecurity)";
      default: return `Group ${groupCode}`;
    }
  };

  const getGroupColor = (groupCode: string) => {
    switch (groupCode) {
      case "1": return "text-blue-500 border-blue-500";
      case "2": return "text-purple-500 border-purple-500";
      case "3": return "text-orange-500 border-orange-500";
      case "4": return "text-pink-500 border-pink-500";
      default: return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quiz Questions</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Quiz Question
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <label htmlFor="group-select" className="font-medium">Select Group:</label>
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-[180px]" id="group-select">
            <SelectValue placeholder="Select group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Group 1 (Programming)</SelectItem>
            <SelectItem value="2">Group 2 (Networking)</SelectItem>
            <SelectItem value="3">Group 3 (Database)</SelectItem>
            <SelectItem value="4">Group 4 (Cybersecurity)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isAdding && (
        <QuizForm 
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setIsAdding(false)}
          isSubmitting={createMutation.isPending}
          defaultGroupCode={selectedGroup}
        />
      )}

      {editingQuiz && (
        <QuizForm 
          quiz={editingQuiz}
          onSubmit={(data) => updateMutation.mutate({ id: editingQuiz.id, quiz: data })}
          onCancel={() => setEditingQuiz(null)}
          isSubmitting={updateMutation.isPending}
        />
      )}

      <div className="grid gap-4">
        {getGroupQuizzes().map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>Question {quiz.quizIndex}</CardTitle>
                    <Badge variant="outline" className={getGroupColor(quiz.groupCode)}>
                      {getGroupName(quiz.groupCode)}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setEditingQuiz(quiz)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this quiz question?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the quiz question.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(quiz.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">{quiz.question}</p>
                <ul className="space-y-1">
                  {quiz.options.map((option, index) => (
                    <li key={index} className="flex items-center">
                      {index === quiz.correctOption ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mr-2 text-red-500" />
                      )}
                      <span className={index === quiz.correctOption ? "font-medium" : ""}>
                        {option}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Quiz form for adding/editing
function QuizForm({ 
  quiz, 
  onSubmit, 
  onCancel, 
  isSubmitting,
  defaultGroupCode = "1" 
}: { 
  quiz?: Quiz,
  onSubmit: (data: z.infer<typeof insertQuizSchema>) => void,
  onCancel: () => void,
  isSubmitting: boolean,
  defaultGroupCode?: string
}) {
  const [options, setOptions] = useState<string[]>(
    quiz?.options || ["", "", "", ""]
  );
  
  const form = useForm<z.infer<typeof insertQuizSchema> & { option0?: string, option1?: string, option2?: string, option3?: string }>({
    resolver: zodResolver(
      insertQuizSchema.extend({
        option0: z.string().min(1, "Option 1 is required"),
        option1: z.string().min(1, "Option 2 is required"),
        option2: z.string().min(1, "Option 3 is required"),
        option3: z.string().min(1, "Option 4 is required")
      })
    ),
    defaultValues: quiz ? {
      groupCode: quiz.groupCode,
      question: quiz.question,
      options: quiz.options,
      correctOption: quiz.correctOption,
      quizIndex: quiz.quizIndex,
      option0: quiz.options[0],
      option1: quiz.options[1],
      option2: quiz.options[2],
      option3: quiz.options[3]
    } : {
      groupCode: defaultGroupCode,
      question: "",
      options: ["", "", "", ""],
      correctOption: 0,
      quizIndex: 1,
      option0: "",
      option1: "",
      option2: "",
      option3: ""
    }
  });

  const handleSubmit = (data: any) => {
    const { option0, option1, option2, option3, ...rest } = data;
    const newOptions = [option0, option1, option2, option3];
    onSubmit({ ...rest, options: newOptions });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{quiz ? 'Edit Quiz Question' : 'Add Quiz Question'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="groupCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Group 1 (Programming)</SelectItem>
                        <SelectItem value="2">Group 2 (Networking)</SelectItem>
                        <SelectItem value="3">Group 3 (Database)</SelectItem>
                        <SelectItem value="4">Group 4 (Cybersecurity)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quizIndex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Index (1-3)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select index" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Question 1</SelectItem>
                        <SelectItem value="2">Question 2</SelectItem>
                        <SelectItem value="3">Question 3</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Quiz question" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <FormLabel>Answer Options</FormLabel>
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name={`option${index}` as any}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            placeholder={`Option ${index + 1}`} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="correctOption"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`option-${index}`}
                              checked={field.value === index}
                              onChange={() => field.onChange(index)}
                              className="mr-2"
                            />
                            <label htmlFor={`option-${index}`}>Correct</label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {quiz ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Users management component
function UsersManager() {
  const { toast } = useToast();
  const { isLoading, data: users } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: getQueryFn({ on401: 'throw' })
  });

  const getGroupColor = (groupCode: string) => {
    switch (groupCode) {
      case "1": return "text-blue-500 border-blue-500";
      case "2": return "text-purple-500 border-purple-500";
      case "3": return "text-orange-500 border-orange-500";
      case "4": return "text-pink-500 border-pink-500";
      default: return "";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-500";
    if (progress >= 50) return "text-amber-500";
    if (progress >= 20) return "text-orange-500";
    return "text-red-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Users</h2>
      <div className="grid gap-4">
        {users?.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{user.username}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className={getGroupColor(user.groupCode)}>
                      Group {user.groupCode}
                    </Badge>
                    {user.isAdmin && (
                      <Badge variant="secondary">Admin</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-lg ${getProgressColor(user.progress)}`}>
                    {user.progress}% Complete
                  </p>
                  <p className="text-sm text-slate-500">
                    Challenge {user.currentChallenge}/5
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-sm text-slate-500 mb-1">Completed Challenges</h4>
                <div className="flex flex-wrap gap-2">
                  {user.completedChallenges.length > 0 ? (
                    user.completedChallenges.map((challengeId) => (
                      <Badge key={challengeId} variant="outline">
                        Challenge {challengeId}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No completed challenges</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm text-slate-500 mb-1">Quiz Progress</h4>
                  <Badge variant={user.completedQuiz ? "secondary" : "outline"}>
                    {user.completedQuiz ? 'Completed' : `Question ${user.lastQuizQuestion}/3`}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">User ID: {user.id}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect non-admin users
  if (!user?.isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  const { logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-slate-500">Manage challenges, quizzes, and view user data</p>
        </div>
        <Button 
          onClick={handleLogout} 
          variant="destructive"
          className="flex items-center gap-2"
        >
          Logout
        </Button>
      </div>
      <AdminTabs />
    </div>
  );
}