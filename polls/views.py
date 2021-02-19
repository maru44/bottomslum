from django.shortcuts import render, redirect
from .models import Post, Board, Wall
from user.models import Anonymousman
import random, string

def index(request):
    return render(request, 'polls/index.html')

def det(request, pk):
    board = Board.objects.get(pk=pk)
    return render(request, 'polls/index.html')

def walldetail(request, slug_name):
    wall = Wall.objects.get(slug_name=slug_name)
    return render(request, 'polls/index.html')

def anonposts(request, aid):
    anon = Anonymousman.objects.get(aid=aid)
    return render(request, 'polls/index.html')
