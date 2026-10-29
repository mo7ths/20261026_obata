(() => {
  const track = document.querySelector('.works-grid');
  const dots = document.querySelector('.works-dots');
  if (!track || !dots) return;

  const cards = [...track.querySelectorAll('.work-card')];
  if (cards.length < 2) return;

  const mobile = window.matchMedia('(max-width: 767px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = 0;
  let scrollFrame = 0;
  let layoutFrame = 0;

  const buttons = cards.map((card, index) => {
    card.id ||= `work-slide-${index + 1}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'works-dot';
    button.setAttribute('aria-label', `制作実績 ${index + 1} / ${cards.length} を表示`);
    button.setAttribute('aria-controls', card.id);
    button.addEventListener('click', () => scrollToCard(index));
    dots.append(button);
    return button;
  });

  function scrollToCard(index, behavior = reducedMotion.matches ? 'instant' : 'smooth') {
    const card = cards[index].getBoundingClientRect();
    const left = track.scrollLeft + card.left - track.getBoundingClientRect().left
      - (track.clientWidth - card.width) / 2;
    track.scrollTo({ left, behavior });
    updateActive();
  }

  function updateActive() {
    scrollFrame = 0;
    if (!mobile.matches || layoutFrame) return;

    if (track.scrollLeft <= 1) {
      activeIndex = 0;
    } else if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 1) {
      activeIndex = cards.length - 1;
    } else {
      const center = track.getBoundingClientRect().left + track.clientWidth / 2;
      let nearestDistance = Infinity;
      cards.forEach((card, index) => {
        const bounds = card.getBoundingClientRect();
        const distance = Math.abs(bounds.left + bounds.width / 2 - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          activeIndex = index;
        }
      });
    }
    buttons.forEach((button, index) => {
      button.setAttribute('aria-current', String(index === activeIndex));
    });
  }

  function positionActiveCard() {
    cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(() => {
      layoutFrame = 0;
      if (mobile.matches) {
        scrollToCard(activeIndex, 'instant');
      }
    });
  }

  function updateLayout() {
    dots.hidden = !mobile.matches;
    if (mobile.matches) {
      track.setAttribute('tabindex', '0');
      track.setAttribute('role', 'region');
      track.setAttribute('aria-roledescription', 'カルーセル');
      track.setAttribute('aria-label', '制作実績');
      cards.forEach((card, index) => {
        card.setAttribute('role', 'group');
        card.setAttribute('aria-roledescription', 'スライド');
        card.setAttribute('aria-label', `${index + 1} / ${cards.length}`);
      });
      positionActiveCard();
    } else {
      ['tabindex', 'role', 'aria-roledescription', 'aria-label'].forEach((attribute) => {
        track.removeAttribute(attribute);
      });
      cards.forEach((card) => {
        ['role', 'aria-roledescription', 'aria-label'].forEach((attribute) => {
          card.removeAttribute(attribute);
        });
      });
      track.scrollTo({ left: 0, behavior: 'instant' });
    }
  }

  track.addEventListener('scroll', () => {
    if (mobile.matches && !scrollFrame) {
      scrollFrame = requestAnimationFrame(updateActive);
    }
  }, { passive: true });

  track.addEventListener('keydown', (event) => {
    if (!mobile.matches || event.target !== track) return;
    const targets = {
      ArrowLeft: Math.max(0, activeIndex - 1),
      ArrowRight: Math.min(cards.length - 1, activeIndex + 1),
      Home: 0,
      End: cards.length - 1,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    scrollToCard(targets[event.key]);
  });

  mobile.addEventListener('change', updateLayout);
  window.addEventListener('resize', positionActiveCard);
  updateLayout();
})();
