'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, Loader2, CheckCircle, XCircle, Link2, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { SUPPORTED_BROKERS } from '@/lib/broker-sync/config';

interface CSVImportProps {
  portfolioId: string;
  onImportSuccess?: () => void;
}

export function CSVImport({ portfolioId, onImportSuccess }: CSVImportProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [clearExisting, setClearExisting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported?: number;
    failed?: number;
    errors?: string[];
  } | null>(null);

  const downloadTemplate = () => {
    const template = `symbol,quantity,avgBuyPrice,purchaseDate
AAPL,10,150.50,2024-01-15
GOOGL,5,2800.00,2024-02-20
TSLA,15,200.00,2024-03-10`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        
        headers.forEach((header, index) => {
          if (header === 'quantity' || header === 'avgBuyPrice') {
            row[header] = parseFloat(values[index]);
          } else {
            row[header] = values[index];
          }
        });
        
        return row;
      });

      // Send to API
      const response = await fetch(`/api/portfolio/${portfolioId}/import-csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, clearExisting }),
      });

      const result = await response.json();
      setResult(result);

      if (result.success && onImportSuccess) {
        setTimeout(() => {
          onImportSuccess();
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        errors: [error instanceof Error ? error.message : 'Failed to process CSV'],
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import from CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file to import your portfolio holdings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium">CSV Template</p>
                <p className="text-sm text-muted-foreground">
                  Download template to see required format
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Clear Existing Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="clear-existing" className="cursor-pointer">
                Clear existing holdings
              </Label>
              <p className="text-sm text-muted-foreground">
                Remove all current holdings before importing
              </p>
            </div>
            <Switch
              id="clear-existing"
              checked={clearExisting}
              onCheckedChange={setClearExisting}
            />
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              {isUploading ? (
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              )}
              <p className="text-lg font-medium mb-2">
                {isUploading ? 'Importing...' : 'Click to upload CSV file'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports: symbol, quantity, avgBuyPrice, purchaseDate
              </p>
            </label>
          </div>

          {/* Result */}
          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <AlertDescription>
                {result.success ? (
                  <div>
                    <p className="font-medium mb-1">Import Successful!</p>
                    <p className="text-sm">
                      Imported: {result.imported} | Failed: {result.failed || 0}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium mb-1">Import Failed</p>
                    {result.errors?.map((error, i) => (
                      <p key={i} className="text-sm">{error}</p>
                    ))}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Broker Sync Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Connect Brokerage
          </CardTitle>
          <CardDescription>
            Sync your holdings automatically from your brokerage account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrokerSync portfolioId={portfolioId} onSyncSuccess={onImportSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}

// Broker Sync Component
function BrokerSync({ 
  portfolioId, 
  onSyncSuccess 
}: { 
  portfolioId: string; 
  onSyncSuccess?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [connectingBroker, setConnectingBroker] = useState<string | null>(null);
  const [plaidConfigured, setPlaidConfigured] = useState<boolean | null>(null);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message?: string;
    imported?: number;
  } | null>(null);

  // Check if Plaid is configured
  useEffect(() => {
    const checkPlaidConfig = async () => {
      try {
        const res = await fetch('/api/portfolio/broker/link-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portfolioId }),
        });
        const data = await res.json();
        setPlaidConfigured(data.configured !== false);
      } catch {
        setPlaidConfigured(false);
      }
    };
    checkPlaidConfig();
  }, [portfolioId]);

  const handleConnectBroker = async (brokerId: string) => {
    setConnectingBroker(brokerId);
    setIsLoading(true);
    setSyncResult(null);

    try {
      // Get link token
      const linkRes = await fetch('/api/portfolio/broker/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioId }),
      });
      const linkData = await linkRes.json();

      if (!linkData.success || !linkData.linkToken) {
        throw new Error(linkData.error || 'Failed to initialize connection');
      }

      // For now, show a message that Plaid Link would open
      // In production, you'd integrate @plaid/link
      setSyncResult({
        success: false,
        message: 'Plaid Link integration requires the @plaid/react-plaid-link package. Add it with: npm install react-plaid-link',
      });

      /*
      // Real Plaid integration would look like:
      const { open, ready } = usePlaidLink({
        token: linkData.linkToken,
        onSuccess: async (public_token, metadata) => {
          const exchangeRes = await fetch('/api/portfolio/broker/exchange-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              publicToken: public_token,
              portfolioId,
              institutionName: metadata.institution?.name,
            }),
          });
          const exchangeData = await exchangeRes.json();
          if (exchangeData.success) {
            setSyncResult(exchangeData);
            onSyncSuccess?.();
          }
        },
      });
      if (ready) open();
      */

    } catch (error) {
      setSyncResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect broker',
      });
    } finally {
      setIsLoading(false);
      setConnectingBroker(null);
    }
  };

  if (plaidConfigured === false) {
    return (
      <div className="text-center py-8">
        <Link2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-2">Broker sync not configured</p>
        <p className="text-sm text-muted-foreground">
          Add PLAID_CLIENT_ID and PLAID_SECRET to enable broker connections
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {syncResult && (
        <Alert variant={syncResult.success ? 'default' : 'destructive'}>
          {syncResult.success ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <AlertDescription>
            {syncResult.message}
            {syncResult.imported && (
              <span className="block mt-1">
                Imported {syncResult.imported} holdings
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SUPPORTED_BROKERS.slice(0, 8).map((broker) => (
          <Button 
            key={broker.id} 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors"
            onClick={() => handleConnectBroker(broker.id)}
            disabled={isLoading}
          >
            {connectingBroker === broker.id ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span className="text-2xl">{broker.logo}</span>
                <span className="text-xs font-medium">{broker.name}</span>
              </>
            )}
          </Button>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Secure connection powered by Plaid. Your credentials are never stored.
      </p>
    </div>
  );
}
