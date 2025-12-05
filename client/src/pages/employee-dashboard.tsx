import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import bgImage from '@assets/Gemini_Generated_Image_mnpedumnpedumnpe_1764676809813.png';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { LogOut, RefreshCw, IndianRupee, User, Car, Phone, Trash2 } from 'lucide-react';

interface SheetCustomer {
  name: string;
  number: string;
  prize: number | null;
  vehicleNumber: string;
  timestamp: string;
  verified?: boolean;
}

interface EmployeeData {
  id: string;
  username: string;
  name: string;
}

export default function EmployeeDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [verifyingVehicles, setVerifyingVehicles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    if (!storedEmployee) {
      setLocation('/employee');
      return;
    }
    setEmployee(JSON.parse(storedEmployee));
  }, [setLocation]);

  const { data: customersData, isLoading, refetch } = useQuery<{ customers: SheetCustomer[] }>({
    queryKey: ['/api/employee/unverified-customers'],
    refetchInterval: 3000,
    enabled: !!employee,
  });

  const verifyMutation = useMutation({
    mutationFn: async (vehicleNumber: string) => {
      const res = await fetch(`/api/employee/verify/${encodeURIComponent(vehicleNumber)}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Verification failed');
      }

      return await res.json();
    },
    onSuccess: (_, vehicleNumber) => {
      setVerifyingVehicles(prev => {
        const newSet = new Set(prev);
        newSet.delete(vehicleNumber);
        return newSet;
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employee/unverified-customers'] });
      toast({
        title: "Customer Verified!",
        description: `Vehicle ${vehicleNumber} has been verified successfully.`,
      });
    },
    onError: (error: Error, vehicleNumber) => {
      setVerifyingVehicles(prev => {
        const newSet = new Set(prev);
        newSet.delete(vehicleNumber);
        return newSet;
      });
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (vehicleNumber: string) => {
      const res = await fetch(`/api/employee/remove/${encodeURIComponent(vehicleNumber)}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Removal failed');
      }

      return await res.json();
    },
    onSuccess: (_, vehicleNumber) => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee/unverified-customers'] });
      toast({
        title: "Customer Removed!",
        description: `Vehicle ${vehicleNumber} has been removed from verification list.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Removal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerify = (vehicleNumber: string, checked: boolean) => {
    if (checked) {
      setVerifyingVehicles(prev => new Set(prev).add(vehicleNumber));
      verifyMutation.mutate(vehicleNumber);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employee');
    setLocation('/employee');
  };

  // Use customers directly from API (already filtered and reversed on backend)
  const unverifiedCustomers = customersData?.customers || [];

  if (!employee) {
    return null;
  }

  return (
    <div 
      className="min-h-screen p-4 md:p-8"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-xl font-bold text-foreground" data-testid="text-dashboard-title">
              Verification Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome, {employee.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Pending Verifications
            </h2>
            <Badge variant="secondary" data-testid="badge-count">
              {unverifiedCustomers.length} pending
            </Badge>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading customers...
            </div>
          ) : unverifiedCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending verifications at the moment.
            </div>
          ) : (
            <div className="space-y-4">
              {unverifiedCustomers.map((customer) => (
                <div
                  key={`${customer.vehicleNumber}-${customer.timestamp}`}
                  className="flex items-center gap-4 p-4 border rounded-lg bg-card/50 hover-elevate"
                  data-testid={`card-customer-${customer.vehicleNumber}`}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={verifyingVehicles.has(customer.vehicleNumber)}
                      onCheckedChange={(checked) => handleVerify(customer.vehicleNumber, checked as boolean)}
                      disabled={verifyingVehicles.has(customer.vehicleNumber)}
                      data-testid={`checkbox-verify-${customer.vehicleNumber}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMutation.mutate(customer.vehicleNumber)}
                      disabled={removeMutation.isPending}
                      className="text-destructive hover:text-destructive"
                      data-testid={`button-remove-${customer.vehicleNumber}`}
                      title="Remove from verification list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <div className="flex items-center gap-1 text-foreground font-medium">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span data-testid={`text-name-${customer.vehicleNumber}`}>
                          {customer.name}
                        </span>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-primary gap-1">
                        <IndianRupee className="w-3 h-3" />
                        <span data-testid={`text-prize-${customer.vehicleNumber}`}>
                          {customer.prize}
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        <span data-testid={`text-vehicle-${customer.vehicleNumber}`}>
                          {customer.vehicleNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span data-testid={`text-phone-${customer.vehicleNumber}`}>
                          {customer.number}
                        </span>
                      </div>
                    </div>
                  </div>

                  {verifyingVehicles.has(customer.vehicleNumber) && (
                    <div className="text-sm text-muted-foreground animate-pulse">
                      Verifying...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          List refreshes automatically every 3 seconds
        </p>
      </div>
    </div>
  );
}
