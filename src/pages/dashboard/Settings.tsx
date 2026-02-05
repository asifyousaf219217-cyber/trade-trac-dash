 import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Globe, LogOut, Save, Building } from "lucide-react";
 import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
 import { useBusiness, useUpdateBusiness } from "@/hooks/useBusiness";
 import { useAuth } from "@/contexts/AuthContext";
 import { toast } from "@/hooks/use-toast";

const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

export default function Settings() {
  const navigate = useNavigate();
   const { data: business, isLoading } = useBusiness();
   const { user, signOut } = useAuth();
   const updateBusiness = useUpdateBusiness();
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
     businessName: "",
     email: "",
     phone: "",
     address: "",
     timezone: "UTC",
  });

   // Populate form when data loads
   useEffect(() => {
     if (business) {
       setProfile({
         businessName: business.name || "",
         email: user?.email || "",
         phone: "",
         address: "",
         timezone: business.timezone || "UTC",
       });
     }
   }, [business, user]);
 
   const handleSave = async () => {
     if (!business) return;
 
    setIsSaving(true);
     try {
       await updateBusiness.mutateAsync({
         name: profile.businessName,
         timezone: profile.timezone,
       });
       toast({
         title: "Settings saved",
         description: "Your profile has been updated.",
       });
     } catch (error) {
       toast({
         title: "Error",
         description: "Failed to save settings.",
         variant: "destructive",
       });
     } finally {
      setIsSaving(false);
     }
  };

   const handleLogout = async () => {
     await signOut();
     navigate("/");
  };

  const updateProfile = (key: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

   // Get initials for avatar
   const getInitials = () => {
     const name = profile.businessName || user?.email || "";
     return name.substring(0, 2).toUpperCase();
   };
 
   if (isLoading) {
     return (
       <div className="flex h-64 items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
       </div>
     );
   }
 
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2">
            <SettingsIcon className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-description">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Business Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Business Profile
              </CardTitle>
              <CardDescription>Your business information visible to customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={profile.businessName}
                    onChange={(e) => updateProfile("businessName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateProfile("email", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => updateProfile("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => updateProfile("address", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Timezone */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Timezone
              </CardTitle>
              <CardDescription>Set your business timezone for accurate scheduling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="timezone">Select Timezone</Label>
                <Select
                  value={profile.timezone}
                  onValueChange={(value) => updateProfile("timezone", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-medium text-primary-foreground">
                 {getInitials()}
                </div>
                <div>
                 <p className="font-medium text-foreground">{profile.businessName || "Your Business"}</p>
                 <p className="text-sm text-muted-foreground">{profile.email || user?.email}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Current Plan</p>
                <div className="rounded-lg bg-accent p-3">
                  <p className="font-medium text-foreground">Free Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Limited to 100 messages/month
                  </p>
                </div>
              </div>

              <Separator />

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
             <Button 
               variant="outline" 
               className="w-full"
               onClick={() => window.open("mailto:support@whatsbott.com", "_blank")}
             >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
