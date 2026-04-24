bun-dev:
	cd api && cp .env.example .env && bun i & cd frontend && bun i && bun postinstall && bun dev & cd data-gen && pip3 install -r requirements.txt --break-system-packages & cp .env.example .env && docker compose up

node-dev:
	cd api && cp .env.example .env && npm i & cd frontend && npm i && npm run postinstall && npm run dev & cd data-gen && pip3 install -r requirements.txt & cp .env.example .env && docker compose up

win-node-dev:
	cd api && copy .env.example .env && npm i & cd frontend && npm i && npm run postinstall && npm run dev & cd data-gen && pip3 install -r requirements.txt & copy .env.example .env && docker compose up

win-bun-dev:
	cd api && copy .env.example .env && bun i & cd frontend && bun i && bun postinstall && bun dev & cd data-gen && pip3 install -r requirements.txt --break-system-packages & copy .env.example .env && docker compose up
