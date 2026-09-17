from ..repositories.usuario_repository import UsuarioRepository
from .exceptions import ReglaNegocioError


class AuthService:

    @staticmethod
    def login(username, password):
        usuario = UsuarioRepository.autenticar(username, password)

        if usuario is None:
            raise ReglaNegocioError(
                "Usuario o contraseña incorrectos",
                status_code=401
            )

        return usuario
