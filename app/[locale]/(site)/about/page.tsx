import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { seoAlternates, BASE_URL } from '@/lib/seo';
import { FadeInSection } from '@/components/FadeInSection';
import type { Metadata } from 'next';

const FACTORY_PHOTOS = [
  {
    src: '/images/factory/design-engineering.jpg',
    caption: { en: 'Product Design & Engineering', 'zh-TW': '產品設計與開發' },
    desc: {
      en: 'In-house CAD design from customer specifications to production drawings.',
      'zh-TW': '從客戶規格到生產圖面，自有 CAD 設計能量。',
    },
  },
  {
    src: '/images/factory/cnc-machining.jpg',
    caption: { en: 'CNC Precision Machining', 'zh-TW': 'CNC 精密加工' },
    desc: {
      en: 'High-precision turning of brass and aluminum valve components.',
      'zh-TW': '銅與鋁合金氣嘴元件的高精度車削。',
    },
  },
  {
    src: '/images/factory/rubber-vulcanization.jpg',
    caption: { en: 'Rubber Vulcanization Molding', 'zh-TW': '橡膠硫化成型' },
    desc: {
      en: 'EPDM rubber vulcanization press lines for snap-in valve bodies.',
      'zh-TW': 'EPDM 橡膠硫化成型產線，生產 snap-in 氣嘴本體。',
    },
  },
  {
    src: '/images/factory/finishing-station.jpg',
    caption: { en: 'Trimming & Finishing', 'zh-TW': '修邊與後處理' },
    desc: {
      en: 'Post-molding trimming and finishing of vulcanized valve trays.',
      'zh-TW': '硫化成型後的整盤修邊與後處理工站。',
    },
  },
  {
    src: '/images/factory/optical-inspection.jpg',
    caption: { en: 'Optical Measurement Inspection', 'zh-TW': '光學量測檢驗' },
    desc: {
      en: 'Video measuring systems verify dimensional accuracy against drawings.',
      'zh-TW': '光學影像量測儀比對圖面，驗證尺寸精度。',
    },
  },
  {
    src: '/images/factory/production-output.jpg',
    caption: { en: 'Mass Production Output', 'zh-TW': '量產產出' },
    desc: {
      en: 'TR-series snap-in valves coming off the production line.',
      'zh-TW': 'TR 系列 snap-in 氣嘴閥量產出料。',
    },
  },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh-TW';
  return {
    title: isZh ? '關於奕道' : 'About N.S.-LIN',
    description: isZh
      ? '奕道實業 — 超過40年氣嘴閥製造經驗，ISO 9001:2015認證，台南工廠，CNC精密加工、硫化製程、鋁合金陽極處理。'
      : 'N.S.-LIN Industrial — 40+ years of tire valve manufacturing. ISO 9001:2015 certified. CNC precision machining, rubber vulcanization, aluminum anodizing.',
    alternates: seoAlternates('/about', locale),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  const isZh = locale === 'zh-TW';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: isZh ? '關於奕道實業' : 'About N.S.-LIN Industrial',
          url: `${BASE_URL}/${isZh ? 'zh-TW/' : ''}about`,
          mainEntity: {
            '@type': 'Organization',
            name: 'N.S.-LIN Industrial Co., Ltd.',
            foundingDate: '1980',
            numberOfEmployees: { '@type': 'QuantitativeValue', value: '50+' },
          },
        }) }}
      />
    <div className="wabi-ind font-sans">
    <div className="mx-auto max-w-3xl px-6 py-20 leading-[1.8]">
      <FadeInSection delay={0}>
        <h1
          className="mb-10 border-b pb-6 font-serif text-[1.9rem] font-semibold sm:text-3xl"
          style={{ color: 'var(--w-ink)', borderColor: 'var(--w-line)' }}
        >
          {t('title')}
        </h1>
      </FadeInSection>

      {/* Company Overview */}
      <FadeInSection delay={100}>
      <section className="mb-16">
        <p className="text-lg leading-[1.9]" style={{ color: 'var(--w-ink-soft)' }}>
          {isZh
            ? 'N.S.-LIN 奕道實業有限公司成立於台南市安南區，擁有超過四十年的輪胎氣嘴閥研發與製造經驗。我們的產品行銷全球，符合TRA（美國）、ETRTO（歐洲）及JATMA（日本）國際標準，並通過ISO 9001:2015品質管理系統認證。'
            : 'N.S.-LIN Industrial Co., Ltd., headquartered in Tainan, Taiwan, brings over four decades of tire valve R&D and manufacturing expertise. Our products serve global markets and comply with TRA (US), ETRTO (EU), and JATMA (Japan) international standards, backed by ISO 9001:2015 quality management certification.'}
        </p>
      </section>
      </FadeInSection>

      {/* Certifications */}
      <FadeInSection delay={200}>
      <section className="mb-16">
        <h2 className="mb-6 font-serif text-xl font-semibold" style={{ color: 'var(--w-ink)' }}>{t('certifications')}</h2>
        <div className="grid gap-px overflow-hidden rounded-lg border sm:grid-cols-3" style={{ borderColor: 'var(--w-line)' }}>
          {[
            { name: 'ISO 9001:2015', desc: isZh ? '品質管理系統' : 'Quality Management System' },
            { name: 'AFAQ 9001', desc: isZh ? '法國品質認證' : 'French Quality Certification' },
            { name: 'DUNS Certified', desc: isZh ? '鄧白氏認證' : 'Dun & Bradstreet Certified' },
          ].map((cert, i) => (
            <FadeInSection key={cert.name} delay={(i % 3) * 100} className="grid">
            <div className="p-5" style={{ backgroundColor: 'var(--w-surface)' }}>
              <div className="font-serif font-semibold" style={{ color: 'var(--w-accent)' }}>{cert.name}</div>
              <div className="mt-1 text-sm" style={{ color: 'var(--w-muted)' }}>{cert.desc}</div>
            </div>
            </FadeInSection>
          ))}
        </div>
      </section>
      </FadeInSection>

      {/* Manufacturing Capabilities */}
      <FadeInSection delay={300}>
      <section className="mb-16">
        <h2 className="mb-6 font-serif text-xl font-semibold" style={{ color: 'var(--w-ink)' }}>{t('capabilities')}</h2>
        <div className="grid gap-px overflow-hidden rounded-lg border sm:grid-cols-2" style={{ borderColor: 'var(--w-line)' }}>
          {[
            { title: isZh ? 'CNC 精密加工' : 'CNC Precision Machining', desc: isZh ? '高精度數控加工，確保每一個氣嘴閥的尺寸精準。' : 'High-precision CNC machining ensures dimensional accuracy for every valve.' },
            { title: isZh ? '橡膠硫化製程' : 'Rubber Vulcanization', desc: isZh ? 'EPDM 橡膠硫化成型，Shore A 70±5 硬度控制。' : 'EPDM rubber vulcanization molding with Shore A 70+/-5 hardness control.' },
            { title: isZh ? '鋁合金陽極處理' : 'Aluminum Anodizing', desc: isZh ? '多色陽極處理，兼顧美觀與防腐蝕。' : 'Multi-color anodizing for aesthetics and corrosion resistance.' },
            { title: isZh ? 'OEM/ODM 客製' : 'OEM/ODM Custom Design', desc: isZh ? '依客戶規格設計製造，從打樣到量產。' : 'Design and manufacture to customer specifications, from prototype to mass production.' },
          ].map((cap, i) => (
            <FadeInSection key={cap.title} delay={(i % 3) * 100} className="grid">
            <div className="p-5" style={{ backgroundColor: 'var(--w-surface)' }}>
              <div className="font-semibold" style={{ color: 'var(--w-ink)' }}>{cap.title}</div>
              <div className="mt-1 text-sm" style={{ color: 'var(--w-ink-soft)' }}>{cap.desc}</div>
            </div>
            </FadeInSection>
          ))}
        </div>
      </section>
      </FadeInSection>

      {/* Factory & Process */}
      <FadeInSection delay={400}>
      <section className="mb-16">
        <h2 className="mb-2 font-serif text-xl font-semibold" style={{ color: 'var(--w-ink)' }}>
          {isZh ? '工廠與製程' : 'Inside Our Factory'}
        </h2>
        <p className="mb-6" style={{ color: 'var(--w-muted)' }}>
          {isZh
            ? '台南自有工廠，從設計、加工、成型到檢驗一站完成。'
            : 'Our own factory in Tainan, Taiwan — design, machining, molding, and inspection under one roof.'}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FACTORY_PHOTOS.map((photo, i) => (
            <FadeInSection key={photo.src} delay={(i % 3) * 100} className="grid">
            <figure className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--w-line)', backgroundColor: 'var(--w-surface)' }}>
              <Image
                src={photo.src}
                alt={isZh ? photo.caption['zh-TW'] : photo.caption.en}
                width={800}
                height={600}
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="p-3">
                <div className="text-sm font-semibold" style={{ color: 'var(--w-ink)' }}>
                  {isZh ? photo.caption['zh-TW'] : photo.caption.en}
                </div>
                <div className="mt-0.5 text-xs" style={{ color: 'var(--w-muted)' }}>
                  {isZh ? photo.desc['zh-TW'] : photo.desc.en}
                </div>
              </figcaption>
            </figure>
            </FadeInSection>
          ))}
        </div>
      </section>
      </FadeInSection>

      {/* Contact Info */}
      <FadeInSection delay={500}>
      <section className="rounded-lg border-l-2 py-1 pl-6" style={{ borderColor: 'var(--w-accent-line)' }}>
        <h2 className="mb-4 mt-5 font-serif text-lg font-semibold" style={{ color: 'var(--w-accent)' }}>
          {isZh ? '聯繫資訊' : 'Contact Information'}
        </h2>
        <div className="mb-5 space-y-2" style={{ color: 'var(--w-ink-soft)' }}>
          <p><strong style={{ color: 'var(--w-ink)' }}>{isZh ? '地址' : 'Address'}:</strong> NO.65, Sec.4, Changhe Rd., Annan Dist., Tainan City 709-47, Taiwan</p>
          <p><strong style={{ color: 'var(--w-ink)' }}>{isZh ? '電話' : 'Phone'}:</strong> +886-6-256-2097</p>
          <p><strong style={{ color: 'var(--w-ink)' }}>{isZh ? '傳真' : 'Fax'}:</strong> +886-6-256-2075</p>
          <p><strong style={{ color: 'var(--w-ink)' }}>Email:</strong> nslin@nslin.com.tw</p>
        </div>
      </section>
      </FadeInSection>
    </div>
    </div>
    </>
  );
}
