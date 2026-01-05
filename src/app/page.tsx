import { createClient } from '@/utils/supabase/server';
import TripSearchSection from '@/components/trip-search-section';
import TetLanding from '@/components/tet-landing';
import FaqSection from '@/components/faq-section';
import TestimonialsSection from '@/components/testimonials-section';
import SiteFooter from '@/components/site-footer';
import AnalyticsTracker from '@/components/analytics-tracker';
// Lưu ý: AuthButton thường nằm ở Navbar (layout.tsx), 
// nhưng nếu bạn muốn đặt ở đâu đó trong body thì cứ import lại.

export default async function Home() {
  const supabase = await createClient();

  // 1. Lấy thông tin User (GIỮ NGUYÊN TÍNH NĂNG CŨ)
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Fetch Trips (GIỮ NGUYÊN TÍNH NĂNG CŨ)
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
  let destinationImagesStr = config['destination_images_json'];
  let destinationImages = {};
  try {
    if (destinationImagesStr) {
      destinationImages = JSON.parse(destinationImagesStr);
    }
  } catch (e) {
    console.error("Error parsing destination_images_json", e);
  }

  let faqsStr = config['faqs_json'];
  let faqs = undefined; // Let component use default if undefined
  try {
    if (faqsStr) {
      faqs = JSON.parse(faqsStr);
    }
  } catch (e) {
    console.error("Error parsing faqs_json", e);
  }


  // Xử lý lỗi đơn giản nếu fetch thất bại
  if (error) {
    console.error("Lỗi tải dữ liệu:", error);
  }

  return (
    <main>
      <AnalyticsTracker />
      {/* 3. HIỂN THỊ GIAO DIỆN MỚI 
        Chúng ta truyền cả 'trips' và 'user' xuống component con.
        Component con sẽ lo việc hiển thị Banner, Tìm kiếm, và Chào user.
      */}
      <TripSearchSection
        trips={trips || []}
        user={user}
        destinationImages={destinationImages}
      />

      {/* 4. FAQ SECTION */}
      <FaqSection faqs={faqs} />

      <TestimonialsSection />

      {/* 5. LANDING PAGE & ANIMATION */}
      <TetLanding
        year={config['landing_year']}
        greeting={config['landing_greeting']}
        subtext={config['landing_subtext']}
      />

      <SiteFooter />
    </main>
  );
}