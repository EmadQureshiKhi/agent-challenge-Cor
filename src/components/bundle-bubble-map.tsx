'use client';

import { useEffect, useRef, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import { BundleDetails } from '@/types/bundle';

interface BundleBubbleMapProps {
  bundles: Record<string, BundleDetails>;
  mintAddress: string;
  ticker: string;
}

export function BundleBubbleMap({ bundles, mintAddress, ticker }: BundleBubbleMapProps) {
  const bubbleMapRef = useRef<HTMLIFrameElement>(null);
  const trenchbotRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bubbleMapAvailable, setBubbleMapAvailable] = useState(false);
  const [trenchbotAvailable, setTrenchbotAvailable] = useState(false);
  const [activeIframe, setActiveIframe] = useState<'bubblemap' | 'trenchbot' | null>(null);
  const [trenchbotAttempted, setTrenchbotAttempted] = useState(false);

  useEffect(() => {
    // Check if the bubble map is available for this token
    const checkBubbleMapAvailability = async () => {
      try {
        const response = await fetch(`https://api-legacy.bubblemaps.io/map-availability?chain=sol&token=${mintAddress}`);
        const data = await response.json();
        
        if (data.status === "OK" && data.availability === true) {
          setBubbleMapAvailable(true);
          setActiveIframe('bubblemap');
        } else {
          // If BubbleMap is not available, try Trenchbot
          setTrenchbotAvailable(true);
          setActiveIframe('trenchbot');
          setTrenchbotAttempted(true);
        }
      } catch (error) {
        console.error("Failed to check bubble map availability:", error);
        // If BubbleMap check fails, try Trenchbot
        setTrenchbotAvailable(true);
        setActiveIframe('trenchbot');
        setTrenchbotAttempted(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkBubbleMapAvailability();
  }, [mintAddress]);

  const handleBubbleMapLoad = () => {
    setIsLoading(false);
  };

  const handleBubbleMapError = () => {
    console.log("BubbleMap iframe failed to load, switching to Trenchbot");
    setBubbleMapAvailable(false);
    setTrenchbotAvailable(true);
    setActiveIframe('trenchbot');
    setTrenchbotAttempted(true);
  };

  const handleTrenchbotLoad = () => {
    setIsLoading(false);
  };

  const handleTrenchbotError = () => {
    console.log("Trenchbot iframe failed to load");
    setTrenchbotAvailable(false);
    setActiveIframe(null);
  };

  // Use onLoad and onError for iframes instead of event listeners
  // This is more reliable for cross-origin iframes
  
  // Calculate total tokens and total wallets for sizing context
  const totalTokens = Object.values(bundles).reduce(
    (sum, bundle) => sum + bundle.total_tokens,
    0
  );

  // Prepare data for visualization
  const bundleEntries = Object.entries(bundles)
    .sort((a, b) => b[1].total_tokens - a[1].total_tokens)
    .slice(0, 10); // Limit to top 10 bundles for better visualization

  // Use a different URL format for Trenchbot that's more reliable
  const trenchbotUrl = `https://trench.bot/bundles/${mintAddress}?all=true`;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="text-lg font-medium">Bundle Distribution</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && (
          <div className="flex h-[300px] w-full items-center justify-center">
            <Skeleton className="h-[250px] w-[90%]" />
          </div>
        )}
        
        {/* BubbleMap iframe */}
        {bubbleMapAvailable && activeIframe === 'bubblemap' && (
          <div className={isLoading ? 'hidden' : 'block'}>
            <iframe
              ref={bubbleMapRef}
              src={`https://app.bubblemaps.io/sol/token/${mintAddress}?prevent_scroll_zoom&small_text&hide_context`}
              width="100%"
              height="500px"
              frameBorder="0"
              scrolling="no"
              title={`${ticker} Bundle Bubble Map`}
              className="w-full"
              onLoad={handleBubbleMapLoad}
              onError={handleBubbleMapError}
            />
          </div>
        )}

        {/* Trenchbot iframe - using direct link to bundle page instead of embed */}
        {trenchbotAvailable && activeIframe === 'trenchbot' && (
          <div className={isLoading ? 'hidden' : 'block'}>
            <iframe
              ref={trenchbotRef}
              src={trenchbotUrl}
              width="100%"
              height="500px"
              frameBorder="0"
              scrolling="no"
              title={`${ticker} Bundle Visualization`}
              className="w-full"
              onLoad={handleTrenchbotLoad}
              onError={handleTrenchbotError}
            />
          </div>
        )}

        {/* Fallback visualization if both iframes fail or when waiting for iframe to load */}
        {(!activeIframe || (trenchbotAttempted && !trenchbotAvailable && !bubbleMapAvailable)) && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {bundleEntries.map(([address, bundle], index) => {
                const percentage = (bundle.total_tokens / totalTokens) * 100;
                const size = Math.max(40, Math.min(100, percentage * 2));
                
                return (
                  <div key={address} className="flex flex-col items-center">
                    <div 
                      className="flex items-center justify-center rounded-full bg-primary/10 text-xs font-medium"
                      style={{ 
                        width: `${size}px`, 
                        height: `${size}px`,
                      }}
                    >
                      {bundle.token_percentage.toFixed(1)}%
                    </div>
                    <div className="mt-2 text-center text-xs">
                      <p className="font-medium">{formatNumber(bundle.total_tokens)} tokens</p>
                      <p className="text-muted-foreground">{bundle.unique_wallets} wallets</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}