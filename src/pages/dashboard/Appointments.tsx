import { useState } from "react";
import { Calendar, Search, Filter, MoreHorizontal, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppointments, useUpdateAppointmentStatus, useAppointmentStats } from "@/hooks/useAppointments";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Appointment, AppointmentStatus } from "@/types/database";

const getStatusVariant = (status: AppointmentStatus) => {
  switch (status) {
    case "pending":
      return "warning";
    case "confirmed":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const getStatusLabel = (status: AppointmentStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function Appointments() {
  const { data: appointments = [], isLoading } = useAppointments();
  const updateStatus = useUpdateAppointmentStatus();
  const stats = useAppointmentStats();
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  const sendConfirmationMessage = async (appointmentId: string, newStatus: string) => {
    try {
      setIsSendingNotification(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return;
      }
      
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (businessError || !business) {
        console.error('Business not found:', businessError);
        toast.error('Failed to find business');
        return;
      }
      
      const webhookUrl = 'https://asifyousaf.app.n8n.cloud/webhook/send-confirmation';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'appointment',
          record_id: appointmentId,
          status: newStatus,
          business_id: business.id
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Confirmation sent:', result);
      
      toast.success('✅ Confirmation sent to customer via WhatsApp!');
      
    } catch (error) {
      console.error('Error sending confirmation:', error);
      toast.error('Failed to send WhatsApp confirmation');
    } finally {
      setIsSendingNotification(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      await updateStatus.mutateAsync({ appointmentId, status });
      toast.success(`Appointment ${status}!`);
      
      if (status === 'confirmed' || status === 'cancelled') {
        await sendConfirmationMessage(appointmentId, status);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };
  
  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2">
            <Calendar className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="page-title">Appointments</h1>
            <p className="page-description">Manage appointments booked through WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
            <p className="text-2xl font-bold text-foreground">{stats.today}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">This Week</p>
            <p className="text-2xl font-bold text-info">{stats.thisWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
            <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      {stats.todayAppointments.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Appointments scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                      <span className="text-sm font-medium text-accent-foreground">
                        {format(new Date(apt.scheduled_at), "h:mm")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {apt.customer_name || apt.customer_number}
                      </p>
                      <p className="text-sm text-muted-foreground">{apt.service || "Service"}</p>
                    </div>
                  </div>
                  <StatusBadge variant={getStatusVariant(apt.status)}>
                    {getStatusLabel(apt.status)}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Appointments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>View and manage all appointments</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search appointments..." className="w-64 pl-9" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No appointments yet. Appointments booked through WhatsApp will appear here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="hidden md:table-cell">Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">
                      {apt.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {apt.customer_name || "Unknown"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {apt.customer_number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(apt.scheduled_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>{format(new Date(apt.scheduled_at), "h:mm a")}</TableCell>
                    <TableCell className="hidden md:table-cell">{apt.service || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge variant={getStatusVariant(apt.status)}>
                        {getStatusLabel(apt.status)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(apt)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(apt.id, "confirmed")}
                            disabled={apt.status !== "pending" || isSendingNotification}
                          >
                            {isSendingNotification ? "Sending..." : "Confirm"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleStatusChange(apt.id, "cancelled")}
                            disabled={apt.status === "cancelled" || isSendingNotification}
                          >
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Appointment Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Full details for this appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">
                    {selectedAppointment.customer_name || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.customer_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Service</p>
                  <p className="text-foreground">{selectedAppointment.service || "-"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Scheduled Time</p>
                  <p className="text-foreground">
                    {format(new Date(selectedAppointment.scheduled_at), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedAppointment.scheduled_at), "h:mm a")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <StatusBadge variant={getStatusVariant(selectedAppointment.status)}>
                    {getStatusLabel(selectedAppointment.status)}
                  </StatusBadge>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-foreground">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm text-foreground">
                  {format(new Date(selectedAppointment.created_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
