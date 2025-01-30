#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use
npm ci

chmod +x apps/server/src/assets/start.sh
cp .env.example .env

npm run build
npm run ln-reboot

npm run pm2:r
npm run pm2:s

# sudo ufw allow 9001/tcp
# sudo ufw allow 9002/tcp
# sudo ufw allow 9003/tcp
# sudo systemctl restart ufw
# sudo iptables -A INPUT -p tcp --dport 9001 -j ACCEPT
# sudo iptables -A INPUT -p tcp --dport 9002 -j ACCEPT
# sudo iptables -A INPUT -p tcp --dport 9003 -j ACCEPT
# sudo iptables-save | sudo tee /etc/iptables/rules.v4
# sudo systemctl daemon-reload
