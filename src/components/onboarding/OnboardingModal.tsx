 import { useState } from "react";
 import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { useBusiness, useUpdateBusiness } from "@/hooks/useBusiness";
 import { Loader2, Building, CheckCircle } from "lucide-react";
 
 interface OnboardingModalProps {
   open: boolean;
   onComplete: () => void;
 }
 
 export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
   const { data: business } = useBusiness();
   const updateBusiness = useUpdateBusiness();
   const [step, setStep] = useState(1);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [formData, setFormData] = useState({
     businessName: "",
   });
 
   const handleSubmit = async () => {
     if (!formData.businessName.trim()) return;
     
     setIsSubmitting(true);
     try {
       await updateBusiness.mutateAsync({
         name: formData.businessName.trim(),
       });
       setStep(2); // Success step
       setTimeout(onComplete, 1500);
     } catch (error) {
       console.error("Onboarding error:", error);
       setIsSubmitting(false);
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={() => {}}>
       <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             {step === 1 ? (
               <>
                 <Building className="h-5 w-5 text-primary" />
                 Set Up Your Business
               </>
             ) : (
               <>
                 <CheckCircle className="h-5 w-5 text-success" />
                 You're All Set!
               </>
             )}
           </DialogTitle>
           <DialogDescription>
             {step === 1 
               ? "Let's personalize your dashboard"
               : "Your business profile is ready"}
           </DialogDescription>
         </DialogHeader>
 
         {step === 1 && (
           <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label htmlFor="businessName">What's your business name?</Label>
               <Input
                 id="businessName"
                 placeholder="e.g., Mario's Pizzeria"
                 value={formData.businessName}
                 onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && formData.businessName.trim()) {
                     handleSubmit();
                   }
                 }}
                 autoFocus
               />
             </div>
             <Button
               className="w-full"
               onClick={handleSubmit}
               disabled={!formData.businessName.trim() || isSubmitting}
             >
               {isSubmitting ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Saving...
                 </>
               ) : (
                 "Continue"
               )}
             </Button>
           </div>
         )}
 
         {step === 2 && (
           <div className="flex flex-col items-center py-8">
             <div className="rounded-full bg-success/10 p-4 mb-4">
               <CheckCircle className="h-12 w-12 text-success" />
             </div>
             <p className="text-sm text-muted-foreground">
               Redirecting to your dashboard...
             </p>
           </div>
         )}
       </DialogContent>
     </Dialog>
   );
 }