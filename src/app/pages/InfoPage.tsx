import { Link } from 'react-router';

interface InfoPageProps {
  title: string;
  description: string;
  bodyTitle: string;
  body: string;
  ctaLabel?: string;
  ctaTo?: string;
}

export function InfoPage({ title, description, bodyTitle, body, ctaLabel, ctaTo }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{title}</h1>
          <p className="text-lg text-gray-600">{description}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{bodyTitle}</h2>
          <p className="text-gray-600 leading-relaxed">{body}</p>

          {ctaLabel && ctaTo && (
            <Link
              to={ctaTo}
              className="inline-flex mt-8 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
