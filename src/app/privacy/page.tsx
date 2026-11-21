import Link from 'next/link';

const sections = [
  {
    title: '1. Introduction',
    body: 'QuickSEO Tools ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this policy carefully. By using our website, you consent to the practices described herein.',
  },
  {
    title: '2. Information We Collect',
    body: 'We collect information in the following ways:',
  },
  {
    title: '2.1 Information You Provide',
    body: 'Our tools process any text, URLs, or data that you enter into input fields entirely within your browser. We do not send your input data to our servers. All tool processing happens client-side on your device.',
  },
  {
    title: '2.2 Automatically Collected Information',
    body: 'When you access our website, certain information may be automatically collected by our hosting provider (Vercel Analytics), including:',
    list: ['Your IP address (anonymized)', 'Browser type and version', 'Pages visited and time spent on each page', 'Referring website or source', 'Device type and operating system', 'General geographic location (country/city level only)'],
  },
  {
    title: '3. How We Use Information',
    body: 'We use the automatically collected information solely to understand how our website is used and to improve the tools we offer. We do not sell, trade, or otherwise transfer your personal information to third parties.',
  },
  {
    title: '4. Cookies',
    body: 'Our website does not use advertising or tracking cookies. We may use minimal analytics provided by our hosting platform to understand aggregate usage patterns.',
  },
  {
    title: '5. Data Security',
    body: 'Since all tool processing happens in your browser, your input data never leaves your device. We use reasonable administrative and technical safeguards to protect the information collected automatically.',
  },
  {
    title: '6. Third-Party Services',
    body: 'Our website is hosted on Vercel. Payments, if applicable, are processed by Lemon Squeezy. These services have their own privacy policies governing their handling of your information.',
  },
  {
    title: '7. Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.',
  },
  {
    title: '8. Contact Us',
    body: 'If you have any questions about this Privacy Policy, please contact us through the website.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="font-bold text-xl tracking-tight">Quick<span className="text-blue-600">SEO</span></Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-1">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: July 16, 2026</p>
        <div className="space-y-8">
          {sections.map(s => (
            <section key={s.title} className="space-y-3">
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <p className="text-sm leading-relaxed">{s.body}</p>
              {s.list && (
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  {s.list.map(item => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
