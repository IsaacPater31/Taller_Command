/*
 * Caso de uso: el editor de la presentación, en JavaScript.
 * Editor = Receiver, Comando* = ConcreteCommand, botones y atajos = Invoker.
 */
(function () {
  var area = document.getElementById("ed-text");
  var clipEl = document.getElementById("ed-clip");
  var listEl = document.getElementById("ed-history");
  var countEl = document.getElementById("ed-count");
  var undoBtn = document.getElementById("ed-undo");
  var flow = document.getElementById("flow");

  /* ---- Receiver ---- */
  var editor = {
    texto: area.value,
    portapapeles: "",
    sel: { start: 0, end: 0 },
    seleccion: function () { return this.texto.slice(this.sel.start, this.sel.end); },
    copiar: function () { this.portapapeles = this.seleccion(); },
    cortar: function () {
      this.copiar();
      this.texto = this.texto.slice(0, this.sel.start) + this.texto.slice(this.sel.end);
      this.sel.end = this.sel.start;
    },
    pegar: function () {
      this.texto = this.texto.slice(0, this.sel.start) + this.portapapeles + this.texto.slice(this.sel.end);
      this.sel.start = this.sel.end = this.sel.start + this.portapapeles.length;
    }
  };

  /* ---- Command y ConcreteCommand ---- */
  function Comando(nombre, operacion, cambiaTexto) {
    this.nombre = nombre;
    this.operacion = operacion;
    this.cambiaTexto = cambiaTexto;
  }
  Comando.prototype.ejecutar = function () {
    this.respaldo = editor.texto;
    this.detalle = this.operacion === "pegar" ? editor.portapapeles : editor.seleccion();
    editor[this.operacion]();
    return this.cambiaTexto; // true: se puede deshacer
  };
  Comando.prototype.deshacer = function () { editor.texto = this.respaldo; };
  Comando.prototype.clonar = function () { return Object.assign(Object.create(Comando.prototype), this); };

  var comandos = {
    cortar: new Comando("ComandoCortar", "cortar", true),
    copiar: new Comando("ComandoCopiar", "copiar", false),
    pegar: new Comando("ComandoPegar", "pegar", true)
  };

  /* ---- Historial ---- */
  var historial = [];

  /* ---- Invoker ---- */
  function disparar(cmd, invocador) {
    syncSelection();
    if ((cmd === "cortar" || cmd === "copiar") && editor.sel.start === editor.sel.end) {
      return show(invocador, comandos[cmd].nombre + ".ejecutar()", "—", "Primero selecciona texto", "skip");
    }
    if (cmd === "pegar" && !editor.portapapeles) {
      return show(invocador, "ComandoPegar.ejecutar()", "—", "Portapapeles vacío", "skip");
    }
    var c = comandos[cmd].clonar();
    var cambio = c.ejecutar();
    if (cambio) historial.unshift(c);
    show(invocador, c.nombre + ".ejecutar()", "editor." + cmd + "()", cambio ? "apilar(c)" : "No se apila", cambio ? "" : "skip");
    render();
  }

  function deshacer(invocador) {
    var c = historial.shift();
    if (!c) return;
    c.deshacer();
    editor.sel.start = editor.sel.end = Math.min(editor.sel.start, editor.texto.length);
    show(invocador, c.nombre + ".deshacer()", "editor.setTexto(respaldo)", "desapilar()", "");
    render();
  }

  /* ---- Vista ---- */
  function syncSelection() {
    if (area.selectionStart !== area.selectionEnd || document.activeElement === area) {
      editor.sel = { start: area.selectionStart, end: area.selectionEnd };
    }
  }

  function render() {
    area.value = editor.texto;
    try { area.setSelectionRange(editor.sel.start, editor.sel.end); } catch (e) { /* sin foco */ }
    clipEl.textContent = editor.portapapeles ? "“" + editor.portapapeles + "”" : "vacío";
    countEl.textContent = historial.length;
    undoBtn.disabled = historial.length === 0;
    listEl.innerHTML = "";
    if (!historial.length) {
      listEl.innerHTML = '<li class="empty">Vacío. Corta o pega algo.</li>';
      return;
    }
    historial.forEach(function (c) {
      var li = document.createElement("li");
      var name = document.createElement("span");
      var det = document.createElement("small");
      name.textContent = c.nombre;
      det.textContent = "“" + c.detalle + "”";
      li.appendChild(name);
      li.appendChild(det);
      listEl.appendChild(li);
    });
  }

  var timers = [];
  function show(invoker, command, receiver, history, last) {
    timers.forEach(clearTimeout);
    timers = [];
    var values = { invoker: invoker, command: command, receiver: receiver, history: history };
    var steps = Array.prototype.slice.call(flow.children);
    steps.forEach(function (li) {
      li.classList.remove("on", "skip");
      // Permite partir la línea después de cada punto: ComandoPegar. / ejecutar()
      document.getElementById("f-" + li.dataset.step).textContent = values[li.dataset.step].replace(/\./g, ".​");
    });
    steps.forEach(function (li, i) {
      timers.push(setTimeout(function () {
        steps.forEach(function (s) { s.classList.remove("on"); });
        if (receiver === "—" && i > 1) { li.classList.add("skip"); return; }
        li.classList.add(i === 3 && last === "skip" ? "skip" : "on");
      }, i * 220));
    });
    timers.push(setTimeout(function () {
      steps.forEach(function (s) { s.classList.remove("on"); });
    }, steps.length * 220 + 900));
  }

  /* ---- Invocadores: botones y atajos ---- */
  document.querySelectorAll(".tool[data-cmd]").forEach(function (btn) {
    btn.addEventListener("pointerdown", function (e) { syncSelection(); e.preventDefault(); });
    btn.addEventListener("click", function () {
      disparar(btn.dataset.cmd, "Botón " + btn.textContent);
    });
  });
  undoBtn.addEventListener("pointerdown", function (e) { e.preventDefault(); });
  undoBtn.addEventListener("click", function () { deshacer("Botón Deshacer"); });

  area.addEventListener("keydown", function (e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    var map = { x: "cortar", c: "copiar", v: "pegar" };
    var key = e.key.toLowerCase();
    var mod = e.metaKey ? "Cmd+" : "Ctrl+";
    if (map[key]) { e.preventDefault(); disparar(map[key], "Atajo " + mod + key.toUpperCase()); }
    else if (key === "z") { e.preventDefault(); deshacer("Atajo " + mod + "Z"); }
  });

  ["select", "keyup", "pointerup"].forEach(function (ev) { area.addEventListener(ev, syncSelection); });
  document.addEventListener("selectionchange", function () {
    if (document.activeElement === area) syncSelection();
  });

  render();
})();
