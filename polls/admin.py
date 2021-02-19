from django.contrib import admin
from .models import Post, Board, Wall
from user.models import Anonymousman

admin.site.register(Board)
admin.site.register(Post)
admin.site.register(Wall)
admin.site.register(Anonymousman)