import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import bgImage from '@assets/Gemini_Generated_Image_mnpedumnpedumnpe_1764676809813.png';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { LogOut, RefreshCw, IndianRupee, User, Car, Phone, Trash2, CheckCircle } from 'lucide-react';

interface SheetCustomer {
  name: string;
  number: string;
  prize: number | null;
  vehicleNumber: string;
  timestamp: string;
  verified?: boolean;
  amount?: number | null;
  verifiedBy?: string;
  verificationTimestamp?: string;
  vpa?: string;
  vpaAccountHolderName?: string;
  beneficiaryName?: string;
  transactionTimestamp?: string;
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
  const [amountInputs, setAmountInputs] = useState<Record<string, string>>({});

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

  const { data: verifiedData, isLoading: verifiedLoading } = useQuery<{ customers: SheetCustomer[] }>({
    queryKey: ['/api/employee/verified-customers'],
    refetchInterval: 5000,
    enabled: !!employee,
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ vehicleNumber, amount }: { vehicleNumber: string; amount: string }) => {
      const res = await fetch(`/api/employee/verify/${encodeURIComponent(vehicleNumber)}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: amount ? parseInt(amount) : undefined,
          verifierName: employee?.name,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Verification failed');
      }

      return await res.json();
    },
    onSuccess: (_, variables) => {
      setVerifyingVehicles(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.vehicleNumber);
        return newSet;
      });
      setAmountInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[variables.vehicleNumber];
        return newInputs;
      });
      queryClient.invalidateQueries({ queryKey: ['/api/employee/unverified-customers'] });
      toast({
        title: "Customer Verified!",
        description: `Vehicle ${variables.vehicleNumber} has been verified successfully.`,
      });
    },
    onError: (error: Error, variables) => {
      setVerifyingVehicles(prev => {
        const newSet = new Set(prev);
        newSet.delete(variables.vehicleNumber);
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
      const amount = amountInputs[vehicleNumber] || '';
      if (!amount.trim()) {
        toast({
          title: "Amount Required",
          description: "Please enter an amount before verifying.",
          variant: "destructive",
        });
        return;
      }
      setVerifyingVehicles(prev => new Set(prev).add(vehicleNumber));
      verifyMutation.mutate({ vehicleNumber, amount });
    }
  };

  const handleAmountChange = (vehicleNumber: string, value: string) => {
    setAmountInputs(prev => ({ ...prev, [vehicleNumber]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem('employee');
    setLocation('/employee');
  };

  const unverifiedCustomers = customersData?.customers || [];
  const verifiedCustomers = verifiedData?.customers || [];

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
      <div className="max-w-6xl mx-auto space-y-6">
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
              onClick={() => { refetch(); }}
              disabled={isLoading || verifiedLoading}
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading || verifiedLoading ? 'animate-spin' : ''}`} />
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

        <Tabs defaultValue="unverified" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unverified" className="gap-2">
              Pending ({unverifiedCustomers.length})
            </TabsTrigger>
            <TabsTrigger value="verified" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Verified ({verifiedCustomers.length})
            </TabsTrigger>
          </TabsList>

          {/* Unverified Tab */}
          <TabsContent value="unverified" className="space-y-4">
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
                        <div className="flex flex-wrap items-center gap-2 mb-2">
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

                        <div className="mb-3">
                          <label className="text-xs text-muted-foreground block mb-1">
                            Verification Amount (₹) - For Recording
                          </label>
                          <Input
                            type="number"
                            placeholder="Enter amount from box"
                            value={amountInputs[customer.vehicleNumber] || ''}
                            onChange={(e) => handleAmountChange(customer.vehicleNumber, e.target.value)}
                            disabled={verifyingVehicles.has(customer.vehicleNumber)}
                            data-testid={`input-amount-${customer.vehicleNumber}`}
                            className="h-8 text-sm"
                          />
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
          </TabsContent>

          {/* Verified Tab */}
          <TabsContent value="verified" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Today's Verified Customers
                </h2>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                  {verifiedCustomers.length} verified
                </Badge>
              </div>

              {verifiedLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading verified customers...
                </div>
              ) : verifiedCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No verified customers yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {verifiedCustomers.map((customer) => (
                    <div
                      key={`${customer.vehicleNumber}-verified-${customer.verificationTimestamp}`}
                      className="flex items-center gap-4 p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                      data-testid={`card-verified-${customer.vehicleNumber}`}
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 text-foreground font-medium">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span data-testid={`text-verified-name-${customer.vehicleNumber}`}>
                              {customer.name}
                            </span>
                          </div>
                          <Badge className="bg-green-600 text-white gap-1">
                            <IndianRupee className="w-3 h-3" />
                            <span data-testid={`text-verified-prize-${customer.vehicleNumber}`}>
                              {customer.prize}
                            </span>
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Car className="w-3 h-3" />
                            <span>{customer.vehicleNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{customer.number}</span>
                          </div>
                          {customer.verifiedBy && (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs">
                              Verified by: <span className="font-medium">{customer.verifiedBy}</span>
                            </div>
                          )}
                          {customer.vpa && (
                            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded border border-blue-200 dark:border-blue-800 space-y-1">
                              <div className="font-medium text-blue-900 dark:text-blue-100">VPA Details:</div>
                              <div className="text-xs text-muted-foreground">
                                <div className="flex gap-2">
                                  <span className="font-medium">VPA:</span>
                                  <span data-testid={`text-vpa-${customer.vehicleNumber}`}>{customer.vpa}</span>
                                </div>
                              </div>
                              {customer.vpaAccountHolderName && (
                                <div className="text-xs text-muted-foreground">
                                  <div className="flex gap-2">
                                    <span className="font-medium">Account Holder:</span>
                                    <span data-testid={`text-vpa-holder-${customer.vehicleNumber}`}>{customer.vpaAccountHolderName}</span>
                                  </div>
                                </div>
                              )}
                              {customer.beneficiaryName && (
                                <div className="text-xs text-muted-foreground">
                                  <div className="flex gap-2">
                                    <span className="font-medium">Beneficiary:</span>
                                    <span data-testid={`text-beneficiary-${customer.vehicleNumber}`}>{customer.beneficiaryName}</span>
                                  </div>
                                </div>
                              )}
                              {customer.transactionTimestamp && (
                                <div className="text-xs text-muted-foreground">
                                  <div className="flex gap-2">
                                    <span className="font-medium">Timestamp:</span>
                                    <span data-testid={`text-txn-timestamp-${customer.vehicleNumber}`}>{new Date(customer.transactionTimestamp).toLocaleString()}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-sm text-muted-foreground">
          List refreshes automatically
        </p>
      </div>
    </div>
  );
}
