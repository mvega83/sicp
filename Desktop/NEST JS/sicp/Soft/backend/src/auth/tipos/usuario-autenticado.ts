// Forma del usuario ya autenticado que queda disponible en `req.user` después de
// pasar por JwtAuthGuard (ver estrategias/jwt.strategy.ts).
export interface UsuarioAutenticado {
  id: string;
  correo: string;
  nombres: string;
  apellidos: string;
}
