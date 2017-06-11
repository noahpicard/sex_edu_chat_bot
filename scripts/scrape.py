import urllib2
import json
import re
import pickle
from BeautifulSoup import BeautifulSoup

def cleanhtml(raw):
	cleanr = re.compile('<.*?>|\\n')
 	raw = re.sub(cleanr, ' ', raw)
	raw = BeautifulSoup(raw).getText()
	raw = raw.replace(u"\u2018", "'").replace(u"\u2019", "'").replace(u"\u201c", '"').replace(u"\u201d", '"')
	raw = raw.replace(' .', '.').replace(' ,', ',')
	raw = ' '.join(raw.split())
	return raw

def extract_links(source):
	links = set([]);
	i = source.find('<article');
	source = source[i:]
	j = source.find('</section>');
	source = source[:j]
	while source.find('href')>0:
		i = source.find('href') + 6
		source = source[i:]
		j = source.find('"')
		links.add(source[:j])
	return links

def parse_link(link):
	html = urllib2.urlopen(link).read()
	i = html.find('<h1 class="title')
	html = html[i:]
	i = html.find('>') + 1
	html = html[i:]
	j = html.find('</h1>')
	question = html[:j]

	i = html.find('<p>')
	html = html[i:]
	j = html.find('<div id="mobile-social" class="clearfix">')
	answer = html[:j]

	return cleanhtml(question), cleanhtml(answer)

faq_source = urllib2.urlopen('https://sexetc.org/sex-ed/info-center/faqs/?pageNum=100').read(); # FAQs
term_source = urllib2.urlopen('https://sexetc.org/sex-ed/sex-terms/?pageNum=100').read(); # terms
links = list(extract_links(faq_source) | extract_links(term_source))
mapping = {}
i = 0
for link in links:
	q, a = parse_link(link)
	mapping[q] = a
	pickle.dump(mapping, open('answers.p', 'w'))
	i += 1
	print i
json.dump(mapping, open('../answers.json', 'w'), indent=2, sort_keys=True)
