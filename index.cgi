#!/usr/bin/python3
"""
CGI-обвязка для запуска Flask-приложения через Apache mod_cgi — запасной
вариант на случай, если на этом shared-тарифе нельзя держать постоянный
процесс (gunicorn). Если процесс держать можно — этот файл не нужен,
используйте gunicorn напрямую (см. инструкцию по деплою).
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from wsgiref.handlers import CGIHandler
from app import app as application


class _ScriptNameFixCGIHandler(CGIHandler):
    """Apache кладёт путь до этого файла в SCRIPT_NAME (например,
    '/index.cgi'), из-за чего Flask генерировал бы ссылки вида
    '/index.cgi/catalog' вместо '/catalog'. Обнуляем SCRIPT_NAME, чтобы
    url_for() строил обычные корневые пути."""

    def setup_environ(self):
        CGIHandler.setup_environ(self)
        if self.environ.get('SCRIPT_NAME', '').endswith('index.cgi'):
            self.environ['SCRIPT_NAME'] = ''


_ScriptNameFixCGIHandler().run(application)
