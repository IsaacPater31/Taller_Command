/* Resalta la sección visible en la barra superior. */
(function () {
  if (!("IntersectionObserver" in window)) return;
  var links = {};
  document.querySelectorAll(".nav nav a").forEach(function (a) { links[a.hash.slice(1)] = a; });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      Object.keys(links).forEach(function (id) { links[id].classList.toggle("active", id === en.target.id); });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  document.querySelectorAll("main section").forEach(function (s) { io.observe(s); });
})();
