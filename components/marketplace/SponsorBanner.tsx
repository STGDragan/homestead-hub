
import React from 'react';
import { AdPlacement } from '../monetization/AdPlacement';
import { SponsorBanner as LegacySponsorType } from '../../types';

interface SponsorBannerProps {
  sponsor?: LegacySponsorType; // kept for legacy compat if needed, but we prefer AdPlacement
}

export const SponsorBanner: React.FC<SponsorBannerProps> = () => {
  return (
    <AdPlacement placementId="dashboard_main" />
  );
};
