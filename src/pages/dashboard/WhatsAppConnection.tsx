import { Smartphone, CheckCircle2, Clock, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { useState, useEffect } from "react";
import { useWhatsAppNumber, useUpdateWhatsAppNumber } from "@/hooks/useWhatsApp";
import { toast } from "@/hooks/use-toast";

export default function WhatsAppConnection() {
  const { data: whatsappNumber, isLoading } = useWhatsAppNumber();
  const updateWhatsApp = useUpdateWhatsAppNumber();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  // Load existing data
  useEffect(() => {
    if (whatsappNumber) {
      setPhoneNumber(whatsappNumber.display_phone_number || "");
      setPhoneNumberId(whatsappNumber.phone_number_id || "");
      setBusinessAccountId(whatsappNumber.business_account_id || "");
      // Don't pre-fill access token for security
    }
  }, [whatsappNumber]);

  const verificationStatus = whatsappNumber?.verification_status || "not_connected";

  const handleSave = async () => {
    try {
      await updateWhatsApp.mutateAsync({
        display_phone_number: phoneNumber || null,
        phone_number_id: phoneNumberId || null,
        business_account_id: businessAccountId || null,
        access_token_encrypted: accessToken || null,
        verification_status: "not_connected",
      });
      toast({
        title: "Configuration saved",
        description: "Your WhatsApp API configuration has been saved successfully.",
      });
      setAccessToken(""); // Clear for security
    } catch (error) {
      toast({
        title: "Error saving configuration",
        description: "Failed to save your WhatsApp configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case "connected":
        return <StatusBadge variant="success">Connected</StatusBadge>;
      case "verifying":
        return <StatusBadge variant="warning">Pending Verification</StatusBadge>;
      default:
        return <StatusBadge variant="error">Not Connected</StatusBadge>;
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case "connected":
        return <CheckCircle2 className="h-12 w-12 text-success" />;
      case "verifying":
        return <Clock className="h-12 w-12 text-warning" />;
      default:
        return <AlertCircle className="h-12 w-12 text-destructive" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">WhatsApp Connection</h1>
        <p className="page-description">Connect your WhatsApp Business account to start automating conversations.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Connection Status
            </CardTitle>
            <CardDescription>Current status of your WhatsApp Business connection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-6 text-center">
              {getStatusIcon()}
              <div className="mt-4">{getStatusBadge()}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {verificationStatus === "connected"
                  ? "Your WhatsApp Business account is connected and ready to use."
                  : verificationStatus === "verifying"
                  ? "Verification in progress. This may take a few minutes."
                  : "Connect your Meta Business account to get started."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Meta Business Setup */}
        <Card>
          <CardHeader>
            <CardTitle>Meta Business Setup</CardTitle>
            <CardDescription>Follow these steps to connect your WhatsApp Business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-accent/50 p-4">
              <h4 className="font-medium text-foreground">Prerequisites</h4>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Meta Business account</li>
                <li>• WhatsApp Business account</li>
                <li>• Verified business phone number</li>
              </ul>
            </div>
            <Button className="w-full" variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Meta Business Suite
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* API Configuration */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Enter your WhatsApp Business API credentials. These will be used to send and receive messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp Business Number</Label>
              <Input
                id="phone"
                placeholder="+1 234 567 8900"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The phone number connected to your WhatsApp Business
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneId">Phone Number ID</Label>
              <Input
                id="phoneId"
                placeholder="Enter Phone Number ID"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Found in your Meta Developer Console
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessId">Business Account ID</Label>
              <Input
                id="businessId"
                placeholder="Enter Business Account ID"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your WhatsApp Business Account ID
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Enter Access Token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Permanent access token from Meta
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline">Test Connection</Button>
            <Button 
              onClick={handleSave}
              disabled={!phoneNumberId || !businessAccountId || !accessToken || updateWhatsApp.isPending}
            >
              {updateWhatsApp.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
