import graphene
from graphene_django import DjangoObjectType
from .models import Board, Post, Wall
from user.models import Anonymousman
from graphene_django.filter import DjangoFilterConnectionField
import random, string
from django_filters import FilterSet, OrderingFilter
import datetime, re

MAX_POST_PER_BOAD = 21

def gen_id(int_):
    random_ = [random.choice(string.ascii_letters + string.digits + '-' + '_') for i in range(int_)]
    id_ = ''.join(random_)
    return id_

def get_ip(info):
    fowarded_address = info.context.META.get('HTTP_X_FORWARDED_FOR')
    if fowarded_address:
        client_addr = fowarded_address.split(',')[0]
        return client_addr
    else:
        client_addr = info.context.META.get('REMOTE_ADDR')
        return client_addr

class AnonType(DjangoObjectType):
    class Meta:
        model = Anonymousman
        filter_fields = ['aid']
        interfaces = (graphene.relay.Node, )

class PostType(DjangoObjectType):
    pk = graphene.Int(source='pk')
    class Meta:
        model = Post
        filter_fields = ['anon', 'anon__aid', 'content', 'posted', 'board', 'board__id', 'number', 'par']
        interfaces = (graphene.relay.Node, )

class PostFilter(FilterSet):
    class Meta:
        model = Post
        fields = {
            "posted": ["exact"],
            'board__id': ['exact'],
            'anon__aid': ['exact'],
        }

    order_by = OrderingFilter(
        fields = (
            ("posted", "posted"),
        )
    )

class BoardType(DjangoObjectType):
    pk = graphene.String(source='pk')
    class Meta:
        model = Board
        #filter_fields = ['id', 'title', 'created', 'updated', 'count', 'prev_board', 'next_board']
        filter_fields = {
            "id": ["exact", "startswith"],
            "created": ["exact"],
            "updated": ["exact"],
            "count": ["exact"],
            "title": ["icontains"],
            "created": ["exact"],
            "prev_board": ["exact"],
            "next_board": ["exact"],
            "wall": ["exact"],
        }
        interfaces = (graphene.relay.Node, )

class BoardFilter(FilterSet):
    class Meta:
        model = Board
        fields = {
            "updated": ["exact"],
            "title": ["icontains"],
            "wall__slug_name": ["exact"]
        }

    order_by = OrderingFilter(
        fields = (
            ("updated", "updated"),
        )
    )

class WallType(DjangoObjectType):
    class Meta:
        model = Wall
        filter_fields = ['name', 'slug_name', 'updated']
        interfaces = (graphene.relay.Node, )

class BoardType2(DjangoObjectType):
    pk = graphene.String(source='pk')
    class Meta:
        model = Board
        filter_fields = ['id', 'title', 'created', 'updated', 'number']

class Query(graphene.ObjectType):
    anon = graphene.relay.Node.Field(AnonType)
    post = graphene.relay.Node.Field(PostType)
    board = graphene.relay.Node.Field(BoardType)
    wall = graphene.relay.Node.Field(WallType)
    all_anons = DjangoFilterConnectionField(AnonType)
    all_posts = DjangoFilterConnectionField(PostType, filterset_class=PostFilter)
    #all_boards = DjangoFilterConnectionField(BoardType, orderBy=graphene.List(of_type=graphene.String))
    all_boards = DjangoFilterConnectionField(BoardType,
        filterset_class=BoardFilter)
    all_walls = DjangoFilterConnectionField(WallType)
    boards = graphene.List(BoardType2)

    def resolve_boards(self, info, **kwargs):
        return Board.objects.all()

class CreateBoard(graphene.Mutation):
    id = graphene.Int()
    content = graphene.String()
    anon = graphene.Field(AnonType)
    number = graphene.Int()
    board = graphene.Field(BoardType, id=graphene.String(), title=graphene.String())
    wall = graphene.Field(WallType, slug_name=graphene.String())

    class Arguments:
        title=graphene.String()
        content = graphene.String()
        board = graphene.JSONString()
        slug_name = graphene.String()
        wall = graphene.JSONString()

    def mutate(self, info, content, title, slug_name, **kwargs):
        today = datetime.date.today()
        client_addr = get_ip(info)

        if Anonymousman.objects.filter(ip=client_addr, dating=today).exists():
            anon = Anonymousman.objects.prefetch_related('post_set').get(ip=client_addr, dating=today)
        else:
            aid__ = gen_id(16)
            anon = Anonymousman.objects.create(ip=client_addr, aid=aid__)

        #wall = Wall.objects.prefetch_related('board_set').get(slug_name=slug_name)
        wall = Wall.objects.get(slug_name=slug_name)
        
        bid = gen_id(8) + "-00001"
        board = Board.objects.create(title=title, id=bid, wall=wall)

        post = Post.objects.create(content=content, board=board, number=1, anon=anon)

        return CreateBoard(
            board = post.board,
            content = post.content,
            number = post.number,
            anon = post.anon,
        )


class CreatePost(graphene.Mutation):
    id = graphene.Int()
    content = graphene.String()
    posted = graphene.DateTime()
    anon = graphene.Field(AnonType)
    number = graphene.Int()
    board = graphene.Field(BoardType, id=graphene.String())

    class Arguments:
        content = graphene.String()
        board_pk = graphene.String()

    def mutate(self, info, board_pk, content, **kwargs):
        today = datetime.date.today()
        client_addr = get_ip(info)

        if Anonymousman.objects.filter(ip=client_addr, dating=today).exists():
            anon = Anonymousman.objects.prefetch_related('post_set').get(ip=client_addr, dating=today)
        else:
            aid__ = gen_id(16)
            anon = Anonymousman.objects.create(ip=client_addr, aid=aid__)

        board = Board.objects.select_related('wall').prefetch_related('post_set').get(pk=board_pk)
        if board.can_write:
            num = Post.objects.only('id').count()
            num = int(num) + 1

            if num >= MAX_POST_PER_BOAD:#1001にする
                board.can_write = False
                
                bid = board.id
                board_id_slug = bid[:9]
                str_board_num = bid[9:]
                new_num = int(str_board_num) + 1
                board_num = '{0:05d}'.format(new_num)
                new_id = board_id_slug + board_num
                new_title = re.sub(r'(\spart(\d)+)$', "", str(board.title), 1) + " part" + str(new_num)

                board_new = Board.objects.create(title=new_title, id=new_id, prev_board=board, count=2, wall=board.wall)
                board.next_board = board_new

                post_first = Post.objects.select_related('board').prefetch_related('anon_set').get(board=board, number=1)
                post_first_str = str(post_first.content)

                Post.objects.create(board=board_new, content=post_first_str, anon=anon)
                post = Post.objects.create(content=content, board=board_new, number=2, anon=anon)
            else:
                board.count += 1
                post = Post.objects.create(content=content, board=board, number=num, anon=anon)
            board.save()
            return CreatePost(
                board = post.board,
                content = post.content,
                number = post.number,
                anon = post.anon,
            )

class CreateRep(graphene.Mutation):
    id = graphene.Int()
    content = graphene.String()
    posted = graphene.DateTime()
    anon = graphene.Field(AnonType)
    number = graphene.Int()
    board = graphene.Field(BoardType, id=graphene.String())

    class Arguments:
        content = graphene.String()
        board_pk = graphene.String()
        par_pk = graphene.String()

    def mutate(self, info, board_pk, par_pk, content, **kwargs):
        today = datetime.date.today()
        client_addr = get_ip(info)

        if Anonymousman.objects.filter(ip=client_addr, dating=today).exists():
            anon = Anonymousman.objects.prefetch_related('post_set').get(ip=client_addr, dating=today)
        else:
            aid__ = gen_id(16)
            anon = Anonymousman.objects.create(ip=client_addr, aid=aid__)

        board = Board.objects.select_related('wall').prefetch_related('post_set').get(pk=board_pk)
        parent = Post.objects.get(pk=par_pk)

        if board.can_write:
            num = Post.objects.only('id').count()
            num = int(num) + 1
            if num < MAX_POST_PER_BOAD:
                board.count += 1
                post = Post.objects.create(content=content, board=board, number=num, anon=anon, par=parent)
            board.save()
            return CreateRep(
                board = post.board,
                content = post.content,
                number = post.number,
                anon = post.anon,
            )

class Mutation(graphene.ObjectType):
    create_board = CreateBoard.Field()
    create_post = CreatePost.Field()
    create_rep = CreateRep.Field()
    