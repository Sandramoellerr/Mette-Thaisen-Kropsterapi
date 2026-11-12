/* ============================================================
   script.js

   To små ting:
     1. Marker linket til den side, man står på (fed + understreget).
     2. Luk mobil-menuen automatisk, når man klikker et link i den.

   Menuen selv (åbn/luk) klarer HTML alene med <details> og
   <summary> + CSS – det kræver ingen JavaScript.
   ============================================================ */

/* --- 1. Marker linket til den aktuelle side ------------------------
   Header'en er ens på alle sider, så vi finder selv ud af, hvilket
   menulink der passer til den side, man er på, og sætter
   aria-current="page" på det. base.css styler det link. */
const nuvaerendeSide = location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".skrivebord-links a, .menu-links a").forEach(function (link) {
  // Book-knapperne skal ikke fremhæves
  if (link.classList.contains("book-knap") || link.classList.contains("book-knap-desktop")) {
    return;
  }
  const linkMaal = link.getAttribute("href").split("/").pop().split("#")[0];
  if (linkMaal === nuvaerendeSide) {
    link.setAttribute("aria-current", "page");
  }
});

/* --- 2. Luk mobilmenuen når man klikker et link ------------------- */
const mobilmenu = document.querySelector(".mobilmenu");

if (mobilmenu) {
  mobilmenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mobilmenu.removeAttribute("open"); // folder <details> sammen igen
    });
  });
}


/* --- 3. Rolige animationer: sektioner toner blidt ind ------------
   Elementer får klassen .reveal, og når de kommer ind i skærmen,
   får de .synlig (CSS laver selve toningen, se base.css afsnit 10).
   Hvis brugeren har bedt om mindre bevægelse, eller browseren ikke
   kender IntersectionObserver, gør vi ingenting – så er alt bare
   synligt. */
const mindreBevaegelse = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !mindreBevaegelse) {
  // Hele sektioner (ikke hero og topbillede, som har egne animationer)
  const sektioner = document.querySelectorAll(
    "main > section:not(.galleri), main > .nyhed, main > .book-band, .book-band"
  );
  sektioner.forEach(function (el) {
    el.classList.add("reveal");
  });

  // Kort i grupper kommer lidt efter hinanden (--nr styrer forsinkelsen)
  document
    .querySelectorAll(".pris-kort, .gruppe, .trin, .logo-kort")
    .forEach(function (el, i, alle) {
      el.classList.add("reveal-barn");
      const soeskende = Array.from(el.parentElement.children);
      el.style.setProperty("--nr", soeskende.indexOf(el));
    });

  const iagttager = new IntersectionObserver(
    function (poster) {
      poster.forEach(function (post) {
        if (post.isIntersecting) {
          const el = post.target;
          el.classList.add("synlig");
          iagttager.unobserve(el); // kun én gang
          // Forsinkelsen er kun til selve indtoningen – nulstil den bagefter,
          // så hover på kortene ikke føles trægt
          if (el.classList.contains("reveal-barn")) {
            setTimeout(function () {
              el.style.transitionDelay = "0s";
            }, 1600);
          }
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -8% 0px" } // threshold 0: også meget høje sektioner bliver synlige
  );

  document.querySelectorAll(".reveal, .reveal-barn").forEach(function (el) {
    iagttager.observe(el);
  });
}


/* --- 4. Udtalelser: pile til at bladre -------------------------------
   Rækken med udtalelser kan scrolles sidelæns. Vi sætter to pile ind, så
   det er tydeligt, at der er flere (kun på computer – på mobil swiper man).
   Pilene scroller ét kort ad gangen og er slukket, når man er ved enden. */
document.querySelectorAll(".udtalelser").forEach(function (sektion) {
  const liste = sektion.querySelector(".udtalelse-liste");
  if (!liste) return;

  const pile = document.createElement("div");
  pile.className = "udtalelse-pile";
  pile.innerHTML =
    '<button type="button" aria-label="Forrige udtalelse">&#8592;</button>' +
    '<button type="button" aria-label="Næste udtalelse">&#8594;</button>';
  sektion.appendChild(pile);

  const [forrige, naeste] = pile.querySelectorAll("button");

  function kortBredde() {
    const kort = liste.querySelector("blockquote");
    const mellemrum = parseFloat(getComputedStyle(liste).columnGap) || 0;
    return kort.getBoundingClientRect().width + mellemrum;
  }

  function opdater() {
    forrige.disabled = liste.scrollLeft < 4;
    naeste.disabled = liste.scrollLeft + liste.clientWidth >= liste.scrollWidth - 4;
  }

  forrige.addEventListener("click", function () {
    liste.scrollBy({ left: -kortBredde(), behavior: mindreBevaegelse ? "auto" : "smooth" });
  });
  naeste.addEventListener("click", function () {
    liste.scrollBy({ left: kortBredde(), behavior: mindreBevaegelse ? "auto" : "smooth" });
  });

  liste.addEventListener("scroll", opdater, { passive: true });
  window.addEventListener("resize", opdater);
  opdater();
});
