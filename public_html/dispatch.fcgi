#!/usr/bin/env python
import sys
import re
import urllib2
sys.path.insert(0, "/home/FLX_PROJECT_NAME/lib/")

def getnote():
    url = 'http://strobot.tumblr.com/post/18064175108/yumoero-weekendneverdies-saitamanodoruji/'
    base_url = re.compile('(http://[\w-]+\.tumblr\.com)').search(url)
    base_url = base_url.group(1)

    res = urllib2.urlopen(url)
    return res.read()
    #notes_url = re.compile('(/notes/\d+/\w+)\?').search(res.read())

    #next_url = base_url + notes_url.group(1)
    #return next_url


def myapp(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain')])
    data = getnote();
    return ['Hello World!\n'+ data]

if __name__ == '__main__':
    from fcgi import WSGIServer
    WSGIServer(myapp).run()

