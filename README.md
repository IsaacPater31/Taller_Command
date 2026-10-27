# Taller · Patrón Command

Taller interactivo sobre el patrón de diseño **Command** (GoF), para la exposición de Arquitectura de software 2026-2, Universidad de Cartagena.

## Qué tiene

1. **Caso de uso**: el editor de texto de la presentación (Cortar, Copiar, Pegar, Deshacer). Se ve el recorrido Invoker → Command → Receiver y cómo se llena la pila del historial. Copiar no se apila porque no cambia el texto.
2. **Taller**, en dos partes. Hay que completar las dos para entrar al ranking, y cada una tiene **un solo intento**:
   - **Parte 1 · Arma el patrón**: arrastrar Client, Invoker, Command, ConcreteCommand y Receiver a su lugar en el diagrama de estructura. En celular también funciona tocando la pieza y luego la caja.
   - **Parte 2 · Preguntas**: las 8 de la diapositiva 16, con una explicación corta después de cada respuesta. Se habilitan al terminar el diagrama.
3. **Ranking** compartido entre todos los dispositivos, guardado en Cloud Firestore. Se actualiza solo cada 10 segundos.

Es HTML, CSS y JavaScript sin dependencias ni compilación. Se adapta desde un iPhone SE hasta un televisor y sigue el modo claro u oscuro del sistema.

## Puntaje

| Parte | Puntos |
| --- | --- |
| Diagrama | 100 por cada pieza en su lugar (un solo intento, máximo 500) |
| Cada pregunta correcta | 100 + hasta 50 por responder en menos de 20 s |
| **Máximo** | **1700** |

Si hay empate en puntos, gana quien terminó las preguntas en menos tiempo.

## Un solo intento

El progreso se guarda en el navegador de cada estudiante. Si recarga la página, ve su resultado del diagrama y sigue en la pregunta donde iba; no puede volver a responder ni repetir. Cada dispositivo guarda un solo puntaje en el ranking.

Para reiniciar un equipo de pruebas (por ejemplo, el del proyector), abre la página con `?reiniciar` al final de la dirección.

Sin inicio de sesión no se puede impedir del todo que alguien vuelva a intentarlo desde una ventana privada u otro navegador.

## Abrirlo en local

```bash
python -m http.server 5173
```

Y abrir `http://localhost:5173`. También funciona abriendo `index.html` directamente.

## Publicarlo en Vercel

1. Importar este repositorio en [vercel.com/new](https://vercel.com/new).
2. **Framework Preset**: Other. Dejar vacíos **Build Command** y **Output Directory**.
3. Desplegar. Cada `git push` a `main` vuelve a publicar el sitio.

## Ranking con Firebase

El ranking está conectado al proyecto de Firebase `taller-command` ([`js/firebase-config.js`](js/firebase-config.js)). La página habla con Firestore mediante su API REST, sin instalar el SDK. Si `projectId` queda vacío, el ranking se guarda solo en el navegador de cada dispositivo (`localStorage`).

Para usar otro proyecto:

1. En [console.firebase.google.com](https://console.firebase.google.com) crear un proyecto.
2. **Compilación → Firestore Database → Crear base de datos**, en modo producción.
3. En la pestaña **Reglas**, pegar el contenido de [`firestore.rules`](firestore.rules) y publicar.
4. **Configuración del proyecto → General → Tus apps → Web (`</>`)**: registrar la app y copiar `projectId` y `apiKey` en `js/firebase-config.js`.

La `apiKey` de Firebase no es secreta. Los datos los protegen las reglas: cualquiera puede leer y agregar un puntaje válido (nombre de hasta 24 caracteres, máximo 1700 puntos), pero nadie puede editar ni borrar desde la página. Para reiniciar el ranking entre grupos, borrar la colección `ranking` desde la consola de Firebase.

## Archivos

```
index.html             Página única
css/styles.css         Estilos
js/editor.js           Caso de uso (Receiver, comandos, historial)
js/diagram.js          Parte 1: arrastrar al diagrama
js/quiz.js             Parte 2: preguntas y resultado
js/ranking.js          Lista del ranking
js/store.js            Guardado: Firestore o localStorage
js/firebase-config.js  Datos del proyecto de Firebase
firestore.rules        Reglas de seguridad de Firestore
```

## Referencias

- Gamma, E., Helm, R., Johnson, R. y Vlissides, J. (1994). *Design patterns: Elements of reusable object-oriented software*. Addison-Wesley.
- Shvets, A. (2020). *Sumérgete en los patrones de diseño*. Refactoring.Guru.
