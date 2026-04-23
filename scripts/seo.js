if (!document.querySelector('#org-schema')) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'org-schema';

  script.text = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Digital Donglers",
    "url": "https://digitaldonglers.com",
    "logo": "https://digitaldonglers.com/assets/agency_logo.webp",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+639625404311",
      "contactType": "customer support",
      "areaServed": "PH"
    }
  });

  document.head.appendChild(script);
}