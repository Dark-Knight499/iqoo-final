import sys
import os
import time
import json
import base64
import http.server
import litert_lm

MODEL_PATH = '/sdcard/Download/gemma-4-E2B-it.litertlm'
PORT = 8080

print(f'Loading Gemma 4 E2B LiteRT-LM model from {MODEL_PATH}...')
sys.stdout.flush()

engine = litert_lm.Engine(
    MODEL_PATH,
    backend=litert_lm.Backend.GPU(),
    vision_backend=litert_lm.Backend.GPU(),
    max_num_images=1
)
print('Gemma 4 E2B Engine initialized on Snapdragon 8 Elite GPU!')
sys.stdout.flush()

class GemmaServerHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            res = {
                'status': 'healthy',
                'model': 'gemma-4-E2B-it',
                'runtime': 'LiteRT-LM (OpenCL GPU)',
                'device': 'iQOO 15 (Snapdragon 8 Elite)',
                'multimodal': True
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))
        elif self.path == '/v1/models':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            res = {
                'models': [{
                    'id': 'gemma-4-e2b-it',
                    'name': 'Gemma 4 E2B IT',
                    'backend': 'GPU',
                    'vision': True
                }]
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path in ('/v1/evaluate', '/completion', '/v1/chat/completions'):
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                req = json.loads(body.decode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({'error': f'Invalid JSON: {e}'}).encode())
                return

            prompt = req.get('prompt', '')
            if not prompt and 'messages' in req and len(req['messages']) > 0:
                prompt = req['messages'][-1].get('content', '')
            if not prompt:
                prompt = 'Describe this image.'

            b64_img = req.get('image_base64', None)
            if not b64_img and 'image_data' in req and len(req['image_data']) > 0:
                b64_img = req['image_data'][0].get('data')

            t0 = time.perf_counter()
            try:
                conv = engine.create_conversation()
                items = []
                if b64_img:
                    img_bytes = base64.b64decode(b64_img)
                    items.append(litert_lm.Content.ImageBytes(img_bytes))
                items.append(prompt)
                contents = litert_lm.Contents.of(*items)

                response = conv.send_message(contents)
                t_ms = (time.perf_counter() - t0) * 1000.0

                text_out = ''
                if isinstance(response, dict) and 'content' in response:
                    c = response['content']
                    if isinstance(c, list):
                        for part in c:
                            if isinstance(part, dict) and 'text' in part:
                                text_out += part['text']
                    elif isinstance(c, str):
                        text_out = c
                elif isinstance(response, str):
                    text_out = response

                out_data = {
                    'text': text_out.strip(),
                    'content': text_out.strip(),
                    'latency_ms': round(t_ms, 1),
                    'model': 'gemma-4-e2b-it',
                    'hardware': 'Snapdragon 8 Elite Adreno GPU'
                }
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(out_data).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, fmt, *args):
        sys.stdout.write('[%s] %s\n' % (self.log_date_time_string(), fmt % args))
        sys.stdout.flush()

print(f'Starting HTTP server on 0.0.0.0:{PORT}...')
sys.stdout.flush()
server = http.server.HTTPServer(('0.0.0.0', PORT), GemmaServerHandler)
server.serve_forever()
