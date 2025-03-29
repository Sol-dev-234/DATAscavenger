import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { IntroScreen } from "@/components/intro-screen";
import { CyberpunkPanel } from "@/components/ui/cyberpunk-panel";
import { CyberpunkButton } from "@/components/ui/cyberpunk-button";
import { CyberpunkInput } from "@/components/ui/cyberpunk-input";

export default function AuthPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Extended schemas with validation
  const loginSchema = loginUserSchema.extend({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(4, "Password must be at least 4 characters"),
  });
  
  const registerSchema = insertUserSchema.extend({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(4, "Password must be at least 4 characters"),
    groupCode: z.enum(["1", "2", "3", "4", "admin"], {
      errorMap: () => ({ message: "Please select a valid group" }),
    }),
    adminCode: z.string().optional(),
  });

  // Login form setup
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form setup
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      groupCode: undefined,
      adminCode: "",
    },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  if (showIntro) {
    return <IntroScreen onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="min-h-screen flex-1 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CyberpunkPanel className="max-w-md w-full p-6">
          <h2 className="font-orbitron text-2xl md:text-3xl text-neon-blue mb-6 text-center">
            SYSTEM {isLogin ? "ACCESS" : "REGISTRATION"}
          </h2>
          
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="block font-tech-mono text-steel-blue">
                  USERNAME:
                </label>
                <CyberpunkInput
                  id="username"
                  {...loginForm.register("username")}
                  className="w-full rounded-sm"
                />
                {loginForm.formState.errors.username && (
                  <p className="text-xs text-red-500 font-tech-mono">
                    {loginForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="login-password" className="block font-tech-mono text-steel-blue">
                  PASSWORD:
                </label>
                <CyberpunkInput
                  id="login-password"
                  type="password"
                  {...loginForm.register("password")}
                  className="w-full rounded-sm"
                />
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-red-500 font-tech-mono">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <div className="pt-4">
                <CyberpunkButton
                  type="submit"
                  fullWidth
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "AUTHENTICATING..." : "ACCESS SYSTEM"}
                </CyberpunkButton>
              </div>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="register-username" className="block font-tech-mono text-steel-blue">
                  USERNAME:
                </label>
                <CyberpunkInput
                  id="register-username"
                  {...registerForm.register("username")}
                  className="w-full rounded-sm"
                />
                {registerForm.formState.errors.username && (
                  <p className="text-xs text-red-500 font-tech-mono">
                    {registerForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="register-password" className="block font-tech-mono text-steel-blue">
                  PASSWORD:
                </label>
                <CyberpunkInput
                  id="register-password"
                  type="password"
                  {...registerForm.register("password")}
                  className="w-full rounded-sm"
                />
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-red-500 font-tech-mono">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="group-code" className="block font-tech-mono text-steel-blue">
                  GROUP CODE:
                </label>
                <select
                  id="group-code"
                  {...registerForm.register("groupCode")}
                  className="w-full rounded-sm bg-cyber-black border-2 border-neon-blue/50 text-steel-blue p-3 focus:outline-none focus:border-neon-blue font-tech-mono appearance-none cursor-pointer hover:bg-cyber-black/50 transition-colors"
                >
                  <option value="" disabled className="bg-cyber-black text-steel-blue">SELECT GROUP</option>
                  <option value="1" className="bg-cyber-black text-neon-blue py-2">GROUP ALPHA [1]</option>
                  <option value="2" className="bg-cyber-black text-neon-purple py-2">GROUP BETA [2]</option>
                  <option value="3" className="bg-cyber-black text-neon-orange py-2">GROUP GAMMA [3]</option>
                  <option value="4" className="bg-cyber-black text-neon-pink py-2">GROUP DELTA [4]</option>
                  <option value="admin" className="bg-cyber-black text-red-500 py-2">ADMINISTRATOR ACCESS</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-steel-blue">
                  ▼
                </div>
                {registerForm.formState.errors.groupCode && (
                  <p className="text-xs text-red-500 font-tech-mono">
                    {registerForm.formState.errors.groupCode.message}
                  </p>
                )}
              </div>
              
              {registerForm.watch("groupCode") === "admin" && (
                <div className="space-y-2">
                  <label htmlFor="admin-code" className="block font-tech-mono text-steel-blue">
                    ADMIN AUTHENTICATION CODE:
                  </label>
                  <CyberpunkInput
                    id="admin-code"
                    type="password"
                    {...registerForm.register("adminCode")}
                    className="w-full rounded-sm"
                    placeholder="Enter administrator code"
                  />
                </div>
              )}
              
              <div className="pt-4">
                <CyberpunkButton
                  type="submit"
                  fullWidth
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "CREATING ACCOUNT..." : "INITIALIZE ACCOUNT"}
                </CyberpunkButton>
              </div>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-neon-blue hover:text-neon-purple text-sm font-tech-mono underline transition-colors"
            >
              {isLogin ? "CREATE NEW ACCOUNT" : "ALREADY HAVE AN ACCOUNT? ACCESS SYSTEM"}
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-steel-blue">
            <p className="font-tech-mono">NEURAL HANDSHAKE REQUIRED FOR ACCESS</p>
          </div>
        </CyberpunkPanel>
      </motion.div>
    </div>
  );
}
