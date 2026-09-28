from rest_framework import serializers

class BaseLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.CharField(source='nome')

    class Meta:
        abstract = True

class BaseWriteSerializer(serializers.ModelSerializer):
    """
    Convenção:
    - FK sempre como entidade_id
    - source aponta para o campo real
    """

    def build_relational_field(self, field_name, relation_info):
        field_class, field_kwargs = super().build_relational_field(field_name, relation_info)

        field_kwargs['queryset'] = relation_info.related_model.objects.all()
        return serializers.PrimaryKeyRelatedField, field_kwargs

class BaseReadSerializer(serializers.ModelSerializer):
    """
    Convenção:
    - FK → entidade_id + entidade_nome
    """

    def to_representation(self, instance):
        data = super().to_representation(instance)

        for field in instance._meta.fields:
            if field.is_relation and field.many_to_one:
                field_name = field.name
                related_obj = getattr(instance, field_name)

                if related_obj:
                    data[f"{field_name}_id"] = related_obj.id

                    if hasattr(related_obj, "nome"):
                        data[f"{field_name}_nome"] = related_obj.nome

        return data
