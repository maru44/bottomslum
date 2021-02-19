from django.db import models
from django.contrib.auth.models import AbstractBaseUser
import random, string

def random_slug(n):
    random_ = [random.choice(string.ascii_letters + string.digits + '-' + '_') for i in range(n)]
    return ''.join(random_)

class Anonymousman(models.Model):
    aid = models.SlugField(max_length=16, unique=True, blank=True, null=True)
    ip = models.CharField(max_length=16, editable=False)
    dating = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.aid