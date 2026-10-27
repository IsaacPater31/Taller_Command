/* Paso 1: arrastrar los participantes al diagrama de estructura (Gamma et al., 1994). */
(function () {
  var board = document.querySelector(".board");
  var uml = document.getElementById("uml");
  var svg = document.getElementById("wires");
  var tray = document.getElementById("tray");
  var statusEl = document.getElementById("arma-status");
  var checkBtn = document.getElementById("arma-check");
  var resetBtn = document.getElementById("arma-reset");
  var roles = document.getElementById("roles");
  var slots = Array.prototype.slice.call(uml.querySelectorAll(".slot"));
  var chips = Array.prototype.slice.call(tray.querySelectorAll(".chip"));
  var narrow = window.matchMedia("(max-width: 700px)");

  var selected = null;
  var drag = null;
  var suppressClick = false;
  var locked = false;

  /* ---------- Conectores ---------- */

  var NS = "http://www.w3.org/2000/svg";
  var DEFS =
    '<defs>' +
    '<marker id="m-arrow" viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto">' +
    '<path d="M1,1 L9.5,5 L1,9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker>' +
    '<marker id="m-tri" viewBox="0 0 16 16" refX="15" refY="8" markerWidth="16" markerHeight="16" markerUnits="userSpaceOnUse" orient="auto">' +
    '<path class="tri" d="M1,1 L15,8 L1,15 Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></marker>' +
    '<marker id="m-dia" viewBox="0 0 20 12" refX="0.5" refY="6" markerWidth="20" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto">' +
    '<path class="tri" d="M0.5,6 L10,1 L19.5,6 L10,11 Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></marker>' +
    '</defs>';

  function rect(area) {
    var el = uml.querySelector('[data-area="' + area + '"]');
    var r = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
    r.r = r.x + r.w; r.b = r.y + r.h; r.cx = r.x + r.w / 2; r.cy = r.y + r.h / 2;
    return r;
  }

  function line(points, opts) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", points.map(function (pt, i) { return (i ? "L" : "M") + pt[0] + " " + pt[1]; }).join(" "));
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "currentColor");
    p.setAttribute("stroke-width", "1.5");
    p.setAttribute("stroke-linejoin", "round");
    if (opts.dash) p.setAttribute("stroke-dasharray", "5 5");
    if (opts.end) p.setAttribute("marker-end", "url(#" + opts.end + ")");
    if (opts.start) p.setAttribute("marker-start", "url(#" + opts.start + ")");
    svg.appendChild(p);
  }

  function label(text, x, y, anchor) {
    var t = document.createElementNS(NS, "text");
    t.setAttribute("x", x);
    t.setAttribute("y", y);
    t.setAttribute("text-anchor", anchor || "middle");
    t.textContent = text;
    svg.appendChild(t);
  }

  function drawWires() {
    svg.innerHTML = DEFS;
    var C = rect("client"), I = rect("invoker"), M = rect("command"), R = rect("receiver"), K = rect("concrete");
    var y, x;

    if (!narrow.matches) {
      // Invoker ◇── Command
      y = I.cy;
      line([[I.r, y], [M.x, y]], { start: "m-dia", end: "m-arrow" });
      // ConcreteCommand ──▷ Command
      line([[K.cx, K.y], [M.cx, M.b]], { end: "m-tri" });
      // ConcreteCommand ──> Receiver
      y = R.cy;
      line([[K.x, y], [R.r, y]], { end: "m-arrow" });
      label("receiver", K.x - 8, y - 8, "end");
      // Client ──> Receiver
      x = C.x + C.w * 0.65;
      line([[x, C.b], [x, R.cy], [R.x, R.cy]], { end: "m-arrow" });
      // Client - - > ConcreteCommand
      x = C.x + C.w * 0.3;
      y = Math.max(R.b, K.b) + 22;
      line([[x, C.b], [x, y], [K.cx, y], [K.cx, K.b]], { dash: true, end: "m-arrow" });
    } else {
      line([[I.cx, I.b], [M.cx, M.y]], { start: "m-dia", end: "m-arrow" });
      line([[K.cx, K.y], [M.cx, M.b]], { end: "m-tri" });
      y = K.y + K.h * 0.35;
      line([[K.x, y], [R.cx, y], [R.cx, R.b]], { end: "m-arrow" });
      label("receiver", K.x - 6, y - 7, "end");
      line([[C.cx, C.b], [C.cx, R.y]], { end: "m-arrow" });
      x = 6;
      y = K.y + K.h * 0.75;
      line([[C.x, C.cy], [x, C.cy], [x, y], [K.x, y]], { dash: true, end: "m-arrow" });
    }
  }

  /* ---------- Estado ---------- */

  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = list[i]; list[i] = list[j]; list[j] = t;
    }
    return list;
  }

  function placedCount() {
    return slots.filter(function (s) { return s.querySelector(".chip"); }).length;
  }

  function select(chip) {
    if (selected) selected.classList.remove("selected");
    selected = chip && chip !== selected ? chip : null;
    if (selected) selected.classList.add("selected");
    board.classList.toggle("picking", !!selected);
  }

  function clearMark(slot) {
    if (slot && slot.classList.contains("slot")) slot.parentNode.classList.remove("ok", "bad");
  }

  function update() {
    var n = placedCount();
    slots.forEach(function (s) {
      var c = s.querySelector(".chip");
      s.tabIndex = c ? -1 : 0;
      s.setAttribute("aria-label", c ? "Contiene " + c.textContent : "Espacio vacío");
    });
    if (!locked) {
      statusEl.className = "status";
      statusEl.textContent = n === 5 ? "Listo. Comprueba tu diagrama." : "Faltan " + (5 - n) + (5 - n === 1 ? " pieza." : " piezas.");
      checkBtn.disabled = n !== 5;
    }
    requestAnimationFrame(drawWires);
  }

  function place(chip, slot) {
    var from = chip.parentNode;
    var current = slot.querySelector(".chip");
    if (current === chip) return;
    if (current) (from.classList.contains("slot") ? from : tray).appendChild(current);
    slot.appendChild(chip);
    clearMark(from);
    clearMark(slot);
    select(null);
    update();
  }

  function toTray(chip) {
    clearMark(chip.parentNode);
    tray.appendChild(chip);
    select(null);
    update();
  }

  /* ---------- Toque y teclado ---------- */

  board.addEventListener("click", function (e) {
    if (locked) return;
    var chip = e.target.closest(".chip");
    var slot = e.target.closest(".slot");
    if (suppressClick) { suppressClick = false; return; }

    if (chip) {
      if (slot) {
        if (selected && selected !== chip) place(selected, slot);
        else toTray(chip);
      } else {
        select(chip);
      }
    } else if (slot && selected) {
      place(selected, slot);
    }
  });

  uml.addEventListener("keydown", function (e) {
    var slot = e.target.closest(".slot");
    if (slot && e.target === slot && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      if (selected && !locked) place(selected, slot);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") select(null);
  });

  /* ---------- Arrastre (mouse y táctil) ---------- */

  board.addEventListener("pointerdown", function (e) {
    var chip = e.target.closest(".chip");
    if (!chip || locked || e.button !== 0) return;
    drag = { chip: chip, x: e.clientX, y: e.clientY, id: e.pointerId, ghost: null, over: null };
    try { chip.setPointerCapture(e.pointerId); } catch (err) { /* puntero sintético */ }
  });

  window.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (e.pointerType === "mouse" && e.buttons === 0) return endDrag(e, false); // se soltó fuera
    if (!drag.ghost) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
      select(null);
      drag.ghost = drag.chip.cloneNode(true);
      drag.ghost.classList.add("ghost");
      drag.ghost.style.width = drag.chip.offsetWidth + "px";
      document.body.appendChild(drag.ghost);
      drag.chip.classList.add("lifting");
      board.classList.add("picking");
    }
    drag.ghost.style.left = e.clientX + "px";
    drag.ghost.style.top = e.clientY + "px";

    var hit = document.elementFromPoint(e.clientX, e.clientY);
    var slot = hit && hit.closest(".slot");
    if (slot !== drag.over) {
      if (drag.over) drag.over.classList.remove("over");
      if (slot) slot.classList.add("over");
      drag.over = slot;
    }

    // Desplaza la página si se arrastra cerca del borde
    var edge = 64;
    if (e.clientY < edge) window.scrollBy(0, -8);
    else if (e.clientY > window.innerHeight - edge) window.scrollBy(0, 8);
  });

  function endDrag(e, cancel) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag;
    drag = null;
    if (!d.ghost) return; // fue un toque: lo maneja "click"
    suppressClick = true;
    setTimeout(function () { suppressClick = false; }, 0);
    d.ghost.remove();
    d.chip.classList.remove("lifting");
    board.classList.remove("picking");
    if (d.over) d.over.classList.remove("over");
    if (cancel) return;
    if (d.over) place(d.chip, d.over);
    else if (d.chip.parentNode.classList.contains("slot")) toTray(d.chip);
  }

  window.addEventListener("pointerup", function (e) { endDrag(e, false); });
  window.addEventListener("pointercancel", function (e) { endDrag(e, true); });
  board.addEventListener("lostpointercapture", function (e) {
    if (drag && e.pointerId === drag.id) setTimeout(function () { endDrag(e, false); }, 0);
  });

  /* ---------- Comprobar y reiniciar ---------- */

  checkBtn.addEventListener("click", function () {
    Score.diagramTries++;
    var wrong = 0;
    slots.forEach(function (s) {
      var ok = s.querySelector(".chip").dataset.role === s.dataset.answer;
      s.parentNode.classList.remove("ok", "bad");
      void s.parentNode.offsetWidth; // reinicia la animación
      s.parentNode.classList.add(ok ? "ok" : "bad");
      if (!ok) wrong++;
    });

    if (wrong === 0) {
      locked = true;
      Score.diagramDone = true;
      Score.diagram = Math.max(100, 500 - (Score.diagramTries - 1) * 100);
      statusEl.className = "status ok";
      statusEl.textContent = "Correcto. +" + Score.diagram + " puntos.";
      checkBtn.disabled = true;
      board.classList.add("locked");
      roles.hidden = false;
    } else {
      statusEl.className = "status bad";
      statusEl.textContent = wrong + (wrong === 1 ? " pieza no está" : " piezas no están") + " en su lugar. Muévelas e intenta de nuevo.";
    }
  });

  function reset() {
    locked = false;
    Score.diagram = 0;
    Score.diagramDone = false;
    Score.diagramTries = 0;
    board.classList.remove("locked");
    roles.hidden = true;
    slots.forEach(function (s) { s.parentNode.classList.remove("ok", "bad"); });
    shuffle(chips).forEach(function (c) { tray.appendChild(c); });
    select(null);
    update();
  }

  resetBtn.addEventListener("click", reset);

  if ("ResizeObserver" in window) new ResizeObserver(drawWires).observe(uml);
  else window.addEventListener("resize", drawWires);
  if (document.fonts) document.fonts.ready.then(drawWires);

  reset();
})();
