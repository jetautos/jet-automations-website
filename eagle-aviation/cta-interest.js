// Wire CTA buttons to prefill the homepage contact form interest field.

(function () {
  function isContactLink(href) {
    return href === '#contact' || href === '/#contact' || href.endsWith('#contact');
  }

  function buildContactUrl(link) {
    const interest = link.dataset.interest;
    if (!interest) return null;

    const href = link.getAttribute('href') || '';
    if (!isContactLink(href)) return null;

    const url = new URL(href.startsWith('#') ? `/${href}` : href, window.location.origin);
    url.searchParams.set('interest', interest);

    const reviewType = link.dataset.reviewType;
    if (reviewType) {
      url.searchParams.set('review', reviewType);
    }

    return url;
  }

  function reviewLine(review) {
    return `Requested: ${review === 'IPC' ? 'Instrument Proficiency Check (IPC)' : review}`;
  }

  function applyInterestFromParams() {
    const interestSelect = document.getElementById('interest');
    if (!interestSelect) return;

    const params = new URLSearchParams(window.location.search);
    const interest = params.get('interest');
    if (interest) {
      interestSelect.value = interest;
    }

    const description = document.getElementById('description');
    if (!description) return;

    const parts = [];
    const review = params.get('review');
    if (review) {
      parts.push(reviewLine(review));
    }

    const slot = params.get('slot');
    const aircraft = params.get('aircraft');
    if (slot) {
      parts.push(`Requested discovery flight time: ${slot}`);
    }
    if (aircraft) {
      parts.push(`Aircraft: ${aircraft}`);
    }

    if (parts.length) {
      description.value = parts.join('\n');
    }
  }

  function scrollToContact() {
    const section = document.getElementById('contact');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  document.querySelectorAll('a[data-interest]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const url = buildContactUrl(link);
      if (!url) return;

      const onHome = document.getElementById('interest');
      if (onHome) {
        event.preventDefault();
        onHome.value = link.dataset.interest;

        const description = document.getElementById('description');
        const reviewType = link.dataset.reviewType;
        if (description && reviewType) {
          const line = reviewLine(reviewType);
          if (!description.value.includes(line)) {
            description.value = description.value ? `${description.value}\n${line}` : line;
          }
        }

        history.pushState(null, '', url.search + url.hash);
        scrollToContact();
        return;
      }

      link.setAttribute('href', url.pathname + url.search + url.hash);
    });
  });

  applyInterestFromParams();

  if (window.location.hash === '#contact' && document.getElementById('contact')) {
    requestAnimationFrame(scrollToContact);
    window.addEventListener('load', () => {
      requestAnimationFrame(scrollToContact);
    });
  }
})();