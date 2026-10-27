/*
 * Ranking compartido con Cloud Firestore.
 * Pega aquí los datos de tu proyecto (Consola de Firebase → Configuración del
 * proyecto → General → Tus apps → Web). Si projectId queda vacío, el ranking
 * se guarda solo en cada dispositivo.
 *
 * La apiKey de Firebase no es secreta: identifica el proyecto. Lo que protege
 * los datos son las reglas de firestore.rules.
 */
window.FIREBASE = {
  projectId: "taller-command",
  apiKey: "AIzaSyDLAr6H2ZM70kzlOsZpyad3VxA8XqouXQk"
};
