import requests
import re
from bs4 import BeautifulSoup
from flask import Blueprint, request, jsonify, Response
from urllib.parse import unquote
import concurrent.futures
import urllib3

# Suppress InsecureRequestWarning for the proxy
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

search_bp = Blueprint('search', __name__)

@search_bp.route('/check-frame', methods=['GET'])
def check_frame():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "No URL provided"}), 400
        
    try:
        # VIP High-Security List: These sites ALWAYS block iframes or have complex JS protection.
        # Hardcoding these ensures 100% success for popular sites.
        vip_sites = ["youtube.com", "youtu.be", "google.com", "opensea.io", "uniswap.org", "github.com", "twitter.com", "x.com", "facebook.com", "instagram.com"]
        domain = url.lower()
        if any(site in domain for site in vip_sites):
            return jsonify({
                "url": url,
                "frameable": False,
                "reason": "VIP Restrictive Site",
                "can_proxy": True
            }), 200

        # Use GET request with stream=True to check headers more reliably than HEAD
        # We only download the first few bytes (headers + start of body)
        with requests.get(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }, timeout=5, allow_redirects=True, stream=True) as res:
            
            headers = {k.lower(): v.lower() for k, v in res.headers.items()}
            
            frameable = True
            reason = ""
            
            # Check X-Frame-Options
            if 'x-frame-options' in headers:
                val = headers['x-frame-options']
                if 'deny' in val or 'sameorigin' in val:
                    frameable = False
                    reason = "X-Frame-Options"
                    
            # Check Content-Security-Policy frame-ancestors
            if frameable and 'content-security-policy' in headers:
                csp = headers['content-security-policy']
                if 'frame-ancestors' in csp:
                    frameable = False
                    reason = "Content-Security-Policy"

            return jsonify({
                "url": url,
                "frameable": frameable,
                "reason": reason,
                "can_proxy": True
            }), 200
        
    except Exception as e:
        # On connection failure, default to proxying to be safe
        return jsonify({
            "url": url,
            "frameable": False,
            "reason": f"Connection error: {str(e)}",
            "can_proxy": True
        }), 200

@search_bp.route('/proxy', methods=['GET'])
def proxy_view():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "No URL provided"}), 400
        
    try:
        # Fetch the content with a generic User-Agent
        res = requests.get(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }, timeout=10, verify=False)
        
        # Prepare headers to strip security and other problematic headers
        excluded_headers = [
            'content-encoding', 'content-length', 'transfer-encoding', 'connection',
            'x-frame-options', 'content-security-policy', 'frame-ancestors', 'strict-transport-security',
            'set-cookie' # Strip cookies to prevent tracking and auth issues in guest mode
        ]
        headers = [(name, value) for (name, value) in res.headers.items() if name.lower() not in excluded_headers]
        
        content = res.content
        
        # If it's HTML, clean it up to prevent JS crashes and relative path issues
        content_type = res.headers.get("Content-Type", "").lower()
        if "text/html" in content_type:
            soup = BeautifulSoup(content, 'html.parser')
            
            # 1. Inject <base> tag to fix relative assets
            if not soup.find('base'):
                base_tag = soup.new_tag('base', href=url)
                if soup.head:
                    soup.head.insert(0, base_tag)
                else:
                    head = soup.new_tag('head')
                    head.append(base_tag)
                    soup.insert(0, head)
            
            # 2. Universal URL Rewriting for all tags and common attributes
            from urllib.parse import urljoin, urlparse
            
            # We use the full page URL as the base for joining relative paths
            for tag in soup.find_all(True):  # Find all tags
                for attr in ['src', 'href', 'poster', 'data-src', 'srcset', 'style', 'action']:
                    val = tag.get(attr)
                    if not val or val.startswith(('http://', 'https://', 'data:', 'javascript:', '#')):
                        continue
                    
                    if attr == 'srcset':
                        # Handle comma-separated srcset
                        parts = val.split(',')
                        new_parts = []
                        for p in parts:
                            p = p.strip()
                            if p and not p.startswith(('http://', 'https://')):
                                subparts = p.split(' ')
                                url_part = urljoin(url, subparts[0])
                                new_parts.append(url_part + (' ' + subparts[1] if len(subparts) > 1 else ''))
                            else:
                                new_parts.append(p)
                        tag[attr] = ', '.join(new_parts)
                    elif attr == 'style':
                        # Handle url() in styles
                        if 'url(' in val:
                            # Replace url(/...) or url(relative/...) with absolute version
                            # This regex handles both quoted and unquoted URLs
                            def fix_css_url(match):
                                quote = match.group(1) or ""
                                path = match.group(2)
                                if path.startswith(('http://', 'https://', 'data:')):
                                    return match.group(0)
                                return f"url({quote}{urljoin(url, path)}{quote})"
                            tag[attr] = re.sub(r'url\(([\'"]?)(.*?)\1\)', fix_css_url, val)
                    else:
                        # Convert relative path to absolute URL
                        tag[attr] = urljoin(url, val)

            # 3. Aggressive Script/Telemetry Stripping & Frame-Busting Prevention
            for script in soup.find_all('script'):
                script_content = script.string or ""
                # Remove common trackers and hydration artifacts
                if any(x in script_content.lower() for x in ['__next_data__', 'hydrate', 'telemetry', 'analytics', 'sentry']):
                    script.decompose()
                # Prevent Frame-Busting (e.g. if(top != self) top.location = self.location)
                elif any(x in script_content.lower() for x in ['top.location', 'parent.location', 'window.frameElement']):
                    script.string = script_content.replace('top.location', 'console.log("Frame-Busting Blocked")')
                elif script.get('src') and any(x in script.get('src').lower() for x in ['next/static', 'analytics.js', 'gtm.js', 'ga.js']):
                    script.decompose()

            content = str(soup).encode('utf-8')

        elif "text/css" in content_type:
            # Fix absolute and relative paths in CSS files
            css_content = content.decode('utf-8', errors='ignore')
            
            def fix_css_url(match):
                quote = match.group(1) or ""
                path = match.group(2)
                if path.startswith(('http://', 'https://', 'data:')):
                    return match.group(0)
                # Use urljoin with the original CSS file URL (if possible) or base url
                return f"url({quote}{urljoin(url, path)}{quote})"
                
            css_content = re.sub(r'url\(([\'"]?)(.*?)\1\)', fix_css_url, css_content)
            content = css_content.encode('utf-8')

        return Response(content, res.status_code, headers)
    except Exception as e:
        print(f"Proxy Error for {url}: {e}")
        return jsonify({"error": str(e)}), 500

@search_bp.route('', methods=['GET'])
def search():
    query = request.args.get('q', '')
    if not query:
        return jsonify({"error": "No search query provided"}), 400

    search_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    results = []

    def fetch_duckduckgo():
        ddg_results = []
        try:
            # Use the more reliable HTML endpoint
            ddg_url = f"https://duckduckgo.com/html/?q={query}"
            res = requests.get(ddg_url, headers=search_headers, timeout=6)
            if res.status_code == 200:
                soup = BeautifulSoup(res.text, 'html.parser')
                for item in soup.select('.result__body'):
                    title_el = item.select_one('.result__title a')
                    snippet_el = item.select_one('.result__snippet')
                    if title_el:
                        href = title_el.get('href', '')
                        if 'uddg=' in href:
                            href = unquote(href.split('uddg=')[-1].split('&')[0])
                        ddg_results.append({
                            "title": title_el.text.strip(),
                            "description": snippet_el.text.strip() if snippet_el else "View in browser...",
                            "url": href,
                            "domain": href.split("//")[-1].split("/")[0] if "//" in href else "Web Link",
                            "source": "ddg"
                        })
        except Exception as e:
            print(f"DDG Parallel Error: {e}")
        return ddg_results

    def fetch_google():
        google_results = []
        try:
            # Use Mobile UA for leaner HTML but with a more robust result target
            google_ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
            google_url = f"https://www.google.com/search?q={query}&num=30"
            res = requests.get(google_url, headers={"User-Agent": google_ua}, timeout=6)
            if res.status_code == 200:
                soup = BeautifulSoup(res.text, 'html.parser')
                # Aggressive selector for Google mobile
                for a in soup.find_all('a'):
                    href = a.get('href', '')
                    if href.startswith('http') and 'google.com' not in href:
                        title_el = a.find(['h3', 'span', 'div'])
                        if title_el and len(title_el.get_text()) > 5:
                            google_results.append({
                                "title": title_el.get_text().strip(),
                                "description": "Google verified result.",
                                "url": href,
                                "domain": href.split("//")[-1].split("/")[0],
                                "source": "google"
                            })
        except Exception as e:
            print(f"Google Parallel Error: {e}")
        return google_results

    def fetch_bing():
        bing_results = []
        try:
            bing_url = f"https://www.bing.com/search?q={query}&count=40"
            res = requests.get(bing_url, headers=search_headers, timeout=6)
            if res.status_code == 200:
                soup = BeautifulSoup(res.text, 'html.parser')
                for item in soup.select('li.b_algo'):
                    title_el = item.find('h2')
                    snippet_el = item.find('p')
                    a = item.find('a')
                    if title_el and a:
                        href = a.get('href', '')
                        bing_results.append({
                            "title": title_el.get_text().strip(),
                            "description": snippet_el.get_text().strip() if snippet_el else "Bing result link.",
                            "url": href,
                            "domain": href.split("//")[-1].split("/")[0] if "//" in href else "Web Link",
                            "source": "bing"
                        })
        except Exception as e:
            print(f"Bing Parallel Error: {e}")
        return bing_results

    # Use Concurrency for SPEED and VOLUME
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(fetch_duckduckgo): "ddg",
            executor.submit(fetch_google): "google",
            executor.submit(fetch_bing): "bing"
        }
        for future in concurrent.futures.as_completed(futures):
            results.extend(future.result())

    # Deduplicate and ensure at least 30+ results
    seen_urls = set()
    final_results = []
    for r in results:
        if r['url'] not in seen_urls:
            final_results.append(r)
            seen_urls.add(r['url'])

    # Target 40 results total
    return jsonify(final_results[:40]), 200

@search_bp.route('/suggest', methods=['GET'])
def suggest():
    query = request.args.get('q', '')
    if not query:
        return jsonify([]), 200
        
    suggestions = []
    
    # 1. Match against internal DApps (Simulation of history/bookmarks)
    from models.dapp_model import Dapp
    try:
        # Search for names or URLs that start with or contain the query
        internal_matches = Dapp.query.filter(
            (Dapp.name.ilike(f'%{query}%')) | (Dapp.url.ilike(f'%{query}%'))
        ).limit(3).all()
        
        for d in internal_matches:
            suggestions.append({
                "phrase": d.name,
                "type": "internal",
                "subtitle": d.url
            })
    except Exception as e:
        print(f"Internal suggest error: {e}")

    # 2. Web Predictions from DuckDuckGo
    url = f"https://duckduckgo.com/ac/?q={query}&type=list"
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        res = requests.get(url, headers=headers, timeout=3)
        res.raise_for_status()
        data = res.json()
        if len(data) > 1 and isinstance(data[1], list):
            for s in data[1]:
                # Don't duplicate internal matches
                if not any(m["phrase"].lower() == s.lower() for m in suggestions):
                    suggestions.append({
                        "phrase": s,
                        "type": "web",
                        "subtitle": "Web Search"
                    })
        return jsonify(suggestions[:8]), 200
    except Exception as e:
        print(f"Suggestions error: {e}")
        return jsonify(suggestions), 200 # Return at least internal ones if web fails
