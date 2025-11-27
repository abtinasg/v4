import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Watchlist</h1>
        <p className="text-muted-foreground">Track your favorite stocks and monitor real-time changes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Watchlist</CardTitle>
          <CardDescription>Stocks you're tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Your watchlist is empty. Add stocks to start tracking.</p>
        </CardContent>
      </Card>
    </div>
  )
}
