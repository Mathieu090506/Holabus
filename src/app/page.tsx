import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import TripSearchHeader from '@/components/trip-search-header';
import TripSearchResults from '@/components/trip-search-results';
import TetLanding from '@/components/tet-landing';
import FaqSection from '@/components/faq-section';
import TestimonialsSection from '@/components/testimonials-section';
import SiteFooter from '@/components/site-footer';
// import AnalyticsTracker from '@/components/analytics-tracker';
import { SearchProvider } from '@/components/search-provider';

export default async function Home() {
  const supabase = await createClient();

  // 1. Lấy thông tin User
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Fetch Trips
  const { data: trips, error } = await supabase
    .from('trips')
    .select('*')
    .order('departure_time', { ascending: true });

  // 3. Fetch Site Config
  const { data: configData } = await supabase.from('site_config').select('*');
  const config: Record<string, string> = {};
  if (configData) {
    configData.forEach((item: any) => {
      config[item.key] = item.value;
    });
  }

  // Parse JSON configs safely
  const destinationImagesStr = config['destination_images_json'];
  let destinationImages = {};
  try {
    if (destinationImagesStr) {
      destinationImages = JSON.parse(destinationImagesStr);
    }
  } catch (e) {
    console.error("Error parsing destination_images_json", e);
  }

  const faqsStr = config['faqs_json'];
  let faqs = undefined;
  try {
    if (faqsStr) {
      faqs = JSON.parse(faqsStr);
    }
  } catch (e) {
    console.error("Error parsing faqs_json", e);
  }

  if (error) {
    console.error("Lỗi tải dữ liệu:", error);
  }

  return (
    <main>
      {/* AnalyticsTracker Removed */}

      <SearchProvider>
        {/* 3. TRIP SEARCH HEADER - Rendered immediately for fast LCP & Visual Stability */}
        {/* Contains the Hero Slider & Search Widget overlapping it */}
        <TripSearchHeader trips={trips || []} />

        {/* 4. TRIP RESULTS - Fetched Data */}
        <Suspense fallback={
          <div className="min-h-screen bg-[#FFFBE6] pb-20 font-sans">
            {/* Trip List Skeleton */}
            <div className="max-w-[1280px] mx-auto px-4 mt-24">
              <div className="w-48 h-10 bg-red-100/50 rounded-lg mb-8 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[400px] bg-white rounded-2xl border-2 border-yellow-100 shadow-sm animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        }>
          <TripSearchResults
            trips={trips || []}
            destinationImages={destinationImages}
          />
        </Suspense>
      </SearchProvider>

      {/* 5. FAQ SECTION */}
      <FaqSection faqs={faqs} />

      <TestimonialsSection />

      {/* 6. LANDING PAGE & ANIMATION */}
      <TetLanding
        year={config['landing_year']}
        greeting={config['landing_greeting']}
        subtext={config['landing_subtext']}
      />

      <SiteFooter />
    </main>
  );
}
