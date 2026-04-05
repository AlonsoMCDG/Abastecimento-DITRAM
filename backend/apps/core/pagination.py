from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10                      # Default size if param is not provided
    page_query_param = 'page'           # Parameter name client uses
    page_size_query_param = 'page_size' # Parameter name client uses
    max_page_size = 100                 # Maximum limit client can request
