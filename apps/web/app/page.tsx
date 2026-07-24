import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { CategoriesSection } from '@/components/landing/CategoriesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FeaturedListings } from '@/components/landing/FeaturedListings';
import { StatsSection } from '@/components/landing/StatsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { AiChatBot } from '@/components/landing/AiChatBot';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FleetNest — Every Journey Starts Here',
  description: "Africa's premier transportation marketplace. Book car rentals, buses, drivers, mechanics, and more.",
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-mesh">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <HowItWorksSection />
      <FeaturedListings />
      <StatsSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
      <AiChatBot />
    </main>
  );
}
