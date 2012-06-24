# coding:utf-8
import sys
import re
import urllib

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

html = """
<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<title>TumblrReblogViewer</title>
		<link rel="stylesheet" href="res/bootstrap/css/bootstrap.min.css">
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
		<script src="res/bootstrap/js/bootstrap-button.js"></script>
		<script src="res/jit.js"></script>
		<script src="res/client.js"></script>
		<style>
			body {
				padding-top: 60px;
				padding-bottom: 40px;
				background-color: #2C4762;
			}
			#textUrl {
				width:100%;
				height:32px;
				font-size: 24px;
			}
			#button {
				margin-left: 33%;
				width:33%;
				height:42px;
				font-size: 22px;
			}
			#graph {
				height: 900px;
				margin-left: auto;
				margin-right: auto;
				padding: 0px;
				width: 1300px;
				overflow: hidden;
				background-color:#173C61;
			}
			#notedata {
				display: none;
			}
			#ruler {
				visibility:hidden;
				position:absolute;
				white-space:nowrap;
				font-size:1.2em;
			}
			li {
				font-size:1.4em;
			}
			hr {
				border-top: 1px solid #999;
				border-bottom: 1px solid #ddd;
			}
			footer hr {
				border-top: 1px solid #333;
				border-bottom: 1px solid #555;
			}
			footer p {
				color: #ddd;
				text-align: center;
			}
		</style>
		<script type="text/javascript">
			var _gaq = _gaq || [];
			_gaq.push(["_setAccount", "UA-3891663-7"]);
			_gaq.push(["_trackPageview"]);

			(function() {
			 var ga = document.createElement("script"); ga.type = "text/javascript"; ga.async = true;
			 ga.src = ("https:" == document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";
			 var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(ga, s);
			 })();
		</script>
	</head>

	<body>
		<div class="container">
			<div class="hero-unit well">
				<h1><a href="http://reblog-visualizer.appspot.com/">TumblrReblogViewer</a></h1>
				<p>
				Tumblrのリブログを可視化<br>
				</p>
				<h3>これは何？</h3>
				<p>
				　自分のReblogが誰にリブログされたか気になりますよね。これはTumblrのnotesを使ってリブログを図で表示してくれるツールです。
				</p>
				<h3>使い方</h3>
				<p>　リブログを見たいPostのアドレス（例 http://strobot.tumblr.com/post/17156593361/hi-ru-ko-drawr)を下のテキストボックスに入力してShow Reblogをクリック。</p>
				<h3>制限</h3>
				<p>　notesを取得するTumblrAPIがないので、htmlから無理やりnotesを取得しています。<del>そのせいでだいたい50notes以上ないとうまく動作しません。</del><br><ins>50notes以下でも動作するように改善しました。</ins><br>
				あまりにもnotesが多い（数千notes以上）だと読み込みに時間がかかる（loading...のまま動かなくなる時もある）ので程々にしてね。</p>
				<h3>謝辞</h3>
				<p>　このツールはサーバーに<a href="https://developers.google.com/appengine/"target="_blank">GoogleAppEngine</a>を使用しています。Tumblrのnotesの取得に<a href="https://github.com/yuribossa/TumblrReblogTree"target="_blank">yuribossaさんのコード</a>を参考にしています。その他<a href="http://twitter.github.com/bootstrap/"target="_blank">TwitterBootstrap</a> <a href="http://jquery.com/"target="_blank">jQuery</a> <a href="http://thejit.org/"target="_blank">JavaScriptInfoVisToolkit</a>を使用しています。各開発者の方、ありがとうございます。
				</p>
				<h3>作者(strobo)について</h3>
				<p>
					<ul>
						<li><a href="http://strobot.tumblr.com/"target="_blank">Tumblr</a> フォローしてくれると喜びます</li>
						<li><a href="http://twitter.com/_strobo"target="_blank">Twitter</a> メッセージ・要望などはこちらへ</li>
						<li><a href="https://github.com/strobo/rblg-viewer"target="_blank">github</a> ソースコードをみたい方はこちらへ</li>
					</ul>
				</p>
				<hr>
				<div class="alert alert-error"id="errormsg"style="display:none">
					<a class="close">×</a>
					ごめんなさい。そのURLからはnoteを取得できませんでした。
				</div>
				<input type="text"id="textUrl"class="input-large"placeholder="Type Post URL">
				<button id="button"class="btn btn-primary btn-large"data-loading-text="loading...">Show Reblog</button>
			</div>
		</div>
		<div id="graph"class="well"></div>
		<footer>
		<hr>
		<p>&copy; Created by Strobo. 2012</p>
		</footer>
		<div id="notedata"></div>
		<a id="ruler"></a>
	</body>
</html>"""

def getNoteByThisHtml(page):
	try:
		# Extract between '<!-- START NOTES -->' to '<!-- END NOTES -->'
		return page.split('<!-- START NOTES -->')[1].split('<!-- END NOTES -->')[0]
	except IndexError:
		return 'notesNotFound'

def getNote(url):
	base_url = re.compile('(http://[\w-]+\.tumblr\.com)').search(url)
	if base_url is None:
		return 'notesNotFound'
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

class getNotes(webapp.RequestHandler):
	def get(self):
		#req = self.request.query_string
		req = self.request.get('q')
		if req == '':
			self.response.out.write(html)
			return
		self.response.out.write(getNote(req))

application = webapp.WSGIApplication([('/',getNotes)], debug=True)
def main():
	run_wsgi_app(application)

if __name__ == "__main__":
	main()
