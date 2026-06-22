// Déclarations ambiantes pour les imports CSS (web / NativeWind).
// Permet l'import à effet de bord de feuilles globales et l'import de CSS modules.
declare module "*.css";

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
