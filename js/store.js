/*
 * Almacenamiento del ranking.
 * Si js/firebase-config.js tiene un projectId, usa Cloud Firestore (ranking
 * compartido entre todos los dispositivos). Si no, usa localStorage.
 * Las dos versiones exponen la misma interfaz: list(), add(entry), clear().
 */
window.Store = (function () {
  var cfg = window.FIREBASE || {};
  var FIELDS = ["name", "total", "diagram", "right", "of", "time", "date"];

  function sortRows(rows) {
    return rows.sort(function (a, b) { return b.total - a.total || a.time - b.time; });
  }

  /* ---------- Local: solo este dispositivo ---------- */
  function local() {
    var KEY = "taller-command:ranking";

    function read() {
      try { return JSON.parse(localStorage.getItem(KEY)) || []; }
      catch (e) { return []; }
    }

    function write(list) {
      try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* modo privado */ }
    }

    return {
      remote: false,
      list: function () { return Promise.resolve(sortRows(read())); },
      add: function (entry) {
        var list = read();
        entry.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        list.push(entry);
        write(list);
        return Promise.resolve(entry);
      },
      clear: function () {
        write([]);
        return Promise.resolve();
      }
    };
  }

  /* ---------- Firestore: compartido (API REST, sin SDK) ---------- */
  function firestore() {
    var base = "https://firestore.googleapis.com/v1/projects/" + encodeURIComponent(cfg.projectId) +
      "/databases/(default)/documents";
    var key = cfg.apiKey ? "?key=" + encodeURIComponent(cfg.apiKey) : "";

    function request(url, body) {
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(function (res) {
        if (!res.ok) throw new Error("Firestore " + res.status);
        return res.json();
      });
    }

    function toFields(entry) {
      var fields = {};
      FIELDS.forEach(function (f) {
        fields[f] = typeof entry[f] === "string" ? { stringValue: entry[f] } : { integerValue: String(entry[f]) };
      });
      return fields;
    }

    function fromDoc(doc) {
      var row = { id: doc.name.split("/").pop() };
      FIELDS.forEach(function (f) {
        var v = doc.fields[f] || {};
        row[f] = "stringValue" in v ? v.stringValue : Number(v.integerValue || 0);
      });
      return row;
    }

    return {
      remote: true,
      list: function () {
        return request(base + ":runQuery" + key, {
          structuredQuery: {
            from: [{ collectionId: "ranking" }],
            orderBy: [{ field: { fieldPath: "total" }, direction: "DESCENDING" }],
            limit: 50
          }
        }).then(function (results) {
          return sortRows(results.filter(function (r) { return r.document; }).map(function (r) { return fromDoc(r.document); }));
        });
      },
      add: function (entry) {
        return request(base + "/ranking" + key, { fields: toFields(entry) }).then(fromDoc);
      },
      clear: function () {
        // Las reglas no permiten borrar desde la página: se hace en la consola de Firebase.
        return Promise.reject(new Error("No disponible"));
      }
    };
  }

  return cfg.projectId ? firestore() : local();
})();
