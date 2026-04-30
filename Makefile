mac-bun-dev:
	cd api && cp .env.example .env && bun i & cd frontend && cp .example.env .env && bun i && bun postinstall && bun dev & cd data-gen && pip3 install -r requirements.txt --break-system-packages && cp .env.example .env & cp & cp .env.example .env && docker compose up

mac-node-dev:
	cd api && cp .env.example .env && npm i & cd frontend && cp .example.env .env && npm i && npm run postinstall && npm run dev & cd data-gen && pip3 install -r requirements.txt --break-system-packages && cp .env.example .env & cp .env.example .env && docker compose up

win-node-dev:
	cd api && copy .env.example .env && npm i & cd frontend && copy .example.env .env && npm i && npm run postinstall && npm run dev & cd data-gen && pip3 install -r requirements.txt && copy .env.example .env & copy .env.example .env && docker compose up

win-bun-dev:
	cd api && copy .env.example .env && bun i & cd frontend && copy .example.env .env && bun i && bun postinstall && bun dev & cd data-gen && pip3 install -r requirements.txt && copy .env.example .env & copy .env.example .env && docker compose up
