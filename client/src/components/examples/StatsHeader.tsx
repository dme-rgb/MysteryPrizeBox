import StatsHeader from '../StatsHeader';

export default function StatsHeaderExample() {
  return (
    <div className="min-h-screen bg-background">
      <StatsHeader totalWinners={42} />
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-muted-foreground">Rest of the page content...</p>
      </div>
    </div>
  );
}
