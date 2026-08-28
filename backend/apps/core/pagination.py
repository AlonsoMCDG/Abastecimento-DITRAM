from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10                      # Default size if param is not provided
    page_query_param = 'page'           # Parameter name client uses
    page_size_query_param = 'page_size' # Parameter name client uses
    max_page_size = 100                 # Maximum limit client can request

    # ------------------------------------------------------------
    # URLs relativas nos links de paginação (next/previous)
    #
    # O PageNumberPagination padrão do DRF gera URLs ABSOLUTAS
    # (ex.: "http://localhost:8000/api/...?page=2"), o que pode
    # fixar um host errado no payload quando o frontend acessa a API
    # por um host diferente (localhost x 127.0.0.1 x IP da rede).
    #
    # Com links relativos, quem consome a API decide qual base usar,
    # eliminando de vez essa classe de inconsistência de origem.
    # ------------------------------------------------------------

    def _relative_link(self, link: str | None) -> str | None:
        if link is None:
            return None

        # Remove o esquema + host + porta, mantendo apenas o caminho
        # (ex.: "http://localhost:8000/api/v1/...?page=2" -> "/api/v1/...?page=2")
        parts = link.split('://', 1)
        if len(parts) == 2:
            _, rest = parts
            rest = rest.split('/', 1)[1] if '/' in rest else ''
            return f'/{rest}'

        return link

    def get_paginated_response(self, data):
        next_url = self._relative_link(self.get_next_link())
        previous_url = self._relative_link(self.get_previous_link())

        return Response({
            'count': self.page.paginator.count,
            'next': next_url,
            'previous': previous_url,
            'results': data,
        })
