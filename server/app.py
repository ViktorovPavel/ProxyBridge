from flask import Flask, jsonify
from flask_cors import CORS
import docker

app = Flask(__name__)
CORS(app)
client = docker.from_env()

@app.route('/proxies', methods=['GET'])
def get_proxies():
    proxies = []
    try:
        for container in client.containers.list():
            name = container.name.lower()
            # Фильтруем строго по префиксу proxy_
            if not name.startswith("proxy_"):
                continue

            ports = container.attrs['NetworkSettings']['Ports']
            if ports:
                for container_port, bindings in ports.items():
                    if bindings:
                        host_port = bindings[0]['HostPort']
                        # Убираем префикс proxy_ для красоты в интерфейсе
                        pretty_name = container.name.replace("proxy_", "").replace('_', ' ').replace('-', ' ').title()
                        proxies.append({
                            "name": pretty_name,
                            "port": int(host_port)
                        })
                        break
    except Exception as e:
        print(f"Error reading docker: {e}")

    return jsonify(proxies)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7654)