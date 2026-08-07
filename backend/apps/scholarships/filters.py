import django_filters
from .models import Scholarship


class ScholarshipFilter(django_filters.FilterSet):
    """Custom filters for scholarships."""
    country = django_filters.CharFilter(lookup_expr='iexact')
    degree_level = django_filters.CharFilter(lookup_expr='iexact')
    deadline_after = django_filters.DateFilter(field_name='application_deadline', lookup_expr='gte')
    deadline_before = django_filters.DateFilter(field_name='application_deadline', lookup_expr='lte')
    min_percentage = django_filters.NumberFilter(field_name='required_percentage', lookup_expr='lte',
                                                  label="My percentage (shows scholarships I qualify for)")

    class Meta:
        model = Scholarship
        fields = ['country', 'degree_level', 'is_active']
