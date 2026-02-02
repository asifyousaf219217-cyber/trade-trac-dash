import { ShoppingCart, Search, Filter, MoreHorizontal } from "lucide-react";
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
import { useOrders, useUpdateOrderStatus, useOrderStats } from "@/hooks/useOrders";
import { format } from "date-fns";
import type { OrderStatus } from "@/types/database";

const getStatusVariant = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "warning";
    case "accepted":
      return "info";
    case "completed":
      return "success";
    case "cancelled":
    case "rejected":
      return "error";
    default:
      return "default";
  }
};

function formatOrderDetails(details: Record<string, unknown>): string {
  if (!details || Object.keys(details).length === 0) {
    return "No details";
  }
  // Try to display items if they exist
  if (Array.isArray(details.items)) {
    return details.items.map((item: { name?: string; quantity?: number }) => 
      `${item.quantity || 1}x ${item.name || 'Item'}`
    ).join(", ");
  }
  return JSON.stringify(details).slice(0, 50);
}

export default function Orders() {
  const { data: orders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const stats = useOrderStats();

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateStatus.mutate({ orderId, status });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2">
            <ShoppingCart className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="page-title">Orders</h1>
            <p className="page-description">Manage orders received through WhatsApp</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Accepted</p>
            <p className="text-2xl font-bold text-info">{stats.accepted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-success">{stats.completed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>View and manage customer orders</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search orders..." className="w-64 pl-9" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No orders yet. Orders placed through WhatsApp will appear here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Order Details</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_number}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-xs truncate md:table-cell">
                      {formatOrderDetails(order.details as Record<string, unknown>)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.total_amount ? `$${order.total_amount.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={getStatusVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {format(new Date(order.created_at), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(order.id, "accepted")}
                            disabled={order.status !== "pending"}
                          >
                            Accept Order
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(order.id, "completed")}
                            disabled={order.status !== "accepted"}
                          >
                            Mark Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleStatusChange(order.id, "cancelled")}
                            disabled={order.status === "completed" || order.status === "cancelled"}
                          >
                            Cancel Order
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
    </div>
  );
}
