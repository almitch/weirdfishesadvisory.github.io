---
layout: default
title: Team
permalink: /team/
---

<section class="services-hero">
  <div class="services-hero-inner">
    <h1>The team.</h1>
    <p>Senior-level strategic expertise paired with hands-on technical delivery. One point of contact who understands the environmental context, the data, and the decision it needs to drive - no layers, no handoffs.</p>
  </div>
</section>

<div class="hero-wave" style="background:var(--navy);">
  <svg viewBox="0 0 1440 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path class="wave-fill" d="M0,28 C240,70 480,0 720,42 C960,84 1200,18 1440,48 L1440,70 L0,70 Z"/>
  </svg>
</div>

<section class="team-section">
  <div class="team-grid">
    {% for member in site.data.team %}
    <article class="team-card reveal{% if forloop.index0 > 0 %} reveal-delay-{{ forloop.index0 }}{% endif %}">
      <div class="team-card-photo">
        <img src="{{ member.photo | relative_url }}" alt="{{ member.name }}" width="800" height="1066" loading="lazy">
      </div>
      <h2 class="team-card-name">{{ member.name }}</h2>
      <p class="team-card-role">{{ member.role }}</p>
      <p class="team-card-bio">{{ member.bio }}</p>
      <a href="{{ member.linkedin }}" class="team-card-linkedin" target="_blank" rel="noopener noreferrer" aria-label="{{ member.name }} on LinkedIn">
        <i class="fab fa-linkedin-in" aria-hidden="true"></i>
        <span>Connect on LinkedIn</span>
      </a>
    </article>
    {% endfor %}
  </div>
</section>

<section class="cta-section reveal">
  <h2>Do you want to create more impact for nature?</h2>
  <p>Whether it's driving decisions, demonstrating impact to funders, or scaling a programme's reach - let's figure out what's stuck and work to fix it.</p>
  <a href="https://calendar.app.google/uGhyEnuhiTjoVJ7J6" target="_blank" rel="noopener" class="cta-button">Book a coffee with us</a>
</section>
