import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function StockAnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stock Analysis</h1>
        <p className="text-muted-foreground">Deep dive into individual stocks with advanced analytics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Analysis Tool</CardTitle>
          <CardDescription>Search for any stock to view detailed analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Search and analysis features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
