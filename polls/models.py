from django.db import models
from user.models import Anonymousman
import random, string
from django.utils import timezone

def random_slug(n):
    random_ = [random.choice(string.ascii_letters + string.digits + '-' + '_') for i in range(n)]
    return ''.join(random_)

class Wall(models.Model):
    slug_name = models.SlugField(max_length=18)
    name = models.CharField(max_length=36)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def number(self):
        return Board.objects.filter(board=self).count()

    def __str__(self):
        return self.name

class Board(models.Model):
    id = models.CharField(max_length=16, primary_key=True, unique=True)
    title = models.CharField(max_length=44)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    count = models.IntegerField(default=1)
    prev_board = models.ForeignKey('self', related_name='pre_board', blank=True, null=True, on_delete=models.CASCADE)
    next_board = models.ForeignKey('self', related_name='nex_board', blank=True, null=True, on_delete=models.CASCADE)
    wall = models.ForeignKey(Wall, blank=True, null=True, on_delete=models.CASCADE)
    can_write = models.BooleanField(default=True)
    alive = models.BooleanField(default=True)
    visible = models.BooleanField(default=True)

    def number(self):
        return Post.objects.filter(board=self).count()

    def __str__(self):
        return self.title

class Post(models.Model):
    anon = models.ForeignKey(Anonymousman, blank=True, null=True, on_delete=models.SET_NULL)
    content = models.TextField(max_length=1000, blank=False, null=False)
    posted = models.DateTimeField(auto_now_add=True)
    board = models.ForeignKey(Board, blank=True, null=True, on_delete=models.CASCADE)
    number = models.IntegerField(default=1)
    par = models.ForeignKey('self', related_name='parent', blank=True, null=True, on_delete=models.CASCADE)
    #chil = models.ManyToManyField('self', related_name='children')