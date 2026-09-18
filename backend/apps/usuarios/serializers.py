from django.utils import timezone
from rest_framework import serializers

from .data.roles import RolUsuario
from .data.estados_reserva import EstadoReserva
from .models import Usuario, Profesional, Servicio, Horario, Reserva, Notificacion


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "rol",
            "telefono",
        ]


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = [
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "rol",
            "telefono",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")

        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()

        return usuario


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ProfesionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profesional
        fields = [
            "id",
            "usuario",
            "tipo_negocio",
            "nombre_negocio",
            "descripcion",
            "telefono",
            "direccion",
            "imagen",
            "enlace_personalizado",
            "activo",
        ]


class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = [
            "id",
            "profesional",
            "nombre",
            "descripcion",
            "precio",
            "duracion",
            "activo",
        ]


class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = [
            "id",
            "profesional",
            "dia",
            "hora_inicio",
            "hora_fin",
            "activo",
        ]


class ReservaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Reserva
        fields = [
            "id",
            "profesional",
            "servicio",
            "cliente",
            "fecha",
            "hora",
            "estado",
            "notas",
            "creada_en",
            "actualizada_en",
        ]
        read_only_fields = [
            "id",
            "creada_en",
            "actualizada_en",
        ]

    def validate(self, data):
        profesional = data.get("profesional")
        servicio = data.get("servicio")
        cliente = data.get("cliente")
        fecha = data.get("fecha")
        hora = data.get("hora")

        # 1. Validar que el profesional esté activo
        if not profesional.activo:
            raise serializers.ValidationError(
                "El profesional no está disponible actualmente."
            )

        # 2. Validar que el servicio pertenezca al profesional
        if servicio.profesional_id != profesional.id:
            raise serializers.ValidationError(
                "El servicio seleccionado no pertenece a este profesional."
            )

        # 3. Validar que el servicio esté activo
        if not servicio.activo:
            raise serializers.ValidationError(
                "El servicio seleccionado no está disponible."
            )

        # 4. Validar que el usuario sea cliente
        if cliente.rol != RolUsuario.CLIENTE:
            raise serializers.ValidationError(
                "El usuario seleccionado no tiene rol de cliente."
            )

        # 5. Validar que la fecha no sea anterior a hoy
        hoy = timezone.localdate()

        if fecha < hoy:
            raise serializers.ValidationError(
                "No puedes crear una reserva en una fecha pasada."
            )

        # 6. Obtener el día de la semana
        dia_semana = fecha.weekday()

        # 7. Buscar horario del profesional para ese día
        horarios = Horario.objects.filter(
            profesional=profesional,
            dia=dia_semana,
            activo=True
        )

        if not horarios.exists():
            raise serializers.ValidationError(
                "El profesional no tiene horario disponible para ese día."
            )

        # 8. Validar que la hora esté dentro del horario
        horario_valido = horarios.filter(
            hora_inicio__lte=hora,
            hora_fin__gt=hora
        ).exists()

        if not horario_valido:
            raise serializers.ValidationError(
                "La hora seleccionada está fuera del horario de atención."
            )

        # 9. Evitar reserva duplicada
        reserva_existente = Reserva.objects.filter(
            profesional=profesional,
            fecha=fecha,
            hora=hora
        ).exclude(
            estado=EstadoReserva.CANCELADA
        ).exists()

        if reserva_existente:
            raise serializers.ValidationError(
                "Ese horario ya está reservado."
            )

        return data
    

class NotificacionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notificacion
        fields = [
            "id",
            "usuario",
            "reserva",
            "tipo",
            "mensaje",
            "leida",
            "creada_en",
        ]
        read_only_fields = [
            "id",
            "creada_en",
        ]