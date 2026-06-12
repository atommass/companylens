import { Header } from '@/components/header';
import { HeroSection } from '@/components/hero-section';
import { MissionSection } from '@/components/mission-section';
import { FeaturesSection } from '@/components/features-section';
import { SupportSection } from '@/components/support-section';
import { FooterSection } from '@/components/footer-section';
import { CmsSection, fetchHomePageContent } from '@/lib/content';

function sectionByType(sections: CmsSection[], type: string) {
  return sections.find((section) => section.type === type);
}

function sectionText(section: CmsSection | undefined, key: string) {
  const value = section?.content?.[key];
  return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

export default async function Home() {
  const page = await fetchHomePageContent();
  const sections = page?.sections ?? [];
  const heroSection = sectionByType(sections, 'hero');
  const missionSection = sectionByType(sections, 'mission');
  const featuresSection = sectionByType(sections, 'features');
  const supportSection = sectionByType(sections, 'support');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection
          title={sectionText(heroSection, 'title')}
          description={sectionText(heroSection, 'description') ?? page?.excerpt ?? undefined}
        />
        <MissionSection
          title={sectionText(missionSection, 'title')}
          paragraphOne={sectionText(missionSection, 'paragraph_one')}
          paragraphTwo={sectionText(missionSection, 'paragraph_two')}
        />
        <FeaturesSection
          title={sectionText(featuresSection, 'title')}
          subtitle={sectionText(featuresSection, 'subtitle')}
        />
        <SupportSection
          title={sectionText(supportSection, 'title')}
          subtitle={sectionText(supportSection, 'subtitle')}
        />
      </main>
      <FooterSection />
    </div>
  );
}
