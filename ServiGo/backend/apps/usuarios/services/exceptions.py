class ReglaNegocioError(Exception):
    """Se lanza cuando una regla de negocio no se cumple.

    El controller la captura y la traduce a una respuesta HTTP,
    usando `status_code` (400 por defecto)."""

    def __init__(self, mensaje, status_code=400):
        super().__init__(mensaje)
        self.mensaje = mensaje
        self.status_code = status_code
