---
layout: default
title: Home
---

{% include sections/hero.html %}

<div class="zone-sunlit">
  <div class="light-rays" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
  {% include kelp-curtain.html tone="light" %}
  {% include sections/services.html %}
</div>

{% include sections/work.html %}

<div class="zone-midnight">
  {% include creature.html top="12%" %}
  {% include creature.html top="58%" flip=true %}
  {% include sections/about.html %}
</div>

{% include sections/contact.html %}
