import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { InfoPage } from './pages/InfoPage';
import { LegalPage } from './pages/LegalPage';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminBlog } from './pages/admin/AdminBlog';
import { AdminChats } from './pages/admin/AdminChats';
import { AdminPlaceholder } from './pages/admin/AdminPlaceholder';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'products', Component: Products },
      { path: 'product/:id', Component: ProductDetail },
      { path: 'cart', Component: Cart },
      { path: 'checkout', Component: Checkout },
      { path: 'auth', Component: Auth },
      { path: 'profile', Component: Profile },
      { path: 'home', Component: Home },
      { path: 'faq', Component: FAQPage },
      { path: 'contact', Component: ContactPage },
      {
        path: 'services',
        element: (
          <InfoPage
            title="Services"
            description="Support beyond equipment rentals."
            bodyTitle="Operational support services"
            body="We support equipment sourcing, rental planning, logistics coordination, deployment support, and technical guidance for oil and gas projects. Use the contact page to discuss your exact scope and timelines."
            ctaLabel="Talk to Sales"
            ctaTo="/contact?intent=sales"
          />
        ),
      },
      {
        path: 'become-a-supplier',
        element: (
          <InfoPage
            title="Become a Supplier"
            description="Partner with Oilmart Pro and reach more industrial buyers."
            bodyTitle="Supplier onboarding"
            body="We work with vetted suppliers that can deliver certified equipment, dependable documentation, and strong service support. Share your company profile, product categories, and operating regions to begin the onboarding review."
            ctaLabel="Start Supplier Request"
            ctaTo="/contact?intent=sales"
          />
        ),
      },
      {
        path: 'help-center',
        element: (
          <InfoPage
            title="Help Center"
            description="Find support for orders, rentals, and account questions."
            bodyTitle="How we can help"
            body="Our team can assist with equipment availability, quote requests, order updates, delivery coordination, and after-rental support. Send a message and we will direct it to the right team."
            ctaLabel="Contact Support"
            ctaTo="/contact?intent=support"
          />
        ),
      },
      {
        path: 'terms',
        element: (
          <LegalPage
            title="Terms & Conditions"
            description="Terms governing use of the Oil Mart Pro website, services, and commercial request flows."
            sections={[
              {
                heading: '1. Platform Use',
                paragraphs: [
                  'Oil Mart Pro provides a digital platform for browsing oil and gas equipment, submitting quote requests, requesting leasing support, placing orders, and requesting buy-for-me procurement assistance. By using the website, you agree to provide accurate information and to use the platform only for lawful business purposes.',
                  'We may update, suspend, or refine parts of the website, catalog, account experience, customer chat, or admin-managed content at any time in order to improve service quality, accuracy, and operational reliability.',
                ],
              },
              {
                heading: '2. Products, Pricing, and Availability',
                paragraphs: [
                  'Products, images, categories, specifications, and pricing displayed on the website are provided for commercial guidance and may be updated without notice. Listing a product does not guarantee immediate stock, vessel availability, dispatch schedule, or final commercial acceptance.',
                  'All prices, including naira-denominated listings, remain subject to review, logistics costs, tax treatment, inspection requirements, import considerations, and final approval where applicable.',
                ],
              },
              {
                heading: '3. Sells, Lease, and Buy-For-Me Services',
                paragraphs: [
                  'For SELLS transactions, ownership transfer, delivery obligations, documentation, inspection terms, and acceptance conditions are finalized during commercial processing. For LEASE transactions, rental duration, liabilities, maintenance scope, mobilization, return condition, and downtime obligations must be agreed before execution.',
                  'For BUY FOR ME requests, Oil Mart Pro may assist with sourcing, vendor engagement, specification alignment, negotiation, and procurement coordination. Final procurement remains subject to supplier confirmation, client approval, payment terms, and market availability.',
                ],
              },
              {
                heading: '4. Quotes, Orders, and Approvals',
                paragraphs: [
                  'Submitting a contact form, quote request, checkout, or chat message does not automatically create a binding contract. Orders, quotes, and procurement requests are subject to internal review, pricing confirmation, commercial approval, and any additional compliance or documentation requirements.',
                  'Oil Mart Pro may approve, reject, accept, revise, or cancel requests where information is incomplete, pricing changes materially, products are unavailable, or commercial conditions are not satisfied.',
                ],
              },
              {
                heading: '5. Customer Accounts',
                paragraphs: [
                  'Users are responsible for maintaining the confidentiality of their account credentials and for ensuring that profile details, company information, and communication details remain accurate.',
                  'You are responsible for all activity carried out through your account unless you notify us promptly of unauthorized access or credential compromise.',
                ],
              },
              {
                heading: '6. Communications and Support',
                paragraphs: [
                  'Messages submitted through profile chat, contact forms, or the website support widget may be reviewed by our commercial or support teams to respond to inquiries, process requests, and maintain service quality.',
                  'Response times are estimates only and may vary depending on operational hours, request complexity, supplier dependency, and documentation requirements.',
                ],
              },
              {
                heading: '7. Limitation and Governing Principles',
                paragraphs: [
                  'To the maximum extent permitted by applicable law, Oil Mart Pro is not liable for indirect, incidental, market-based, operational, or consequential losses arising from website use, service interruption, inaccurate third-party data, or unavailable inventory.',
                  'Final contractual obligations for any transaction should be documented in the relevant quotation, purchase order, lease agreement, procurement instruction, or commercial acceptance document issued between the parties.',
                ],
              },
            ]}
            ctaLabel="Request Clarification"
            ctaTo="/contact?intent=support"
          />
        ),
      },
      {
        path: 'privacy',
        element: (
          <LegalPage
            title="Privacy Policy"
            description="How Oil Mart Pro collects, uses, stores, and manages customer and operational information."
            sections={[
              {
                heading: '1. Information We Collect',
                paragraphs: [
                  'We may collect information you provide directly, including your name, email address, phone number, company name, shipping details, profile image, account credentials, chat messages, and quote or order-related requests submitted through the website.',
                  'We may also store product selections, cart details, operation preferences such as SELLS, LEASE, or BUY FOR ME, and administrative status updates linked to your requests.',
                ],
              },
              {
                heading: '2. How We Use Information',
                paragraphs: [
                  'Information is used to create and manage customer accounts, respond to inquiries, process quote requests, review orders, support lease and procurement workflows, improve website usability, and maintain administrative visibility across customer and support interactions.',
                  'We may also use your details to communicate with you about account activity, commercial follow-up, support responses, order status, and procurement-related updates.',
                ],
              },
              {
                heading: '3. Chats, Forms, and Support Records',
                paragraphs: [
                  'Messages sent through the website chat widget, profile chat, contact forms, and support flows may be stored and made visible in the admin panel so our team can respond, track requests, and manage customer support more effectively.',
                  'Registered-user conversations may be linked to the customer account associated with that email address so replies can appear inside the user profile experience.',
                ],
              },
              {
                heading: '4. Storage and Local Experience',
                paragraphs: [
                  'This website currently uses local browser storage for account details, chat history, product management data, and certain admin-facing updates. That means some information may remain available on the same browser after refresh or revisit.',
                  'For a production deployment, storage, access controls, encryption, retention periods, and server-side protections should be implemented according to the organization’s approved security and compliance standards.',
                ],
              },
              {
                heading: '5. Sharing and Disclosure',
                paragraphs: [
                  'We do not disclose your information more broadly than necessary to operate the website experience, review your commercial request, or coordinate sourcing, leasing, fulfillment, and support activities.',
                  'Where supplier involvement, logistics coordination, inspection support, or procurement handling is required, relevant information may be shared only to the extent needed to progress the request responsibly.',
                ],
              },
              {
                heading: '6. Your Choices and Updates',
                paragraphs: [
                  'You may update account details such as name, phone number, company, password, and profile image from your profile settings. Keeping your information accurate helps us process requests more efficiently and reduces follow-up delays.',
                  'If you need help correcting support records, account details, or quote information, you may contact us through the website support and contact channels.',
                ],
              },
              {
                heading: '7. Security and Policy Changes',
                paragraphs: [
                  'We take reasonable steps within the current website setup to manage information access inside the application, but no method of storage or transmission should be treated as entirely risk-free.',
                  'This Privacy Policy may be updated as the platform evolves. Continued use of the website after changes are published indicates acceptance of the revised policy language.',
                ],
              },
            ]}
            ctaLabel="Ask a Privacy Question"
            ctaTo="/contact?intent=support"
          />
        ),
      },
    ],
  },
  {
    path: '/admin',
    Component: AdminLogin,
  },
  {
    path: '/admin/dashboard',
    Component: AdminDashboard,
    children: [
      { index: true, Component: AdminOverview },
      { path: 'products', Component: AdminProducts },
      { path: 'orders', Component: AdminOrders },
      { path: 'blog', Component: AdminBlog },
      { path: 'chats', Component: AdminChats },
      {
        path: 'customers',
        element: <AdminPlaceholder title="Customers" description="Manage customer accounts and information" />,
      },
      {
        path: 'analytics',
        element: <AdminPlaceholder title="Analytics" description="View detailed analytics and reports" />,
      },
    ],
  },
]);
