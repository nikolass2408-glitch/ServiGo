from django.urls import path

from ..controllers.auth_controller import (
    ListaUsuariosView,
    RegistroUsuarioView,
    LoginUsuarioView,
)

urlpatterns = [
    path("usuarios/", ListaUsuariosView.as_view(), name="lista-usuarios"),
    path("registro/", RegistroUsuarioView.as_view(), name="registro"),
    path("login/", LoginUsuarioView.as_view(), name="login"),
]
