"""Expected application errors with an associated HTTP status."""


class AppException(Exception):
    """An expected application error that can be returned to an API client."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        """Create an application error with a safe client-facing message."""
        super().__init__(message)
        self.message = message
        self.status_code = status_code
