import http.server, socketserver, sys, os

PORT = int(os.environ.get("TMAR_PORT", "0"))
ROOT = os.environ.get("TMAR_ROOT", os.getcwd())
NOACCESSLOG = os.environ.get("TMAR_NOACCESSLOG") == "1"

class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)
    def log_message(self, fmt, *args):
        # pythonw may have no usable stderr; never let logging kill a response.
        if NOACCESSLOG:
            return
        try:
            sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))
            sys.stderr.flush()
        except Exception:
            pass

class Srv(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

def main():
    with Srv(("127.0.0.1", PORT), H) as httpd:
        try:
            sys.stdout.write("serving %s on http://127.0.0.1:%d\n" % (ROOT, PORT))
            sys.stdout.flush()
        except Exception:
            pass
        httpd.serve_forever()

if __name__ == "__main__":
    main()
