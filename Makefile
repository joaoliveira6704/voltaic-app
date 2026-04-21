bun-dev:
	cp .env.example .env && docker compose up & cd api && bun i && bun server.js & cd frontend && bun i && bun postinstall && bun dev & cd data-gen && pip3 install -r requirements.txt --break-system-packages && python3 main.py

node-dev:
	cp .env.example .env && docker compose up & cd api && npm i && node server.js & cd frontend && npm i && npm run postinstall && npm run dev & cd data-gen && pip3 install -r requirements.txt && python3 main.py