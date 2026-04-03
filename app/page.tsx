import { HeroSection } from '@/components/blocks/hero-section-1';
import { FeaturesSection } from '@/components/blocks/features-section';
import { HowItWorksSection } from '@/components/blocks/how-it-works-section';
import { HomePricingSection } from '@/components/blocks/home-pricing-section';
import { TrustedBySection } from '@/components/blocks/trusted-by-section';
import { SiteFooter } from '@/components/layout/site-footer';

export const dynamic = 'force-dynamic';

export default function HomePage() {
    return (
        <div className="bg-background min-h-screen">
            <HeroSection />
            <TrustedBySection />
            <FeaturesSection />
            <HowItWorksSection />
            <HomePricingSection />
            <SiteFooter />
        </div>
    );
}
