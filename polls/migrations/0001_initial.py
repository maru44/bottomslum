# Generated by Django 3.1 on 2020-09-01 14:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Board',
            fields=[
                ('id', models.CharField(max_length=16, primary_key=True, serialize=False, unique=True)),
                ('title', models.CharField(max_length=44)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
                ('count', models.IntegerField(default=1)),
                ('can_write', models.BooleanField(default=True)),
                ('alive', models.BooleanField(default=True)),
                ('visible', models.BooleanField(default=True)),
                ('next_board', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='nex_board', to='polls.board')),
                ('prev_board', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='pre_board', to='polls.board')),
            ],
        ),
        migrations.CreateModel(
            name='Wall',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug_name', models.SlugField(max_length=18)),
                ('name', models.CharField(max_length=36)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(max_length=1000)),
                ('posted', models.DateTimeField(auto_now_add=True)),
                ('number', models.IntegerField(default=1)),
                ('anon', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='user.anonymousman')),
                ('board', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='polls.board')),
                ('par', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='parent', to='polls.post')),
            ],
        ),
        migrations.AddField(
            model_name='board',
            name='wall',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='polls.wall'),
        ),
    ]
