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

Sin configurar, el ranking usa `localStorage`: cada dispositivo ve solo sus puntajes.

Para compartirlo entre todos los celulares se usa **Cloud Firestore** (plan gratuito Spark):

1. En [console.firebase.google.com](https://console.firebase.google.com) crea un proyecto (Analytics no hace falta).
2. **Compilación → Firestore Database → Crear base de datos**, en modo producción y en una región cercana (por ejemplo `southamerica-east1`).
3. En la pestaña **Reglas**, pega el contenido de [`firestore.rules`](firestore.rules) y publica.
4. **Configuración del proyecto → General → Tus apps → Web (`</>`)**: registra la app y copia `projectId` y `apiKey` en [`js/firebase-config.js`](js/firebase-config.js).

La `apiKey` de Firebase no es secreta. Los datos los protegen las reglas: cualquiera puede leer y agregar un puntaje válido, pero nadie puede editar ni borrar desde la página. Para reiniciar el ranking, borra la colección `ranking` desde la consola.

## Puntaje

| Parte | Puntos |
| --- | --- |
| Diagrama | 500 al primer intento, 100 menos por cada intento fallido (mínimo 100) |
| Pregunta correcta | 100 + hasta 50 por responder en menos de 20 s |

## Referencias

- Gamma, E., Helm, R., Johnson, R. y Vlissides, J. (1994). *Design patterns: Elements of reusable object-oriented software*. Addison-Wesley.
- Shvets, A. (2020). *Sumérgete en los patrones de diseño*. Refactoring.Guru.
