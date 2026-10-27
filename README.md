# Taller · Patrón Command

Taller interactivo sobre el patrón de diseño **Command** (GoF), para la exposición de Arquitectura de software 2026-2, Universidad de Cartagena.

1. **Arma el patrón**: arrastra Client, Invoker, Command, ConcreteCommand y Receiver a su lugar en el diagrama de estructura. En celular también funciona tocando la pieza y luego la caja.
2. **Caso de uso**: el editor de texto de la presentación (Cortar, Copiar, Pegar, Deshacer), donde se ve el recorrido Invoker → Command → Receiver y la pila del historial.
3. **Taller de preguntas**: las 8 preguntas de la diapositiva 16, con puntaje por acierto y bono por rapidez.
4. **Ranking**: guarda nombre y puntaje.

Es HTML, CSS y JavaScript sin dependencias ni compilación. Se adapta desde un iPhone SE hasta un televisor y sigue el modo claro u oscuro del sistema.

## Abrirlo

Basta con abrir `index.html` en el navegador. Para servirlo localmente:

```bash
python -m http.server 5173
```

## Publicarlo en GitHub Pages

En el repositorio: **Settings → Pages → Deploy from a branch → `main` / root**.

## Sobre el ranking

El ranking usa `localStorage`: se guarda en el navegador de cada dispositivo, sin base de datos. Sirve si todos juegan en el mismo equipo (por ejemplo, el del proyector). Para un ranking compartido entre celulares se necesita un servicio que almacene los datos (Firebase o Supabase, por ejemplo). Basta con cambiar `js/store.js`, que expone `list()`, `add()` y `clear()`.

## Puntaje

| Parte | Puntos |
| --- | --- |
| Diagrama | 500 al primer intento, 100 menos por cada intento fallido (mínimo 100) |
| Pregunta correcta | 100 + hasta 50 por responder en menos de 20 s |

## Referencias

- Gamma, E., Helm, R., Johnson, R. y Vlissides, J. (1994). *Design patterns: Elements of reusable object-oriented software*. Addison-Wesley.
- Shvets, A. (2020). *Sumérgete en los patrones de diseño*. Refactoring.Guru.
