// Service Card Expansion Functionality
document.addEventListener('DOMContentLoaded', function() {
  const serviceCards = document.querySelectorAll('.service-expandable-card');

  serviceCards.forEach(card => {
    const header = card.querySelector('.service-header');
    const toggle = card.querySelector('.expand-toggle');

    // Click handler for the entire header
    header.addEventListener('click', function() {
      toggleCard(card);
    });

    // Prevent double-toggle when clicking the button directly
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleCard(card);
    });

    // Keyboard accessibility
    header.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard(card);
      }
    });

    // Make header focusable for keyboard navigation
    header.setAttribute('tabindex', '0');
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');
  });

  function toggleCard(card) {
    const isExpanded = card.classList.contains('expanded');
    const header = card.querySelector('.service-header');

    if (isExpanded) {
      card.classList.remove('expanded');
      header.setAttribute('aria-expanded', 'false');
    } else {
      card.classList.add('expanded');
      header.setAttribute('aria-expanded', 'true');
    }
  }
});
