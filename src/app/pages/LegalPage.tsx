import { Link } from 'react-router';

interface LegalSection {
  heading: string;
  paragraphs: string[];
}

interface LegalPageProps {
  title: string;
  description: string;
  sections: LegalSection[];
  ctaLabel?: string;
  ctaTo?: string;
}

export function LegalPage({ title, description, sections, ctaLabel, ctaTo }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{title}</h1>
          <p className="text-lg text-gray-600">{description}</p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-3 text-2xl font-bold text-gray-900">{section.heading}</h2>
                <div className="space-y-3">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="leading-relaxed text-gray-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {ctaLabel && ctaTo && (
            <Link
              to={ctaTo}
              className="mt-10 inline-flex rounded-xl bg-orange-500 px-6 py-3 text-white transition hover:bg-orange-600"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
