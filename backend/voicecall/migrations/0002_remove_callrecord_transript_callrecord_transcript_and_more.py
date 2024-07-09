# Generated by Django 4.2.13 on 2024-07-08 14:35

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("voicecall", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="callrecord",
            name="transript",
        ),
        migrations.AddField(
            model_name="callrecord",
            name="transcript",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="callsummary",
            name="text",
            field=models.TextField(blank=True, null=True),
        ),
    ]