#!/usr/bin/env python
import sys
import re
import urllib
#import pprint

sys.path.insert(0, "/home/FLX_PROJECT_NAME/lib/")

def getNoteByThisHtml(page):
    return 'getNoteByHtml'
def getNote(url):
    #url = 'http://strobot.tumblr.com/post/18123513647/kamatama-udon-cherrypin'
    base_url = re.compile('(http://[\w-]+\.tumblr\.com)').search(url)
    if base_url is None:
        return 'invalidURL'
    base_url = base_url.group(1)

    res = urllib.urlopen(url)
    page = res.read()
    notes_url = re.compile('(/notes/\d+/\w+)\?').search(page)
    if notes_url is None:
        return getNoteByThisHtml(page)

    next_url = base_url + notes_url.group(1)
    
    result = ''
    while next_url:
        res = urllib.urlopen(next_url)
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
    req = urllib.unquote(req)
    req = req.partition('=')
    req = { req[0]: req[2]}
    start_response('200 OK', [('Content-Type', 'text/plain')])

    return [getNote(req['q'])]
    #return [pprint.pformat(req)]

if __name__ == '__main__':
    from fcgi import WSGIServer
    WSGIServer(myapp).run()

