#!/usr/bin/env python
import sys
import urllib2
sys.path.insert(0, "/home/FLX_PROJECT_NAME/lib/")

def getnote():
    f = urllib2.urlopen('http://www.python.org/')
    return f.read()
def myapp(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain')])
    data = getnote();
    return ['Hello World!\n'+ data]

if __name__ == '__main__':
    from fcgi import WSGIServer
    WSGIServer(myapp).run()

