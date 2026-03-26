import { Link } from 'react-router';

const faqItems = [
  {
    question: 'What services does Oil Mart Pro provide?',
    answer:
      'Oil Mart Pro supports three main operations: SELLS for direct equipment purchase, LEASE for project-based equipment access, and BUY FOR ME for procurement support where our team sources equipment on your behalf.',
  },
  {
    question: 'How do I request a quote?',
    answer:
      'You can request a quote from product pages, the contact page, or through checkout-related flows. Quote requests are reviewed in the admin panel before approval, acceptance, or follow-up.',
  },
  {
    question: 'Can I lease equipment instead of buying it?',
    answer:
      'Yes. Products can be requested under the LEASE operation type. Leasing terms, availability, support scope, and duration are confirmed during the commercial review process.',
  },
  {
    question: 'What does BUY FOR ME mean?',
    answer:
      'BUY FOR ME allows you to request procurement assistance from Oil Mart Pro. Our team can help source products, engage vendors, and coordinate purchasing based on your specifications and commercial requirements.',
  },
  {
    question: 'Do I need an account to use the website?',
    answer:
      'You can browse the website without an account, but creating an account gives you access to your customer profile, profile chat, saved details, and a better support experience.',
  },
  {
    question: 'Can the admin team reply to me directly?',
    answer:
      'Yes. Registered users have their own profile chat thread, and admin replies to that conversation will appear inside the user profile. Guest website chat remains available through the floating support chat button.',
  },
  {
    question: 'Are all prices shown in naira?',
    answer:
      'Yes. The website and admin panel use naira pricing so listed product values and commercial references reflect the Nigerian operating context of the business.',
  },
  {
    question: 'Do you support vessels as a category?',
    answer:
      'Yes. The platform includes a Vessels category, and vessel products can be added from the admin panel and displayed to customers like other catalog items.',
  },
  {
    question: 'How do I contact support or sales?',
    answer:
      'You can use the contact page, the FAQ support links, the floating chat widget, or your profile chat if you are logged in. Requests are routed to the admin panel for review and response.',
  },
];

export function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-3 text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600">
            Quick answers about ordering, leasing, procurement, customer accounts, chat support, and how Oil Mart Pro works.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <section key={item.question} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-gray-900">{item.question}</h2>
              <p className="leading-relaxed text-gray-600">{item.answer}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-3xl bg-gray-900 px-8 py-10 text-white">
          <h2 className="text-2xl font-bold">Still need help?</h2>
          <p className="mt-3 max-w-2xl text-gray-300">
            If your question is specific to pricing, vessel availability, leasing terms, procurement, or account support, our team can help directly.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link to="/contact?intent=support" className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">
              Contact Support
            </Link>
            <Link to="/contact?intent=sales" className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
