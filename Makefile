bun-dev:
	cp .env.example .env && docker compose up & cd api && bun i & cd frontend && bun i && bun postinstall && bun dev & cd data-gen && pip3 install -r requirements.txt --break-system-packages

node-dev:
	cp .env.example .env && docker compose up & cd api && npm i & cd frontend && npm i && npm run postinstall && npm run dev & cd data-gen && pip3 install -r requirements.txt

win-node-dev:
	copy .env.example .env && docker compose up & cd api && npm i & cd frontend && npm i && npm run postinstall && npm run dev & cd data-gen && pip3 install -r requirements.txt

win-bun-dev:
	copy .env.example .env && docker compose up & cd api && bun i & cd frontend && bun i && bun postinstall && bun dev & cd data-gen && pip3 install -r requirements.txt --break-system-packages
