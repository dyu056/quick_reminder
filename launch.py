#!/usr/bin/env python3
"""Serve Quick Reminder locally and open its fixed address."""
from pathlib import Path
import socket
import subprocess
import sys
import time
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parent
URL = "http://localhost:8767/"

def ready():
    try:
        with urlopen("http://127.0.0.1:8767/", timeout=1) as response:
            return response.read() == (ROOT / "index.html").read_bytes()
    except OSError:
        return False

def main():
    if not ready():
        try:
            with socket.create_connection(("127.0.0.1", 8767), timeout=1):
                raise SystemExit("8767 端口被其他程序占用。")
        except OSError:
            pass
        log_dir = Path.home() / "Library/Logs/InfraStartup"
        log_dir.mkdir(parents=True, exist_ok=True)
        with (log_dir / "quick-reminder-server.log").open("ab") as log:
            process = subprocess.Popen(
                [sys.executable, "-m", "http.server", "8767", "--bind", "127.0.0.1", "--directory", str(ROOT)],
                stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT,
                start_new_session=True,
            )
        for _ in range(60):
            if ready():
                break
            if process.poll() is not None:
                raise SystemExit("Quick Reminder 服务启动失败，请查看日志。")
            time.sleep(0.2)
        else:
            raise SystemExit("Quick Reminder 服务未就绪，请查看日志。")
    subprocess.run(["/usr/bin/open", URL], check=True)
    print("Quick Reminder 已打开：" + URL)

if __name__ == "__main__":
    main()
