/* Ranking: lee y muestra los puntajes guardados. */
(function () {
  var list = document.getElementById("board");
  var note = document.getElementById("board-note");
  var clearBtn = document.getElementById("board-clear");
  var mine = Score.savedId;

  if (Store.remote) note.textContent = "Un solo intento. Aquí no hay deshacer.";

  function message(text) {
    list.innerHTML = "";
    var li = document.createElement("li");
    li.className = "empty";
    li.textContent = text;
    list.appendChild(li);
  }

  function render() {
    return Store.list().then(function (rows) {
      clearBtn.hidden = Store.remote || rows.length === 0;
      if (!rows.length) return message("Aún no hay puntajes. Termina el taller y sé el primero.");
      list.innerHTML = "";
      rows.slice(0, 20).forEach(function (r) {
        var li = document.createElement("li");
        if (r.id === mine) li.className = "me";
        var who = document.createElement("span");
        who.className = "who";
        who.textContent = r.name;
        var meta = document.createElement("small");
        meta.textContent = r.right + "/" + r.of + " aciertos · diagrama " + r.diagram + " · " + window.fmtTime(r.time);
        who.appendChild(meta);
        var pts = document.createElement("span");
        pts.className = "pts";
        pts.textContent = r.total;
        li.appendChild(who);
        li.appendChild(pts);
        list.appendChild(li);
      });
    }).catch(function () {
      message("No se pudo cargar el ranking. Revisa la conexión.");
    });
  }

  document.addEventListener("ranking:changed", function (e) {
    mine = e.detail;
    render();
  });

  clearBtn.addEventListener("click", function () {
    if (confirm("¿Borrar todos los puntajes de este dispositivo?")) Store.clear().then(render);
  });

  // En línea: refresca cada 10 s mientras la página está visible (útil en el proyector)
  if (Store.remote) {
    setInterval(function () {
      if (document.visibilityState === "visible") render();
    }, 10000);
  }

  render();
})();
