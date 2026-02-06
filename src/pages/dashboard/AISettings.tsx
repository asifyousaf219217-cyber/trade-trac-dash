import { useState, useEffect } from "react";
import { Sparkles, Info, Eye, EyeOff, Save, AlertTriangle, CheckCircle2, Loader2, Activity, TestTube, Bot, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type KeyStatus = "empty" | "validating" | "valid" | "invalid" | "cooldown";

interface AIFeatures {
  intent_detection: boolean;
  datetime_assist: boolean;
  faq_answers: boolean;
}

interface TestResult {
  success: boolean;
  message: string;
  handledBy: string;
  fallbackReason: string | null;
  type?: string;
}

export default function AISettings() {
  const { data: business, isLoading: businessLoading } = useBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const businessId = business?.id;

  // Local state
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<KeyStatus>("empty");
  const [_hasExistingKey, setHasExistingKey] = useState(false);
  const [keyChanged, setKeyChanged] = useState(false);
  const [testCooldown, setTestCooldown] = useState(0);
  const [aiFeatures, setAiFeatures] = useState<AIFeatures>({
    intent_detection: false,
    datetime_assist: true,
    faq_answers: false,
  });
  const [businessContext, setBusinessContext] = useState("");
  const [businessContextChanged, setBusinessContextChanged] = useState(false);
  
  // Test AI state
  const [testMessage, setTestMessage] = useState("What services do you offer?");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Fetch AI config from bot_configs
  const { data: aiConfig, isLoading: configLoading } = useQuery({
    queryKey: ["ai-config", businessId],
    queryFn: async () => {
      if (!businessId) return null;
      const { data, error } = await supabase
        .from("bot_configs")
        .select("ai_enabled, ai_features, ai_business_context")
        .eq("business_id", businessId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  // Check if API key exists (boolean only, never return actual key)
  const { data: hasKey } = useQuery({
    queryKey: ["has-gemini-key", businessId],
    queryFn: async () => {
      if (!businessId) return false;
      const { data, error } = await supabase
        .from("bot_configs")
        .select("ai_api_key_encrypted")
        .eq("business_id", businessId)
        .maybeSingle();
      if (error) return false;
      return !!data?.ai_api_key_encrypted;
    },
    enabled: !!businessId,
  });

  // Sync local state with fetched data
  useEffect(() => {
    if (aiConfig) {
      setIsAIEnabled(aiConfig.ai_enabled ?? false);
      const features = aiConfig.ai_features as AIFeatures | null;
      setAiFeatures(features ?? {
        intent_detection: false,
        datetime_assist: true,
        faq_answers: false,
      });
      setBusinessContext(aiConfig.ai_business_context ?? "");
    }
  }, [aiConfig]);

  useEffect(() => {
    if (hasKey !== undefined) {
      setHasExistingKey(hasKey);
      if (hasKey) {
        setApiKey("••••••••••••••••");
        setKeyStatus("valid");
      }
    }
  }, [hasKey]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!businessId) throw new Error("No business found");

      const updateData: Record<string, unknown> = {
        ai_enabled: isAIEnabled,
        ai_features: aiFeatures,
        ai_business_context: businessContext,
        updated_at: new Date().toISOString(),
      };

      // Only include API key if it was changed and is valid
      if (keyChanged && (keyStatus === "valid" || keyStatus === "cooldown") && !apiKey.includes("•")) {
        updateData.ai_api_key_encrypted = apiKey;
      }

      const { error } = await supabase
        .from("bot_configs")
        .update(updateData)
        .eq("business_id", businessId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-config"] });
      queryClient.invalidateQueries({ queryKey: ["has-gemini-key"] });
      queryClient.invalidateQueries({ queryKey: ["bot-config"] });
      
      // Track what was saved for the toast
      const savedItems: string[] = [];
      if (isAIEnabled !== aiConfig?.ai_enabled) savedItems.push("AI status");
      if (JSON.stringify(aiFeatures) !== JSON.stringify(aiConfig?.ai_features)) savedItems.push("AI features");
      if (keyChanged && keyStatus === "valid" && !apiKey.includes("•")) savedItems.push("API key");
      if (businessContextChanged) savedItems.push("business context");
      
      setKeyChanged(false);
      setBusinessContextChanged(false);
      toast({
        title: "Settings saved",
        description: savedItems.length > 0 
          ? `Updated: ${savedItems.join(", ")}`
          : "Your AI settings have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test API key
  const testApiKey = async () => {
    if (!apiKey || apiKey.includes("•") || testCooldown > 0) return;

    setKeyStatus("validating");

    try {
      const { data, error } = await supabase.functions.invoke("validate-gemini-key", {
        body: { api_key: apiKey, business_id: businessId },
      });

      if (error) throw error;

      if (data?.valid) {
        setKeyStatus("valid");
        toast({
          title: "API Key Valid",
          description: "Your Gemini API key is working correctly.",
        });
      } else {
        setKeyStatus("invalid");
        toast({
          title: "Invalid API Key",
          description: data?.error || "The API key could not be validated.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Validation error:", err);
      setKeyStatus("invalid");
      toast({
        title: "Validation Error",
        description: "Could not validate the API key. Please try again.",
        variant: "destructive",
      });
    }

    // Start cooldown
    setTestCooldown(30);
    const interval = setInterval(() => {
      setTestCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Test AI response
  const handleTestAI = async () => {
    if (!businessId || !testMessage.trim()) return;
    
    setTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assist", {
        body: {
          business_id: businessId,
          type: "faq",
          user_input: testMessage,
          context: {},
        },
      });

      if (error) throw error;

      const isFallback = data?.fallback === true;
      setTestResult({
        success: !isFallback,
        message: data?.result?.response || data?.reason || "No response",
        handledBy: isFallback ? "static" : "ai",
        fallbackReason: data?.reason || null,
        type: isFallback ? "fallback" : "ai",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setTestResult({
        success: false,
        message: errorMessage,
        handledBy: "static",
        fallbackReason: "error",
      });
    }

    setTesting(false);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setKeyChanged(true);
    if (value.length === 0) {
      setKeyStatus("empty");
    } else if (!value.includes("•")) {
      setKeyStatus("empty"); // Reset status for new keys until validated
    }
  };

  const handleBusinessContextChange = (value: string) => {
    setBusinessContext(value);
    setBusinessContextChanged(true);
  };

  // API key can only be saved if it was changed, tested and valid, and not the masked placeholder
  const keyReadyToSave = keyChanged && keyStatus === "valid" && !apiKey.includes("•");
  
  // Show warning if key was changed but not validated
  const showKeyWarning = keyChanged && !apiKey.includes("•") && keyStatus !== "valid" && keyStatus !== "validating";

  const canSave = isAIEnabled !== aiConfig?.ai_enabled ||
    JSON.stringify(aiFeatures) !== JSON.stringify(aiConfig?.ai_features) ||
    businessContextChanged ||
    keyReadyToSave;

  if (businessLoading || configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2">
            <Sparkles className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="page-title">AI Settings</h1>
            <p className="page-description">Configure AI-powered responses for your bot</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Mode</CardTitle>
                  <CardDescription>Enable intelligent responses powered by Gemini</CardDescription>
                </div>
                <StatusBadge variant={isAIEnabled ? "active" : "inactive"}>
                  {isAIEnabled ? "AI Enabled" : "Static Mode"}
                </StatusBadge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label className="text-base">Enable AI Responses</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, your bot will use Gemini AI for intelligent responses
                  </p>
                </div>
                <Switch
                  checked={isAIEnabled}
                  onCheckedChange={setIsAIEnabled}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gemini API Key</CardTitle>
              <CardDescription>Your API key is stored securely and never shared</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    disabled={!isAIEnabled}
                    className={keyStatus === "valid" ? "border-green-500 pr-20" : keyStatus === "invalid" ? "border-destructive pr-20" : "pr-20"}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {keyStatus === "valid" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {keyStatus === "invalid" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    {keyStatus === "validating" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-muted-foreground hover:text-foreground"
                      disabled={!isAIEnabled}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={testApiKey}
                disabled={!isAIEnabled || !apiKey || apiKey.includes("•") || keyStatus === "validating" || testCooldown > 0}
                className="w-full"
              >
                {keyStatus === "validating" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : testCooldown > 0 ? (
                  `Test Again (${testCooldown}s)`
                ) : (
                  "Test API Key"
                )}
              </Button>

              {showKeyWarning && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                    Please test your API key before saving. Keys are only saved after successful validation.
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg bg-accent/50 p-4">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 shrink-0 text-accent-foreground" />
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Get your Gemini API key from the{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Context Card */}
          <Card>
            <CardHeader>
              <CardTitle>Business Context for AI</CardTitle>
              <CardDescription>Help AI understand your business and respond naturally</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai_business_context">Describe Your Business</Label>
                <Textarea
                  id="ai_business_context"
                  placeholder="Describe your business, services, and preferred tone...

Example: We are a barber shop in Dubai. Services include haircuts, beard trim, and kids cuts. Use a friendly and casual tone."
                  value={businessContext}
                  onChange={(e) => handleBusinessContextChange(e.target.value)}
                  rows={4}
                  disabled={!isAIEnabled}
                />
                <p className="text-sm text-muted-foreground">
                  This helps the AI understand your business and respond naturally.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Activity Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                AI Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Status</span>
                <Badge variant={isAIEnabled ? "default" : "secondary"}>
                  {isAIEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Key</span>
                <Badge variant={hasKey ? "default" : "destructive"}>
                  {hasKey ? "Configured" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Business Context</span>
                <Badge variant={businessContext ? "default" : "outline"}>
                  {businessContext ? "Set" : "Not Set"}
                </Badge>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>AI handles general questions naturally</li>
                  <li>AI detects booking intent → triggers menu</li>
                  <li>If AI fails → static logic takes over</li>
                  <li>Structured flows always use menus</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Test AI Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Test AI Response
              </CardTitle>
              <CardDescription>Send a test message to see how AI responds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testMessage">Test Message</Label>
                <Input
                  id="testMessage"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="What services do you offer?"
                  disabled={!isAIEnabled || !hasKey}
                />
              </div>
              
              <Button
                variant="outline"
                onClick={handleTestAI}
                disabled={!isAIEnabled || !hasKey || testing || !testMessage.trim()}
                className="w-full"
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Send Test Message
                  </>
                )}
              </Button>

              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  <AlertDescription>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={testResult.handledBy === "ai" ? "default" : "secondary"}>
                        {testResult.handledBy === "ai" ? (
                          <><Bot className="mr-1 h-3 w-3" /> AI</>
                        ) : (
                          "📋 Static"
                        )}
                      </Badge>
                      {testResult.fallbackReason && (
                        <span className="text-xs text-muted-foreground">
                          ({testResult.fallbackReason})
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{testResult.message}</p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Placeholder for sticky save button spacing */}
        </div>

        {/* Info Cards */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How AI Mode Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Customer sends message</p>
                    <p className="text-sm text-muted-foreground">
                      Message is received through WhatsApp
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground">AI analyzes context</p>
                    <p className="text-sm text-muted-foreground">
                      Gemini understands the intent and your business info
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Smart response generated</p>
                    <p className="text-sm text-muted-foreground">
                      AI creates a natural, helpful response
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isAIEnabled && (
            <Card className="border-warning/50 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  Static Mode Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Without an AI key, your bot will only respond with the pre-configured 
                  messages from your Bot Configuration. For more intelligent, contextual 
                  responses, enable AI mode and add your Gemini API key.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>AI Capabilities</CardTitle>
              <CardDescription>What AI mode enables</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Natural language understanding
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Context-aware responses
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Multilingual support
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Complex query handling
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Personalized recommendations
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Save Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border p-4 lg:left-64">
        <div className="max-w-5xl mx-auto">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!canSave || saveMutation.isPending}
            className="w-full"
            size="lg"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save AI Settings
              </>
            )}
          </Button>
          {showKeyWarning && (
            <p className="text-center text-sm text-yellow-600 dark:text-yellow-400 mt-2">
              ⚠️ API key will not be saved until tested
            </p>
          )}
        </div>
      </div>
    </div>
  );
}