import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import EmployeeLogin from "@/pages/employee-login";
import EmployeeDashboard from "@/pages/employee-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/employee" component={EmployeeLogin} />
      <Route path="/employee/dashboard" component={EmployeeDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

<button
  onClick={() => {
    throw new Error("Sentry client test error");
  }}
>
  Test Sentry
</button>

export default App;
