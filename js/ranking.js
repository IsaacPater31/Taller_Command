/* Ranking: lee y muestra los puntajes guardados. */
(function () {
  var list = document.getElementById("board");
  var clearBtn = document.getElementById("board-clear");
  var mine = null;

  function render() {
    Store.list().then(function (rows) {
      list.innerHTML = "";
      clearBtn.hidden = rows.length === 0;
      if (!rows.length) {
        list.innerHTML = '<li class="empty">Aún no hay puntajes. Termina el taller y sé el primero.</li>';
        return;
      }
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
    });
  }

  document.addEventListener("ranking:changed", function (e) {
    mine = e.detail;
    render();
  });

  clearBtn.addEventListener("click", function () {
    if (confirm("¿Borrar todos los puntajes de este dispositivo?")) Store.clear().then(render);
  });

  render();
})();
