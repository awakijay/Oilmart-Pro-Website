import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { QuoteRequest, useAppData } from '../context/AppDataContext';
import { useChat } from '../context/ChatContext';
import { createBotChallenge, isBotCheckValid } from '../utils/botProtection';

const contentMap = {
  quote: {
    title: 'Request a Quote',
    description: 'Tell us what equipment or service you need and we will prepare a tailored quote.',
    buttonLabel: 'Submit Quote Request',
  },
  sales: {
    title: 'Contact Sales',
    description: 'Reach our sales team for pricing, availability, and commercial support.',
    buttonLabel: 'Send to Sales',
  },
  support: {
    title: 'Help Center',
    description: 'Send your support request and our team will respond with the right next step.',
    buttonLabel: 'Send Support Request',
  },
  question: {
    title: 'Ask a Product Question',
    description: 'Ask for product details, specs, certifications, or rental guidance.',
    buttonLabel: 'Send Question',
  },
} as const;

type IntentKey = keyof typeof contentMap;

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const { addQuoteRequest } = useAppData();
  const { sendUserMessage } = useChat();
  const product = searchParams.get('product') ?? '';
  const intent = ((searchParams.get('intent') ?? 'support') in contentMap
    ? searchParams.get('intent')
    : 'support') as IntentKey;

  const content = useMemo(() => contentMap[intent], [intent]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [botChallenge, setBotChallenge] = useState(() => createBotChallenge());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: product ? `Regarding ${product}` : '',
    message: '',
    securityAnswer: '',
    website: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isBotCheckValid(formData.securityAnswer, botChallenge.answer, formData.website)) {
      setError('Security check failed. Please answer the question correctly.');
      setBotChallenge(createBotChallenge());
      setFormData((prev) => ({ ...prev, securityAnswer: '', website: '' }));
      return;
    }

    setError('');
    const request: QuoteRequest = {
      id: `Q-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      company: formData.company,
      subject: formData.subject,
      message: formData.message,
      intent,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    };
    addQuoteRequest(request);
    sendUserMessage(`${content.title} from ${formData.name}: ${formData.subject} - ${formData.message}`);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">{content.title}</h1>
          <p className="text-lg text-gray-600">{content.description}</p>
        </div>

        <div className="grid md:grid-cols-[1.5fr_1fr] gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {submitted ? (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Message received</h2>
                <p className="text-gray-600">
                  We have captured your request and our team will follow up using the email you provided.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Send Another Request
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Company</label>
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Subject</label>
                  <input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="hidden" aria-hidden="true">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Website</label>
                  <input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Security Question: {botChallenge.question}
                  </label>
                  <input
                    name="securityAnswer"
                    value={formData.securityAnswer}
                    onChange={handleChange}
                    required
                    inputMode="numeric"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  {content.buttonLabel}
                </button>
              </form>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact details</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                <span className="font-semibold text-gray-900">Email:</span> rentals@oilmartpro.com
              </p>
              <p>
                <span className="font-semibold text-gray-900">Phone:</span> +(234) 706 884 1116
              </p>
              <p>
                <span className="font-semibold text-gray-900">Address:</span> off SHELL UMUEBULU FLOWSTATION, UMUEBULU 4, Port-Harcourt 500101, Rivers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
