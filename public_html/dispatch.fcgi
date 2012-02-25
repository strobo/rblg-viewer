#!/usr/bin/env python
import sys
import re
import urllib2
import pprint

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
        result += buf

        notes_url = re.compile('(/notes/\d+/\w+\?from_c=\d+)').search(buf)
        if not notes_url:
            return result
        next_url = base_url + notes_url.group(1)
    return result



def myapp(environ, start_response):
    #req = pprint.pformat(environ)
    req = environ.get('QUERY_STRING')
    req = req.partition('=')
    req = { req[0]: req[2]}
    start_response('200 OK', [('Content-Type', 'text/plain')])

    #return [getnote()]
    return [req]

if __name__ == '__main__':
    from fcgi import WSGIServer
    WSGIServer(myapp).run()

