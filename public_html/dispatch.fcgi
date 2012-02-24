#!/usr/bin/env python
import sys
import re
import urllib2
sys.path.insert(0, "/home/FLX_PROJECT_NAME/lib/")

def getnote():
    url = 'http://strobot.tumblr.com/post/18123513647/kamatama-udon-cherrypin'
    base_url = re.compile('(http://[\w-]+\.tumblr\.com)').search(url)
    base_url = base_url.group(1)

    res = urllib2.urlopen(url)
    notes_url = re.compile('(/notes/\d+/\w+)\?').search(res.read())

    next_url = base_url + notes_url.group(1)
    
    result = ''
    while next_url:
        res = urllib2.urlopen(next_url)
        buf = res.read();
        notes_url = re.compile('(/notes/\d+/\w+\?from_c=\d+)').search(buf)
        result += buf

        next_url = base_url + notes_url.group(1)
    return result



def myapp(environ, start_response):
    start_response('200 OK', [('Content-Type', 'text/plain')])
    data = getnote();
    return ['Hello World!\n'+ data]

if __name__ == '__main__':
    from fcgi import WSGIServer
    WSGIServer(myapp).run()

