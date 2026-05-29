from django.core.management.base import BaseCommand
from users.factories import CustomUserFactory

from users.models import CustomUser

class Command(BaseCommand):
    
    def add_arguments(self, parser):
        parser.add_argument("--total", default=10, type=int, help="Number of users will be created")
    
    def handle(self, *args, **options):
        total = options["total"]
        
        users = CustomUserFactory.build_batch(total)
        
        CustomUser.objects.bulk_create(users)
        
        self.stdout.write(f"{total} Users created successfully")