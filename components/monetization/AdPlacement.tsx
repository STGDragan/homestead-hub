
import React, { useEffect, useState } from 'react';
import { adNetwork } from '../../services/adNetwork';
import { AdCampaign, AdCreative } from '../../types';
import { BannerAd, SponsorBlock, ProductTile, SeasonalPanel } from '../campaigns/CampaignVisuals';

interface AdPlacementProps {
  placementId: string;
  className?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({ placementId, className = '' }) => {
  const [ad, setAd] = useState<{ campaign: AdCampaign, creative: AdCreative } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 1. Fetch Ad
    adNetwork.getAdForPlacement(placementId).then(setAd);
  }, [placementId]);

  useEffect(() => {
    // 2. Log Impression when visible (simple version)
    if (ad && !visible) {
        adNetwork.logImpression(ad.campaign.id, ad.creative.id, placementId);
        setVisible(true);
    }
  }, [ad]);

  const handleClick = (e: React.MouseEvent) => {
      if (!ad) return;
      e.preventDefault();
      adNetwork.logClick(ad.campaign.id, ad.creative.id, placementId, ad.creative.clickUrl);
  };

  if (!ad) return null; // Collapse if no ad

  // Render correct visual based on Campaign Type
  switch (ad.campaign.type) {
      case 'banner':
          return <BannerAd campaign={ad.campaign} creative={ad.creative} onClick={handleClick} className={className} />;
      case 'sponsor_block':
          return <SponsorBlock campaign={ad.campaign} creative={ad.creative} onClick={handleClick} className={className} />;
      case 'product_tile':
          return <ProductTile campaign={ad.campaign} creative={ad.creative} onClick={handleClick} className={className} />;
      case 'seasonal_panel':
          return <SeasonalPanel campaign={ad.campaign} creative={ad.creative} onClick={handleClick} className={className} />;
      default:
          return <ProductTile campaign={ad.campaign} creative={ad.creative} onClick={handleClick} className={className} />;
  }
};
