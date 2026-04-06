import { HeroSection } from '@/components/blocks/hero-section-1';
import { FeaturesSection } from '@/components/blocks/features-section';
import { TemplatesShowcaseSection } from '@/components/blocks/templates-showcase-section';
import { HowItWorksSection } from '@/components/blocks/how-it-works-section';
import { HomePricingSection } from '@/components/blocks/home-pricing-section';
import { HomeFaqSection } from '@/components/blocks/home-faq-section';
import { TrustedBySection } from '@/components/blocks/trusted-by-section';
import { SiteFooter } from '@/components/layout/site-footer';
import { HomeFaqJsonLd } from '@/components/seo/home-faq-json-ld';

export default function HomePage() {
    return (
        <div className="bg-background min-h-screen">
            <HomeFaqJsonLd />
            <HeroSection />
            <TrustedBySection />
            <FeaturesSection />
            <TemplatesShowcaseSection />
            <HowItWorksSection />
            <HomePricingSection />
            <HomeFaqSection />
            <SiteFooter />
        </div>
    );
}
