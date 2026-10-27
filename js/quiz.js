/* Paso 2: taller de preguntas (diapositiva 16). */
(function () {
  var root = document.getElementById("quiz");

  var QUESTIONS = [
    {
      q: "¿Cuál es el propósito del patrón Command?",
      o: ["Encapsular una petición como un objeto", "Definir una familia de algoritmos intercambiables", "Crear objetos sin especificar su clase concreta"],
      a: 0,
      why: "La petición se vuelve un objeto que se puede guardar, encolar o deshacer. La opción b describe Strategy."
    },
    {
      q: "En el ejemplo del editor, ¿qué clase cumple el rol de Receiver?",
      o: ["Comando", "Editor", "Control"],
      a: 1,
      why: "Editor hace el trabajo real: copiar(), cortar() y pegar()."
    },
    {
      q: "¿Qué participante llama a ejecutar() sin saber qué operación se realiza?",
      o: ["Client", "Receiver", "Invoker"],
      a: 2,
      why: "El Invoker (Boton, Atajo) solo conoce la interfaz Comando."
    },
    {
      q: "¿Por qué ComandoCopiar devuelve false en ejecutar()?",
      o: ["Porque la copia falló", "Porque no cambia el texto y no hay nada que deshacer", "Porque Copiar no tiene receptor"],
      a: 1,
      why: "Si el texto no cambia, no se apila en el historial."
    },
    {
      q: "¿Para qué se clona el comando antes de guardarlo en el historial?",
      o: ["Para que cada ejecución conserve su propio respaldo", "Para que se ejecute más rápido", "Para no tener que crear el Editor"],
      a: 0,
      why: "Cada copia guarda su respaldo independiente. Es el patrón Prototype."
    },
    {
      q: "Si se agrega la acción “Negrita”, ¿qué ocurre?",
      o: ["Se modifican Boton y Atajo", "Se modifica la clase Comando", "Se crea ComandoNegrita sin modificar Control, Boton ni Atajo"],
      a: 2,
      why: "Principio abierto/cerrado: se agrega una clase, no se modifican las existentes."
    },
    {
      q: "¿Qué patrón permite armar un comando compuesto (MacroCommand)?",
      o: ["Memento", "Strategy", "Composite"],
      a: 2,
      why: "Composite agrupa varios comandos que se ejecutan y deshacen como uno solo."
    },
    {
      q: "¿Cuál es un costo de aplicar el patrón?",
      o: ["Acopla la interfaz con la lógica", "Aumenta el número de clases", "Impide deshacer operaciones"],
      a: 1,
      why: "Aparece una clase por cada acción."
    }
  ];

  var POINTS = 100;      // por respuesta correcta
  var BONUS = 50;        // máximo por rapidez
  var FAST = 20;         // segundos hasta perder el bono

  var state;

  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function mount(node) {
    root.innerHTML = "";
    root.appendChild(node);
  }

  function intro() {
    mount(el(
      '<div class="card">' +
      '<p class="q-title">8 preguntas.</p>' +
      '<p class="lead small">Cada acierto suma ' + POINTS + ' puntos. Responder rápido suma hasta ' + BONUS + ' más.</p>' +
      '<div class="actions"><button class="btn btn-primary" data-go>Comenzar</button></div>' +
      '</div>'
    ));
    root.querySelector("[data-go]").addEventListener("click", start);
  }

  function start() {
    state = { i: 0, points: 0, right: 0, started: Date.now(), shownAt: 0 };
    ask();
  }

  function ask() {
    var item = QUESTIONS[state.i];
    var n = QUESTIONS.length;
    var card = el(
      '<div class="card">' +
      '<div class="q-top"><span>Pregunta ' + (state.i + 1) + ' de ' + n + '</span><span>' + state.points + ' pts</span></div>' +
      '<div class="bar"><i style="width:' + (state.i / n * 100) + '%"></i></div>' +
      '<h3 class="q-title">' + esc(item.q) + '</h3>' +
      '<div class="options">' +
      item.o.map(function (o, k) {
        return '<button class="option" data-k="' + k + '"><b>' + "abc"[k] + '</b><span>' + esc(o) + '</span></button>';
      }).join("") +
      '</div>' +
      '</div>'
    );
    mount(card);
    state.shownAt = Date.now();
    card.querySelector(".options").addEventListener("click", function (e) {
      var btn = e.target.closest(".option");
      if (btn) answer(card, item, +btn.dataset.k);
    });
  }

  function answer(card, item, k) {
    var secs = (Date.now() - state.shownAt) / 1000;
    var ok = k === item.a;
    var gained = ok ? POINTS + Math.round(BONUS * Math.max(0, 1 - secs / FAST)) : 0;
    state.points += gained;
    if (ok) state.right++;

    card.querySelectorAll(".option").forEach(function (b, j) {
      b.disabled = true;
      if (j === item.a) b.classList.add("right");
      else if (j === k) b.classList.add("wrong");
      else b.classList.add("dim");
    });
    card.querySelector(".q-top span:last-child").textContent = state.points + " pts";

    var last = state.i === QUESTIONS.length - 1;
    card.appendChild(el('<p class="explain"><strong>' + (ok ? "Correcto. +" + gained + "." : "No es esa.") + '</strong> ' + esc(item.why) + '</p>'));
    var actions = el('<div class="actions"><button class="btn btn-primary">' + (last ? "Ver resultado" : "Siguiente") + '</button></div>');
    card.appendChild(actions);
    var next = actions.querySelector("button");
    next.focus({ preventScroll: true });
    next.addEventListener("click", function () {
      if (last) finish();
      else { state.i++; ask(); }
    });
  }

  function finish() {
    var time = Math.round((Date.now() - state.started) / 1000);
    var total = state.points + Score.diagram;
    var card = el(
      '<div class="card">' +
      '<p class="big">' + total + '</p>' +
      '<p class="big-label">puntos</p>' +
      '<div class="split">' +
      '<div><b>' + Score.diagram + '</b><span>Diagrama</span></div>' +
      '<div><b>' + state.right + '/' + QUESTIONS.length + '</b><span>Aciertos</span></div>' +
      '<div><b>' + fmt(time) + '</b><span>Tiempo</span></div>' +
      '</div>' +
      (Score.diagramDone ? "" : '<p class="note">Aún no has armado el diagrama: vale hasta 500 puntos. <a href="#arma">Ir al paso 1</a></p>') +
      '<form class="field" novalidate>' +
      '<input name="name" maxlength="24" autocomplete="nickname" placeholder="Tu nombre" aria-label="Tu nombre" required>' +
      '<button class="btn btn-primary">Guardar</button>' +
      '</form>' +
      '<div class="actions"><button class="btn btn-link" data-again>Repetir el taller</button></div>' +
      '</div>'
    );
    mount(card);

    var form = card.querySelector("form");
    var input = form.querySelector("input");
    try { input.value = localStorage.getItem("taller-command:name") || ""; } catch (e) { /* sin acceso */ }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = input.value.trim();
      if (!name) { input.focus(); return; }
      try { localStorage.setItem("taller-command:name", name); } catch (err) { /* sin acceso */ }
      form.querySelector("button").disabled = true;
      Store.add({
        name: name,
        total: total,
        diagram: Score.diagram,
        right: state.right,
        of: QUESTIONS.length,
        time: time,
        date: Date.now()
      }).then(function (entry) {
        form.replaceWith(el('<p class="note">Guardado. <a href="#ranking">Ver ranking</a></p>'));
        document.dispatchEvent(new CustomEvent("ranking:changed", { detail: entry.id }));
      }).catch(function () {
        form.querySelector("button").disabled = false;
        var msg = form.nextElementSibling;
        if (!msg || !msg.classList.contains("note")) {
          msg = el('<p class="note"></p>');
          form.after(msg);
        }
        msg.textContent = "No se pudo guardar. Revisa la conexión e intenta de nuevo.";
      });
    });

    card.querySelector("[data-again]").addEventListener("click", start);
  }

  function fmt(s) {
    var m = Math.floor(s / 60);
    return m + ":" + String(s % 60).padStart(2, "0");
  }

  window.fmtTime = fmt;
  intro();
})();
