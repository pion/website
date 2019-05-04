document.addEventListener('DOMContentLoaded', () => {
  const $sectionLinks = Array.prototype.slice.call(document.querySelectorAll('.knowledge-base-link-for-section'), 0);

  $sectionLinks.forEach( el => {
    el.addEventListener('click', () => {
      el.parentElement.querySelector("ul").classList.toggle('is-hidden')
      el.parentElement.querySelectorAll(".knowledge-base-section-icon").forEach(iconEl =>  {
        iconEl.classList.toggle('is-hidden')
      })
    });
  });
});
