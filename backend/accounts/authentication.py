from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import CSRFCheck
from rest_framework.exceptions import PermissionDenied


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get("access_token")

        if not access_token:
            return None

        validated_token = self.get_validated_token(access_token)
        self.enforce_csrf(request)
        return (self.get_user(validated_token),validated_token)

    def enforce_csrf(self, request):
        check = CSRFCheck(lambda request: None)
        check.process_request(request)

        reason = check.process_view(request, None, (), {})

        if reason:
            raise PermissionDenied(f"CSRF Failed: {reason}")