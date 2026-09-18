from django.contrib.auth import authenticate

from ..data.roles import RolUsuario
from ..models import Usuario


class UsuarioRepository:
    """Acceso a datos para Usuario. No contiene reglas de negocio,
    solo lectura/escritura contra la base de datos."""

    @staticmethod
    def listar_todos():
        return Usuario.objects.all()

    @staticmethod
    def buscar_por_id(usuario_id):
        return Usuario.objects.get(pk=usuario_id)

    @staticmethod
    def autenticar(username, password):
        return authenticate(username=username, password=password)

    @staticmethod
    def clientes():
        return Usuario.objects.filter(rol=RolUsuario.CLIENTE)

    @staticmethod
    def clientes_de_profesional(profesional_id):
        return Usuario.objects.filter(
            rol=RolUsuario.CLIENTE,
            reservas__profesional_id=profesional_id
        ).distinct()
