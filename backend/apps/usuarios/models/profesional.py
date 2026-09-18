from django.db import models

from ..data.tipos_negocio import TipoNegocio
from .usuario import Usuario


class Profesional(models.Model):
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        related_name="profesional"
    )

    tipo_negocio = models.CharField(
        max_length=20,
        choices=TipoNegocio.choices,
        default=TipoNegocio.OTRO
    )

    nombre_negocio = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    direccion = models.CharField(max_length=200, blank=True)
    imagen = models.URLField(blank=True)

    enlace_personalizado = models.SlugField(
        max_length=100,
        unique=True
    )

    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre_negocio
