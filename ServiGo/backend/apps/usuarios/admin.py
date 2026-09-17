from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Usuario, Profesional, Servicio, Horario, Reserva


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (
            "Información adicional",
            {
                "fields": ("rol", "telefono"),
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Información adicional",
            {
                "fields": ("rol", "telefono"),
            },
        ),
    )


@admin.register(Profesional)
class ProfesionalAdmin(admin.ModelAdmin):
    list_display = (
        "nombre_negocio",
        "usuario",
        "tipo_negocio",
        "telefono",
        "activo",
    )

    search_fields = (
        "nombre_negocio",
        "usuario__username",
    )

    list_filter = (
        "tipo_negocio",
        "activo",
    )


@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = (
        "nombre",
        "profesional",
        "precio",
        "duracion",
        "activo",
    )

    list_filter = ("activo",)

    search_fields = (
        "nombre",
        "profesional__nombre_negocio",
    )


@admin.register(Horario)
class HorarioAdmin(admin.ModelAdmin):
    list_display = (
        "profesional",
        "dia",
        "hora_inicio",
        "hora_fin",
        "activo",
    )

    list_filter = ("dia", "activo")


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = (
        "cliente",
        "profesional",
        "servicio",
        "fecha",
        "hora",
        "estado",
    )

    list_filter = ("estado", "fecha")

    search_fields = (
        "cliente__username",
        "profesional__nombre_negocio",
        "servicio__nombre",
    )