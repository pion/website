document.addEventListener('DOMContentLoaded', () => {
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  if ($navbarBurgers.length > 0) {
    $navbarBurgers.forEach( el => {
      el.addEventListener('click', () => {
        el.classList.toggle('is-active');
        document.getElementById(el.dataset.target).classList.toggle('is-active');
      });
    });
  }
});
