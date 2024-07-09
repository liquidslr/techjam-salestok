from rest_framework import serializers


class ChoiceDisplaySerializerField(serializers.CharField):
    """
    Use this class method for all the positive integer
    field with choices to get display value instead of actual
    """

    def get_attribute(self, instance):
        return instance

    def to_representation(self, value, *args, **kwargs):
        if self.source_attrs:
            display_value = getattr(value, f"get_{self.source_attrs[0]}_display")()
            return str(display_value) if display_value is not None else ""
        return ""
