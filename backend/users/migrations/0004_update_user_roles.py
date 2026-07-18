from django.db import migrations, models


def forwards(apps, schema_editor):
    CustomUser = apps.get_model("users", "CustomUser")
    CustomUser.objects.exclude(role="ADMIN").update(role="USER")


def backwards(apps, schema_editor):
    CustomUser = apps.get_model("users", "CustomUser")
    CustomUser.objects.exclude(role="ADMIN").update(role="CANDIDATE")


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0003_alter_customuser_role"),
    ]

    operations = [
        migrations.AlterField(
            model_name="customuser",
            name="role",
            field=models.CharField(choices=[("USER", "User"), ("ADMIN", "System admin")], default="USER", max_length=20),
        ),
        migrations.RunPython(forwards, backwards),
    ]